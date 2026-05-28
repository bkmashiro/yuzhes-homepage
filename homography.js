/**
 * homography.js
 * Computes a CSS matrix3d transform that maps a unit square [0,1]²
 * onto 4 arbitrary points in screen space, then applies it to
 * #screen-content so it precisely overlays the CRT monitor screen.
 *
 * Usage:
 *   applyScreenTransform([
 *     [x0, y0],  // top-left corner of screen in closeup image pixels
 *     [x1, y1],  // top-right
 *     [x2, y2],  // bottom-right
 *     [x3, y3],  // bottom-left
 *   ], imageWidth, imageHeight);
 *
 * Coordinates are in px relative to the closeup image's natural size.
 * They'll be scaled to match whatever size the image renders at.
 */

/**
 * Given 4 destination points (in rendered px on the page),
 * returns the CSS matrix3d string that maps the unit square onto them.
 *
 * Based on the algorithm described by:
 *   http://www.reedbeta.com/blog/quadrilateral-interpolation-part-1/
 * and the CSS perspective-matrix derivation by:
 *   https://franklinta.com/2014/09/08/computing-css-3d-transforms/
 */
function computeMatrix3d(dst) {
  // dst = [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]
  // We want M such that M * [s,t,0,1]^T gives [dst[i].x, dst[i].y, 0, 1]
  // for (s,t) ∈ {(0,0),(1,0),(1,1),(0,1)}

  const [p0, p1, p2, p3] = dst;

  // Solve for the projective transform from unit square to dst
  // Using the direct linear transform (homography)
  function adj(m) {
    // adjugate of 3×3 matrix (row-major)
    return [
      m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
      m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
      m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3],
    ];
  }

  function mult(a, b) {
    // 3×3 × 3×3
    const r = new Array(9).fill(0);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        for (let k = 0; k < 3; k++)
          r[i*3+j] += a[i*3+k] * b[k*3+j];
    return r;
  }

  function multV(m, v) {
    return [
      m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
      m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
      m[6]*v[0] + m[7]*v[1] + m[8]*v[2],
    ];
  }

  // Map unit square [0,0],[1,0],[1,1],[0,1] → dst via projective
  // homography H computed using the adjugate method
  function basisToPoints(p) {
    const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] = p;
    const m = [x0,x1,x2, y0,y1,y2, 1,1,1];
    const v = multV(adj(m), [x3,y3,1]);
    return mult(m, [v[0],0,0, 0,v[1],0, 0,0,v[2]]);
  }

  const srcPts = [[0,0],[1,0],[1,1],[0,1]];
  const H = mult(basisToPoints(dst), adj(basisToPoints(srcPts)));

  // Normalize so H[8] == 1
  const s = H[8];
  const h = H.map(v => v / s);

  // CSS matrix3d expects a 4×4 column-major matrix.
  // We embed the 3×3 homography in 4×4:
  //   [h0  h1  0  h2]
  //   [h3  h4  0  h5]
  //   [0   0   1  0 ]
  //   [h6  h7  0  h8]
  // Column-major order:
  const m3d = [
    h[0], h[3], 0, h[6],
    h[1], h[4], 0, h[7],
    0,    0,    1, 0,
    h[2], h[5], 0, h[8],
  ];

  return `matrix3d(${m3d.map(v => v.toFixed(8)).join(',')})`;
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

  // Scale factors: how the image is rendered vs its natural size
  const rect  = container.getBoundingClientRect();
  const scaleX = rect.width  / imgW;
  const scaleY = rect.height / imgH;

  // Convert corners to rendered pixel coords
  const dst = corners.map(([x, y]) => [x * scaleX, y * scaleY]);

  // The #screen-content element is position:absolute and fills the container.
  // We want to shrink it down to the screen rect first (simpler approach),
  // OR we can keep it 100%×100% and apply the full homography.
  // We'll use the full homography on a 100%×100% element.

  const matrix = computeMatrix3d(dst);
  screenEl.style.transform = matrix;

  // Also size the win98 desktop to approximate the screen dimensions
  const w = Math.hypot(dst[1][0]-dst[0][0], dst[1][1]-dst[0][1]);
  const h = Math.hypot(dst[3][0]-dst[0][0], dst[3][1]-dst[0][1]);
  screenEl.style.width  = `${w}px`;
  screenEl.style.height = `${h}px`;
}

// Re-apply on resize
window.addEventListener('resize', () => {
  if (window._screenCorners) {
    applyScreenTransform(...window._screenCorners);
  }
});

/**
 * Public entry point.
 * Call this once the closeup scene is active.
 */
function initScreenTransform(corners, imgW, imgH) {
  window._screenCorners = [corners, imgW, imgH];
  applyScreenTransform(corners, imgW, imgH);
}
