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
 * Apply the homography transform to #screen-content.
 *
 * @param {number[][]} corners  4×2 array of [x,y] pixel coords in the
 *                              NATURAL size of the closeup image,
 *                              order: top-left, top-right, bottom-right, bottom-left
 * @param {number}     imgW     Natural width of closeup image (px)
 * @param {number}     imgH     Natural height of closeup image (px)
 */
function applyScreenTransform(corners, imgW, imgH) {
  const container = document.getElementById('scene-closeup');
  const screenEl  = document.getElementById('screen-content');

  // Scale image-natural coords → rendered page coords
  const rect   = container.getBoundingClientRect();
  const scaleX = rect.width  / imgW;
  const scaleY = rect.height / imgH;
  const dst    = corners.map(([x, y]) => [x * scaleX, y * scaleY]);

  // Approximate screen dimensions from the quad
  // (top edge width × left edge height)
  const w = Math.hypot(dst[1][0]-dst[0][0], dst[1][1]-dst[0][1]);
  const h = Math.hypot(dst[3][0]-dst[0][0], dst[3][1]-dst[0][1]);

  screenEl.style.width  = `${w}px`;
  screenEl.style.height = `${h}px`;
  screenEl.style.transformOrigin = '0 0';

  // Source: the element's own four corners in local space
  const src = [[0,0], [w,0], [w,h], [0,h]];

  screenEl.style.transform = toCSSMatrix3d(src, dst);
}

// Re-apply on resize
window.addEventListener('resize', () => {
  if (window._screenCorners) applyScreenTransform(...window._screenCorners);
});

/** Public entry point. Call once the closeup scene is active. */
function initScreenTransform(corners, imgW, imgH) {
  window._screenCorners = [corners, imgW, imgH];
  applyScreenTransform(corners, imgW, imgH);
}
