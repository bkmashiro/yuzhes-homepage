/**
 * homography.js
 * Computes a CSS matrix3d transform that maps a rectangle (the element)
 * onto 4 arbitrary screen-space points, then applies it to #screen-content.
 *
 * Reference: https://franklinta.com/2014/09/08/computing-css-3d-transforms/
 */

/* ─── 3×3 matrix helpers (row-major) ─── */
function mat3adj(m) {
  return [
    m[4]*m[8]-m[5]*m[7],  m[2]*m[7]-m[1]*m[8],  m[1]*m[5]-m[2]*m[4],
    m[5]*m[6]-m[3]*m[8],  m[0]*m[8]-m[2]*m[6],  m[2]*m[3]-m[0]*m[5],
    m[3]*m[7]-m[4]*m[6],  m[1]*m[6]-m[0]*m[7],  m[0]*m[4]-m[1]*m[3],
  ];
}
function mat3mult(a, b) {
  const r = new Array(9).fill(0);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        r[i*3+j] += a[i*3+k] * b[k*3+j];
  return r;
}
function mat3multV(m, v) {
  return [
    m[0]*v[0]+m[1]*v[1]+m[2]*v[2],
    m[3]*v[0]+m[4]*v[1]+m[5]*v[2],
    m[6]*v[0]+m[7]*v[1]+m[8]*v[2],
  ];
}

/**
 * Returns the projective matrix (3×3) that maps 4 points in src
 * to the corresponding 4 points in dst.
 * Both are [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] in order TL,TR,BR,BL.
 */
function basisToPoints(p) {
  const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] = p;
  const m = [x0,x1,x2, y0,y1,y2, 1,1,1];
  const v = mat3multV(mat3adj(m), [x3,y3,1]);
  return mat3mult(m, [v[0],0,0, 0,v[1],0, 0,0,v[2]]);
}

function computeHomography(src, dst) {
  return mat3mult(basisToPoints(dst), mat3adj(basisToPoints(src)));
}

/**
 * Given src corners (element local px) and dst corners (page px),
 * returns the CSS matrix3d string.
 */
function toCSSMatrix3d(src, dst) {
  const H = computeHomography(src, dst);
  // Normalize
  const s = H[8];
  const h = H.map(v => v / s);

  // Embed 3×3 projective into 4×4 column-major CSS matrix:
  //   col0      col1      col2   col3
  //  [h[0]     h[1]       0     h[2] ]   row 0
  //  [h[3]     h[4]       0     h[5] ]   row 1
  //  [ 0        0         1      0   ]   row 2
  //  [h[6]     h[7]       0     h[8] ]   row 3
  //
  // CSS matrix3d(c0r0,c0r1,c0r2,c0r3, c1r0,...) = column-major
  const m = [
    h[0], h[3], 0, h[6],   // column 0
    h[1], h[4], 0, h[7],   // column 1
    0,    0,    1, 0,       // column 2
    h[2], h[5], 0, h[8],   // column 3
  ];
  return `matrix3d(${m.map(v => v.toFixed(10)).join(',')})`;
}

/**
 * Build a quadratic-bezier SVG clip-path for the CRT screen shape.
 *
 * @param {number}   w       Element width (px)
 * @param {number}   h       Element height (px)
 * @param {number[]} mids    [top, right, bottom, left] midpoint offsets in
 *                           element-local px.  Positive = bow outward from
 *                           the quad centre (i.e. inward on screen means
 *                           the edge curves toward the viewer, use negative).
 *                           CRT screens bow slightly inward → negative values.
 */
/**
 * Build clip-path polygon approximating curved CRT screen edges.
 * Positive mids = edge bows INWARD (toward screen centre).
 * Uses polygon() with N segments per edge — better compat than path().
 * Bezier bulge formula: offset = 4*m*t*(1-t), max at t=0.5.
 */
function buildClipPath(w, h, mids) {
  const [mTop, mRight, mBottom, mLeft] = mids;
  const N = 20;
  const b = (m, t) => 4 * m * t * (1 - t);
  const pts = [];
  // Top: left→right, bows down (inward)
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(`${(t * w).toFixed(2)}px ${b(mTop, t).toFixed(2)}px`);
  }
  // Right: top→bottom, bows left (inward)
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    pts.push(`${(w - b(mRight, t)).toFixed(2)}px ${(t * h).toFixed(2)}px`);
  }
  // Bottom: right→left, bows up (inward)
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    pts.push(`${((1 - t) * w).toFixed(2)}px ${(h - b(mBottom, t)).toFixed(2)}px`);
  }
  // Left: bottom→top, bows right (inward)
  for (let i = 1; i < N; i++) {
    const t = i / N;
    pts.push(`${b(mLeft, t).toFixed(2)}px ${((1 - t) * h).toFixed(2)}px`);
  }
  return `polygon(${pts.join(', ')})`;
}

/**
 * Apply the homography + curved clip-path to #screen-content.
 *
 * @param {number[][]} corners  4×2 array of [x,y] in closeup image natural px,
 *                              order: TL, TR, BR, BL
 * @param {number}     imgW     Natural width of closeup image (px)
 * @param {number}     imgH     Natural height of closeup image (px)
 * @param {number[]}   [edgeMids=[0,0,0,0]]
 *                              Midpoint offsets [top,right,bottom,left] in
 *                              image-natural px (positive = bow outward).
 */
function applyScreenTransform(corners, imgW, imgH, edgeMids = [0, 0, 0, 0]) {
  const container = document.getElementById('scene-closeup');
  const screenEl  = document.getElementById('screen-content');

  // Scale image-natural coords → rendered page coords
  const rect   = container.getBoundingClientRect();
  const scaleX = rect.width  / imgW;
  const scaleY = rect.height / imgH;
  const dst    = corners.map(([x, y]) => [x * scaleX, y * scaleY]);

  // Element dimensions approximated from top edge width × left edge height
  const w = Math.hypot(dst[1][0]-dst[0][0], dst[1][1]-dst[0][1]);
  const h = Math.hypot(dst[3][0]-dst[0][0], dst[3][1]-dst[0][1]);

  screenEl.style.width  = `${w}px`;
  screenEl.style.height = `${h}px`;
  screenEl.style.transformOrigin = '0 0';

  // Homography: map element rect → screen quad
  const src = [[0,0], [w,0], [w,h], [0,h]];
  screenEl.style.transform = toCSSMatrix3d(src, dst);

  // Clip-path: scale edge midpoint offsets from image-natural to element space
  const mids = [
    edgeMids[0] * scaleY,   // top
    edgeMids[1] * scaleX,   // right
    edgeMids[2] * scaleY,   // bottom
    edgeMids[3] * scaleX,   // left
  ];
  screenEl.style.clipPath = buildClipPath(w, h, mids);
}

// Re-apply on resize
window.addEventListener('resize', () => {
  if (window._screenState) applyScreenTransform(...window._screenState);
});

/** Public entry point. Call once the closeup scene is active. */
function initScreenTransform(corners, imgW, imgH, edgeMids = [0, 0, 0, 0]) {
  window._screenState = [corners, imgW, imgH, edgeMids];
  applyScreenTransform(corners, imgW, imgH, edgeMids);
}
