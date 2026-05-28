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

// Extra pixels added around the element so outward-bowing clip-path
// has real content to reveal. Must be >= max expected |edgeMids|.
const CLIP_EXPAND = 80;

/**
 * Build clip-path polygon for CRT curved edges.
 * Coordinate origin is the EXPANDED element's top-left.
 * The actual screen rect sits at (E, E) → (E+w, E+h) inside the element.
 *
 * Positive mids[i] = edge bows OUTWARD (away from screen centre).
 * Negative mids[i] = edge bows INWARD.
 * Bezier bulge: 4*m*t*(1-t), peaks at t=0.5.
 */
function buildClipPath(w, h, mids) {
  const [mTop, mRight, mBottom, mLeft] = mids;
  const E = CLIP_EXPAND;
  const N = 20;
  const b = (m, t) => 4 * m * t * (1 - t);
  const pts = [];
  // Top edge: (E,E) → (E+w, E), outward = upward = subtract bulge
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(`${(E + t * w).toFixed(1)}px ${(E - b(mTop, t)).toFixed(1)}px`);
  }
  // Right edge: (E+w, E) → (E+w, E+h), outward = rightward = add bulge
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    pts.push(`${(E + w + b(mRight, t)).toFixed(1)}px ${(E + t * h).toFixed(1)}px`);
  }
  // Bottom edge: (E+w, E+h) → (E, E+h), outward = downward = add bulge
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    pts.push(`${(E + (1 - t) * w).toFixed(1)}px ${(E + h + b(mBottom, t)).toFixed(1)}px`);
  }
  // Left edge: (E, E+h) → (E, E), outward = leftward = subtract bulge
  for (let i = 1; i < N; i++) {
    const t = i / N;
    pts.push(`${(E - b(mLeft, t)).toFixed(1)}px ${(E + (1 - t) * h).toFixed(1)}px`);
  }
  return `polygon(${pts.join(', ')})`;
}

/**
 * Apply the homography + curved clip-path to #screen-content.
 *
 * @param {number[][]} corners  4×2 [x,y] in closeup natural px, order TL TR BR BL
 * @param {number}     imgW     Natural width of closeup image
 * @param {number}     imgH     Natural height of closeup image
 * @param {number[]}   edgeMids [top,right,bottom,left] offsets in natural px.
 *                              Positive = outward bow. Negative = inward.
 */
function applyScreenTransform(corners, imgW, imgH, edgeMids = [0, 0, 0, 0]) {
  const container = document.getElementById('scene-closeup');
  const screenEl  = document.getElementById('screen-content');
  const desktop   = document.getElementById('win98-desktop');

  const rect = container.getBoundingClientRect();

  // object-fit: cover uses a UNIFORM scale = max(containerW/imgW, containerH/imgH),
  // then centres the image. Using separate scaleX/scaleY is wrong and breaks on resize.
  const coverScale = Math.max(rect.width / imgW, rect.height / imgH);
  const offX = (rect.width  - imgW * coverScale) / 2;
  const offY = (rect.height - imgH * coverScale) / 2;

  // Convert image-natural px → container-relative rendered px
  const dst = corners.map(([x, y]) => [
    x * coverScale + offX,
    y * coverScale + offY,
  ]);

  // Screen dimensions in rendered px
  const w = Math.hypot(dst[1][0]-dst[0][0], dst[1][1]-dst[0][1]);
  const h = Math.hypot(dst[3][0]-dst[0][0], dst[3][1]-dst[0][1]);
  const E = CLIP_EXPAND;

  // Element is (w+2E) × (h+2E); screen rect sits at (E,E) inside
  screenEl.style.width  = `${w + 2 * E}px`;
  screenEl.style.height = `${h + 2 * E}px`;
  screenEl.style.transformOrigin = '0 0';

  // Homography maps the screen rect (at offset E,E) to the dst quad
  const src = [[E, E], [E + w, E], [E + w, E + h], [E, E + h]];
  screenEl.style.transform = toCSSMatrix3d(src, dst);

  // screen-content background fills the expand area so outward-bowing
  // clip regions show the desktop colour instead of transparency
  screenEl.style.background = '#008080';
  screenEl.style.overflow   = 'visible'; // don't clip the expand area

  // Win98 desktop fills only the actual screen area
  if (desktop) {
    desktop.style.position = 'absolute';
    desktop.style.left   = `${E}px`;
    desktop.style.top    = `${E}px`;
    desktop.style.width  = `${w}px`;
    desktop.style.height = `${h}px`;
  }

  // Scale mids from image-natural to rendered px (uniform coverScale)
  const mids = [
    edgeMids[0] * coverScale,
    edgeMids[1] * coverScale,
    edgeMids[2] * coverScale,
    edgeMids[3] * coverScale,
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
