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

/* ─── Character transparent-padding compensation ───────────────────────────
 * The generated anime-girl.png has large transparent areas on each side.
 * position:fixed right/bottom anchors the IMAGE box, not the visible body.
 * As the viewport height changes, width:auto scales the image, so the blank
 * area in pixels grows/shrinks → drift in the character's apparent position.
 *
 * Fix: detect the non-transparent bounding box via canvas, then set CSS vars
 * --ctx / --cty so the CSS transform shifts the image by exactly the blank
 * fractions (translateX(rFrac*100%) uses own width, so it scales perfectly).
 * ──────────────────────────────────────────────────────────────────────────*/
function applyCharacterTrim(img) {
  try {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;

    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 16) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Fraction of image width/height that is blank on the right / bottom
    const rFrac = (w - 1 - maxX) / w;
    const bFrac = (h - 1 - maxY) / h;

    // CSS vars consumed by #character transform in style.css
    img.style.setProperty('--ctx', `${(rFrac * 100).toFixed(3)}%`);
    img.style.setProperty('--cty', `${(bFrac * 100).toFixed(3)}%`);
  } catch (err) {
    // Canvas tainted (cross-origin) or other error — leave defaults
    console.warn('Character trim skipped:', err);
  }
}

if (character) {
  if (character.complete && character.naturalWidth) {
    applyCharacterTrim(character);
  } else {
    character.addEventListener('load', () => applyCharacterTrim(character));
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

  /* ── Character position/scale calibration ── */
  const charState = { right: 8, bottom: 0, height: 45 };

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
      `<b style="color:#ffd700">&#x2699; Calibration</b>  <span style="color:#888;font-size:10px">&#x25CF;corners  &#x25C6;edges  &#x2605;char</span><br><br>` +
      `<span style="color:#88ffcc">const SCREEN_CORNERS = [<br>` +
      cal.map((c,i) => `&nbsp;&nbsp;[${c[0]}, ${c[1]}], <span style="color:#555">// ${LABELS[i]}</span>`).join('<br>') +
      `<br>];<br><br>const EDGE_MIDS = [${mids.map(v=>Math.round(v)).join(', ')}];<br>` +
      `<span style="color:#888">// top, right, bottom, left</span><br><br>` +
      `<span style="color:#ffcc44">// Character<br>` +
      `right:${charState.right.toFixed(1)}% bottom:${charState.bottom.toFixed(1)}% height:${charState.height.toFixed(1)}%</span></span>`;
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
