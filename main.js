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
  20,  // top    edge
  12,  // right  edge
  20,  // bottom edge
  12,  // left   edge
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

  function refresh() {
    initScreenTransform(cal, closeupImg.naturalWidth, closeupImg.naturalHeight, mids);
    updatePanel();
    repositionMidHandles();
  }

  function updatePanel() {
    panel.innerHTML =
      `<b style="color:#ffd700">⚙ Calibration</b>  <span style="color:#888;font-size:10px">●corners  ◆edges</span><br><br>` +
      `<span style="color:#88ffcc">const SCREEN_CORNERS = [<br>` +
      cal.map((c,i) => `&nbsp;&nbsp;[${c[0]}, ${c[1]}], <span style="color:#555">// ${LABELS[i]}</span>`).join('<br>') +
      `<br>];<br><br>const EDGE_MIDS = [${mids.map(v=>Math.round(v)).join(', ')}];<br>` +
      `<span style="color:#888">// top, right, bottom, left</span></span>`;
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
      const r = closeupImg.getBoundingClientRect();
      h.style.left = `${r.left + cal[i][0] * (r.width  / closeupImg.naturalWidth)}px`;
      h.style.top  = `${r.top  + cal[i][1] * (r.height / closeupImg.naturalHeight)}px`;
    }
    reposition();
    window.addEventListener('resize', reposition);

    h.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      h.style.cursor = 'grabbing';
      const onMove = e => {
        const r = closeupImg.getBoundingClientRect();
        cal[i][0] = Math.round((e.clientX - r.left) * (closeupImg.naturalWidth  / r.width));
        cal[i][1] = Math.round((e.clientY - r.top)  * (closeupImg.naturalHeight / r.height));
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
  // Each edge midpoint handle sits at the geometric midpoint of the edge
  // and can only be dragged perpendicular to that edge.
  // Dragging changes mids[i] (offset in image-natural px).
  const EDGE_LABELS  = ['▲T', '▶R', '▼B', '◀L'];
  const EDGE_COLOR   = '#ff88ff';
  const midHandleEls = [];

  function getMidHandleScreenPos(i) {
    // Midpoint of the edge in image-natural coords
    const r = closeupImg.getBoundingClientRect();
    const sX = r.width  / closeupImg.naturalWidth;
    const sY = r.height / closeupImg.naturalHeight;
    // Edges: 0=top(TL→TR), 1=right(TR→BR), 2=bottom(BR→BL), 3=left(BL→TL)
    const edgePts = [
      [cal[0], cal[1]],  // top
      [cal[1], cal[2]],  // right
      [cal[2], cal[3]],  // bottom
      [cal[3], cal[0]],  // left
    ];
    const [a, b] = edgePts[i];
    // Geometric midpoint
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    // Perpendicular unit vector (inward direction)
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    // Perpendicular outward: rotate 90°
    // For top: perp is (0,-1); for right: (1,0); etc. But let's compute generically:
    const px = -dy / len, py = dx / len;
    // Offset in image-natural px → screen px
    const offsetPx = mids[i] * Math.hypot(sX, sY) / Math.SQRT2;
    return [
      r.left + mx * sX + px * offsetPx,
      r.top  + my * sY + py * offsetPx,
    ];
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

    // Perpendicular drag axis depends on edge
    h.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      h.style.cursor = 'grabbing';
      const startMid = mids[i];
      const startX = e.clientX, startY = e.clientY;

      // Compute perpendicular direction in screen space for this edge
      const r = closeupImg.getBoundingClientRect();
      const sX = r.width  / closeupImg.naturalWidth;
      const sY = r.height / closeupImg.naturalHeight;
      const edgePts = [
        [cal[0], cal[1]], [cal[1], cal[2]],
        [cal[2], cal[3]], [cal[3], cal[0]],
      ];
      const [a, b] = edgePts[i];
      const dx = (b[0]-a[0])*sX, dy = (b[1]-a[1])*sY;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy/len, py = dx/len; // perp outward unit vec in screen px

      const onMove = e => {
        const drag = (e.clientX-startX)*px + (e.clientY-startY)*py;
        const imgScale = Math.hypot(sX, sY) / Math.SQRT2;
        mids[i] = Math.round(startMid + drag / imgScale);
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

  updatePanel();
}
