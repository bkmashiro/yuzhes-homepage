/**
 * warp.js
 * CRT convex-surface barrel distortion via SVG feDisplacementMap.
 *
 * A convex CRT screen curves toward the viewer, making content near the
 * edges appear magnified / stretched outward — classic barrel distortion.
 *
 * feDisplacementMap formula:
 *   output(x,y) = input(x + (R/255 - 0.5)*scale, y + (G/255 - 0.5)*scale)
 *
 * For barrel distortion the source sample must come from CLOSER to centre:
 *   delta_x = -nx * r² * strength * W/2
 *   R = 128 - nx * r² * 127     (128 = no shift, 0 = max left, 255 = max right)
 *   scale = strength * min(W,H) * 0.5
 *
 * Parameters:
 *   strength  0..1   overall warp intensity (0.15 ≈ subtle CRT, 0.4 ≈ fisheye)
 *   kx        0..1   horizontal exaggeration multiplier (default 1.0)
 *   ky        0..1   vertical   exaggeration multiplier (default 1.0)
 */

const CRT_WARP = {
  strength: 0.18,   // overall warp — tune this
  kx:       1.0,    // horizontal vs vertical balance
  ky:       0.8,
};

function buildDisplacementMap(w, h, strength, kx, ky) {
  const c   = document.createElement('canvas');
  c.width   = w;
  c.height  = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d   = img.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x / (w - 1)) * 2 - 1;  // [-1, 1]
      const ny = (y / (h - 1)) * 2 - 1;
      const r2 = nx * nx + ny * ny;

      // Source pixel is pulled toward the centre by nx*r²*strength
      const R = Math.round(128 - nx * r2 * 127 * kx);
      const G = Math.round(128 - ny * r2 * 127 * ky);

      const i = (y * w + x) * 4;
      d[i]   = Math.max(0, Math.min(255, R));
      d[i+1] = Math.max(0, Math.min(255, G));
      d[i+2] = 128;
      d[i+3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

function _applyCRTWarp(el, { strength, kx, ky } = CRT_WARP) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  if (!w || !h) return;

  const mapUrl = buildDisplacementMap(w, h, strength, kx, ky);
  const scale  = strength * Math.min(w, h) * 0.5;

  // Ensure SVG filter container exists
  let svg = document.getElementById('crt-warp-svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'crt-warp-svg';
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style.cssText = 'display:none; position:absolute; width:0; height:0';
    document.body.appendChild(svg);
  }

  // Rebuild filter (feImage href must be set via setAttribute after DOM insert)
  svg.innerHTML = `
    <defs>
      <filter id="crt-warp"
              x="-8%" y="-8%" width="116%" height="116%"
              color-interpolation-filters="sRGB">
        <feImage id="crt-warp-map" result="warpmap"
                 x="0" y="0" width="${w}" height="${h}"
                 preserveAspectRatio="none" />
        <feDisplacementMap in="SourceGraphic" in2="warpmap"
                           scale="${scale.toFixed(2)}"
                           xChannelSelector="R"
                           yChannelSelector="G" />
      </filter>
    </defs>`;

  // Set href after node is in DOM (avoids SVG namespace quirks)
  document.getElementById('crt-warp-map').setAttribute('href', mapUrl);

  el.style.filter = 'url(#crt-warp)';
}

/**
 * Apply (or update) CRT barrel distortion to #win98-desktop.
 * Call this once the element has layout dimensions.
 *
 * @param {object} [params]  Override CRT_WARP defaults
 */
function applyCRTWarp(params = CRT_WARP) {
  const el = document.getElementById('win98-desktop');
  if (!el) return;
  Object.assign(CRT_WARP, params);
  _applyCRTWarp(el, CRT_WARP);
}

// Resize is handled by homography.js ResizeObserver which calls applyCRTWarp()
// directly after updating win98-desktop dimensions — no separate handler needed.
