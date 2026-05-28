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

/* ─── Character transparent-padding compensation ────────────────────────
 * The character image has transparent padding around the visible body.
 * We scan for the rightmost and bottommost opaque pixels, then compute
 * pixel offsets to push the transparent area off-screen so the visible
 * body stays anchored to the bottom-right of the viewport.
 *
 * Math:
 *   renderedH = 45vh (in px)
 *   renderedW = naturalW / naturalH * renderedH
 *   rightPadPx  = (naturalW - rightmostOpaqueX) / naturalH * renderedH
 *   bottomPadPx = (naturalH - bottommostOpaqueY) / naturalH * renderedH
 *   transform: translateX(rightPadPx) translateY(bottomPadPx)
 *
 * Recomputed on resize since 45vh changes in absolute pixels.
 * ──────────────────────────────────────────────────────────────────────── */

// Hard-coded transparent padding fractions (normalised 0..1).
// Set these after running ?calibrate and noting the values in the panel.
// null = auto-detect via canvas (only works when served with CORS headers).
const CHAR_PAD = { right: null, bottom: null };

// Normalised transparent padding fractions (set by alpha scan or fallback)
let charPadRight  = 0; // (naturalW - rightmostOpaqueX) / naturalW
let charPadBottom = 0; // (naturalH - bottommostOpaqueY) / naturalH

function updateCharacterTransform() {
  if (!character) return;
  const renderedH = window.innerHeight * 0.45; // 45vh in px
  const nw = character.naturalWidth  || 1;
  const nh = character.naturalHeight || 1;
  const renderedW = (nw / nh) * renderedH;

  const rightPx  = charPadRight  * renderedW;
  const bottomPx = charPadBottom * renderedH;

  character.style.setProperty('--char-tx', `${rightPx.toFixed(1)}px`);
  character.style.setProperty('--char-ty', `${bottomPx.toFixed(1)}px`);
}

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

    // Fraction of image that is transparent padding on each side
    charPadRight  = (w - (maxX + 1)) / w;
    charPadBottom = (h - (maxY + 1)) / h;
  } catch (e) {
    console.warn('Character padding auto-detect failed:', e);
    charPadRight  = 0;
    charPadBottom = 0;
  }
  updateCharacterTransform();
}

if (character) {
  const run = () => {
    if (CHAR_PAD.right !== null && CHAR_PAD.bottom !== null) {
      // Use hard-coded values (reliable, no CORS needed)
      charPadRight  = CHAR_PAD.right;
      charPadBottom = CHAR_PAD.bottom;
      updateCharacterTransform();
    } else {
      detectCharacterPadding(); // canvas scan (needs CORS or same-origin)
    }
  };
  if (character.complete && character.naturalWidth) run();
  else character.addEventListener('load', run);

  window.addEventListener('resize', updateCharacterTransform);
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
  }

  /* ── Character drag — drag the character body directly ── */
  // Track extra right/bottom offset (in px) applied on top of the auto-detected padding
  let calOffsetRight = 0;
  let calOffsetBottom = 0;

  function applyCalOffset() {
    if (!character) return;
    const renderedH = window.innerHeight * 0.45;
    const nw = character.naturalWidth || 1;
    const nh = character.naturalHeight || 1;
    const renderedW = (nw / nh) * renderedH;

    const rightPx  = charPadRight  * renderedW + calOffsetRight;
    const bottomPx = charPadBottom * renderedH + calOffsetBottom;

    character.style.setProperty('--char-tx', `${rightPx.toFixed(1)}px`);
    character.style.setProperty('--char-ty', `${bottomPx.toFixed(1)}px`);
    updatePanel();
  }

  // Enable pointer events on character for dragging in calibration mode
  if (character) {
    character.style.pointerEvents = 'auto';
    character.style.cursor = 'grab';

    character.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      character.style.cursor = 'grabbing';
      const startX = e.clientX, startY = e.clientY;
      const startOR = calOffsetRight, startOB = calOffsetBottom;

      const onMove = e => {
        // Dragging right increases the right offset (pushes image right = more off-screen)
        // But intuitively dragging right should move the visible body right,
        // which means DECREASING the right offset (less compensation)
        calOffsetRight  = startOR - (e.clientX - startX);
        calOffsetBottom = startOB - (e.clientY - startY);
        applyCalOffset();
      };
      const onUp = () => {
        character.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  function updatePanel() {
    const renderedH = window.innerHeight * 0.45;
    const nw = (character && character.naturalWidth) || 1;
    const nh = (character && character.naturalHeight) || 1;
    const renderedW = (nw / nh) * renderedH;
    const totalRightPx  = charPadRight  * renderedW + calOffsetRight;
    const totalBottomPx = charPadBottom * renderedH + calOffsetBottom;

    panel.innerHTML =
      `<b style="color:#ffd700">&#x2699; Calibration</b>  <span style="color:#888;font-size:10px">&#x25CF;corners  &#x25C6;edges  drag character to reposition</span><br><br>` +
      `<span style="color:#88ffcc">const SCREEN_CORNERS = [<br>` +
      cal.map((c,i) => `&nbsp;&nbsp;[${c[0]}, ${c[1]}], <span style="color:#555">// ${LABELS[i]}</span>`).join('<br>') +
      `<br>];<br><br>const EDGE_MIDS = [${mids.map(v=>Math.round(v)).join(', ')}];<br>` +
      `<span style="color:#888">// top, right, bottom, left</span><br><br>` +
      `<span style="color:#ffcc44">// Character padding (auto-detected)<br>` +
      `padRight: ${(charPadRight * 100).toFixed(1)}%  padBottom: ${(charPadBottom * 100).toFixed(1)}%<br>` +
      `// Rendered offset: right=${totalRightPx.toFixed(1)}px  bottom=${totalBottomPx.toFixed(1)}px<br>` +
      `// Manual adjustment: right=${calOffsetRight.toFixed(1)}px  bottom=${calOffsetBottom.toFixed(1)}px</span></span>`;
  }
  updatePanel();
}
