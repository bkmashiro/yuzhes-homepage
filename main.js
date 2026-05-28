/**
 * main.js
 * Scene transitions and overall page orchestration.
 *
 * ── Screen corner calibration ──────────────────────────────────────────────
 * Corners measured in natural-resolution pixels of assets/closeup.jpg.
 * Order: top-left, top-right, bottom-right, bottom-left.
 *
 * These are the intersection points of the screen-edge tangent lines
 * (extrapolated past the rounded corners of the CRT bezel).
 * Fine-tune interactively: append ?calibrate to the URL.
 * ──────────────────────────────────────────────────────────────────────────
 */

const SCREEN_CORNERS = [
  [317,  278],  // top-left
  [1065, 290],  // top-right
  [1079, 821],  // bottom-right
  [338,  869],  // bottom-left
];

// Edge midpoint offsets in image-natural px.
// Positive = bow OUTWARD (convex, away from screen centre) — correct for CRT glass.
// Negative = bow inward.  |value| must be < CLIP_EXPAND (80px rendered).
const EDGE_MIDS = [
  39,  // top    edge
  18,  // right  edge
  29,  // bottom edge
   4,  // left   edge
];

// Natural resolution of assets/closeup.jpg
// (read from image once loaded)
let CLOSEUP_IMG_SIZE = [1312, 1199]; // placeholder — updated on load

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
/**
 * Plays the wide→closeup zoom animation, then swaps scenes.
 * @param {MouseEvent} e  Click event on the wide scene (used to aim zoom)
 */
function zoomIntoScreen(e) {
  if (inCloseup) return;

  // Where did the user click, relative to the scene (0-1)
  const rect = sceneWide.getBoundingClientRect();
  const cx = (e.clientX - rect.left) / rect.width;
  const cy = (e.clientY - rect.top)  / rect.height;

  // We'll scale from the click point
  // CSS transform-origin trick on the wide image
  wideImg.style.transformOrigin = `${cx * 100}% ${cy * 100}%`;
  wideImg.style.transition = 'transform 0.9s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease 0.7s';
  wideImg.style.transform = 'scale(4)';
  wideImg.style.opacity = '0';

  setTimeout(() => {
    // Swap scenes
    sceneWide.classList.remove('active');
    sceneCloseup.classList.add('active');
    inCloseup = true;

    // Reset wide image for back-navigation
    wideImg.style.transition = 'none';
    wideImg.style.transform  = 'scale(1)';
    wideImg.style.opacity    = '1';

    // Show character
    if (character) {
      setTimeout(() => character.classList.add('visible'), 100);
    }
    if (speechBubble) {
      setTimeout(() => speechBubble.classList.add('visible'), 600);
    }

    // Apply CRT warp now that the desktop has rendered dimensions
    setTimeout(() => applyCRTWarp(), 50);
  }, 900);

  zoomHint.style.opacity = '0';
}

/* ─── Back to wide (click outside the screen area) ─── */
function zoomOut() {
  if (!inCloseup) return;

  sceneCloseup.classList.remove('active');
  sceneWide.classList.add('active');
  inCloseup = false;

  if (character) character.classList.remove('visible');
  if (speechBubble) speechBubble.classList.remove('visible');

  setTimeout(() => { zoomHint.style.opacity = '1'; }, 600);
}

/* ─── Escape key to go back ─── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') zoomOut();
});

/* ─── Click on wide scene to zoom in ─── */
sceneWide.addEventListener('click', zoomIntoScreen);

/* ─── Click on closeup background (not on screen or UI) to zoom out ─── */
closeupImg.addEventListener('click', zoomOut);

/* ─── Init screen overlay once closeup image loads ─── */
closeupImg.addEventListener('load', () => {
  CLOSEUP_IMG_SIZE = [closeupImg.naturalWidth, closeupImg.naturalHeight];
  initScreenTransform(SCREEN_CORNERS, ...CLOSEUP_IMG_SIZE, EDGE_MIDS);
});

// If already cached / loaded synchronously
if (closeupImg.complete && closeupImg.naturalWidth) {
  CLOSEUP_IMG_SIZE = [closeupImg.naturalWidth, closeupImg.naturalHeight];
  initScreenTransform(SCREEN_CORNERS, ...CLOSEUP_IMG_SIZE, EDGE_MIDS);
}

/* ─── Init Win98 desktop ─── */
initWin98();

/* ─── CRT barrel warp ─── */
// Applied after entering closeup (win98-desktop has layout by then)
// and on resize (handled inside warp.js)

/* ─── Speech bubble content ─── */
if (speechBubble) {
  speechBubble.innerHTML = `
    Welcome! ✨<br>
    I'm the interface<br>between worlds~
  `;
}

/* ─── Interactive calibration UI (?calibrate) ─── */
if (window.location.search.includes('calibrate')) {
  // Force into closeup mode immediately
  sceneWide.classList.remove('active');
  sceneCloseup.classList.add('active');
  inCloseup = true;

  // Working copies
  const cal  = SCREEN_CORNERS.map(c => [...c]);
  const mids = [...EDGE_MIDS]; // [top, right, bottom, left] in image-natural px

  const LABELS = ['TL', 'TR', 'BR', 'BL'];
  const COLORS  = ['#ff4444','#44aaff','#44ff88','#ffcc44'];

  // Output panel
  const panel = document.createElement('div');
  panel.id = 'cal-panel';
  panel.style.cssText = `
    position:fixed; bottom:12px; left:12px; z-index:9999;
    background:rgba(0,0,0,0.82); color:#fff;
    font:12px/1.5 monospace; padding:12px 16px; border-radius:8px;
    pointer-events:none; max-width:340px;
  `;
  document.body.appendChild(panel);

  /**
   * Same coordinate math as applyScreenTransform: object-fit cover → uniform
   * coverScale with centred offsets.  All calibration handle positioning and
   * drag reading must use this so the stored natural-px values are correct at
   * every viewport size.
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
  const EDGE_LABELS  = ['▲T', '▶R', '▼B', '◀L'];
  const EDGE_COLOR   = '#ff88ff';
  const midHandleEls = [];

  // Edge pair indices: 0=top(0→1), 1=right(1→2), 2=bottom(2→3), 3=left(3→0)
  const EDGE_PAIRS = [[0,1],[1,2],[2,3],[3,0]];

  function getMidHandleScreenPos(i) {
    const { r, scale, oX, oY } = calCoverInfo();
    const [ai, bi] = EDGE_PAIRS[i];
    const a = cal[ai], b = cal[bi];
    // Midpoint in natural px → screen px
    const mx = r.left + (a[0]+b[0])/2 * scale + oX;
    const my = r.top  + (a[1]+b[1])/2 * scale + oY;
    // Edge direction in natural px (uniform scale ⇒ same unit vector in screen space)
    const dx = b[0]-a[0], dy = b[1]-a[1];
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy/len, py = dx/len; // perp outward unit vector
    // mids[i] in natural px → screen px via uniform coverScale
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

      // Perpendicular direction in screen space (uniform scale ⇒ same direction as natural)
      const { scale } = calCoverInfo();
      const [ai, bi] = EDGE_PAIRS[i];
      const a = cal[ai], b = cal[bi];
      const dx = b[0]-a[0], dy = b[1]-a[1];
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy/len, py = dx/len; // perp outward unit vec

      const onMove = e => {
        const drag = (e.clientX-startX)*px + (e.clientY-startY)*py;
        // drag is in screen px; divide by coverScale to get natural px
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

  /* ── Character position/scale calibration ── */
  // charState: [right%, bottom%, height%] as percentages of scene container
  const charState = { right: 8, bottom: 0, height: 45 };

  updatePanel();

  function applyCharState() {
    if (!character) return;
    character.style.right  = `${charState.right}%`;
    character.style.bottom = `${charState.bottom}%`;
    character.style.height = `${charState.height}%`;
    character.style.opacity = '1';
    character.style.transform = 'none';
    updatePanel();
  }
  applyCharState();

  function updatePanel() {
    panel.innerHTML =
      `<b style="color:#ffd700">⚙ Calibration</b>  <span style="color:#888;font-size:10px">●corners  ◆edges  ★char</span><br><br>` +
      `<span style="color:#88ffcc">const SCREEN_CORNERS = [<br>` +
      cal.map((c,i) => `&nbsp;&nbsp;[${c[0]}, ${c[1]}], <span style="color:#555">// ${LABELS[i]}</span>`).join('<br>') +
      `<br>];<br><br>const EDGE_MIDS = [${mids.map(v=>Math.round(v)).join(', ')}];<br>` +
      `<span style="color:#888">// top, right, bottom, left</span><br><br>` +
      `<span style="color:#ffcc44">// Character<br>` +
      `right:${charState.right.toFixed(1)}% bottom:${charState.bottom.toFixed(1)}% height:${charState.height.toFixed(1)}%</span></span>`;
  }

  // Character drag handle — a star marker
  const charHandle = document.createElement('div');
  charHandle.style.cssText = `
    position:fixed; width:20px; height:20px; margin:-10px;
    background:#ffcc44; border-radius:50%; cursor:grab; z-index:10000;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; box-shadow:0 0 8px #ffcc44;
  `;
  charHandle.textContent = '★';
  document.body.appendChild(charHandle);

  // Scale handle — smaller circle above the main handle
  const scaleHandle = document.createElement('div');
  scaleHandle.style.cssText = `
    position:fixed; width:16px; height:16px; margin:-8px;
    background:#ff88ff; border-radius:50%; cursor:ns-resize; z-index:10000;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; box-shadow:0 0 6px #ff88ff;
  `;
  scaleHandle.textContent = '↕';
  document.body.appendChild(scaleHandle);

  function repositionCharHandles() {
    const r = sceneCloseup.getBoundingClientRect();
    // Bottom-anchor position of character
    const bx = r.right  - (charState.right  / 100) * r.width;
    const by = r.bottom - (charState.bottom / 100) * r.height;
    charHandle.style.left = `${bx}px`;
    charHandle.style.top  = `${by}px`;
    // Scale handle sits 30px above drag handle
    scaleHandle.style.left = `${bx}px`;
    scaleHandle.style.top  = `${by - 30}px`;
  }
  repositionCharHandles();
  window.addEventListener('resize', repositionCharHandles);

  // Drag to reposition
  charHandle.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    charHandle.style.cursor = 'grabbing';
    const startX = e.clientX, startY = e.clientY;
    const startR = charState.right, startB = charState.bottom;
    const r = sceneCloseup.getBoundingClientRect();
    const onMove = e => {
      // Right increases as we move left, bottom increases as we move up
      charState.right  = Math.max(0, startR  - (e.clientX - startX) / r.width  * 100);
      charState.bottom = Math.max(0, startB  - (e.clientY - startY) / r.height * 100);
      applyCharState();
      repositionCharHandles();
    };
    const onUp = () => {
      charHandle.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Drag scale handle vertically to resize
  scaleHandle.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    scaleHandle.style.cursor = 'grabbing';
    const startY = e.clientY, startH = charState.height;
    const r = sceneCloseup.getBoundingClientRect();
    const onMove = e => {
      // Drag up = bigger
      charState.height = Math.max(5, Math.min(100, startH - (e.clientY - startY) / r.height * 100));
      applyCharState();
      repositionCharHandles();
    };
    const onUp = () => {
      scaleHandle.style.cursor = 'ns-resize';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}
