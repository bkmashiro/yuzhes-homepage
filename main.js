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
  initScreenTransform(SCREEN_CORNERS, ...CLOSEUP_IMG_SIZE);
});

// If already cached / loaded synchronously
if (closeupImg.complete && closeupImg.naturalWidth) {
  CLOSEUP_IMG_SIZE = [closeupImg.naturalWidth, closeupImg.naturalHeight];
  initScreenTransform(SCREEN_CORNERS, ...CLOSEUP_IMG_SIZE);
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

  // Working copy of corners (in image-natural px)
  const cal = SCREEN_CORNERS.map(c => [...c]);
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

  function updatePanel() {
    panel.innerHTML =
      `<b style="color:#ffd700">⚙ Calibration mode</b><br>` +
      `Drag handles to align. Copy to main.js:<br><br>` +
      `<span style="color:#88ffcc">const SCREEN_CORNERS = [<br>` +
      cal.map((c,i) => `&nbsp;&nbsp;[${c[0]}, ${c[1]}], <span style="color:#666">// ${LABELS[i]}</span>`).join('<br>') +
      `<br>];</span>`;
  }

  // Create draggable handles positioned over the image
  const handles = cal.map((corner, i) => {
    const h = document.createElement('div');
    h.style.cssText = `
      position:fixed; width:18px; height:18px; margin:-9px;
      border-radius:50%; border:3px solid ${COLORS[i]};
      background:rgba(0,0,0,0.5); cursor:grab; z-index:10000;
      box-shadow:0 0 6px ${COLORS[i]};
      display:flex; align-items:center; justify-content:center;
      font:bold 8px sans-serif; color:${COLORS[i]};
    `;
    h.textContent = LABELS[i];
    document.body.appendChild(h);

    function reposition() {
      const rect  = closeupImg.getBoundingClientRect();
      const scaleX = rect.width  / closeupImg.naturalWidth;
      const scaleY = rect.height / closeupImg.naturalHeight;
      h.style.left = `${rect.left + cal[i][0] * scaleX}px`;
      h.style.top  = `${rect.top  + cal[i][1] * scaleY}px`;
    }
    reposition();

    // Drag
    h.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();
      h.style.cursor = 'grabbing';

      function onMove(e) {
        const rect   = closeupImg.getBoundingClientRect();
        const scaleX = closeupImg.naturalWidth  / rect.width;
        const scaleY = closeupImg.naturalHeight / rect.height;
        cal[i][0] = Math.round((e.clientX - rect.left) * scaleX);
        cal[i][1] = Math.round((e.clientY - rect.top)  * scaleY);
        reposition();
        initScreenTransform(cal, closeupImg.naturalWidth, closeupImg.naturalHeight);
        updatePanel();
      }
      function onUp() {
        h.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    window.addEventListener('resize', reposition);
    return { reposition };
  });

  updatePanel();
}
