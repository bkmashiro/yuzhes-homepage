/**
 * win98.js
 * Lightweight Win98-style desktop environment.
 * Creates icons, handles drag-to-move windows, taskbar, clock, start menu.
 */

import { saySpeech } from './main.js';
import mikuArt1 from './miku-ascii-art-1.txt?raw';
import mikuArt2 from './miku-ascii-art-2.txt?raw';

let _audioCtx2 = null;
function playTypingClick() {
  try {
    if (!_audioCtx2) _audioCtx2 = new (window.AudioContext||window.webkitAudioContext)();
    const ctx = _audioCtx2;
    const buf = ctx.createBuffer(1, ctx.sampleRate*0.03, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0; i<data.length; i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(data.length*0.15));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain(); gain.gain.value = 0.08;
    src.connect(gain); gain.connect(ctx.destination);
    src.start();
  } catch(e) {}
}

/* ─── Icon pixel art (SVG data URIs) ─── */
const ICONS = {
  myComputer: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='4' y='4' width='24' height='18' fill='%23c0c0c0' stroke='%23000' stroke-width='1'/><rect x='6' y='6' width='20' height='14' fill='%230000aa'/><rect x='10' y='22' width='12' height='3' fill='%23c0c0c0'/><rect x='7' y='25' width='18' height='2' fill='%23808080'/></svg>`,
  folder:     `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='10' width='28' height='18' fill='%23ffd700' stroke='%23b8860b' stroke-width='1'/><rect x='2' y='8' width='10' height='4' fill='%23ffd700' stroke='%23b8860b' stroke-width='1'/></svg>`,
  notepad:    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='5' y='2' width='22' height='28' fill='%23fff' stroke='%23000' stroke-width='1'/><rect x='8' y='8' width='16' height='1' fill='%23000'/><rect x='8' y='12' width='16' height='1' fill='%23000'/><rect x='8' y='16' width='12' height='1' fill='%23000'/><rect x='8' y='20' width='14' height='1' fill='%23000'/></svg>`,
  internet:   `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='13' fill='%234169e1' stroke='%23000' stroke-width='1'/><ellipse cx='16' cy='16' rx='6' ry='13' fill='none' stroke='%23fff' stroke-width='1'/><line x1='3' y1='16' x2='29' y2='16' stroke='%23fff' stroke-width='1'/><line x1='6' y1='9' x2='26' y2='9' stroke='%23fff' stroke-width='1'/><line x1='6' y1='23' x2='26' y2='23' stroke='%23fff' stroke-width='1'/></svg>`,
  recycle:    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='7' y='12' width='18' height='16' rx='1' fill='%23c0c0c0' stroke='%23808080' stroke-width='1'/><rect x='9' y='14' width='14' height='12' fill='%23fff'/><line x1='5' y1='12' x2='27' y2='12' stroke='%23808080' stroke-width='2'/><rect x='12' y='9' width='8' height='3' rx='1' fill='%23c0c0c0' stroke='%23808080' stroke-width='1'/><path d='M11 16 Q13 14 12 18' stroke='%23808080' stroke-width='1' fill='none'/><path d='M15 15 Q18 13 17 19' stroke='%23808080' stroke-width='1' fill='none'/><path d='M19 16 Q21 14 20 18' stroke='%23808080' stroke-width='1' fill='none'/></svg>`,
  winlogo:    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='13' height='13' fill='%23ff0000'/><rect x='17' y='2' width='13' height='13' fill='%2300cc00'/><rect x='2' y='17' width='13' height='13' fill='%230000ff'/><rect x='17' y='17' width='13' height='13' fill='%23ffcc00'/></svg>`,
  mine:       `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='8' fill='%23333'/><line x1='16' y1='4' x2='16' y2='28' stroke='%23333' stroke-width='2'/><line x1='4' y1='16' x2='28' y2='16' stroke='%23333' stroke-width='2'/><line x1='8' y1='8' x2='24' y2='24' stroke='%23333' stroke-width='2'/><line x1='24' y1='8' x2='8' y2='24' stroke='%23333' stroke-width='2'/></svg>`,
};

/* ─── Desktop icon definitions ─── */
// contextItems(def) → array of menu items for right-click; undefined = use default
const DESKTOP_ICONS = [
  {
    id: 'my-computer',
    label: 'My Computer',
    icon: ICONS.myComputer,
    onOpen: openMyComputer,
    contextItems: def => [
      { label: 'Open',    action: def.onOpen },
      { label: 'Explore', action: def.onOpen },
      '---',
      { label: 'Map Network Drive…',      action: () => saySpeech('No network cable detected \uD83D\uDCE1', 4000) },
      { label: 'Disconnect Network Drive…', label_dim: true },
      '---',
      { label: 'Properties', action: openSysProps },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: ICONS.folder,
    onOpen: openProjects,
    contextItems: def => [
      { label: 'Open',    action: def.onOpen },
      { label: 'Explore', action: def.onOpen },
      '---',
      { label: 'Find\u2026', action: () => saySpeech("Searching\u2026 \uD83D\uDD0D  no results for 'motivation'", 4000) },
      { label: 'Send To', sub: [
        { label: '3\u00BD Floppy (A:)' },
        { label: 'Desktop (create shortcut)' },
      ]},
      '---',
      { label: 'Rename' },
      { label: 'Properties' },
    ],
  },
  {
    id: 'about',
    label: 'About Me',
    icon: ICONS.notepad,
    onOpen: openAbout,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      { label: 'Print', action: () => saySpeech('No printer found \uD83D\uDDA8\uFE0F  (good)', 4000) },
      '---',
      { label: 'Send To', sub: [
        { label: 'Mail Recipient', action: () => saySpeech('Composing email\u2026 error: no email client \uD83D\uDE05') },
        { label: '3\u00BD Floppy (A:)' },
      ]},
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'internet',
    label: 'Internet',
    icon: ICONS.internet,
    onOpen: openInternet,
    contextItems: def => [
      { label: 'Open',                   action: def.onOpen },
      { label: 'Open in New Window',     action: def.onOpen },
      { label: 'Set as Default Browser', action: () => saySpeech('Bold choice in 2024 \uD83D\uDE02', 4000) },
      '---',
      { label: 'Properties', action: openIEProps },
    ],
  },
  {
    id: 'recycle',
    label: 'Recycle Bin',
    icon: ICONS.recycle,
    onOpen: openRecycleBin,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      { label: 'Empty Recycle Bin', action: emptyRecycleBin },
      '---',
      { label: 'Properties', action: () => openWindow('recycle-props', 'Recycle Bin Properties', ICONS.recycle, `
        <div style="padding:12px;font-size:12px">
          <div class="inset-panel">
            <p><b>Global</b></p>
            <p style="margin-top:8px">Maximum size: <b>10%</b> of each drive</p>
            <p style="margin-top:4px">Space used: <b>0 bytes</b></p>
          </div>
          <p style="margin-top:10px;color:#808080;font-size:11px">Configure the amount of disk space to use for deleted files.</p>
        </div>
      `, { width: 280, height: 200 }) },
    ],
  },
  {
    id: 'guestbook',
    label: 'guestbook.txt',
    icon: ICONS.notepad,
    onOpen: openGuestbook,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      { label: 'Print', action: () => saySpeech('Sending to printer\u2026 \uD83D\uDDA8\uFE0F  Error: out of ink', 4000) },
      '---',
      { label: 'Copy', action: () => saySpeech('Copied! (not really \uD83D\uDE09)', 3000) },
      { label: 'Properties' },
    ],
  },
  {
    id: 'minesweeper',
    label: 'Minesweeper',
    icon: ICONS.mine,
    onOpen: openMinesweeper,
    contextItems: def => [
      { label: 'Open',        action: def.onOpen },
      { label: 'High Scores', action: openMineHighScores },
      '---',
      { label: 'Properties' },
    ],
  },
];

/* ─── Window manager state ─── */
let windowZBase = 20;
const openWindows = {};

function bringToFront(id) {
  windowZBase++;
  const el = document.getElementById(`win-${id}`);
  if (!el) return;
  el.style.zIndex = windowZBase;
  document.querySelectorAll('.win98-window').forEach(w => w.classList.remove('focused'));
  document.querySelectorAll('.window-titlebar').forEach(t => t.classList.add('inactive'));
  el.classList.add('focused');
  el.querySelector('.window-titlebar').classList.remove('inactive');
  document.querySelectorAll('.taskbar-btn').forEach(b => b.classList.remove('active'));
  const tb = document.getElementById(`tb-${id}`);
  if (tb) tb.classList.add('active');
}

function openWindow(id, title, icon, bodyHTML, opts = {}) {
  // If already open, just bring to front
  if (document.getElementById(`win-${id}`)) {
    bringToFront(id);
    return;
  }

  const desktop = document.getElementById('win98-desktop');
  const w = opts.width  || 320;
  const h = opts.height || 220;
  const x = opts.x ?? (60 + Math.random() * 80);
  const y = opts.y ?? (40 + Math.random() * 60);

  const win = document.createElement('div');
  win.className = 'win98-window';
  win.id = `win-${id}`;
  win.style.cssText = `width:${w}px;height:${h}px;left:${x}px;top:${y}px;z-index:${++windowZBase}`;

  win.innerHTML = `
    <div class="window-titlebar">
      <img class="window-title-icon" src="${icon}" alt="">
      <span class="window-title-text">${title}</span>
      <div class="window-controls">
        <button class="window-btn" title="Minimize">&#x2013;</button>
        <button class="window-btn" title="Maximize">&#x25A1;</button>
        <button class="window-btn close" title="Close">&#x2715;</button>
      </div>
    </div>
    <div class="window-body">${bodyHTML}</div>
  `;

  // Close button
  win.querySelector('.window-btn.close').onclick = () => closeWindow(id);
  // Minimize with animation
  win.querySelector('.window-btn[title="Minimize"]').onclick = () => minimizeWindow(id);
  // Maximize / restore
  win.querySelector('.window-btn[title="Maximize"]').onclick = () => toggleMaximize(id);

  // Add resize handles
  addResizeHandles(win, id);

  desktop.appendChild(win);
  makeDraggable(win, win.querySelector('.window-titlebar'));
  bringToFront(id);

  win.addEventListener('mousedown', () => bringToFront(id));

  // Taskbar button
  addTaskbarBtn(id, title, icon, win);
}

function minimizeWindow(id) {
  const win = document.getElementById(`win-${id}`);
  if (!win) return;
  if (Math.random() < 0.3) {
    saySpeech("Out of sight, out of mind \u2728");
  }
  win.classList.add('minimizing');
  const tb = document.getElementById(`tb-${id}`);
  if (tb) tb.classList.remove('active');
  // After transition ends, hide the window
  const onEnd = () => {
    win.removeEventListener('transitionend', onEnd);
    win.classList.remove('minimizing');
    win.classList.add('minimized');
    win.style.display = 'none';
  };
  win.addEventListener('transitionend', onEnd);
}

function restoreWindow(id) {
  const win = document.getElementById(`win-${id}`);
  if (!win) return;
  win.classList.remove('minimized');
  // Start at the shrunken state
  win.style.display = 'flex';
  win.style.transform = 'scale(0.1) translateY(200px)';
  win.style.opacity = '0';
  // Force reflow so browser registers the start state
  void win.offsetHeight;
  // Animate to normal
  win.classList.add('restoring');
  win.style.transform = '';
  win.style.opacity = '';
  bringToFront(id);
  const onEnd = () => {
    win.removeEventListener('transitionend', onEnd);
    win.classList.remove('restoring');
  };
  win.addEventListener('transitionend', onEnd);
}

function closeWindow(id) {
  const win = document.getElementById(`win-${id}`);
  if (win) win.remove();
  const tb = document.getElementById(`tb-${id}`);
  if (tb) tb.remove();
}

function addTaskbarBtn(id, title, icon, win) {
  const taskbar = document.getElementById('taskbar');
  const btn = document.createElement('button');
  btn.className = 'taskbar-btn active';
  btn.id = `tb-${id}`;
  btn.innerHTML = `<img src="${icon}" style="width:14px;height:14px;image-rendering:pixelated"> ${title}`;
  btn.onclick = () => {
    if (win.classList.contains('minimized') || win.style.display === 'none') {
      restoreWindow(id);
    } else if (document.getElementById(`win-${id}`)?.classList.contains('focused')) {
      minimizeWindow(id);
    } else {
      bringToFront(id);
    }
  };
  // Insert before clock
  taskbar.insertBefore(btn, document.getElementById('taskbar-clock'));
}

/* ─── Maximize / Restore ─── */
function toggleMaximize(id) {
  const win = document.getElementById(`win-${id}`);
  if (!win) return;
  const desktop = document.getElementById('win98-desktop');
  const dw = desktop.clientWidth;
  const dh = desktop.clientHeight;
  const maxBtn = win.querySelector('.window-btn[title="Maximize"]');

  if (win.classList.contains('maximized')) {
    // Restore
    win.style.left   = win.dataset.preMaxLeft;
    win.style.top    = win.dataset.preMaxTop;
    win.style.width  = win.dataset.preMaxWidth;
    win.style.height = win.dataset.preMaxHeight;
    win.classList.remove('maximized');
    if (maxBtn) maxBtn.innerHTML = '\u25A1'; // □
  } else {
    // Store pre-maximize state
    win.dataset.preMaxLeft   = win.style.left;
    win.dataset.preMaxTop    = win.style.top;
    win.dataset.preMaxWidth  = win.style.width;
    win.dataset.preMaxHeight = win.style.height;
    // Maximize
    win.style.left   = '0px';
    win.style.top    = '0px';
    win.style.width  = `${dw}px`;
    win.style.height = `${dh - 28}px`;
    win.classList.add('maximized');
    if (maxBtn) maxBtn.innerHTML = '\u274F'; // ❏ overlapping squares
  }
  bringToFront(id);
}

/* ─── Draggable windows ─── */
function makeDraggable(el, handle) {
  let sx, sy, ex, ey;
  handle.addEventListener('mousedown', e => {
    if (e.target.closest('.window-controls')) return;
    if (el.classList.contains('maximized')) return; // no drag when maximized
    e.preventDefault();
    sx = e.clientX; sy = e.clientY;
    ex = el.offsetLeft; ey = el.offsetTop;

    const toDesktop = window._viewportToDesktop || ((cx, cy) => [cx, cy]);

    // Sample start point in desktop coords
    const [startDX, startDY] = toDesktop(sx, sy);

    function onMove(e) {
      const [curDX, curDY] = toDesktop(e.clientX, e.clientY);
      el.style.left = `${ex + (curDX - startDX)}px`;
      el.style.top  = `${ey + (curDY - startDY)}px`;
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

/* ─── Resize handles ─── */
function addResizeHandles(win, id) {
  const directions = ['n', 's', 'e', 'w', 'ne', 'se', 'sw', 'nw'];
  directions.forEach(dir => {
    const handle = document.createElement('div');
    handle.className = `resize-handle resize-${dir}`;
    win.appendChild(handle);

    handle.addEventListener('mousedown', e => {
      if (win.classList.contains('maximized')) return;
      e.preventDefault();
      e.stopPropagation();

      const toDesktop = window._viewportToDesktop || ((cx, cy) => [cx, cy]);
      const [startDX, startDY] = toDesktop(e.clientX, e.clientY);
      const startLeft   = win.offsetLeft;
      const startTop    = win.offsetTop;
      const startWidth  = win.offsetWidth;
      const startHeight = win.offsetHeight;

      function onMove(ev) {
        const [curDX, curDY] = toDesktop(ev.clientX, ev.clientY);
        const dx = curDX - startDX;
        const dy = curDY - startDY;

        let newLeft   = startLeft;
        let newTop    = startTop;
        let newWidth  = startWidth;
        let newHeight = startHeight;

        if (dir.includes('e')) { newWidth  = startWidth  + dx; }
        if (dir.includes('w')) { newWidth  = startWidth  - dx; newLeft = startLeft + dx; }
        if (dir.includes('s')) { newHeight = startHeight + dy; }
        if (dir.includes('n')) { newHeight = startHeight - dy; newTop  = startTop  + dy; }

        // Enforce minimum size
        if (newWidth < 200) {
          if (dir.includes('w')) newLeft = startLeft + startWidth - 200;
          newWidth = 200;
        }
        if (newHeight < 100) {
          if (dir.includes('n')) newTop = startTop + startHeight - 100;
          newHeight = 100;
        }

        win.style.left   = `${newLeft}px`;
        win.style.top    = `${newTop}px`;
        win.style.width  = `${newWidth}px`;
        win.style.height = `${newHeight}px`;
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
}

/* ─── Window content builders ─── */
let _myComputerOpenedBefore = false;
function openMyComputer() {
  if (!_myComputerOpenedBefore) {
    _myComputerOpenedBefore = true;
    saySpeech("Make yourself at home~ \u{1F3E0}");
  }
  openWindow('my-computer', 'My Computer', ICONS.myComputer, `
    <div style="display:flex;flex-wrap:wrap;gap:16px;padding:16px;align-items:flex-start">
      <div class="win-icon" data-action="openProjects">
        <img src="${ICONS.folder}" alt=""><span>Projects</span>
      </div>
      <div class="win-icon">
        <img src="${ICONS.folder}" alt=""><span>Documents</span>
      </div>
      <div class="win-icon">
        <img src="${ICONS.myComputer}" alt=""><span>(C:)</span>
      </div>
    </div>
  `, { width: 320, height: 200 });
  // Attach dblclick via delegation after window is created
  const win = document.getElementById('win-my-computer');
  if (win) {
    win.addEventListener('dblclick', e => {
      const icon = e.target.closest('.win-icon[data-action]');
      if (!icon) return;
      if (icon.dataset.action === 'openProjects') openProjects();
    });
  }
}

function openProjects() {
  openWindow('projects', 'Projects', ICONS.folder, `
    <div class="inset-panel" style="height:100%;overflow-y:auto;box-sizing:border-box;padding:4px">
      <div style="display:flex;align-items:center;gap:6px;padding:4px 4px;border-bottom:1px solid #c0c0c0">
        <img src="${ICONS.folder}" style="width:20px;height:20px;image-rendering:pixelated">
        <span style="flex:1;font-size:12px"><b>yuzhes-homepage</b> — this site</span>
        <button class="win98-small-btn" onclick="window.open('https://github.com/bkmashiro/yuzhes-homepage','_blank')" style="font-size:10px;padding:2px 6px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;font-family:inherit">Open</button>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding:4px 4px;border-bottom:1px solid #c0c0c0">
        <img src="${ICONS.folder}" style="width:20px;height:20px;image-rendering:pixelated">
        <span style="flex:1;font-size:12px"><b>neoblog</b> — personal blog engine</span>
        <button class="win98-small-btn" onclick="window.openProjectDetail('neoblog')" style="font-size:10px;padding:2px 6px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;font-family:inherit">Info</button>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding:4px 4px;border-bottom:1px solid #c0c0c0">
        <img src="${ICONS.folder}" style="width:20px;height:20px;image-rendering:pixelated">
        <span style="flex:1;font-size:12px"><b>wasm-py-runtime</b> — WebAssembly Python sandbox</span>
        <button class="win98-small-btn" onclick="window.openProjectDetail('wasm')" style="font-size:10px;padding:2px 6px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;font-family:inherit">Info</button>
      </div>
      <p style="margin-top:10px;color:#808080;font-size:10px;padding:0 4px">More coming soon...</p>
    </div>
  `, { width: 360, height: 200 });
}

function openAbout() {
  openWindow('about', 'about.txt — Notepad', ICONS.notepad, `
    <div class="inset-panel" style="height:100%;overflow-y:auto;box-sizing:border-box;background:#fff;font-family:monospace;font-size:12px;white-space:pre-wrap">============================================
  about.txt  —  yuzhes (bkmashiro)
============================================

Hi! I'm a CS grad student who loves
building things at the intersection of
systems, languages, and the web.

INTERESTS:
  * Programming language runtimes
  * WebAssembly & sandboxing
  * Web technologies & creative coding
  * Music, generative art, anime

CURRENTLY WORKING ON:
  wasm-py-runtime — a research project
  sandboxing Python inside WebAssembly
  for my master's thesis.

ALSO MADE:
  neoblog       — personal blog engine
  yuzhes-homepage — this very site!

FIND ME:
  github.com/bkmashiro

============================================
  "It compiles on my machine"  — me, always
============================================
    </div>
  `, { width: 340, height: 300 });
  saySpeech("That's me! Nice to meet you \u{1F44B}");
}

function openInternet() {
  saySpeech("You're really using IE? Respect. \u{1F602}");
  openWindow('internet', 'Internet Explorer', ICONS.internet, `
    <div style="display:flex;flex-direction:column;height:100%;gap:0">
      <div style="display:flex;align-items:center;gap:4px;padding:4px;background:#c0c0c0;border-bottom:1px solid #808080">
        <span style="font-size:10px;font-weight:bold">Address:</span>
        <div class="inset-panel" style="flex:1;padding:2px 6px;font-size:11px;font-family:monospace;background:#fff">about:me</div>
        <button style="font-size:10px;padding:2px 8px;font-family:inherit;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">Go</button>
      </div>
      <div class="inset-panel" style="flex:1;overflow-y:auto;background:#fff;padding:12px">
        <p style="font-size:14px;font-weight:bold;color:#000080;margin-bottom:8px">&#x1F310; yuzhes.exe — Personal Page</p>
        <hr style="border:none;border-top:1px solid #808080;margin:8px 0">
        <p style="font-size:12px;margin-bottom:10px">Links &amp; Social:</p>
        <div style="display:flex;flex-direction:column;gap:6px">
          <a href="https://github.com/bkmashiro" target="_blank" style="color:#0000ff;font-size:12px;text-decoration:underline">&#x1F4BB; GitHub — github.com/bkmashiro</a>
          <a href="#" style="color:#0000ff;font-size:12px;text-decoration:underline">&#x1F4DD; Blog — neoblog (coming soon)</a>
          <a href="#" style="color:#0000ff;font-size:12px;text-decoration:underline">&#x1F52C; Research — wasm-py-runtime</a>
        </div>
        <hr style="border:none;border-top:1px solid #808080;margin:10px 0">
        <p style="color:#808080;font-size:10px">Best viewed in Internet Explorer 6.0 at 640x480</p>
      </div>
    </div>
  `, { width: 320, height: 240 });
}

/* ─── Extra window openers (referenced by icon contextItems) ─── */

function openRecycleBin() {
  openWindow('recycle-bin', 'Recycle Bin', ICONS.recycle,
    '<p style="color:#808080;font-style:italic;padding:8px">Recycle Bin is empty.</p>');
  saySpeech("It\u2019s empty\u2026 just like my inbox \uD83D\uDCED");
}

function emptyRecycleBin() {
  // Fake "emptying" progress then speech
  saySpeech('Emptying\u2026 \uD83D\uDDD1\uFE0F  Done! (it was already empty)', 4000, true);
}

function openSysProps() {
  openWindow('sys-props', 'System Properties', ICONS.myComputer, `
    <div style="padding:12px;font-size:12px">
      <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px">
        <div style="font-size:40px;line-height:1">&#x1F4BB;</div>
        <div>
          <p><b>Microsoft Windows 98</b></p>
          <p style="color:#808080;font-size:11px;margin-top:2px">4.10.1998</p>
          <p style="margin-top:6px;font-size:11px">Registered to: <b>yuzhes</b></p>
        </div>
      </div>
      <div class="inset-panel" style="font-size:11px">
        <p>Processor: Intel Pentium II, 450 MHz</p>
        <p style="margin-top:4px">RAM: 64.0 MB</p>
        <p style="margin-top:8px;color:#808080">This computer is running perfectly fine. Probably.</p>
      </div>
    </div>
  `, { width: 300, height: 210 });
}

function openIEProps() {
  openWindow('ie-props', 'Internet Options', ICONS.internet, `
    <div style="padding:12px;font-size:12px">
      <p><b>Home page</b></p>
      <div class="inset-panel" style="margin-top:6px;display:flex;align-items:center;gap:6px;padding:4px 8px">
        <span style="color:#808080">Address:</span>
        <span style="font-family:monospace">about:me</span>
      </div>
      <p style="margin-top:12px"><b>Temporary Internet Files</b></p>
      <div style="margin-top:6px;display:flex;gap:6px">
        <button style="font-size:11px;font-family:inherit;padding:3px 10px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">Delete Files</button>
        <button style="font-size:11px;font-family:inherit;padding:3px 10px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">Settings</button>
      </div>
      <p style="margin-top:10px"><b>Cookies:</b> &#x1F36A;&#x1F36A;&#x1F36A; (a lot)</p>
      <p style="margin-top:8px;color:#808080;font-size:11px">Security: Medium (trust everyone)</p>
    </div>
  `, { width: 300, height: 240 });
}

function openMineHighScores() {
  openWindow('mine-scores', 'Minesweeper \u2014 High Scores', ICONS.mine, `
    <div style="padding:16px;font-size:12px;text-align:center">
      <p>&#x1F3C6; <b>Best Times</b></p>
      <table style="margin:12px auto;border-collapse:collapse;text-align:left">
        <tr><td style="padding:4px 16px">Beginner</td><td style="padding:4px 16px;color:#0000ff">999</td><td style="padding:4px 16px">Anonymous</td></tr>
        <tr><td style="padding:4px 16px">Intermediate</td><td style="padding:4px 16px;color:#0000ff">999</td><td style="padding:4px 16px">Anonymous</td></tr>
        <tr><td style="padding:4px 16px">Expert</td><td style="padding:4px 16px;color:#0000ff">999</td><td style="padding:4px 16px">Anonymous</td></tr>
      </table>
      <p style="color:#808080;font-size:11px">Play a game to set a record!</p>
    </div>
  `, { width: 280, height: 200 });
}

function openGuestbook() {
  saySpeech("You found my guestbook! \u{1F4D6}");
  openWindow('guestbook', 'guestbook.txt — Notepad', ICONS.notepad, `
    <div class="inset-panel" style="height:100%;overflow-y:auto;box-sizing:border-box;background:#fff;font-family:monospace;font-size:12px;white-space:pre-wrap">=== guestbook.txt ===

[2024-01-15] anon: cool site!
[2024-01-16] someone: this CRT effect is sick
[2024-02-03] visitor: love the anime girl lol
[2024-03-10] hacker: nice wasm project btw
[2023-12-01] me: hello from the future

--- sign below this line ---



    </div>
  `, { width: 320, height: 260 });
}

function openProjectDetail(project) {
  const details = {
    neoblog: {
      title: 'neoblog',
      desc: 'A personal blog engine built with modern web tech.\nMinimalist, fast, markdown-powered.\n\nStatus: active development\nStack: TypeScript, Vite',
    },
    wasm: {
      title: 'wasm-py-runtime',
      desc: 'WebAssembly Python sandbox for secure execution.\nMaster\'s research project.\n\nStatus: research / WIP\nStack: Rust, WebAssembly, Python',
    },
  };
  const d = details[project];
  if (!d) return;
  openWindow(`project-${project}`, `${d.title} — Details`, ICONS.notepad, `
    <div class="inset-panel" style="height:100%;overflow-y:auto;box-sizing:border-box;background:#fff;font-family:monospace;font-size:12px;white-space:pre-wrap">${d.desc}</div>
  `, { width: 280, height: 180 });
}

/* ─── Start menu ─── */
function initStartMenu() {
  const btn  = document.getElementById('start-btn');
  const logo = document.getElementById('start-logo');
  if (logo) logo.src = ICONS.winlogo;
  const menu = document.getElementById('start-menu');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  document.addEventListener('click', () => menu.classList.remove('open'));

  menu.innerHTML = `
    <div class="start-menu-sidebar"><span>Windows 98</span></div>
    <div class="start-menu-items">
      <div class="start-menu-item" onclick="openProjects()">
        <img src="${ICONS.folder}" alt=""> Programs
      </div>
      <div class="start-menu-item" onclick="openAbout()">
        <img src="${ICONS.notepad}" alt=""> About Me
      </div>
      <div class="start-menu-separator"></div>
      <div class="start-menu-item" onclick="openInternet()">
        <img src="${ICONS.internet}" alt=""> Internet
      </div>
      <div class="start-menu-separator"></div>
      <div class="start-menu-item" id="sm-calc"><img src="${ICONS.notepad}" alt=""> Calculator</div>
      <div class="start-menu-item" id="sm-snake"><img src="${ICONS.mine}" alt=""> Snake</div>
      <div class="start-menu-item" id="sm-terminal"><img src="${ICONS.myComputer}" alt=""> Command Prompt</div>
      <div class="start-menu-item" id="sm-defrag">💾 Disk Defragmenter</div>
      <div class="start-menu-item" id="sm-dlram">🧠 Download More RAM</div>
      <div class="start-menu-item" id="sm-y2k">📅 Y2K Compliance</div>
      <div class="start-menu-separator"></div>
      <div class="start-menu-item" onclick="window.openShutdownDialog()">
        <img src="${ICONS.winlogo}" alt=""> Shut Down...
      </div>
    </div>
  `;

  menu.querySelector('#sm-calc')?.addEventListener('click', () => { menu.classList.remove('open'); openCalculator(); });
  menu.querySelector('#sm-snake')?.addEventListener('click', () => { menu.classList.remove('open'); openSnake(); });
  menu.querySelector('#sm-terminal')?.addEventListener('click', () => { menu.classList.remove('open'); openTerminal(); });
  menu.querySelector('#sm-defrag')?.addEventListener('click', () => { menu.classList.remove('open'); openDefrag(); });
  menu.querySelector('#sm-dlram')?.addEventListener('click', () => { menu.classList.remove('open'); openDownloadRAM(); });
  menu.querySelector('#sm-y2k')?.addEventListener('click', () => { menu.classList.remove('open'); openY2K(); });
}

/* ─── Clock ─── */
function initClock() {
  const clockEl = document.getElementById('taskbar-clock');
  function tick() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }
  tick();
  setInterval(tick, 1000);
}

/* ─── Desktop icons ─── */
function initDesktopIcons() {
  const container = document.getElementById('desktop-icons');
  DESKTOP_ICONS.forEach((def, i) => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.innerHTML = `<img src="${def.icon}" alt=""><span>${def.label}</span>`;

    // Initial grid position
    el.style.left = '10px';
    el.style.top  = `${10 + i * 90}px`;

    // Drag state
    let dragStartX, dragStartY, iconStartLeft, iconStartTop, hasMoved;

    el.addEventListener('mousedown', e => {
      e.preventDefault();
      hasMoved = false;
      const toDesktop = window._viewportToDesktop || ((cx, cy) => [cx, cy]);
      const [dsx, dsy] = toDesktop(e.clientX, e.clientY);
      dragStartX = dsx;
      dragStartY = dsy;
      iconStartLeft = parseInt(el.style.left, 10) || 0;
      iconStartTop  = parseInt(el.style.top, 10) || 0;

      function onMove(ev) {
        const [dcx, dcy] = toDesktop(ev.clientX, ev.clientY);
        const dx = dcx - dragStartX;
        const dy = dcy - dragStartY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
        if (hasMoved) {
          el.style.left = `${iconStartLeft + dx}px`;
          el.style.top  = `${iconStartTop + dy}px`;
        }
      }
      function onUp(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (!hasMoved) {
          // Treat as click — select
          document.querySelectorAll('.desktop-icon').forEach(ic => ic.classList.remove('selected'));
          el.classList.add('selected');
        } else {
          // Snap to 80px grid
          const snappedLeft = Math.round(parseInt(el.style.left, 10) / 80) * 80 + 10;
          const snappedTop  = Math.round(parseInt(el.style.top, 10) / 80) * 80 + 10;
          el.style.left = `${Math.max(0, snappedLeft)}px`;
          el.style.top  = `${Math.max(0, snappedTop)}px`;
        }
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    el.addEventListener('dblclick', e => {
      if (!hasMoved) def.onOpen();
    });

    container.appendChild(el);
  });

  document.getElementById('win98-desktop').addEventListener('click', () => {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
  });
}

/* ─── Start-logo set via inline SVG data URI ─── */

/* ─── Notepad (persistent) ─── */
function openNotepadPersist() {
  openWindow('notepad-persist', 'Untitled — Notepad', ICONS.notepad, `
    <div style="display:flex;flex-direction:column;height:100%;box-sizing:border-box">
      <div style="background:#c0c0c0;border-bottom:1px solid #808080;padding:2px 4px;font-size:11px;display:flex;gap:8px">
        <span style="cursor:pointer">File</span><span style="cursor:pointer">Edit</span><span style="cursor:pointer">Format</span><span style="cursor:pointer">Help</span>
      </div>
      <textarea id="notepad-area" style="flex:1;resize:none;border:none;border:1px inset #808080;font-family:'Courier New',monospace;font-size:12px;padding:4px;box-sizing:border-box;outline:none"></textarea>
    </div>
  `, { width: 360, height: 280 });
}

/* ─── Delete System32 ─── */
function openDeleteSystem32() {
  openWindow('del-sys32', 'Deleting System32', ICONS.myComputer, `
    <div style="padding:16px;font-size:12px">
      <p id="sys32-status">Initializing...</p>
      <div style="margin-top:8px;background:#fff;border:1px inset #808080;height:18px;position:relative">
        <div id="sys32-bar" style="height:100%;width:0%;background:#000080;transition:width 0.08s linear"></div>
      </div>
      <p id="sys32-pct" style="margin-top:4px;text-align:right;font-family:monospace">0%</p>
    </div>
  `, { width: 320, height: 150 });

  let pct = 0;
  const bar = document.getElementById('sys32-bar');
  const statusEl = document.getElementById('sys32-status');
  const pctEl = document.getElementById('sys32-pct');

  const files = ['ntoskrnl.exe','hal.dll','kernel32.dll','user32.dll','shell32.dll','gdi32.dll'];
  let fileIdx = 0;

  const timer = setInterval(() => {
    if (pct < 99) {
      pct = Math.min(99, pct + (Math.random() * 3));
      if (bar) bar.style.width = `${pct}%`;
      if (pctEl) pctEl.textContent = `${Math.floor(pct)}%`;
      if (statusEl) statusEl.textContent = `Deleting ${files[Math.floor(fileIdx++ / 8) % files.length]}...`;
    } else {
      clearInterval(timer);
      setTimeout(() => {
        if (bar) { bar.style.background = '#c00000'; bar.style.width = '100%'; }
        if (statusEl) statusEl.innerHTML = '<b style="color:red">⛔ Access Denied:</b> Nice try. 😏';
        if (pctEl) pctEl.textContent = 'DENIED';
        saySpeech('Nice try, hacker 😈', 4000, true);
      }, 800);
    }
  }, 100);
}

/* ─── Right-click context menus ─── */
let activeContextMenu = null;

function dismissContextMenu() {
  document.querySelectorAll('.context-menu, .context-submenu').forEach(m => m.remove());
  activeContextMenu = null;
}

function showContextMenu(x, y, items) {
  dismissContextMenu();
  const menu = document.createElement('div');
  menu.className = 'context-menu';

  items.forEach(item => {
    if (item === '---') {
      const sep = document.createElement('div');
      sep.className = 'context-menu-separator';
      menu.appendChild(sep);
      return;
    }
    const row = document.createElement('div');
    row.className = 'context-menu-item';
    // Label span (so arrow stays right-aligned)
    const label = document.createElement('span');
    label.textContent = item.label;
    row.appendChild(label);

    if (item.sub) {
      const arrow = document.createElement('span');
      arrow.className = 'context-menu-arrow';
      arrow.textContent = '\u25B6';
      row.appendChild(arrow);
      // Hover to show submenu
      if (Array.isArray(item.sub)) {
        let subMenu = null;
        row.addEventListener('mouseenter', () => {
          // Dismiss any other open submenu
          menu.querySelectorAll('.context-submenu').forEach(s => s.remove());
          subMenu = document.createElement('div');
          subMenu.className = 'context-menu context-submenu';
          item.sub.forEach(subItem => {
            if (subItem === '---') {
              const sep = document.createElement('div');
              sep.className = 'context-menu-separator';
              subMenu.appendChild(sep);
            } else {
              const subRow = document.createElement('div');
              subRow.className = 'context-menu-item';
              subRow.textContent = subItem.label || subItem;
              if (subItem.action) subRow.addEventListener('click', e => { e.stopPropagation(); dismissContextMenu(); subItem.action(); });
              subMenu.appendChild(subRow);
            }
          });
          // Position to the right of the parent row, in desktop-local coords
          subMenu.style.position = 'absolute';
          desktop.appendChild(subMenu);
          const rRect = row.getBoundingClientRect();
          const toLocal2 = window._viewportToDesktop || ((cx, cy) => { const r = desktop.getBoundingClientRect(); return [cx - r.left, cy - r.top]; });
          let [sx, sy] = toLocal2(rRect.right, rRect.top);
          const sw = subMenu.offsetWidth, sh = subMenu.offsetHeight;
          const dw2 = desktop.clientWidth, dh2 = desktop.clientHeight - 28;
          if (sx + sw > dw2) { const [lx] = toLocal2(rRect.left, rRect.top); sx = lx - sw; }
          if (sy + sh > dh2) sy = dh2 - sh;
          if (sx < 0) sx = 0; if (sy < 0) sy = 0;
          subMenu.style.left = `${sx}px`;
          subMenu.style.top  = `${sy}px`;
        });
        row.addEventListener('mouseleave', e => {
          if (subMenu && !subMenu.contains(e.relatedTarget)) { subMenu.remove(); subMenu = null; }
        });
      }
    }

    if (item.action) {
      row.addEventListener('click', e => { e.stopPropagation(); dismissContextMenu(); item.action(); });
    } else if (!item.sub) {
      row.addEventListener('click', e => { e.stopPropagation(); dismissContextMenu(); });
    }
    menu.appendChild(row);
  });

  // Position inside #win98-desktop using inverse homography so menu sits
  // inside the transformed screen (same coordinate space as the Win98 UI).
  const desktop = document.getElementById('win98-desktop');
  menu.style.position = 'absolute';
  desktop.appendChild(menu);

  // Convert viewport clientX/Y → desktop local px
  const toLocal = window._viewportToDesktop || ((cx, cy) => {
    const r = desktop.getBoundingClientRect();
    return [cx - r.left, cy - r.top]; // fallback (no transform)
  });
  let [left, top] = toLocal(x, y);

  // Clamp so menu stays within desktop bounds
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  const dw = desktop.clientWidth, dh = desktop.clientHeight - 28; // 28 = taskbar
  if (left + mw > dw) left = dw - mw;
  if (top  + mh > dh) top  = dh - mh;
  if (left < 0) left = 0;
  if (top  < 0) top  = 0;
  menu.style.left = `${left}px`;
  menu.style.top  = `${top}px`;
  activeContextMenu = menu;
}

function initContextMenus() {
  const desktop = document.getElementById('win98-desktop');

  // Triple-click → Matrix rain
  let tripleCount=0, tripleTimer=null;
  desktop.addEventListener('click', ev => {
    if (ev.target.closest('.desktop-icon,.win98-window,#taskbar,#ascii-widget')) return;
    tripleCount++;
    clearTimeout(tripleTimer);
    tripleTimer=setTimeout(()=>{tripleCount=0;},500);
    if (tripleCount>=3){tripleCount=0;startMatrixRain();}
  });

  // Rapid clicking easter egg
  let rapidClicks=[], rapidTimer=null;
  desktop.addEventListener('click', ev => {
    if (ev.target.closest('.win98-window,#taskbar')) return;
    const now=Date.now();
    rapidClicks.push(now);
    rapidClicks=rapidClicks.filter(t=>now-t<3000);
    if (rapidClicks.length>=10){
      rapidClicks=[];
      saySpeech("Hey! Stop clicking so much! 😤", 4000, true);
    }
  });

  // Dismiss on any click
  document.addEventListener('click', dismissContextMenu);

  // Desktop right-click
  desktop.addEventListener('contextmenu', e => {
    // Don't show on windows, inputs, links
    if (e.target.closest('.win98-window, input, textarea, a')) return;
    e.preventDefault();
    e.stopPropagation();

    const clickedIcon = e.target.closest('.desktop-icon');
    if (clickedIcon) {
      // Icon context menu — use per-icon contextItems if defined, else generic
      const allIcons = Array.from(document.querySelectorAll('#desktop-icons .desktop-icon'));
      const idx = allIcons.indexOf(clickedIcon);
      const def = DESKTOP_ICONS[idx];
      const items = def?.contextItems
        ? def.contextItems(def)
        : [
            { label: 'Open', action: def?.onOpen ?? null },
            '---',
            { label: 'Send To', sub: [
              { label: '3\u00BD Floppy (A:)' },
              { label: 'Desktop (create shortcut)' },
            ]},
            '---',
            { label: 'Delete' },
            { label: 'Rename' },
            '---',
            { label: 'Properties' },
          ];
      showContextMenu(e.clientX, e.clientY, items);
    } else {
      // Desktop background context menu
      showContextMenu(e.clientX, e.clientY, [
        { label: 'Arrange Icons', sub: [
          { label: 'by Name', action: () => {
            const icons = Array.from(document.querySelectorAll('#desktop-icons .desktop-icon'));
            icons.sort((a, b) => a.querySelector('span').textContent.localeCompare(b.querySelector('span').textContent));
            icons.forEach((el, i) => {
              el.style.transition = 'left 0.3s ease, top 0.3s ease';
              el.style.left = '10px';
              el.style.top = `${10 + i * 90}px`;
              setTimeout(() => { el.style.transition = ''; }, 400);
            });
            saySpeech('Arranged! ✨', 2500);
          }},
          { label: 'by Type' },
          { label: 'by Size' },
          { label: 'by Date' },
          '---',
          { label: 'Auto Arrange' },
        ]},
        { label: 'Refresh', action: () => {
          const desktop = document.getElementById('win98-desktop');
          desktop.style.transition = 'opacity 0.08s';
          desktop.style.opacity = '0.5';
          setTimeout(() => { desktop.style.opacity = '1'; setTimeout(() => { desktop.style.transition = ''; }, 100); }, 150);
          saySpeech('Refreshed! ✨', 2000);
        }},
        '---',
        { label: 'New', sub: [
          { label: 'Folder', action: () => {
            const container = document.getElementById('desktop-icons');
            const el = document.createElement('div');
            el.className = 'desktop-icon';
            el.innerHTML = `<img src="${ICONS.folder}" alt=""><span contenteditable="false">New Folder</span>`;
            el.style.left = `${20 + Math.random() * 60}px`;
            el.style.top  = `${100 + Math.random() * 100}px`;
            container.appendChild(el);
            let dragStartX, dragStartY, iconStartLeft, iconStartTop, hasMoved;
            el.addEventListener('mousedown', e => {
              e.preventDefault();
              hasMoved = false;
              const toDesktop = window._viewportToDesktop || ((cx,cy)=>[cx,cy]);
              const [dsx,dsy] = toDesktop(e.clientX, e.clientY);
              dragStartX=dsx; dragStartY=dsy;
              iconStartLeft=parseInt(el.style.left)||0; iconStartTop=parseInt(el.style.top)||0;
              function onMove(ev) {
                const [dcx,dcy] = toDesktop(ev.clientX,ev.clientY);
                const dx=dcx-dragStartX, dy=dcy-dragStartY;
                if (Math.abs(dx)>5||Math.abs(dy)>5) hasMoved=true;
                if (hasMoved) { el.style.left=`${iconStartLeft+dx}px`; el.style.top=`${iconStartTop+dy}px`; }
              }
              function onUp() {
                document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp);
              }
              document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp);
            });
            el.addEventListener('dblclick', () => {
              const span = el.querySelector('span');
              span.contentEditable = 'true';
              span.focus();
              const sel = window.getSelection();
              sel.selectAllChildren(span);
              span.addEventListener('blur', () => { span.contentEditable = 'false'; }, {once:true});
              span.addEventListener('keydown', e => { if (e.key==='Enter') { e.preventDefault(); span.blur(); }}, {once:true});
            });
          }},
          { label: 'Shortcut' },
          '---',
          { label: 'Text Document', action: () => openNotepadPersist() },
          { label: 'Bitmap Image' },
        ]},
        '---',
        { label: 'Format C:\\...', action: openFormatDisk },
        { label: 'Delete System32', action: openDeleteSystem32 },
        { label: '📎 Summon Clippy', action: spawnClippy },
        '---',
        {
          label: 'Properties',
          action: () => {
            openWindow('display-props', 'Display Properties', ICONS.myComputer, `
              <div style="text-align:center;padding:20px">
                <p style="font-size:14px;margin-bottom:8px"><b>Display Properties</b></p>
                <div class="inset-panel" style="padding:16px;margin-top:8px">
                  <p>This computer is running at a resolution of <b>640x480</b> with <b>256 colors</b>.</p>
                  <p style="margin-top:8px;color:#808080;font-size:11px">Windows 98 — It's a great day to browse the web!</p>
                </div>
              </div>
            `, { width: 300, height: 200 });
          },
        },
      ]);
    }
  });
}

/* ─── CRT scan line effect ─── */
function initCRTScan() {
  const desktop = document.getElementById('win98-desktop');
  if (!desktop) return;
  const scanContainer = document.createElement('div');
  scanContainer.id = 'crt-scan';
  const scanLine = document.createElement('div');
  scanLine.className = 'scan-line';
  scanContainer.appendChild(scanLine);
  desktop.appendChild(scanContainer);
}

/* ─── ASCII art desktop widget ─── */
const ASCII_STORAGE_KEY = 'ascii-widget';
const ASCII_TEXTS = [mikuArt1, mikuArt2];

function initAsciiWidget() {
  const desktop = document.getElementById('win98-desktop');
  if (!desktop) return;

  // Restore saved state; default: centered, slightly upper area
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(ASCII_STORAGE_KEY) || '{}'); } catch {}

  const W = saved.width  ?? 320;
  const H = saved.height ?? 400;
  // Compute centered default after a tick so desktop has rendered dimensions
  const defaultLeft = () => Math.max(20, Math.round((desktop.clientWidth  - W) / 2));
  const defaultTop  = () => Math.max(20, Math.round((desktop.clientHeight - H) / 3));

  const widget = document.createElement('div');
  widget.id = 'ascii-widget';
  widget.style.width  = `${W}px`;
  widget.style.height = `${H}px`;
  // Position set after desktop is in DOM
  widget.style.left = `${saved.left ?? defaultLeft()}px`;
  widget.style.top  = `${saved.top  ?? defaultTop()}px`;

  let currentArtIdx = Math.floor(Math.random() * ASCII_TEXTS.length);

  const pre = document.createElement('pre');
  pre.id = 'ascii-widget-pre';
  pre.textContent = ASCII_TEXTS[currentArtIdx];
  widget.appendChild(pre);

  // Resize grip (visible only in edit mode via CSS)
  const grip = document.createElement('div');
  grip.id = 'ascii-widget-grip';
  grip.title = 'Resize';
  widget.appendChild(grip);

  desktop.insertBefore(widget, desktop.firstChild); // behind icons

  // If no saved position yet, recompute after desktop is painted
  if (saved.left == null) {
    requestAnimationFrame(() => {
      widget.style.left = `${defaultLeft()}px`;
      widget.style.top  = `${defaultTop()}px`;
    });
  }

  function save() {
    localStorage.setItem(ASCII_STORAGE_KEY, JSON.stringify({
      left:   parseInt(widget.style.left),
      top:    parseInt(widget.style.top),
      width:  parseInt(widget.style.width),
      height: parseInt(widget.style.height),
    }));
  }

  /* ── Edit mode toggle ── */
  let editMode = false;
  function setEditMode(on) {
    editMode = on;
    widget.classList.toggle('edit-mode', on);
  }

  /* ── Drag to move (edit mode only) ── */
  widget.addEventListener('mousedown', e => {
    if (!editMode) return;
    if (e.target === grip) return;
    e.preventDefault(); e.stopPropagation();
    const toDesktop = window._viewportToDesktop || ((x, y) => [x, y]);
    const [sx, sy] = toDesktop(e.clientX, e.clientY);
    const ox = parseInt(widget.style.left), oy = parseInt(widget.style.top);
    function onMove(ev) {
      const [cx, cy] = toDesktop(ev.clientX, ev.clientY);
      widget.style.left = `${ox + cx - sx}px`;
      widget.style.top  = `${oy + cy - sy}px`;
    }
    function onUp() { save(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  /* ── Resize grip (edit mode only) ── */
  grip.addEventListener('mousedown', e => {
    if (!editMode) return;
    e.preventDefault(); e.stopPropagation();
    const toDesktop = window._viewportToDesktop || ((x, y) => [x, y]);
    const [sx, sy] = toDesktop(e.clientX, e.clientY);
    const ow = parseInt(widget.style.width), oh = parseInt(widget.style.height);
    function onMove(ev) {
      const [cx, cy] = toDesktop(ev.clientX, ev.clientY);
      widget.style.width  = `${Math.max(80,  ow + cx - sx)}px`;
      widget.style.height = `${Math.max(60, oh + cy - sy)}px`;
    }
    function onUp() { save(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  /* ── Right-click context menu ── */
  widget.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, [
      editMode
        ? { label: '✓ Lock in place', action: () => setEditMode(false) }
        : { label: '✎ Move / Resize', action: () => setEditMode(true) },
      { label: '🎨 Change Art', action: () => {
          currentArtIdx = (currentArtIdx + 1) % ASCII_TEXTS.length;
          pre.textContent = ASCII_TEXTS[currentArtIdx];
        }
      },
      '---',
      { label: 'Close', action: () => widget.remove() },
    ]);
  });
}

/* ─── Easter egg: Start button rapid clicks ─── */
function initStartButtonEasterEgg() {
  const btn = document.getElementById('start-btn');
  if (!btn) return;
  let clickTimes = [];
  btn.addEventListener('click', () => {
    const now = Date.now();
    clickTimes.push(now);
    // Keep only clicks within last 2 seconds
    clickTimes = clickTimes.filter(t => now - t < 2000);
    if (clickTimes.length >= 3) {
      saySpeech("Okay okay I heard you! \u{1F624}", 4000, true);
      clickTimes = [];
    }
  });
}

/* ─── Easter egg: Idle detection ─── */
function initIdleEasterEgg() {
  let idleTimer = null, screensaverTimer = null;
  let idleTriggered = false;
  const desktop = document.getElementById('win98-desktop');

  function resetIdle() {
    clearTimeout(idleTimer); clearTimeout(screensaverTimer);
    idleTimer = setTimeout(() => {
      if (!idleTriggered) { idleTriggered = true; saySpeech("Hello? Anyone there...? 👀"); }
    }, 30000);
    screensaverTimer = setTimeout(() => { startStarfield(); }, 90000);
  }

  if (desktop) { desktop.addEventListener('mousemove', resetIdle); desktop.addEventListener('click', resetIdle); resetIdle(); }
}

/* ─── System tray ─── */
function initSystemTray() {
  const volumeBtn = document.getElementById('tray-volume');
  const networkBtn = document.getElementById('tray-network');
  let muted = false;

  if (volumeBtn) {
    volumeBtn.addEventListener('click', e => {
      e.stopPropagation();
      muted = !muted;
      if (muted) {
        saySpeech("Shh, I'm working... \uD83E\uDD2B", 4000, true);
      } else {
        saySpeech("Volume: 100% \uD83D\uDD0A", 3000, true);
      }
    });
  }

  if (networkBtn) {
    networkBtn.addEventListener('click', e => {
      e.stopPropagation();
      saySpeech("Connected to: localhost \uD83C\uDF10", 3000, true);
    });
  }
}

/* ─── Shutdown dialog ─── */
function openShutdownDialog() {
  document.getElementById('start-menu').classList.remove('open');
  openWindow('shutdown', 'Shut Down Windows', ICONS.winlogo, `
    <div style="padding:8px">
      <p style="font-size:12px;margin-bottom:12px">What do you want the computer to do?</p>
      <label class="win98-radio"><input type="radio" name="shutdown-opt" value="shutdown" checked> Shut down</label>
      <label class="win98-radio"><input type="radio" name="shutdown-opt" value="restart"> Restart</label>
      <label class="win98-radio"><input type="radio" name="shutdown-opt" value="standby"> Stand by</label>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button id="shutdown-ok" style="padding:4px 16px;font-family:inherit;font-size:12px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">OK</button>
        <button id="shutdown-cancel" style="padding:4px 16px;font-family:inherit;font-size:12px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">Cancel</button>
      </div>
    </div>
  `, { width: 280, height: 180 });

  document.getElementById('shutdown-cancel').onclick = () => closeWindow('shutdown');
  document.getElementById('shutdown-ok').onclick = () => {
    const sel = document.querySelector('input[name="shutdown-opt"]:checked');
    const val = sel ? sel.value : 'shutdown';
    closeWindow('shutdown');
    if (val === 'shutdown') {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:999999;display:flex;align-items:center;justify-content:center';
      overlay.innerHTML = '<p style="color:#fff;font-family:\'Courier New\',monospace;font-size:14px;text-align:center">It is now safe to turn off your computer.</p>';
      document.body.appendChild(overlay);
    } else if (val === 'restart') {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:999999;display:flex;align-items:center;justify-content:center';
      overlay.innerHTML = '<p style="color:#fff;font-family:\'Courier New\',monospace;font-size:14px;text-align:center">Restarting...</p>';
      document.body.appendChild(overlay);
      setTimeout(() => location.reload(), 2000);
    } else if (val === 'standby') {
      saySpeech("Zzz... \uD83D\uDCA4", 6000, true);
    }
  };
}

/* ─── Idle screensaver ─── */
function initScreensaver() {
  const desktop = document.getElementById('win98-desktop');
  if (!desktop) return;

  let screensaverTimer = null;
  let screensaverActive = false;
  const SCREENSAVER_MS = 90000;

  function startScreensaver() {
    if (screensaverActive) return;
    screensaverActive = true;

    const saver = document.createElement('div');
    saver.id = 'screensaver';

    const text = document.createElement('div');
    text.id = 'screensaver-text';
    text.textContent = 'yuzhes.exe';
    saver.appendChild(text);

    desktop.appendChild(saver);

    const colors = ['#ff0', '#0ff', '#f0f', '#0f0', '#f80', '#80f', '#fff'];
    let x = 80, y = 80, vx = 2, vy = 1.5;
    let rafId;

    function animate() {
      const sw = saver.clientWidth;
      const sh = saver.clientHeight;
      const tw = text.offsetWidth;
      const th = text.offsetHeight;

      x += vx;
      y += vy;

      let bounced = false;
      if (x < 0) { x = 0; vx = Math.abs(vx); bounced = true; }
      if (x + tw > sw) { x = sw - tw; vx = -Math.abs(vx); bounced = true; }
      if (y < 0) { y = 0; vy = Math.abs(vy); bounced = true; }
      if (y + th > sh) { y = sh - th; vy = -Math.abs(vy); bounced = true; }

      if (bounced) {
        text.style.color = colors[Math.floor(Math.random() * colors.length)];
      }

      text.style.left = `${x}px`;
      text.style.top  = `${y}px`;
      rafId = requestAnimationFrame(animate);
    }
    text.style.color = colors[0];
    animate();

    function dismiss() {
      screensaverActive = false;
      cancelAnimationFrame(rafId);
      saver.remove();
      saver.removeEventListener('click', dismiss);
      saver.removeEventListener('mousemove', dismiss);
      resetScreensaverTimer();
    }

    saver.addEventListener('click', dismiss);
    saver.addEventListener('mousemove', dismiss);
  }

  function resetScreensaverTimer() {
    clearTimeout(screensaverTimer);
    if (!screensaverActive) {
      screensaverTimer = setTimeout(startScreensaver, SCREENSAVER_MS);
    }
  }

  desktop.addEventListener('mousemove', resetScreensaverTimer);
  desktop.addEventListener('mousedown', resetScreensaverTimer);
  resetScreensaverTimer();
}

/* ─── BSOD (Konami code) ─── */
function initBSOD() {
  const KONAMI = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a'
  ];
  let pos = 0;

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[pos]) {
      pos++;
      if (pos === KONAMI.length) {
        pos = 0;
        showBSOD();
      }
    } else {
      pos = (e.key === KONAMI[0]) ? 1 : 0;
    }
  });
}

function showBSOD() {
  saySpeech("404: brain not found \uD83D\uDC80", 5000, true);

  const bsod = document.createElement('div');
  bsod.id = 'bsod';
  bsod.innerHTML = `
    <h2>Windows</h2>
    <p>A fatal exception 0E has occurred at 0028:C0011E36 in VXD YUZHES(01) + 00010E36.<br>
    The current application will be terminated.</p>
    <p>&nbsp;</p>
    <p>* Press any key to terminate the current application.</p>
    <p>* Press CTRL+ALT+DEL again to restart your computer.<br>
    &nbsp;&nbsp;You will lose any unsaved information in all applications.</p>
    <p>&nbsp;</p>
    <p>Press any key to continue_</p>
  `;
  document.body.appendChild(bsod);

  function dismiss() {
    bsod.remove();
    document.removeEventListener('keydown', dismiss);
    bsod.removeEventListener('click', dismiss);
  }
  bsod.addEventListener('click', dismiss);
  document.addEventListener('keydown', dismiss);
}

/* ─── Format C: easter egg ─── */
function openFormatDisk() {
  saySpeech("Haha, got you~ \uD83D\uDE08", 4000, true);
  openWindow('format-c', 'Format (C:)', ICONS.myComputer, `
    <div style="padding:12px;display:flex;flex-direction:column;gap:10px">
      <p style="font-size:12px">Formatting drive C:...</p>
      <div id="format-progress-bar" style="height:16px;background:#fff;border:1px inset #808080;position:relative;overflow:hidden">
        <div id="format-progress-fill" style="height:100%;width:0%;background:#000080;transition:width 0.05s linear"></div>
      </div>
      <p id="format-status" style="font-size:12px;color:#808080">0% complete</p>
    </div>
  `, { width: 260, height: 150 });

  let pct = 0;
  const fill = document.getElementById('format-progress-fill');
  const status = document.getElementById('format-status');
  const interval = setInterval(() => {
    pct += Math.random() * 5 + 2;
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      if (fill) fill.style.width = '100%';
      if (status) status.innerHTML = '<b style="color:#008000">Just kidding! \uD83D\uDE04 Your files are safe.</b>';
    } else {
      if (fill) fill.style.width = `${pct}%`;
      if (status) status.textContent = `${Math.floor(pct)}% complete`;
    }
  }, 80);
}

/* ─── Minesweeper ─── */
function openMinesweeper() {
  const ROWS = 5, COLS = 5, MINES = 5;
  let grid = [];
  let revealed = [];
  let gameOver = false;

  // Place mines
  const positions = [];
  for (let i = 0; i < ROWS * COLS; i++) positions.push(i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const mineSet = new Set(positions.slice(0, MINES));

  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    revealed[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = mineSet.has(r * COLS + c) ? -1 : 0;
      revealed[r][c] = false;
    }
  }

  // Count adjacent mines
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === -1) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === -1) count++;
        }
      }
      grid[r][c] = count;
    }
  }

  const MINE_COLORS = ['','#0000ff','#008000','#ff0000','#000080','#800000','#008080','#000','#808080'];

  function buildGrid() {
    const container = document.getElementById('minesweeper-grid');
    if (!container) return;
    container.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('button');
        cell.className = 'mine-cell' + (revealed[r][c] ? ' revealed' : '');
        if (revealed[r][c]) {
          if (grid[r][c] === -1) {
            cell.textContent = '\uD83D\uDCA3';
            cell.classList.add('mine-hit');
          } else if (grid[r][c] > 0) {
            cell.textContent = grid[r][c];
            cell.style.color = MINE_COLORS[grid[r][c]] || '#000';
          }
        }
        if (!gameOver && !revealed[r][c]) {
          const rr = r, cc = c;
          cell.addEventListener('click', () => revealCell(rr, cc));
        }
        container.appendChild(cell);
      }
    }
  }

  function revealCell(r, c) {
    if (gameOver || revealed[r][c]) return;
    revealed[r][c] = true;

    if (grid[r][c] === -1) {
      gameOver = true;
      // Reveal all mines
      for (let rr = 0; rr < ROWS; rr++)
        for (let cc = 0; cc < COLS; cc++)
          if (grid[rr][cc] === -1) revealed[rr][cc] = true;
      buildGrid();
      const statusEl = document.getElementById('mine-status');
      if (statusEl) statusEl.textContent = '\uD83D\uDCA5 You lose!';
      saySpeech("I told you not to click there... 💣", 3500, true);
      return;
    }

    // Flood fill for zeros
    if (grid[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !revealed[nr][nc]) {
            revealCell(nr, nc);
          }
        }
      }
    }

    // Check win
    let unrevealedNonMines = 0;
    for (let rr = 0; rr < ROWS; rr++)
      for (let cc = 0; cc < COLS; cc++)
        if (!revealed[rr][cc] && grid[rr][cc] !== -1) unrevealedNonMines++;

    buildGrid();

    if (unrevealedNonMines === 0) {
      gameOver = true;
      const statusEl = document.getElementById('mine-status');
      if (statusEl) statusEl.textContent = '\uD83C\uDF89 You win!';
      saySpeech("Sugoi! 🎉 You're a minesweeper pro!", 4000, true);
    }
  }

  openWindow('minesweeper', 'Minesweeper', ICONS.mine, `
    <div style="display:flex;flex-direction:column;align-items:center;padding:8px">
      <p id="mine-status" style="font-size:12px;font-weight:bold;margin-bottom:4px">Find the mines!</p>
      <div id="minesweeper-grid"></div>
      <button id="mine-reset" style="margin-top:8px;padding:3px 12px;font-family:inherit;font-size:11px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">New Game</button>
    </div>
  `, { width: 200, height: 220 });

  buildGrid();
  document.getElementById('mine-reset').addEventListener('click', () => {
    closeWindow('minesweeper');
    openMinesweeper();
  });

  saySpeech("Good luck \uD83D\uDCA3", 3000, true);
}

/* ─── Disk Defragmenter ─── */
function openDefrag() {
  const COLS=24, ROWS=10;
  const cellsHTML = Array.from({length:COLS*ROWS}, (_,i) => {
    const type = Math.random()<0.05?'bad':Math.random()<0.6?'used':'free';
    const colors = {free:'#fff',used:'#000080',bad:'#800000',optimized:'#008000'};
    return `<div class="defrag-cell" data-type="${type}" style="width:16px;height:12px;background:${colors[type]};border:1px solid #808080;display:inline-block"></div>`;
  }).join('');

  openWindow('defrag', 'Disk Defragmenter', ICONS.myComputer, `
    <div style="padding:8px;font-size:12px">
      <p>Drive C: &nbsp; <b>Analyzing...</b></p>
      <div style="margin:8px 0;line-height:0;background:#c0c0c0;border:1px inset #808080;padding:4px">${cellsHTML}</div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
        <div style="width:12px;height:10px;background:#000080;border:1px solid #808080;display:inline-block"></div><span>Used</span>
        <div style="width:12px;height:10px;background:#fff;border:1px solid #808080;display:inline-block"></div><span>Free</span>
        <div style="width:12px;height:10px;background:#008000;border:1px solid #808080;display:inline-block"></div><span>Optimized</span>
        <div style="width:12px;height:10px;background:#800000;border:1px solid #808080;display:inline-block"></div><span>Bad</span>
      </div>
      <div style="margin-top:8px;display:flex;gap:6px">
        <button id="defrag-btn" style="font-size:11px;font-family:inherit;padding:3px 12px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">Defragment</button>
        <button id="defrag-stop" style="font-size:11px;font-family:inherit;padding:3px 12px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">Stop</button>
      </div>
      <div style="margin-top:8px;background:#fff;border:1px inset #808080;height:14px;position:relative">
        <div id="defrag-bar" style="height:100%;width:0%;background:#000080"></div>
      </div>
      <p id="defrag-status" style="font-size:11px;margin-top:4px;color:#808080">Click Defragment to begin</p>
    </div>
  `, { width: 420, height: 280 });

  let defragRunning = false, defragTimer = null, pct = 0;
  const bar = document.getElementById('defrag-bar');
  const status = document.getElementById('defrag-status');
  const cells = Array.from(document.querySelectorAll('.defrag-cell'));

  document.getElementById('defrag-btn')?.addEventListener('click', () => {
    if (defragRunning) return;
    defragRunning = true; pct = 0;
    if (status) status.textContent = 'Defragmenting... please wait';

    let usedCells = cells.filter(c=>c.dataset.type==='used');
    let i=0;
    defragTimer = setInterval(() => {
      if (!document.getElementById('win-defrag')) { clearInterval(defragTimer); return; }
      for (let k=0; k<3 && i<usedCells.length; k++, i++) {
        usedCells[i].style.background='#008000';
        usedCells[i].dataset.type='optimized';
      }
      pct = Math.min(99, (i/Math.max(usedCells.length,1))*100);
      if (bar) bar.style.width=`${pct}%`;

      if (i >= usedCells.length) {
        clearInterval(defragTimer); defragRunning=false;
        if (bar) bar.style.width='100%';
        if (status) status.textContent='Defragmentation complete... mostly. 🎉';
      }
    }, 80);
  });

  document.getElementById('defrag-stop')?.addEventListener('click', () => {
    clearInterval(defragTimer); defragRunning=false;
    if (status) status.textContent='Stopped. Partial defrag saved.';
  });
}

/* ─── Download More RAM ─── */
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) try { _audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e) {}
  return _audioCtx;
}

function playDialup() {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    const tones = [1000,2200,1600,800,2400,1100,1800,900,2600];
    let t = ctx.currentTime;
    tones.forEach(freq => {
      const osc=ctx.createOscillator(), gain=ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.06,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.18);
      osc.start(t); osc.stop(t+0.18); t+=0.14;
    });
  } catch(e) {}
}

function openDownloadRAM() {
  openWindow('dl-ram', 'Download More RAM', ICONS.internet, `
    <div style="padding:16px;font-size:12px">
      <p style="margin-bottom:8px">🧠 Connecting to RAM servers...</p>
      <div style="background:#fff;border:1px inset #808080;height:18px;position:relative">
        <div id="ram-bar" style="height:100%;width:0%;background:#000080;transition:width 0.3s linear"></div>
      </div>
      <p id="ram-pct" style="margin-top:4px;font-family:monospace">0 MB / 64 MB</p>
      <p id="ram-status" style="margin-top:8px;color:#808080">Establishing connection...</p>
    </div>
  `, { width: 300, height: 170 });

  playDialup();
  let dlTimer = null, soundTimer = null;
  let mb = 0;
  const bar = document.getElementById('ram-bar');
  const pctEl = document.getElementById('ram-pct');
  const statusEl = document.getElementById('ram-status');
  const msgs = ['Downloading free memory...','Compressing RAM packets...','Bypassing memory firewall...','Injecting RAM cells...','Almost there!'];
  let msgIdx = 0;

  soundTimer = setInterval(() => { if (document.getElementById('win-dl-ram')) playDialup(); else clearInterval(soundTimer); }, 3000);

  dlTimer = setInterval(() => {
    if (!document.getElementById('win-dl-ram')) { clearInterval(dlTimer); clearInterval(soundTimer); return; }
    mb = Math.min(64, mb + (Math.random()*3));
    if (bar) bar.style.width=`${(mb/64)*100}%`;
    if (pctEl) pctEl.textContent=`${Math.floor(mb)} MB / 64 MB`;
    if (statusEl && Math.random()>0.7) statusEl.textContent=msgs[msgIdx++%msgs.length];
    if (mb >= 64) {
      clearInterval(dlTimer); clearInterval(soundTimer);
      if (bar) bar.style.background='#008000';
      if (statusEl) statusEl.textContent='✅ Download complete! You now have 128MB of RAM.';
      if (pctEl) pctEl.textContent='64 MB / 64 MB';
      saySpeech('RAM downloaded! 🧠✨ Speed boost activated!', 4000, true);
    }
  }, 250);
}

/* ─── Clippy ─── */
function spawnClippy() {
  if (document.getElementById('clippy-popup')) return;
  const desktop = document.getElementById('win98-desktop');

  const popup = document.createElement('div');
  popup.id = 'clippy-popup';
  popup.style.cssText = `
    position:absolute; bottom:36px; right:10px; z-index:5000;
    background:#ffffcc; border:2px solid #888; border-radius:8px;
    padding:10px 12px; font-size:11px; max-width:180px;
    box-shadow:2px 2px 4px rgba(0,0,0,0.3); font-family:inherit;
  `;
  popup.innerHTML = `
    <div style="font-size:20px;text-align:center;margin-bottom:6px">📎</div>
    <p style="margin-bottom:8px;line-height:1.4">It looks like you're browsing a personal homepage. Would you like help with that?</p>
    <div style="display:flex;gap:6px;justify-content:flex-end">
      <button id="clippy-yes" style="font-size:11px;font-family:inherit;padding:2px 10px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">Yes</button>
      <button id="clippy-no" style="font-size:11px;font-family:inherit;padding:2px 10px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">No</button>
    </div>
  `;
  desktop.appendChild(popup);

  const dismiss = () => {
    popup.remove();
    saySpeech("That's what I thought 😏", 3000, true);
  };
  popup.querySelector('#clippy-yes')?.addEventListener('click', dismiss);
  popup.querySelector('#clippy-no')?.addEventListener('click', dismiss);

  saySpeech('Oh! Clippy appeared! 📎', 2500, true);
}

/* ─── Y2K Compliance Checker ─── */
function openY2K() {
  openWindow('y2k', 'Y2K Compliance Checker', ICONS.myComputer, `
    <div style="padding:16px;font-size:12px">
      <p style="margin-bottom:8px">🔍 Scanning system for Y2K compliance...</p>
      <div style="background:#fff;border:1px inset #808080;height:14px">
        <div id="y2k-bar" style="height:100%;width:0%;background:#000080;transition:width 2s linear"></div>
      </div>
      <div id="y2k-result" style="margin-top:12px"></div>
    </div>
  `, { width: 340, height: 180 });

  requestAnimationFrame(() => {
    const bar = document.getElementById('y2k-bar');
    const result = document.getElementById('y2k-result');
    if (bar) bar.style.width = '100%';
    setTimeout(() => {
      if (!result) return;
      const y2k = new Date(2000,0,1);
      const now = new Date();
      const diff = now - y2k;
      const days = Math.floor(diff/86400000);
      const yrs = Math.floor(days/365);
      const remDays = days % 365;
      const hrs = Math.floor((diff%86400000)/3600000);
      result.innerHTML = `
        <p>✅ <b>System is Y2K Compliant!</b></p>
        <p style="margin-top:8px;color:#444">You have survived:</p>
        <p style="font-family:monospace;font-size:13px;color:#000080;margin-top:4px">${yrs} years, ${remDays} days, ${hrs} hours</p>
        <p style="margin-top:4px">since January 1, 2000 00:00:00</p>
        <p style="margin-top:8px;color:#808080;font-size:11px">No action required. Miraculously still operational.</p>
      `;
    }, 2100);
  });
}

/* ─── Calculator ─── */
function openCalculator() {
  const bodyHTML = `
    <div style="padding:6px">
      <div id="calc-disp" style="background:#fff;border:1px inset #808080;text-align:right;padding:3px 6px;font-size:16px;font-family:monospace;min-height:28px;margin-bottom:6px;word-break:break-all">0</div>
      <div id="calc-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px"></div>
    </div>
  `;
  openWindow('calculator', 'Calculator', ICONS.notepad, bodyHTML, { width: 220, height: 240 });

  const disp = document.getElementById('calc-disp');
  const grid = document.getElementById('calc-grid');
  if (!disp || !grid) return;

  let cur = '0', prev = null, op = null, waitNext = false, mem = 0;

  const updateDisp = () => { disp.textContent = cur; };

  const btn = (label, type='num') => {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = `background:${type==='op'?'#b0b0b0':'#c0c0c0'};border:2px solid;border-color:#fff #808080 #808080 #fff;font-size:11px;font-family:inherit;cursor:pointer;padding:3px;min-height:22px`;
    b.addEventListener('mousedown', () => { b.style.borderColor='#808080 #fff #fff #808080'; });
    b.addEventListener('mouseup', () => { b.style.borderColor='#fff #808080 #808080 #fff'; });
    return b;
  };

  const rows = [
    [['MC','mem'],['MR','mem'],['MS','mem'],['M+','mem']],
    [['7'],['8'],['9'],['÷','op']],
    [['4'],['5'],['6'],['×','op']],
    [['1'],['2'],['3'],['-','op']],
    [['0'],['±'],['.'],['+','op']],
    [['C','op'],['CE','op'],['=','op'],['←','op']],
  ];

  rows.forEach(row => row.forEach(([label, type='num']) => {
    const b = btn(label, type);
    b.addEventListener('click', () => {
      if ('0123456789'.includes(label)) {
        if (waitNext || cur==='0') { cur=label; waitNext=false; }
        else cur = cur.length < 12 ? cur+label : cur;
      } else if (label==='.') {
        if (waitNext) { cur='0.'; waitNext=false; }
        else if (!cur.includes('.')) cur += '.';
      } else if (label==='±') {
        cur = cur.startsWith('-') ? cur.slice(1) : (cur==='0'?'0':'-'+cur);
      } else if (label==='C') { cur='0'; prev=null; op=null; waitNext=false; }
      else if (label==='CE') { cur='0'; }
      else if (label==='←') { cur = cur.length>1 ? cur.slice(0,-1) : '0'; }
      else if (['+','-','×','÷'].includes(label)) {
        if (op && !waitNext) {
          const a=parseFloat(prev), b=parseFloat(cur);
          prev=String(op==='+'?a+b:op==='-'?a-b:op==='×'?a*b:b!==0?a/b:NaN);
          cur=prev;
        } else prev=cur;
        op=label==='×'?'*':label==='÷'?'/':label;
        waitNext=true;
      } else if (label==='=') {
        if (op && prev!==null) {
          const a=parseFloat(prev), b=parseFloat(cur);
          const r=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:b!==0?a/b:NaN;
          cur = isNaN(r)?'Error':String(parseFloat(r.toFixed(10)));
          prev=null; op=null; waitNext=true;
        }
      } else if (label==='MS') { mem=parseFloat(cur)||0; }
      else if (label==='MR') { cur=String(mem); waitNext=false; }
      else if (label==='MC') { mem=0; }
      else if (label==='M+') { mem+=parseFloat(cur)||0; }
      updateDisp();
    });
    grid.appendChild(b);
  }));
}

/* ─── Snake ─── */
function openSnake() {
  openWindow('snake', 'Snake', ICONS.mine, `
    <div style="text-align:center;padding:4px">
      <canvas id="snake-canvas" width="220" height="220" style="display:block;margin:0 auto;background:#000;image-rendering:pixelated"></canvas>
      <p id="snake-info" style="font-size:11px;margin-top:4px">Score: 0 | Arrow keys to play | Space to pause</p>
    </div>
  `, { width: 260, height: 280 });

  const canvas = document.getElementById('snake-canvas');
  const info = document.getElementById('snake-info');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const CELL = 11, COLS = 20, ROWS = 20;
  let snake, dir, nextDir, food, score, paused, dead, rafId;

  function randFood() {
    let pos;
    do { pos = {x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS)}; }
    while (snake.some(s=>s.x===pos.x&&s.y===pos.y));
    return pos;
  }

  function reset() {
    snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}]; dir={x:1,y:0}; nextDir={x:1,y:0};
    food=randFood(); score=0; paused=false; dead=false;
    info.textContent='Score: 0 | Arrow keys | Space=pause';
  }

  function draw() {
    ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#f00';
    ctx.fillRect(food.x*CELL+1, food.y*CELL+1, CELL-2, CELL-2);
    snake.forEach((s,i) => {
      ctx.fillStyle = i===0?'#0f0':'#080';
      ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
    });
    if (dead) {
      ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#f00'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
      ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2-8);
      ctx.fillStyle='#fff'; ctx.font='11px monospace';
      ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2+10);
      ctx.fillText('Space to restart', canvas.width/2, canvas.height/2+26);
    }
  }

  let lastTick=0;
  function gameLoop(ts) {
    rafId=requestAnimationFrame(gameLoop);
    if (dead || paused) { draw(); return; }
    if (ts-lastTick < 150) return;
    lastTick=ts;
    dir=nextDir;
    const head={x:(snake[0].x+dir.x+COLS)%COLS, y:(snake[0].y+dir.y+ROWS)%ROWS};
    if (snake.some(s=>s.x===head.x&&s.y===head.y)) {
      dead=true;
      saySpeech('Game over! 💀 Press Space to try again', 3500, true);
      draw(); return;
    }
    snake.unshift(head);
    if (head.x===food.x&&head.y===food.y) {
      score++; food=randFood();
      info.textContent=`Score: ${score} | Arrow keys | Space=pause`;
      if (score===5) saySpeech('5 points already! 🐍', 2500, true);
    } else snake.pop();
    draw();
  }

  const keyHandler = e => {
    if (!document.getElementById('win-snake')) { document.removeEventListener('keydown',keyHandler); return; }
    if (e.key==='ArrowUp'&&dir.y===0) nextDir={x:0,y:-1};
    else if (e.key==='ArrowDown'&&dir.y===0) nextDir={x:0,y:1};
    else if (e.key==='ArrowLeft'&&dir.x===0) nextDir={x:-1,y:0};
    else if (e.key==='ArrowRight'&&dir.x===0) nextDir={x:1,y:0};
    else if (e.key===' ') {
      if (dead) reset();
      else { paused=!paused; info.textContent=paused?'PAUSED — Space to resume':`Score: ${score} | Arrow keys | Space=pause`; }
      e.preventDefault();
    }
  };
  document.addEventListener('keydown', keyHandler);

  reset();
  rafId=requestAnimationFrame(gameLoop);

  const observer = new MutationObserver(() => {
    if (!document.getElementById('win-snake')) { cancelAnimationFrame(rafId); document.removeEventListener('keydown',keyHandler); observer.disconnect(); }
  });
  observer.observe(document.getElementById('win98-desktop'), {childList:true, subtree:true});
}

/* ─── Terminal ─── */
function openTerminal() {
  openWindow('terminal', 'Command Prompt', ICONS.myComputer, `
    <div style="background:#000;height:100%;display:flex;flex-direction:column;box-sizing:border-box">
      <div id="term-out" style="background:#000;color:#c0c0c0;font-family:'Courier New',monospace;font-size:12px;flex:1;overflow-y:auto;padding:4px;white-space:pre-wrap"></div>
      <div style="display:flex;background:#000;padding:2px 4px;border-top:1px solid #333">
        <span style="color:#c0c0c0;font-family:'Courier New',monospace;font-size:12px;white-space:nowrap">C:\\&gt;&nbsp;</span>
        <input id="term-in" style="flex:1;background:#000;color:#c0c0c0;border:none;outline:none;font-family:'Courier New',monospace;font-size:12px">
      </div>
    </div>
  `, { width: 480, height: 300 });

  const out = document.getElementById('term-out');
  const inp = document.getElementById('term-in');
  if (!out || !inp) return;

  let termColor = '#c0c0c0';
  const print = (text) => {
    const line = document.createElement('div');
    line.textContent = text;
    line.style.color = termColor;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  };

  print('Microsoft(R) Windows 98');
  print('(C)Copyright Microsoft Corp 1981-1999.');
  print('');

  const history = [];
  let histIdx = -1;

  inp.focus();
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = inp.value.trim();
      print(`C:\\> ${cmd}`);
      inp.value = '';
      if (cmd) { history.unshift(cmd); histIdx = -1; }
      handleCommand(cmd.toLowerCase(), cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length-1) inp.value = history[++histIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) inp.value = history[--histIdx]; else { histIdx=-1; inp.value=''; }
    }
  });

  function handleCommand(cmdLow, cmdRaw) {
    const parts = cmdRaw.split(/\s+/);
    if (cmdLow === '') return;
    else if (cmdLow === 'cls') { out.innerHTML = ''; }
    else if (cmdLow === 'ver') { print('Windows 98 [Version 4.10.1998]'); }
    else if (cmdLow === 'exit') { closeWindow('terminal'); }
    else if (cmdLow.startsWith('echo ')) { print(cmdRaw.slice(5)); }
    else if (cmdLow === 'echo') { print('ECHO is on.'); }
    else if (cmdLow === 'dir') {
      print(' Volume in drive C has no label.');
      print(' Directory of C:\\');
      print('');
      const icons = Array.from(document.querySelectorAll('#desktop-icons .desktop-icon span')).map(s=>s.textContent);
      icons.forEach(name => print(` 01/01/1998  12:00         <DIR>          ${name}`));
      print('');
      print(`        ${icons.length} File(s)     0 bytes`);
    }
    else if (cmdLow.startsWith('color')) {
      const code = parts[1] || '07';
      const colors = {'0a':'#00ff00','0b':'#00ffff','0c':'#ff0000','0e':'#ffff00','0f':'#ffffff','07':'#c0c0c0'};
      termColor = colors[code] || '#c0c0c0';
      print('');
    }
    else if (cmdLow === 'cd' || cmdLow.startsWith('cd ')) { print('C:\\'); }
    else if (cmdLow === 'help') {
      ['CLS     Clears the screen.','DIR     Displays a list of files.','ECHO    Displays messages.',
       'VER     Displays Windows version.','COLOR   Sets console colors (e.g. COLOR 0A for green).',
       'CD      Displays current directory.','FORMAT  Formats a disk (try FORMAT C:).',
       'EXIT    Quits the command prompt.'].forEach(print);
    }
    else if (cmdLow === 'format c:' || cmdLow === 'format c:\\') {
      closeWindow('terminal');
      setTimeout(() => openFormatDisk(), 300);
    }
    else if (cmdLow === 'matrix') {
      closeWindow('terminal');
      setTimeout(() => startMatrixRain(), 300);
    }
    else { print(`'${parts[0]}' is not recognized as an internal or external command.`); }
    print('');
  }
}

/* ─── Matrix Rain ─── */
function startMatrixRain() {
  const desktop = document.getElementById('win98-desktop');
  if (document.getElementById('matrix-canvas')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-canvas';
  canvas.style.cssText = 'position:absolute;inset:0;z-index:8000;pointer-events:none;opacity:1;transition:opacity 1s ease';
  canvas.width = desktop.clientWidth;
  canvas.height = desktop.clientHeight;
  desktop.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const cols = Math.floor(canvas.width/14);
  const drops = Array(cols).fill(0).map(()=>Math.floor(Math.random()*canvas.height/14));
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF';

  let raf, start=Date.now();
  function draw() {
    ctx.fillStyle='rgba(0,0,0,0.05)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font='14px monospace';
    drops.forEach((y,i) => {
      ctx.fillStyle='#0f0';
      ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*14, y*14);
      if (y*14>canvas.height&&Math.random()>0.975) drops[i]=0; else drops[i]++;
    });
    if (Date.now()-start<8000) raf=requestAnimationFrame(draw);
    else { canvas.style.opacity='0'; setTimeout(()=>canvas.remove(),1000); cancelAnimationFrame(raf); }
  }
  raf=requestAnimationFrame(draw);
  saySpeech('Wake up, Neo... 🐇', 5000, true);
}

/* ─── Starfield Screensaver ─── */
function startStarfield() {
  const desktop = document.getElementById('win98-desktop');
  if (document.getElementById('starfield-canvas')) return;

  const container = document.createElement('div');
  container.id = 'starfield-ss';
  container.style.cssText = 'position:absolute;inset:0;background:#000;z-index:8999;cursor:pointer;overflow:hidden';

  const canvas = document.createElement('canvas');
  canvas.id = 'starfield-canvas';
  canvas.width = desktop.clientWidth;
  canvas.height = desktop.clientHeight - 28;
  canvas.style.cssText = 'position:absolute;top:0;left:0';
  container.appendChild(canvas);

  const pw = document.createElement('div');
  pw.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;padding:10px 16px;font-size:12px;font-family:inherit;white-space:nowrap;display:none';
  pw.innerHTML = '🔒 Enter Password: <input style="font-size:11px;width:80px;border:1px inset #808080;font-family:monospace" type="password"><button style="font-size:11px;font-family:inherit;padding:2px 8px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;margin-left:4px;cursor:pointer">OK</button>';
  container.appendChild(pw);
  pw.querySelector('button')?.addEventListener('click', dismiss);

  desktop.appendChild(container);

  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2;
  const stars = Array.from({length:200},()=>({x:(Math.random()-.5)*W,y:(Math.random()-.5)*H,z:Math.random()*W,pz:0}));

  let raf;
  function draw(){
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{
      s.pz=s.z; s.z-=6;
      if(s.z<=0){s.x=(Math.random()-.5)*W;s.y=(Math.random()-.5)*H;s.z=W;s.pz=W;}
      const sx=(s.x/s.z)*W+cx, sy=(s.y/s.z)*H+cy;
      const px=(s.x/s.pz)*W+cx, py=(s.y/s.pz)*H+cy;
      const size=Math.max(0.5,(1-s.z/W)*2.5);
      ctx.strokeStyle=`rgba(255,255,255,${1-s.z/W})`;
      ctx.lineWidth=size;
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(sx,sy); ctx.stroke();
    });
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);

  let shown=false;
  function dismiss(){
    cancelAnimationFrame(raf);
    container.remove();
  }
  container.addEventListener('mousemove', ()=>{
    if (!shown){ shown=true; pw.style.display='block'; }
  });
  container.addEventListener('click', e=>{
    if (!e.target.matches('button,input')) dismiss();
  });
}

/* ─── Init ─── */
export function initWin98() {
  initDesktopIcons();
  initStartMenu();
  initClock();
  initContextMenus();
  initCRTScan();
  initAsciiWidget();
  initStartButtonEasterEgg();
  initIdleEasterEgg();

  initSystemTray();
  initScreensaver();
  initBSOD();

  // Expose functions needed by inline onclick handlers in generated HTML
  window.openProjects = openProjects;
  window.openAbout = openAbout;
  window.openInternet = openInternet;
  window.openGuestbook = openGuestbook;
  window.openProjectDetail = openProjectDetail;
  window.openShutdownDialog = openShutdownDialog;
  window.openMinesweeper = openMinesweeper;
  window.openFormatDisk = openFormatDisk;
  window.openCalculator = openCalculator;
  window.openSnake = openSnake;
  window.openTerminal = openTerminal;
  window.openDefrag = openDefrag;
  window.openDownloadRAM = openDownloadRAM;
  window.openY2K = openY2K;

  // Typing sounds
  document.getElementById('win98-desktop')?.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (e.key.length===1||e.key==='Backspace'||e.key==='Enter'||e.key==='Space') playTypingClick();
    }
  }, true);
}
