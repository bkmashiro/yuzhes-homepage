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

/* ─── Character anchor point ─────────────────────────────────────────────
 * Like a game-engine pivot: (ax, ay) is the normalised point within the
 * image that should sit at the CSS position anchor (right/bottom edges).
 *   (0,0) = image top-left   (1,1) = image bottom-right
 *
 * CSS right:0 / bottom:0 docks the IMAGE's outer bottom-right corner.
 * We then apply:
 *   translateX((1-ax)*100%)  — shifts image right so the ax column aligns
 *   translateY((1-ay)*100%)  — shifts image down  so the ay row    aligns
 * Because 100% = own width/height, this is viewport-size-independent.
 *
 * CHAR_ANCHOR can be set manually or left null for auto-detection
 * (canvas alpha scan finds the bounding box of non-transparent pixels).
 * ──────────────────────────────────────────────────────────────────────── */
const CHAR_ANCHOR = { x: null, y: null }; // null = auto-detect from alpha

function applyCharacterAnchor(ax, ay) {
  character.style.setProperty('--ctx', `${((1 - ax) * 100).toFixed(3)}%`);
  character.style.setProperty('--cty', `${((1 - ay) * 100).toFixed(3)}%`);
}

function detectCharacterAnchor() {
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

    // Anchor = rightmost / bottommost non-transparent pixel (normalised)
    applyCharacterAnchor((maxX + 1) / w, (maxY + 1) / h);
  } catch (e) {
    console.warn('Character anchor auto-detect failed:', e);
    applyCharacterAnchor(0.5, 1.0); // fallback: bottom-centre
  }
}

if (character) {
  const ax = CHAR_ANCHOR.x, ay = CHAR_ANCHOR.y;
  const run = () => (ax !== null && ay !== null)
    ? applyCharacterAnchor(ax, ay)
    : detectCharacterAnchor();
  if (character.complete && character.naturalWidth) run();
  else character.addEventListener('load', run);
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
   * All calibration handle positioning and drag reading use this same math.
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

  /* ── Character position/scale calibration state ── */
  // Declared here (before getDock/getCharRenderSize are called) to avoid TDZ.
  const charState = { right: 8, bottom: 0, height: 45 };

  /* ── Anchor calibration state ── */
  // anchorCal: which normalised point of the image maps to the dock position.
  // Declared early so updatePanel() (called from applyCharState()) can read it.
  let anchorCal = { x: 0.5, y: 1.0 };

  /* ── Anchor handle (⊕) ── drag to set pivot point on character ── */
  // The ⊕ sits at the dock position (= where the anchor maps on screen).
  // Drag it to the character's butt/feet; on release the character shifts
  // so that exact image point becomes the new dock.
  const anchorHandle = document.createElement('div');
  anchorHandle.style.cssText = `
    position:fixed; width:22px; height:22px; margin:-11px;
    border-radius:50%; border:2px solid #fff;
    background:rgba(255,80,80,0.85); cursor:crosshair; z-index:10000;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; box-shadow:0 0 8px rgba(255,80,80,0.9);
  `;
  anchorHandle.textContent = '\u2295'; // ⊕
  anchorHandle.title = 'Drag onto character pivot (butt/feet) then release';
  document.body.appendChild(anchorHandle);

  function getDock() {
    return {
      x: window.innerWidth  * (1 - charState.right  / 100),
      y: window.innerHeight * (1 - charState.bottom / 100),
    };
  }
  function getCharRenderSize() {
    const h = window.innerHeight * (charState.height / 100);
    const w = character.naturalWidth / character.naturalHeight * h;
    return { w, h };
  }

  function repositionAnchorHandle() {
    const d = getDock();
    anchorHandle.style.left = `${d.x}px`;
    anchorHandle.style.top  = `${d.y}px`;
  }
  repositionAnchorHandle();
  window.addEventListener('resize', repositionAnchorHandle);

  anchorHandle.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    anchorHandle.style.cursor = 'grabbing';
    // Freeze image position at drag start
    const snap = { ax: anchorCal.x, ay: anchorCal.y };
    const dock  = getDock();
    const { w, h } = getCharRenderSize();

    const onMove = e => {
      // Move handle with mouse (visual feedback only — image stays frozen)
      anchorHandle.style.left = `${e.clientX}px`;
      anchorHandle.style.top  = `${e.clientY}px`;
    };
    const onUp = e => {
      // Compute image coordinate at release position (based on frozen image layout)
      const dx = e.clientX - dock.x;
      const dy = e.clientY - dock.y;
      anchorCal.x = Math.max(0, Math.min(1, snap.ax + dx / w));
      anchorCal.y = Math.max(0, Math.min(1, snap.ay + dy / h));
      applyCharacterAnchor(anchorCal.x, anchorCal.y);
      anchorHandle.style.cursor = 'crosshair';
      repositionAnchorHandle(); // snap back to dock
      updatePanel();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Make character visible without animation; anchor transform (CSS) handles position
  if (character) {
    character.classList.add('visible');
    character.style.transition = 'none';
  }

  function applyCharState() {
    if (!character) return;
    character.style.right  = `${charState.right}%`;
    character.style.bottom = `${charState.bottom}%`;
    character.style.height = `${charState.height}%`;
    // opacity/transform handled by .visible class + anchor CSS vars
    updatePanel();
  }
  applyCharState();

  function initAnchorCal() {
    if (!character || !character.complete || !character.naturalWidth) return;
    try {
      const w = character.naturalWidth, h = character.naturalHeight;
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(character, 0, 0);
      const d = cv.getContext('2d').getImageData(0, 0, w, h).data;
      let maxX = 0, maxY = 0;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          if (d[(y * w + x) * 4 + 3] > 16) {
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
      anchorCal.x = (maxX + 1) / w;
      anchorCal.y = (maxY + 1) / h;
    } catch (e) { /* leave defaults */ }
    applyCharacterAnchor(anchorCal.x, anchorCal.y);
    updatePanel();
  }
  if (character) {
    if (character.complete && character.naturalWidth) initAnchorCal();
    else character.addEventListener('load', initAnchorCal);
  }

  function updatePanel() {
    panel.innerHTML =
      `<b style="color:#ffd700">&#x2699; Calibration</b>  <span style="color:#888;font-size:10px">&#x25CF;corners  &#x25C6;edges  &#x2605;char  &#x2295;anchor</span><br><br>` +
      `<span style="color:#88ffcc">const SCREEN_CORNERS = [<br>` +
      cal.map((c,i) => `&nbsp;&nbsp;[${c[0]}, ${c[1]}], <span style="color:#555">// ${LABELS[i]}</span>`).join('<br>') +
      `<br>];<br><br>const EDGE_MIDS = [${mids.map(v=>Math.round(v)).join(', ')}];<br>` +
      `<span style="color:#888">// top, right, bottom, left</span><br><br>` +
      `<span style="color:#ffcc44">// Character position<br>` +
      `right:${charState.right.toFixed(1)}% bottom:${charState.bottom.toFixed(1)}% height:${charState.height.toFixed(1)}%<br><br>` +
      `// Anchor (pivot point, normalised 0..1)<br>` +
      `CHAR_ANCHOR = { x: ${anchorCal.x.toFixed(4)}, y: ${anchorCal.y.toFixed(4)} }</span></span>`;
  }
  updatePanel();

  // Character drag handle
  const charHandle = document.createElement('div');
  charHandle.style.cssText = `
    position:fixed; width:20px; height:20px; margin:-10px;
    background:#ffcc44; border-radius:50%; cursor:grab; z-index:10000;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; box-shadow:0 0 8px #ffcc44;
  `;
  charHandle.textContent = '\u2605';
  document.body.appendChild(charHandle);

  // Scale handle
  const scaleHandle = document.createElement('div');
  scaleHandle.style.cssText = `
    position:fixed; width:16px; height:16px; margin:-8px;
    background:#ff88ff; border-radius:50%; cursor:ns-resize; z-index:10000;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; box-shadow:0 0 6px #ff88ff;
  `;
  scaleHandle.textContent = '\u2195';
  document.body.appendChild(scaleHandle);

  function repositionCharHandles() {
    const r = sceneCloseup.getBoundingClientRect();
    const bx = r.right  - (charState.right  / 100) * r.width;
    const by = r.bottom - (charState.bottom / 100) * r.height;
    charHandle.style.left = `${bx}px`;
    charHandle.style.top  = `${by}px`;
    scaleHandle.style.left = `${bx}px`;
    scaleHandle.style.top  = `${by - 30}px`;
  }
  repositionCharHandles();
  window.addEventListener('resize', repositionCharHandles);

  charHandle.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    charHandle.style.cursor = 'grabbing';
    const startX = e.clientX, startY = e.clientY;
    const startR = charState.right, startB = charState.bottom;
    const r = sceneCloseup.getBoundingClientRect();
    const onMove = e => {
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

  scaleHandle.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    scaleHandle.style.cursor = 'grabbing';
    const startY = e.clientY, startH = charState.height;
    const r = sceneCloseup.getBoundingClientRect();
    const onMove = e => {
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
