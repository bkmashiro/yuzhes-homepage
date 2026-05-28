/**
 * main.js
 * Scene transitions and overall page orchestration.
 *
 * ── Screen corner calibration ──────────────────────────────────────────────
 * Measure the 4 corners of the CRT screen in the CLOSEUP image using
 * Photoshop (or any tool), then update SCREEN_CORNERS below.
 *
 * Order: top-left, top-right, bottom-right, bottom-left
 * Units: pixels in the image's natural (full) resolution
 *
 * Example (placeholder — update with real PS measurements):
 *   SCREEN_CORNERS = [[312, 198], [948, 182], [972, 714], [288, 730]]
 *
 * CLOSEUP_IMG_SIZE = [naturalWidth, naturalHeight] of closeup.jpg
 * ──────────────────────────────────────────────────────────────────────────
 */

const SCREEN_CORNERS = [
  [312, 198],  // top-left     ← replace with your PS values
  [948, 182],  // top-right
  [972, 714],  // bottom-right
  [288, 730],  // bottom-left
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

/* ─── Dev helper: click to log coordinates ─── */
if (window.location.search.includes('calibrate')) {
  closeupImg.style.cursor = 'crosshair';
  const log = [];
  closeupImg.addEventListener('click', e => {
    e.stopPropagation();
    const rect = closeupImg.getBoundingClientRect();
    const scaleX = closeupImg.naturalWidth  / rect.width;
    const scaleY = closeupImg.naturalHeight / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top)  * scaleY);
    log.push([x, y]);
    console.log(`Corner ${log.length}: [${x}, ${y}]`);
    if (log.length === 4) {
      console.log('SCREEN_CORNERS =', JSON.stringify(log));
    }
  }, true);
}
