/**
 * win98.js
 * Lightweight Win98-style desktop environment.
 * Creates icons, handles drag-to-move windows, taskbar, clock, start menu.
 */

import { saySpeech } from './main.js';
import mikuArt1 from './miku-ascii-art-1.txt?raw';
import mikuArt2 from './miku-ascii-art-2.txt?raw';

/* ─── Icon pixel art (SVG data URIs) ─── */
const ICONS = {
  myComputer: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='4' y='4' width='24' height='18' fill='%23c0c0c0' stroke='%23000' stroke-width='1'/><rect x='6' y='6' width='20' height='14' fill='%230000aa'/><rect x='10' y='22' width='12' height='3' fill='%23c0c0c0'/><rect x='7' y='25' width='18' height='2' fill='%23808080'/></svg>`,
  folder:     `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='10' width='28' height='18' fill='%23ffd700' stroke='%23b8860b' stroke-width='1'/><rect x='2' y='8' width='10' height='4' fill='%23ffd700' stroke='%23b8860b' stroke-width='1'/></svg>`,
  notepad:    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='5' y='2' width='22' height='28' fill='%23fff' stroke='%23000' stroke-width='1'/><rect x='8' y='8' width='16' height='1' fill='%23000'/><rect x='8' y='12' width='16' height='1' fill='%23000'/><rect x='8' y='16' width='12' height='1' fill='%23000'/><rect x='8' y='20' width='14' height='1' fill='%23000'/></svg>`,
  internet:   `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='13' fill='%234169e1' stroke='%23000' stroke-width='1'/><ellipse cx='16' cy='16' rx='6' ry='13' fill='none' stroke='%23fff' stroke-width='1'/><line x1='3' y1='16' x2='29' y2='16' stroke='%23fff' stroke-width='1'/><line x1='6' y1='9' x2='26' y2='9' stroke='%23fff' stroke-width='1'/><line x1='6' y1='23' x2='26' y2='23' stroke='%23fff' stroke-width='1'/></svg>`,
  recycle:    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='7' y='12' width='18' height='16' rx='1' fill='%23c0c0c0' stroke='%23808080' stroke-width='1'/><rect x='9' y='14' width='14' height='12' fill='%23fff'/><line x1='5' y1='12' x2='27' y2='12' stroke='%23808080' stroke-width='2'/><rect x='12' y='9' width='8' height='3' rx='1' fill='%23c0c0c0' stroke='%23808080' stroke-width='1'/><path d='M11 16 Q13 14 12 18' stroke='%23808080' stroke-width='1' fill='none'/><path d='M15 15 Q18 13 17 19' stroke='%23808080' stroke-width='1' fill='none'/><path d='M19 16 Q21 14 20 18' stroke='%23808080' stroke-width='1' fill='none'/></svg>`,
  winlogo:    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='13' height='13' fill='%23ff0000'/><rect x='17' y='2' width='13' height='13' fill='%2300cc00'/><rect x='2' y='17' width='13' height='13' fill='%230000ff'/><rect x='17' y='17' width='13' height='13' fill='%23ffcc00'/></svg>`,
};

/* ─── Desktop icon definitions ─── */
const DESKTOP_ICONS = [
  {
    id: 'my-computer',
    label: 'My Computer',
    icon: ICONS.myComputer,
    onOpen: openMyComputer,
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: ICONS.folder,
    onOpen: openProjects,
  },
  {
    id: 'about',
    label: 'About Me',
    icon: ICONS.notepad,
    onOpen: openAbout,
  },
  {
    id: 'internet',
    label: 'Internet',
    icon: ICONS.internet,
    onOpen: openInternet,
  },
  {
    id: 'recycle',
    label: 'Recycle Bin',
    icon: ICONS.recycle,
    onOpen: () => {
      openWindow('recycle-bin', 'Recycle Bin', ICONS.recycle,
        '<p style="color:#808080;font-style:italic">Recycle Bin is empty.</p>');
      saySpeech("It's empty... just like my inbox \u{1F4ED}");
    },
  },
  {
    id: 'guestbook',
    label: 'guestbook.txt',
    icon: ICONS.notepad,
    onOpen: openGuestbook,
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
    <div style="display:grid;grid-template-columns:repeat(3,64px);gap:16px;justify-content:center;padding:16px">
      <div class="desktop-icon" id="mycomp-projects-icon">
        <img src="${ICONS.folder}" alt=""><span>Projects</span>
      </div>
      <div class="desktop-icon">
        <img src="${ICONS.folder}" alt=""><span>Documents</span>
      </div>
    </div>
  `, { width: 300, height: 200 });
  // Attach dblclick after window is created
  const projIcon = document.getElementById('mycomp-projects-icon');
  if (projIcon) projIcon.addEventListener('dblclick', () => openProjects());
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
      <div class="start-menu-item" onclick="window.openShutdownDialog()">
        <img src="${ICONS.winlogo}" alt=""> Shut Down...
      </div>
    </div>
  `;
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
      // Icon context menu
      // Find which icon definition this is
      const iconDefs = DESKTOP_ICONS;
      const allIcons = Array.from(document.querySelectorAll('#desktop-icons .desktop-icon'));
      const idx = allIcons.indexOf(clickedIcon);
      const def = iconDefs[idx];
      showContextMenu(e.clientX, e.clientY, [
        { label: 'Open', action: def ? def.onOpen : null },
        '---',
        { label: 'Send To', sub: [
          { label: '3½ Floppy (A:)' },
          { label: 'Desktop (create shortcut)' },
          { label: 'Mail Recipient' },
        ]},
        '---',
        { label: 'Delete' },
        { label: 'Rename' },
        '---',
        { label: 'Properties' },
      ]);
    } else {
      // Desktop background context menu
      showContextMenu(e.clientX, e.clientY, [
        { label: 'Arrange Icons', sub: [
          { label: 'by Name', action: () => saySpeech("My icons were already perfect...") },
          { label: 'by Type' },
          { label: 'by Size' },
          { label: 'by Date' },
          '---',
          { label: 'Auto Arrange' },
        ]},
        { label: 'Refresh' },
        '---',
        { label: 'New', sub: [
          { label: 'Folder' },
          { label: 'Shortcut' },
          '---',
          { label: 'Text Document' },
          { label: 'Bitmap Image' },
        ]},
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

function initAsciiWidget() {
  const desktop = document.getElementById('win98-desktop');
  if (!desktop) return;

  // Pick one randomly from the inlined texts
  const ASCII_TEXTS = [mikuArt1, mikuArt2];
  const text = ASCII_TEXTS[Math.floor(Math.random() * ASCII_TEXTS.length)];

  // Restore saved state
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(ASCII_STORAGE_KEY) || '{}'); } catch {}

  const widget = document.createElement('div');
  widget.id = 'ascii-widget';
  widget.style.left   = `${saved.left   ?? 20}px`;
  widget.style.top    = `${saved.top    ?? 20}px`;
  widget.style.width  = `${saved.width  ?? 320}px`;
  widget.style.height = `${saved.height ?? 400}px`;

  const pre = document.createElement('pre');
  pre.id = 'ascii-widget-pre';
  pre.textContent = text;
  widget.appendChild(pre);

  // Resize grip (bottom-right corner)
  const grip = document.createElement('div');
  grip.id = 'ascii-widget-grip';
  grip.title = 'Resize';
  widget.appendChild(grip);

  desktop.insertBefore(widget, desktop.firstChild); // behind icons

  function save() {
    localStorage.setItem(ASCII_STORAGE_KEY, JSON.stringify({
      left:   parseInt(widget.style.left),
      top:    parseInt(widget.style.top),
      width:  parseInt(widget.style.width),
      height: parseInt(widget.style.height),
    }));
  }

  // Drag to move
  widget.addEventListener('mousedown', e => {
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
    function onUp() {
      save();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Resize grip
  grip.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    const toDesktop = window._viewportToDesktop || ((x, y) => [x, y]);
    const [sx, sy] = toDesktop(e.clientX, e.clientY);
    const ow = parseInt(widget.style.width), oh = parseInt(widget.style.height);
    function onMove(ev) {
      const [cx, cy] = toDesktop(ev.clientX, ev.clientY);
      widget.style.width  = `${Math.max(80,  ow + cx - sx)}px`;
      widget.style.height = `${Math.max(60, oh + cy - sy)}px`;
    }
    function onUp() {
      save();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
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
  let idleTimer = null;
  let idleTriggered = false;
  const IDLE_MS = 30000;

  function resetIdle() {
    if (idleTriggered) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!idleTriggered) {
        idleTriggered = true;
        saySpeech("Hello? Anyone there...? \u{1F440}");
      }
    }, IDLE_MS);
  }

  const desktop = document.getElementById('win98-desktop');
  if (desktop) {
    desktop.addEventListener('mousemove', resetIdle);
    resetIdle();
  }
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

  // Expose functions needed by inline onclick handlers in generated HTML
  window.openProjects = openProjects;
  window.openAbout = openAbout;
  window.openInternet = openInternet;
  window.openGuestbook = openGuestbook;
  window.openProjectDetail = openProjectDetail;
  window.openShutdownDialog = openShutdownDialog;
}
