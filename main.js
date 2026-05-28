/**
 * main.js
 * Scene transitions, calibration tool, and overall page orchestration.
 *
 * Screen corner calibration:
 * Corners measured in natural-resolution pixels of assets/closeup.png.
 * Order: top-left, top-right, bottom-right, bottom-left.
 * These are the intersection points of the screen-edge tangent lines
 * (extrapolated past the rounded corners of the CRT bezel).
 * Fine-tune interactively: append ?calibrate to the URL.
 */

const SCREEN_CORNERS = [
  [317,  278],  // top-left
  [1065, 290],  // top-right
  [1079, 821],  // bottom-right
  [338,  869],  // bottom-left
];

// Edge midpoint offsets in image-natural px.
// Positive = bow OUTWARD (convex, away from screen centre) — correct for CRT glass.
const EDGE_MIDS = [
  39,  // top    edge
  18,  // right  edge
  29,  // bottom edge
   4,  // left   edge
];

/* ─── Scene elements ─── */
const sceneWide     = document.getElementById('scene-wide');
const sceneCloseup  = document.getElementById('scene-closeup');
const wideImg       = document.getElementById('wide-img');
const closeupImg    = document.getElementById('closeup-img');
const zoomHint      = document.getElementById('zoom-hint');
const character     = document.getElementById('character');
const speechBubble  = document.getElementById('speech-bubble');

/* ─── State ─── */
let inCloseup = false;

/* ─── Zoom-in transition ─── */
// Where the monitor screen sits in the wide photo (% of image).
// Used as the zoom-in transform-origin so the animation always flies into the screen.
const ZOOM_TARGET = { x: 50, y: 45 }; // tweak if monitor is off-centre

function zoomIntoScreen(e) {
  if (inCloseup) return;

  wideImg.style.transformOrigin = `${ZOOM_TARGET.x}% ${ZOOM_TARGET.y}%`;
  wideImg.style.transition = 'transform 0.9s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease 0.7s';
  wideImg.style.transform = 'scale(4)';
  wideImg.style.opacity = '0';

  setTimeout(() => {
    sceneWide.classList.remove('active');
    sceneCloseup.classList.add('active');
    inCloseup = true;

    // Reset wide image for potential back-navigation
    wideImg.style.transition = 'none';
    wideImg.style.transform  = 'scale(1)';
    wideImg.style.opacity    = '1';

    // Show character sprite
    if (character) {
      setTimeout(() => character.classList.add('visible'), 100);
    }
    if (speechBubble) {
      setTimeout(() => speechBubble.classList.add('visible'), 600);
    }
  }, 900);

  zoomHint.style.opacity = '0';
}

/* ─── Back to wide (Escape or click background) ─── */
function zoomOut() {
  if (!inCloseup) return;

  sceneCloseup.classList.remove('active');
  sceneWide.classList.add('active');
  inCloseup = false;

  if (character) character.classList.remove('visible');
  if (speechBubble) speechBubble.classList.remove('visible');

  setTimeout(() => { zoomHint.style.opacity = '1'; }, 600);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') zoomOut();
});

sceneWide.addEventListener('click', zoomIntoScreen);
closeupImg.addEventListener('click', zoomOut);

/* ─── Init screen overlay once closeup image loads ─── */
function onCloseupReady() {
  initScreenTransform(
    SCREEN_CORNERS,
    closeupImg.naturalWidth,
    closeupImg.naturalHeight,
    EDGE_MIDS
  );
}

closeupImg.addEventListener('load', onCloseupReady);
if (closeupImg.complete && closeupImg.naturalWidth) {
  onCloseupReady();
}

/* ─── Init Win98 desktop ─── */
initWin98();

/* ─── Character scene-graph positioning ─────────────────────────────────
 * The character is positioned in the same coordinate space as the screen
 * overlay: natural pixels of closeup.png. This way both elements move
 * and scale consistently when the viewport resizes.
 *
 * CHAR_SCENE_ANCHOR = foot/pivot point in natural closeup image pixels
 * CHAR_SCENE_HEIGHT = visual height of the character in natural image pixels
 *
 * On every resize, getCoverInfo() gives us coverScale + offsets, and we
 * convert scene coords to viewport coords — same math as the screen overlay.
 *
 * Transparent padding fractions (padFracRight, padFracBottom) offset
 * from the rendered image corner to the opaque character body.
 * ──────────────────────────────────────────────────────────────────────── */

// Character anchor (foot position) in closeup.png natural pixels.
// Calibrate with ?calibrate and copy the values from the panel.
const CHAR_SCENE_ANCHOR = [982, 1004];

// Character visual height in closeup.png natural pixels.
const CHAR_SCENE_HEIGHT = 360;

// Transparent padding fractions (normalised 0..1).
// null = auto-detect via canvas scan; set manually for reliability.
const CHAR_PAD = { right: null, bottom: null };

// Runtime padding fractions (set by detection or hard-coded values)
let charPadFracRight  = 0;
let charPadFracBottom = 0;

// Speech bubble offset from anchor in natural image pixels [dx, dy]
// Negative Y = above the anchor point (near head)
const BUBBLE_SCENE_OFFSET = [-220, -300]; // ~head height above anchor, to the left

/**
 * Recompute character position and size from the scene coordinate system.
 * Uses the same getCoverInfo() as applyScreenTransform().
 */
function updateCharacterLayout() {
  if (!character) return;
  const nw = character.naturalWidth  || 1;
  const nh = character.naturalHeight || 1;

  const container = document.getElementById('scene-closeup');
  if (!container) return;
  const rect = container.getBoundingClientRect();

  const imgW = closeupImg.naturalWidth;
  const imgH = closeupImg.naturalHeight;
  if (!imgW || !imgH) return;

  const { coverScale, offX, offY } = getCoverInfo(rect, imgW, imgH);

  // Convert anchor from scene natural px to viewport px
  const vpX = rect.left + CHAR_SCENE_ANCHOR[0] * coverScale + offX;
  const vpY = rect.top  + CHAR_SCENE_ANCHOR[1] * coverScale + offY;

  // Rendered character dimensions
  const renderedH = CHAR_SCENE_HEIGHT * coverScale;
  const renderedW = (nw / nh) * renderedH;

  // Transparent padding offsets in rendered px
  const rightPadPx  = charPadFracRight  * renderedW;
  const bottomPadPx = charPadFracBottom * renderedH;

  // Position so that the anchor is the character's bottom-centre of the
  // opaque body. Adjust for transparent padding.
  // The opaque body's right edge = renderedW - rightPadPx
  // The opaque body's bottom edge = renderedH - bottomPadPx
  // We want the opaque bottom-centre at (vpX, vpY).
  const opaqueW = renderedW - rightPadPx;
  const opaqueH = renderedH - bottomPadPx;
  const left = vpX - opaqueW / 2;
  const top  = vpY - opaqueH;

  character.style.left   = `${left}px`;
  character.style.top    = `${top}px`;
  character.style.width  = `${renderedW}px`;
  character.style.height = `${renderedH}px`;

  // Speech bubble
  if (speechBubble) {
    const bubbleVpX = rect.left + (CHAR_SCENE_ANCHOR[0] + BUBBLE_SCENE_OFFSET[0]) * coverScale + offX;
    const bubbleVpY = rect.top  + (CHAR_SCENE_ANCHOR[1] + BUBBLE_SCENE_OFFSET[1]) * coverScale + offY;
    speechBubble.style.left = `${bubbleVpX - 200}px`; // max-width is 200px, right-align
    speechBubble.style.top  = `${bubbleVpY}px`;
  }
}

/**
 * Auto-detect transparent padding by scanning the character image alpha channel.
 */
function detectCharacterPadding() {
  try {
    const img = character;
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0);
    const data = c.getContext('2d').getImageData(0, 0, w, h).data;

    let maxX = 0, maxY = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (data[(y * w + x) * 4 + 3] > 16) {
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }

    charPadFracRight  = (w - (maxX + 1)) / w;
    charPadFracBottom = (h - (maxY + 1)) / h;
  } catch (e) {
    console.warn('Character padding auto-detect failed:', e);
    charPadFracRight  = 0;
    charPadFracBottom = 0;
  }
  updateCharacterLayout();
}

if (character) {
  const run = () => {
    if (CHAR_PAD.right !== null && CHAR_PAD.bottom !== null) {
      charPadFracRight  = CHAR_PAD.right;
      charPadFracBottom = CHAR_PAD.bottom;
    } else {
      detectCharacterPadding();
      return; // detectCharacterPadding calls updateCharacterLayout
    }
    updateCharacterLayout();
  };
  if (character.complete && character.naturalWidth) run();
  else character.addEventListener('load', run);

  // Recompute on resize — same as screen overlay.
  // Use wrapper so calibration mode can override via window.updateCharacterLayout.
  window.addEventListener('resize', () => {
    if (typeof window.updateCharacterLayout === 'function') {
      window.updateCharacterLayout();
    } else {
      updateCharacterLayout();
    }
  });
}

// Also observe #scene-closeup resize for character layout updates.
// Use a separate ResizeObserver (the screen overlay has its own in homography.js).
// Call via window.updateCharacterLayout so calibration mode can override it.
{
  const container = document.getElementById('scene-closeup');
  if (container) {
    const charObserver = new ResizeObserver(() => {
      if (typeof window.updateCharacterLayout === 'function') {
        window.updateCharacterLayout();
      } else {
        updateCharacterLayout();
      }
    });
    charObserver.observe(container);
  }
}

/* ─── Speech bubble content ─── */
if (speechBubble) {
  speechBubble.innerHTML = `
    Welcome! &#x2728;<br>
    I'm the interface<br>between worlds~
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Interactive calibration UI (?calibrate)
   ═══════════════════════════════════════════════════════════════════════════ */
if (window.location.search.includes('calibrate')) {
  // Force into closeup mode immediately
  sceneWide.classList.remove('active');
  sceneCloseup.classList.add('active');
  inCloseup = true;

  // Working copies
  const cal  = SCREEN_CORNERS.map(c => [...c]);
  const mids = [...EDGE_MIDS];

  const LABELS = ['TL', 'TR', 'BR', 'BL'];
  const COLORS = ['#ff4444','#44aaff','#44ff88','#ffcc44'];

  // Output panel
  const panel = document.createElement('div');
  panel.id = 'cal-panel';
  document.body.appendChild(panel);

  /**
   * Compute object-fit:cover layout — uniform coverScale with centred offsets.
   */
  function calCoverInfo() {
    const r   = closeupImg.getBoundingClientRect();
    const iW  = closeupImg.naturalWidth;
    const iH  = closeupImg.naturalHeight;
    const scale = Math.max(r.width / iW, r.height / iH);
    const oX  = (r.width  - iW * scale) / 2;
    const oY  = (r.height - iH * scale) / 2;
    return { r, scale, oX, oY };
  }

  function refresh() {
    initScreenTransform(cal, closeupImg.naturalWidth, closeupImg.naturalHeight, mids);
    updatePanel();
    repositionMidHandles();
  }

  /* ── Corner handles (circles) ── */
  cal.forEach((corner, i) => {
    const h = document.createElement('div');
    h.style.cssText = `
      position:fixed; width:18px; height:18px; margin:-9px;
      border-radius:50%; border:3px solid ${COLORS[i]};
      background:rgba(0,0,0,0.55); cursor:grab; z-index:10000;
      box-shadow:0 0 6px ${COLORS[i]};
      display:flex; align-items:center; justify-content:center;
      font:bold 8px sans-serif; color:${COLORS[i]};
    `;
    h.textContent = LABELS[i];
    document.body.appendChild(h);

    function reposition() {
      const { r, scale, oX, oY } = calCoverInfo();
      h.style.left = `${r.left + cal[i][0] * scale + oX}px`;
      h.style.top  = `${r.top  + cal[i][1] * scale + oY}px`;
    }
    reposition();
    window.addEventListener('resize', reposition);

    h.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      h.style.cursor = 'grabbing';
      const onMove = e => {
        const { r, scale, oX, oY } = calCoverInfo();
        cal[i][0] = Math.round((e.clientX - r.left - oX) / scale);
        cal[i][1] = Math.round((e.clientY - r.top  - oY) / scale);
        reposition();
        refresh();
      };
      const onUp = () => {
        h.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });

  /* ── Edge midpoint handles (diamonds) ── */
  const EDGE_LABELS  = ['T', 'R', 'B', 'L'];
  const EDGE_COLOR   = '#ff88ff';
  const midHandleEls = [];
  const EDGE_PAIRS = [[0,1],[1,2],[2,3],[3,0]];

  function getMidHandleScreenPos(i) {
    const { r, scale, oX, oY } = calCoverInfo();
    const [ai, bi] = EDGE_PAIRS[i];
    const a = cal[ai], b = cal[bi];
    const mx = r.left + (a[0]+b[0])/2 * scale + oX;
    const my = r.top  + (a[1]+b[1])/2 * scale + oY;
    const dx = b[0]-a[0], dy = b[1]-a[1];
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy/len, py = dx/len;
    const offsetPx = mids[i] * scale;
    return [mx + px*offsetPx, my + py*offsetPx];
  }

  function repositionMidHandles() {
    midHandleEls.forEach((el, i) => {
      const [lx, ly] = getMidHandleScreenPos(i);
      el.style.left = `${lx}px`;
      el.style.top  = `${ly}px`;
    });
  }

  EDGE_LABELS.forEach((label, i) => {
    const h = document.createElement('div');
    h.style.cssText = `
      position:fixed; width:16px; height:16px; margin:-8px;
      transform:rotate(45deg);
      border:2px solid ${EDGE_COLOR};
      background:rgba(0,0,0,0.55); cursor:grab; z-index:10000;
      box-shadow:0 0 6px ${EDGE_COLOR};
    `;
    document.body.appendChild(h);
    midHandleEls.push(h);

    h.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      h.style.cursor = 'grabbing';
      const startMid = mids[i];
      const startX = e.clientX, startY = e.clientY;

      const { scale } = calCoverInfo();
      const [ai, bi] = EDGE_PAIRS[i];
      const a = cal[ai], b = cal[bi];
      const dx = b[0]-a[0], dy = b[1]-a[1];
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy/len, py = dx/len;

      const onMove = e => {
        const drag = (e.clientX-startX)*px + (e.clientY-startY)*py;
        mids[i] = Math.round(startMid + drag / scale);
        refresh();
      };
      const onUp = () => {
        h.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });

  repositionMidHandles();
  window.addEventListener('resize', repositionMidHandles);

  // Make character visible immediately without animation
  if (character) {
    character.classList.add('visible');
    character.style.transition = 'none';
    updateCharacterLayout();
  }

  /* ── Character drag — drag the character in scene coordinates ── */
  // Working copies of scene anchor and height for calibration
  const calAnchor = [...CHAR_SCENE_ANCHOR];
  let calHeight = CHAR_SCENE_HEIGHT;

  // Override updateCharacterLayout to use calibration values
  const origUpdateCharacterLayout = updateCharacterLayout;
  window.updateCharacterLayoutCal = function() {
    if (!character) return;
    const nw = character.naturalWidth  || 1;
    const nh = character.naturalHeight || 1;

    const container = document.getElementById('scene-closeup');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const imgW = closeupImg.naturalWidth;
    const imgH = closeupImg.naturalHeight;
    if (!imgW || !imgH) return;

    const { coverScale, offX, offY } = getCoverInfo(rect, imgW, imgH);

    const vpX = rect.left + calAnchor[0] * coverScale + offX;
    const vpY = rect.top  + calAnchor[1] * coverScale + offY;

    const renderedH = calHeight * coverScale;
    const renderedW = (nw / nh) * renderedH;

    const rightPadPx  = charPadFracRight  * renderedW;
    const bottomPadPx = charPadFracBottom * renderedH;

    const opaqueW = renderedW - rightPadPx;
    const opaqueH = renderedH - bottomPadPx;
    const left = vpX - opaqueW / 2;
    const top  = vpY - opaqueH;

    character.style.left   = `${left}px`;
    character.style.top    = `${top}px`;
    character.style.width  = `${renderedW}px`;
    character.style.height = `${renderedH}px`;

    if (speechBubble) {
      const bubbleVpX = rect.left + (calAnchor[0] + BUBBLE_SCENE_OFFSET[0]) * coverScale + offX;
      const bubbleVpY = rect.top  + (calAnchor[1] + BUBBLE_SCENE_OFFSET[1]) * coverScale + offY;
      speechBubble.style.left = `${bubbleVpX - 200}px`;
      speechBubble.style.top  = `${bubbleVpY}px`;
    }
  };

  // Replace the global layout function with the calibration version
  // so ResizeObserver and window resize also use cal values
  window.updateCharacterLayout = window.updateCharacterLayoutCal;
  window.updateCharacterLayoutCal();

  // Enable pointer events on character for dragging in calibration mode
  if (character) {
    character.style.pointerEvents = 'auto';
    character.style.cursor = 'grab';

    character.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      character.style.cursor = 'grabbing';
      const startX = e.clientX, startY = e.clientY;
      const startAnchorX = calAnchor[0], startAnchorY = calAnchor[1];

      const container = document.getElementById('scene-closeup');
      const rect = container.getBoundingClientRect();
      const { coverScale } = getCoverInfo(rect, closeupImg.naturalWidth, closeupImg.naturalHeight);

      const onMove = e => {
        // Convert viewport drag delta to scene natural px
        calAnchor[0] = Math.round(startAnchorX + (e.clientX - startX) / coverScale);
        calAnchor[1] = Math.round(startAnchorY + (e.clientY - startY) / coverScale);
        window.updateCharacterLayoutCal();
        updatePanel();
      };
      const onUp = () => {
        character.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Mouse wheel to adjust character height
    character.addEventListener('wheel', e => {
      e.preventDefault();
      calHeight = Math.max(50, calHeight + (e.deltaY > 0 ? -20 : 20));
      window.updateCharacterLayoutCal();
      updatePanel();
    }, { passive: false });
  }

  function updatePanel() {
    panel.innerHTML =
      `<b style="color:#ffd700">&#x2699; Calibration</b>  <span style="color:#888;font-size:10px">&#x25CF;corners  &#x25C6;edges  drag character / scroll to resize</span><br><br>` +
      `<span style="color:#88ffcc">const SCREEN_CORNERS = [<br>` +
      cal.map((c,i) => `&nbsp;&nbsp;[${c[0]}, ${c[1]}], <span style="color:#555">// ${LABELS[i]}</span>`).join('<br>') +
      `<br>];<br><br>const EDGE_MIDS = [${mids.map(v=>Math.round(v)).join(', ')}];<br>` +
      `<span style="color:#888">// top, right, bottom, left</span></span><br><br>` +
      `<span style="color:#ffcc44">const CHAR_SCENE_ANCHOR = [${calAnchor[0]}, ${calAnchor[1]}];<br>` +
      `const CHAR_SCENE_HEIGHT = ${calHeight};<br><br>` +
      `<span style="color:#888">// Padding fracs: right=${(charPadFracRight * 100).toFixed(1)}%  bottom=${(charPadFracBottom * 100).toFixed(1)}%</span></span>`;
  }
  updatePanel();
}
