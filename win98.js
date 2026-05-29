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
  browser:    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='4' width='28' height='24' rx='1' fill='%234169e1' stroke='%23000' stroke-width='1'/><rect x='2' y='4' width='28' height='7' fill='%23c0c0c0' stroke='%23000' stroke-width='1'/><rect x='8' y='6' width='16' height='3' rx='1' fill='%23fff' stroke='%23808080' stroke-width='0.5'/><text x='5' y='9.5' font-family='serif' font-size='6' fill='%23000080' font-style='italic' font-weight='bold'>!e</text><rect x='4' y='13' width='24' height='13' fill='%23fff'/><text x='7' y='21' font-family='serif' font-size='8' fill='%234169e1' font-style='italic'>!e</text><text x='14' y='21' font-family='monospace' font-size='5' fill='%23808080'>browser</text></svg>`,
  recycle:    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='7' y='12' width='18' height='16' rx='1' fill='%23c0c0c0' stroke='%23808080' stroke-width='1'/><rect x='9' y='14' width='14' height='12' fill='%23fff'/><line x1='5' y1='12' x2='27' y2='12' stroke='%23808080' stroke-width='2'/><rect x='12' y='9' width='8' height='3' rx='1' fill='%23c0c0c0' stroke='%23808080' stroke-width='1'/><path d='M11 16 Q13 14 12 18' stroke='%23808080' stroke-width='1' fill='none'/><path d='M15 15 Q18 13 17 19' stroke='%23808080' stroke-width='1' fill='none'/><path d='M19 16 Q21 14 20 18' stroke='%23808080' stroke-width='1' fill='none'/></svg>`,
  winlogo:    `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='13' height='13' fill='%23ff0000'/><rect x='17' y='2' width='13' height='13' fill='%2300cc00'/><rect x='2' y='17' width='13' height='13' fill='%230000ff'/><rect x='17' y='17' width='13' height='13' fill='%23ffcc00'/></svg>`,
  mine:       `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='8' fill='%23333'/><line x1='16' y1='4' x2='16' y2='28' stroke='%23333' stroke-width='2'/><line x1='4' y1='16' x2='28' y2='16' stroke='%23333' stroke-width='2'/><line x1='8' y1='8' x2='24' y2='24' stroke='%23333' stroke-width='2'/><line x1='24' y1='8' x2='8' y2='24' stroke='%23333' stroke-width='2'/></svg>`,
  paint:      `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='28' height='22' fill='%23fff' stroke='%23000' stroke-width='1'/><rect x='2' y='2' width='28' height='5' fill='%23c0c0c0' stroke='%23000' stroke-width='1'/><circle cx='8' cy='4.5' r='2' fill='%23f00'/><circle cx='14' cy='4.5' r='2' fill='%230a0'/><circle cx='20' cy='4.5' r='2' fill='%230000ff'/><circle cx='26' cy='4.5' r='2' fill='%23ff0'/><rect x='4' y='9' width='4' height='13' fill='%23a0522d'/><rect x='6' y='22' width='2' height='6' rx='1' fill='%23808080'/><ellipse cx='7' cy='28' rx='3' ry='1.5' fill='%23000080'/></svg>`,
  winamp:     `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='28' height='28' rx='2' fill='%23222'/><rect x='4' y='4' width='24' height='8' fill='%23111'/><text x='5' y='10' font-family='monospace' font-size='7' fill='%2300ff00'>NOW PLAYING</text><circle cx='10' cy='20' r='5' fill='%23444'/><circle cx='10' cy='20' r='2' fill='%23222'/><path d='M20 16 L26 20 L20 24 Z' fill='%2300ff00'/></svg>`,
  icq:        `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='10' cy='12' r='5' fill='%23ff6600'/><circle cx='22' cy='20' r='6' fill='%2300cc00'/><circle cx='10' cy='12' r='2' fill='%23fff'/><circle cx='22' cy='20' r='2.5' fill='%23fff'/></svg>`,
  cal:        `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='4' width='28' height='26' rx='1' fill='%23fff' stroke='%23808080' stroke-width='1'/><rect x='2' y='4' width='28' height='7' fill='%23000080'/><rect x='8' y='2' width='3' height='5' rx='1' fill='%23c0c0c0'/><rect x='21' y='2' width='3' height='5' rx='1' fill='%23c0c0c0'/><text x='6' y='9' font-family='sans-serif' font-size='5' fill='%23fff' font-weight='bold'>CALENDAR</text><rect x='5' y='14' width='4' height='3' fill='%23e0e0ff'/><rect x='10' y='14' width='4' height='3' fill='%23e0e0ff'/><rect x='15' y='14' width='4' height='3' fill='%23e0e0ff'/><rect x='20' y='14' width='4' height='3' fill='%23e0e0ff'/><rect x='25' y='14' width='4' height='3' fill='%23ffd0d0'/><rect x='5' y='19' width='4' height='3' fill='%23e0e0ff'/><rect x='10' y='19' width='4' height='3' fill='%23e0e0ff'/><rect x='15' y='19' width='4' height='3' fill='%23000080'/><rect x='20' y='19' width='4' height='3' fill='%23e0e0ff'/><rect x='25' y='19' width='4' height='3' fill='%23ffd0d0'/><rect x='5' y='24' width='4' height='3' fill='%23e0e0ff'/><rect x='10' y='24' width='4' height='3' fill='%23e0e0ff'/></svg>`,
  rss:        `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='28' height='28' rx='3' fill='%23f60'/><circle cx='8' cy='24' r='3' fill='%23fff'/><path d='M5 18 Q14 18 14 27' stroke='%23fff' stroke-width='2.5' fill='none'/><path d='M5 11 Q21 11 21 27' stroke='%23fff' stroke-width='2.5' fill='none'/><path d='M5 5 Q27 5 27 27' stroke='%23fff' stroke-width='2.5' fill='none'/></svg>`,
  lab:        `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='13' y='2' width='6' height='14' fill='%23c0c0c0' stroke='%23808080' stroke-width='1'/><path d='M10 16 L6 28 L26 28 L22 16Z' fill='%23e0f0ff' stroke='%23808080' stroke-width='1'/><circle cx='12' cy='22' r='2' fill='%2300ccff' opacity='0.8'/><circle cx='19' cy='25' r='1.5' fill='%2300ccff' opacity='0.6'/><circle cx='15' cy='20' r='1' fill='%230088ff' opacity='0.9'/><rect x='10' y='2' width='12' height='3' rx='1' fill='%23808080'/></svg>`,
  research:   `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='4' y='2' width='20' height='26' rx='1' fill='%23fff' stroke='%23808080' stroke-width='1'/><rect x='4' y='2' width='20' height='5' fill='%23000080'/><rect x='7' y='10' width='14' height='1.5' fill='%23333'/><rect x='7' y='14' width='14' height='1.5' fill='%23333'/><rect x='7' y='18' width='10' height='1.5' fill='%23333'/><circle cx='24' cy='24' r='5' fill='%23c0c0c0' stroke='%23808080' stroke-width='1'/><line x1='27.5' y1='27.5' x2='30' y2='30' stroke='%23808080' stroke-width='2'/><circle cx='24' cy='24' r='2.5' fill='%23fff'/></svg>`,
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
  {
    id: 'winamp',
    label: 'Winamp.exe',
    icon: ICONS.winamp,
    onOpen: openWinamp,
    contextItems: def => [
      { label: 'Open',       action: def.onOpen },
      { label: 'Play / Pause', action: def.onOpen },
      '---',
      { label: 'Add to Playlist', action: () => saySpeech('Playlist updated 🎵', 3000) },
      { label: 'Properties' },
    ],
  },
  {
    id: 'paint',
    label: 'Paint.exe',
    icon: ICONS.paint,
    onOpen: openPaint,
    contextItems: def => [
      { label: 'Open',   action: def.onOpen },
      { label: 'Edit',   action: def.onOpen },
      '---',
      { label: 'Set as Wallpaper', action: () => saySpeech('Nice art! 🎨 Wallpaper set.', 3000) },
      { label: 'Properties' },
    ],
  },
  {
    id: 'icq',
    label: 'ICQ',
    icon: ICONS.icq,
    onOpen: openICQ,
    contextItems: def => [
      { label: 'Open',           action: def.onOpen },
      { label: 'Add Contact…',   action: () => saySpeech('No contacts found 👻', 3000) },
      '---',
      { label: 'Change Status',  sub: [
        { label: '🟢 Online',      action: () => saySpeech('Status: Online 🟢', 3000, true) },
        { label: '🟡 Away',        action: () => saySpeech('Status: Away 🌙', 3000, true) },
        { label: '🔴 Do Not Disturb', action: () => saySpeech('Status: DND 🔴', 3000, true) },
        { label: '👻 Invisible',   action: () => saySpeech('You are now a ghost 👻', 3000, true) },
      ]},
      '---',
      { label: 'Properties', action: openICQProps },
    ],
  },
  {
    id: 'blog',
    label: 'Blog Reader',
    icon: ICONS.rss,
    onOpen: openBlogReader,
    contextItems: def => [
      { label: 'Open',    action: def.onOpen },
      { label: 'Refresh', action: () => { def.onOpen(); loadRSS(); } },
      '---',
      { label: 'Visit Blog', action: () => window.open('https://blog.yuzhes.com', '_blank') },
      { label: 'Properties' },
    ],
  },
  {
    id: 'lab',
    label: 'Creative Lab',
    icon: ICONS.lab,
    onOpen: openCreativeLab,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    icon: ICONS.research,
    onOpen: openResearch,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: ICONS.cal,
    onOpen: openCalendar,
    contextItems: def => [
      { label: 'Open',         action: def.onOpen },
      { label: 'Today',        action: def.onOpen },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'excl-e',
    label: '!e Browser',
    icon: ICONS.browser,
    onOpen: openExclamationE,
    contextItems: def => [
      { label: 'Open',             action: def.onOpen },
      { label: 'New Window',       action: def.onOpen },
      '---',
      { label: 'Set Home Page…',   action: () => saySpeech('Home page updated! 🏠', 3000) },
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
      <div class="win-icon" data-action="openDocuments">
        <img src="${ICONS.folder}" alt=""><span>Documents</span>
      </div>
      <div class="win-icon" data-action="openC">
        <img src="${ICONS.myComputer}" alt=""><span>(C:)</span>
      </div>
      <div class="win-icon" data-action="openPaint">
        <img src="${ICONS.paint}" alt=""><span>Paint.exe</span>
      </div>
      <div class="win-icon" data-action="openWinamp">
        <img src="${ICONS.winamp}" alt=""><span>Winamp.exe</span>
      </div>
    </div>
  `, { width: 360, height: 230 });
  const win = document.getElementById('win-my-computer');
  if (win) {
    win.addEventListener('dblclick', e => {
      const icon = e.target.closest('.win-icon[data-action]');
      if (!icon) return;
      const actions = {
        openProjects: openProjects,
        openDocuments: openDocuments,
        openC: openCDrive,
        openPaint: openPaint,
        openWinamp: openWinamp,
      };
      actions[icon.dataset.action]?.();
    });
  }
}

function openDocuments() {
  openWindow('documents', 'Documents', ICONS.folder, `
    <div class="inset-panel" style="height:100%;overflow-y:auto;box-sizing:border-box;background:#fff;font-family:monospace;font-size:12px">
      <div style="display:flex;flex-wrap:wrap;gap:16px;padding:12px;align-items:flex-start">
        <div class="win-icon" style="cursor:pointer" ondblclick="window.openAbout?.()">
          <img src="${ICONS.notepad}" alt=""><span>about.txt</span>
        </div>
        <div class="win-icon" style="cursor:pointer" ondblclick="window.openGuestbook?.()">
          <img src="${ICONS.notepad}" alt=""><span>guestbook.txt</span>
        </div>
        <div class="win-icon" style="cursor:pointer" ondblclick="window.openNotepadPersist?.()">
          <img src="${ICONS.notepad}" alt=""><span>notes.txt</span>
        </div>
      </div>
    </div>
  `, { width: 300, height: 200 });
}

function openCDrive() {
  openWindow('c-drive', 'Local Disk (C:)', ICONS.myComputer, `
    <div class="inset-panel" style="height:100%;overflow-y:auto;box-sizing:border-box;background:#fff">
      <div style="display:flex;flex-wrap:wrap;gap:16px;padding:12px;align-items:flex-start">
        <div class="win-icon"><img src="${ICONS.folder}" alt=""><span>Windows</span></div>
        <div class="win-icon"><img src="${ICONS.folder}" alt=""><span>Program Files</span></div>
        <div class="win-icon"><img src="${ICONS.folder}" alt=""><span>My Documents</span></div>
        <div class="win-icon"><img src="${ICONS.folder}" alt=""><span>Temp</span></div>
        <div class="win-icon" ondblclick="window.openFormatDisk?.()" style="cursor:pointer">
          <img src="${ICONS.myComputer}" alt=""><span>autoexec.bat</span>
        </div>
      </div>
      <div style="padding:4px 12px;border-top:1px solid #c0c0c0;font-size:10px;color:#808080;font-family:monospace">
        5 objects | 4.2 GB free of 4.3 GB
      </div>
    </div>
  `, { width: 320, height: 220 });
  saySpeech('Don\'t touch system32 👀', 3000, true);
}

const PROJECTS = [
  { name: 'yuzhes-homepage', desc: 'This site — retro Win98 CRT homepage', url: 'https://github.com/bkmashiro/yuzhes-homepage', icon: ICONS.internet },
  { name: 'blog', desc: 'baka_mashiro\'s blog — programming, life, and everything', url: 'https://blog.yuzhes.com', icon: ICONS.notepad },
  { name: 'tela', desc: 'LLM-native HTML page composer with layout primitives + MCP server', url: 'https://github.com/bkmashiro/tela', icon: ICONS.folder },
  { name: 'loom', desc: 'LLM execution runtime — parallel plan execution via streaming notation', url: 'https://github.com/bkmashiro/loom', icon: ICONS.folder },
  { name: 'datalog', desc: 'Datalog engine for Go — facts, Horn clause rules, fixpoint eval', url: 'https://github.com/bkmashiro/datalog', icon: ICONS.folder },
  { name: 'witness', desc: 'Deterministic I/O recording and replay for Go tests', url: 'https://github.com/bkmashiro/witness', icon: ICONS.folder },
  { name: 'logograph', desc: 'Interactive TUI dependency map for Go, Python, TypeScript', url: 'https://github.com/bkmashiro/logograph', icon: ICONS.folder },
  { name: 'go-labs', desc: '25 zero-dependency generic Go libraries (Go 1.22+)', url: 'https://github.com/bkmashiro/go-labs', icon: ICONS.folder },
  { name: 'wasi-wheels', desc: 'Python native extension wheels cross-compiled for wasm32-wasip1', url: 'https://github.com/bkmashiro/wasi-wheels', icon: ICONS.folder },
  { name: 'smart-extract', desc: 'Windows context-menu tool for intelligent encrypted archive extraction', url: 'https://github.com/bkmashiro/smart-extract', icon: ICONS.folder },
];

function openProjects() {
  const rowsHTML = PROJECTS.map(p => `
    <div style="display:flex;align-items:center;gap:6px;padding:4px 6px;border-bottom:1px solid #c0c0c0">
      <img src="${p.icon}" style="width:16px;height:16px;image-rendering:pixelated;flex-shrink:0">
      <span style="flex:1;font-size:11px;overflow:hidden"><b>${p.name}</b> — <span style="color:#444">${p.desc}</span></span>
      <button onclick="window.open('${p.url}','_blank')"
        style="flex-shrink:0;font-size:10px;padding:1px 6px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;font-family:inherit">
        Open
      </button>
    </div>
  `).join('');

  openWindow('projects', 'Projects — github.com/bkmashiro', ICONS.folder, `
    <div class="inset-panel" style="height:100%;overflow-y:auto;box-sizing:border-box;padding:0">
      <div style="padding:4px 6px;background:#000080;color:#fff;font-size:10px;display:flex;justify-content:space-between">
        <span>📁 bkmashiro's projects</span>
        <a href="https://github.com/bkmashiro" target="_blank" style="color:#adf;font-size:10px">github.com/bkmashiro</a>
      </div>
      ${rowsHTML}
    </div>
  `, { width: 440, height: 320 });
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
          <a href="https://blog.yuzhes.com" target="_blank" style="color:#0000ff;font-size:12px;text-decoration:underline">&#x1F4DD; Blog — blog.yuzhes.com</a>
          <a href="https://github.com/bkmashiro/wasi-wheels" target="_blank" style="color:#0000ff;font-size:12px;text-decoration:underline">&#x1F52C; wasi-wheels — Python WASM native extensions</a>
          <a href="https://github.com/bkmashiro/tela" target="_blank" style="color:#0000ff;font-size:12px;text-decoration:underline">&#x1F5A5; tela — LLM-native HTML composer</a>
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

/* ─── !e Browser ─── */
function openExclamationE(startUrl) {
  const url = startUrl || 'https://blog.yuzhes.com';
  const id = 'excl-e';

  if (document.getElementById(`win-${id}`)) { bringToFront(id); return; }

  const btnStyle = `font-size:11px;font-family:inherit;padding:2px 7px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer;flex-shrink:0`;

  openWindow(id, '!e — Browser', ICONS.browser, `
    <div style="display:flex;flex-direction:column;height:100%;gap:0">

      <!-- Toolbar -->
      <div style="display:flex;align-items:center;gap:2px;padding:3px 4px;background:#c0c0c0;border-bottom:1px solid #808080;flex-shrink:0">
        <button id="ieb-back"    title="Back"    style="${btnStyle}">◀</button>
        <button id="ieb-fwd"     title="Forward" style="${btnStyle}">▶</button>
        <button id="ieb-stop"    title="Stop"    style="${btnStyle}">✕</button>
        <button id="ieb-refresh" title="Refresh" style="${btnStyle}">↻</button>
        <div style="width:1px;height:16px;background:#808080;margin:0 3px;flex-shrink:0"></div>
        <span style="font-size:10px;font-weight:bold;white-space:nowrap;flex-shrink:0">Address:</span>
        <input id="ieb-addr" type="text" value="${url}"
          style="flex:1;font-size:11px;font-family:monospace;border:inset 2px;padding:1px 4px;background:#fff;min-width:0"/>
        <button id="ieb-go" style="${btnStyle} margin-left:2px">Go</button>
      </div>

      <!-- Viewport -->
      <div style="position:relative;flex:1;overflow:hidden">
        <div id="ieb-loading" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;z-index:3;font-size:11px;gap:6px">
          <div id="ieb-spinner" style="width:24px;height:24px;border:3px solid #c0c0c0;border-top-color:#000080;border-radius:50%;animation:spin 0.8s linear infinite"></div>
          <span id="ieb-load-txt">Connecting…</span>
        </div>

        <div id="ieb-error" style="position:absolute;inset:0;display:none;background:#fff;padding:24px;z-index:3;font-size:12px">
          <p style="font-size:18px;font-weight:bold;color:#000080;margin-bottom:8px">The page cannot be displayed</p>
          <hr style="border:none;border-top:2px solid #000080;margin-bottom:12px"/>
          <p style="margin-bottom:8px">The website you are trying to reach is not available, or has refused to be displayed inside another window.</p>
          <p style="color:#808080;font-size:11px;margin-bottom:12px">This may be due to security restrictions on the remote server (X-Frame-Options: DENY).</p>
          <p style="font-size:11px"><b>Try:</b></p>
          <ul style="font-size:11px;margin-left:16px;margin-top:4px;list-style:disc">
            <li>Clicking <b>Open in New Window</b> below to visit the site normally</li>
            <li>Navigating to a different URL in the address bar</li>
          </ul>
          <div style="margin-top:14px;display:flex;gap:8px">
            <button id="ieb-err-open" style="${btnStyle}">Open in New Window</button>
            <button id="ieb-err-back" style="${btnStyle}">Back</button>
          </div>
        </div>

        <iframe id="ieb-frame"
          style="width:100%;height:100%;border:none;display:block;filter:sepia(0.18) contrast(1.06) saturate(0.72) brightness(0.94)"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation">
        </iframe>

        <!-- Scanline + vignette overlay -->
        <div style="position:absolute;inset:0;pointer-events:none;z-index:2;
          background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.018) 3px,rgba(0,0,0,0.018) 4px),
                     radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.08) 100%)">
        </div>
      </div>

      <!-- Status bar -->
      <div id="ieb-status" style="padding:2px 6px;font-size:10px;background:#c0c0c0;border-top:1px solid #808080;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        Ready
      </div>
    </div>
  `, { width: 520, height: 380 });

  // --- Wire up after DOM is inserted ---
  const history   = [url];
  let histIdx     = 0;
  let loadTimer   = null;
  let currentUrl  = url;

  const frame   = document.getElementById('ieb-frame');
  const addr    = document.getElementById('ieb-addr');
  const status  = document.getElementById('ieb-status');
  const loading = document.getElementById('ieb-loading');
  const errDiv  = document.getElementById('ieb-error');

  function setStatus(txt) { if (status) status.textContent = txt; }
  function showLoading(txt) {
    if (loading) loading.style.display = 'flex';
    if (errDiv)  errDiv.style.display  = 'none';
    setStatus(txt || 'Connecting…');
  }
  function showError() {
    if (loading) loading.style.display = 'none';
    if (errDiv)  errDiv.style.display  = 'block';
    setStatus(`Cannot display: ${currentUrl}`);
    const errOpen = document.getElementById('ieb-err-open');
    const errBack = document.getElementById('ieb-err-back');
    if (errOpen) errOpen.onclick = () => window.open(currentUrl, '_blank');
    if (errBack) errBack.onclick = () => { if (histIdx > 0) goTo(history[--histIdx], false); };
  }
  function hideLoading() {
    if (loading) loading.style.display = 'none';
    if (errDiv)  errDiv.style.display  = 'none';
    setStatus('Done');
  }

  function navigate(href, pushHistory = true) {
    let target = href.trim();
    if (!target) return;
    // Auto-prepend https
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;

    currentUrl = target;
    if (addr) addr.value = target;

    showLoading('Connecting to ' + target + '…');
    clearTimeout(loadTimer);

    if (pushHistory) {
      history.splice(histIdx + 1);
      history.push(target);
      histIdx = history.length - 1;
    }

    _pendingNav = true;
    frame.src = target;

    // Fallback: if load never fires (some blocks don't), show error after 6s
    loadTimer = setTimeout(() => { _pendingNav = false; showError(); }, 6000);
  }

  let _pendingNav = false;

  frame.addEventListener('load', () => {
    if (!_pendingNav) return;   // ignore the initial about:blank load
    _pendingNav = false;
    clearTimeout(loadTimer);

    try {
      // Accessible → same-origin (or about:blank after X-Frame-Options kill)
      const loc = frame.contentDocument?.location?.href ?? '';
      if (!loc || loc === 'about:blank') {
        showError();
      } else {
        hideLoading();
        if (addr) addr.value = loc;
      }
    } catch (_) {
      // contentDocument threw → cross-origin navigation.
      // Could be (a) page loaded OK, or (b) X-Frame-Options blocked and
      // Chrome left the frame in a cross-origin error state.
      // Recheck after a tick: if it has become accessible + blank → blocked.
      setTimeout(() => {
        try {
          const loc2 = frame.contentDocument?.location?.href ?? '';
          if (!loc2 || loc2 === 'about:blank') showError();
          else hideLoading();
        } catch {
          // Still cross-origin → legitimately loaded
          hideLoading();
        }
      }, 300);
    }
  });

  // Go button / Enter key
  document.getElementById('ieb-go')?.addEventListener('click', () => navigate(addr.value));
  addr?.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(addr.value); });

  // Back / Forward
  document.getElementById('ieb-back')?.addEventListener('click', () => {
    if (histIdx > 0) navigate(history[--histIdx], false);
  });
  document.getElementById('ieb-fwd')?.addEventListener('click', () => {
    if (histIdx < history.length - 1) navigate(history[++histIdx], false);
  });
  document.getElementById('ieb-stop')?.addEventListener('click', () => {
    clearTimeout(loadTimer);
    frame.src = 'about:blank';
    setStatus('Stopped');
    if (loading) loading.style.display = 'none';
  });
  document.getElementById('ieb-refresh')?.addEventListener('click', () => {
    navigate(currentUrl, false);
  });

  // Delay first navigation by one tick so the iframe's initial about:blank
  // load event fires BEFORE _pendingNav is set true — avoids spurious error page
  setTimeout(() => navigate(url, false), 50);
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

/* ─── Winamp ─── */
const WINAMP_PLAYLIST = [
  { title: 'Yoko Takahashi — A Cruel Angel\'s Thesis',   dur: '1:35' },
  { title: 'Joe Hisaishi — One Summer\'s Day',           dur: '3:22' },
  { title: 'Nujabes — Feather',                          dur: '5:07' },
  { title: 'Yoko Kanno — Tank!',                         dur: '3:15' },
  { title: 'ClariS — Connect',                           dur: '4:10' },
  { title: 'Susumu Hirasawa — Forces',                   dur: '4:33' },
];
let _winampTrack = 0;
let _winampPlaying = false;
let _winampTimer = null;
let _winampSec = 0;

function openWinamp() {
  _winampPlaying = false;
  clearInterval(_winampTimer);

  function trackHTML() {
    const t = WINAMP_PLAYLIST[_winampTrack];
    const mins = Math.floor(_winampSec / 60).toString().padStart(2, '0');
    const secs = (_winampSec % 60).toString().padStart(2, '0');
    return `<span id="wa-time" style="font-family:monospace;color:#00ff00">${mins}:${secs}</span>
            <span id="wa-title" style="color:#00cc00;font-size:10px;margin-left:4px;overflow:hidden;white-space:nowrap;max-width:160px;display:inline-block;text-overflow:ellipsis">${t.title}</span>`;
  }

  openWindow('winamp', 'Winamp', ICONS.winamp, `
    <div style="background:#222;color:#0f0;font-family:monospace;font-size:11px;display:flex;flex-direction:column;height:100%;box-sizing:border-box">
      <div style="background:#111;padding:6px 8px;border-bottom:1px solid #00ff0044">
        <div style="font-size:9px;color:#00aa00;margin-bottom:2px">▶ NOW PLAYING</div>
        <div id="wa-info" style="display:flex;align-items:center;gap:4px">${trackHTML()}</div>
        <div style="margin-top:4px;background:#111;border:1px solid #00ff0033;height:6px;border-radius:2px;overflow:hidden">
          <div id="wa-progress" style="height:100%;width:0%;background:#00ff00;transition:width 0.5s linear"></div>
        </div>
      </div>
      <div style="display:flex;justify-content:center;gap:4px;padding:6px 4px;border-bottom:1px solid #00ff0022">
        <button id="wa-prev" style="background:#333;color:#0f0;border:1px solid #555;padding:2px 8px;cursor:pointer;font-size:11px;font-family:monospace">⏮</button>
        <button id="wa-play" style="background:#333;color:#0f0;border:1px solid #555;padding:2px 8px;cursor:pointer;font-size:11px;font-family:monospace">▶</button>
        <button id="wa-pause" style="background:#333;color:#0f0;border:1px solid #555;padding:2px 8px;cursor:pointer;font-size:11px;font-family:monospace">⏸</button>
        <button id="wa-stop" style="background:#333;color:#0f0;border:1px solid #555;padding:2px 8px;cursor:pointer;font-size:11px;font-family:monospace">⏹</button>
        <button id="wa-next" style="background:#333;color:#0f0;border:1px solid #555;padding:2px 8px;cursor:pointer;font-size:11px;font-family:monospace">⏭</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:4px 0">
        ${WINAMP_PLAYLIST.map((t, i) => `
          <div class="wa-row" data-idx="${i}" style="padding:2px 8px;display:flex;justify-content:space-between;cursor:pointer;font-size:10px;${i === _winampTrack ? 'background:#004400;color:#0f0' : 'color:#009900'}">
            <span>${(i+1).toString().padStart(2,'0')}. ${t.title}</span>
            <span style="color:#007700">${t.dur}</span>
          </div>`).join('')}
      </div>
    </div>
  `, { width: 280, height: 260 });

  function refreshDisplay() {
    const info = document.getElementById('wa-info');
    if (info) info.innerHTML = trackHTML();
    const rows = document.querySelectorAll('.wa-row');
    rows.forEach(r => {
      const active = parseInt(r.dataset.idx) === _winampTrack;
      r.style.background = active ? '#004400' : '';
      r.style.color = active ? '#0f0' : '#009900';
    });
  }

  function startPlaying() {
    _winampPlaying = true;
    clearInterval(_winampTimer);
    const totalSec = WINAMP_PLAYLIST[_winampTrack].dur.split(':').reduce((a, v) => a*60 + parseInt(v), 0);
    _winampTimer = setInterval(() => {
      if (!document.getElementById('win-winamp')) { clearInterval(_winampTimer); return; }
      _winampSec++;
      if (_winampSec >= totalSec) { _winampSec = 0; _winampTrack = (_winampTrack + 1) % WINAMP_PLAYLIST.length; refreshDisplay(); }
      const prog = document.getElementById('wa-progress');
      if (prog) prog.style.width = `${(_winampSec / totalSec) * 100}%`;
      const timeEl = document.getElementById('wa-time');
      if (timeEl) timeEl.textContent = `${Math.floor(_winampSec/60).toString().padStart(2,'0')}:${(_winampSec%60).toString().padStart(2,'0')}`;
    }, 1000);
  }

  document.getElementById('wa-play')?.addEventListener('click', () => {
    _winampSec = 0; startPlaying(); refreshDisplay();
    saySpeech('🎵 Winamp, it really whips the llama\'s ass!', 4000, true);
  });
  document.getElementById('wa-pause')?.addEventListener('click', () => {
    _winampPlaying = !_winampPlaying;
    if (_winampPlaying) startPlaying(); else clearInterval(_winampTimer);
  });
  document.getElementById('wa-stop')?.addEventListener('click', () => {
    clearInterval(_winampTimer); _winampPlaying = false; _winampSec = 0;
    const prog = document.getElementById('wa-progress');
    if (prog) prog.style.width = '0%';
    const timeEl = document.getElementById('wa-time');
    if (timeEl) timeEl.textContent = '00:00';
  });
  document.getElementById('wa-prev')?.addEventListener('click', () => {
    _winampTrack = (_winampTrack - 1 + WINAMP_PLAYLIST.length) % WINAMP_PLAYLIST.length;
    _winampSec = 0; if (_winampPlaying) startPlaying(); refreshDisplay();
  });
  document.getElementById('wa-next')?.addEventListener('click', () => {
    _winampTrack = (_winampTrack + 1) % WINAMP_PLAYLIST.length;
    _winampSec = 0; if (_winampPlaying) startPlaying(); refreshDisplay();
  });
  document.querySelectorAll('.wa-row').forEach(r => {
    r.addEventListener('dblclick', () => {
      _winampTrack = parseInt(r.dataset.idx); _winampSec = 0;
      startPlaying(); refreshDisplay();
    });
  });
}

/* ─── Paint ─── */
function openPaint() {
  openWindow('paint', 'Untitled — Paint', ICONS.paint, `
    <div style="display:flex;flex-direction:column;height:100%;background:#c0c0c0;box-sizing:border-box">
      <div style="display:flex;gap:2px;padding:2px 4px;border-bottom:1px solid #808080;align-items:center;flex-wrap:wrap">
        <span style="font-size:10px;font-weight:bold;margin-right:4px">Color:</span>
        ${['#000','#fff','#f00','#0f0','#00f','#ff0','#f0f','#0ff','#f80','#08f','#808080','#c0c0c0'].map(c =>
          `<div data-color="${c}" style="width:14px;height:14px;background:${c};border:2px solid #fff;cursor:pointer;box-sizing:border-box"></div>`
        ).join('')}
        <span style="font-size:10px;font-weight:bold;margin-left:6px">Size:</span>
        ${[2,4,8].map(s => `<button data-size="${s}" style="font-size:9px;font-family:inherit;padding:1px 4px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">${s}px</button>`).join('')}
        <button id="paint-clear" style="font-size:9px;font-family:inherit;padding:1px 6px;cursor:pointer;margin-left:4px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">Clear</button>
        <button id="paint-eraser" style="font-size:9px;font-family:inherit;padding:1px 6px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">Eraser</button>
      </div>
      <div style="flex:1;display:flex;align-items:stretch;overflow:hidden;background:#808080;padding:4px">
        <canvas id="paint-canvas" width="400" height="300" style="background:#fff;cursor:crosshair;touch-action:none;flex:1;image-rendering:pixelated"></canvas>
      </div>
      <div id="paint-status" style="padding:2px 6px;font-size:10px;border-top:1px solid #808080;background:#c0c0c0">0, 0</div>
    </div>
  `, { width: 420, height: 320 });

  const canvas = document.getElementById('paint-canvas');
  if (!canvas) return;
  const ctx2d = canvas.getContext('2d');
  let painting = false;
  let currentColor = '#000';
  let currentSize = 4;
  let erasing = false;

  // Resize canvas to match display
  function resizeCanvas() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    const imgData = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = w;
    canvas.height = h;
    ctx2d.fillStyle = '#fff';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.putImageData(imgData, 0, 0);
  }
  resizeCanvas();

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return [src.clientX - r.left, src.clientY - r.top];
  }

  canvas.addEventListener('mousedown', e => {
    painting = true;
    const [x, y] = getPos(e);
    ctx2d.beginPath();
    ctx2d.moveTo(x, y);
  });
  canvas.addEventListener('mousemove', e => {
    const [x, y] = getPos(e);
    const statusEl = document.getElementById('paint-status');
    if (statusEl) statusEl.textContent = `${Math.round(x)}, ${Math.round(y)}`;
    if (!painting) return;
    ctx2d.lineWidth = currentSize;
    ctx2d.lineCap = 'round';
    ctx2d.strokeStyle = erasing ? '#fff' : currentColor;
    ctx2d.lineTo(x, y);
    ctx2d.stroke();
    ctx2d.beginPath();
    ctx2d.moveTo(x, y);
  });
  canvas.addEventListener('mouseup', () => { painting = false; });
  canvas.addEventListener('mouseleave', () => { painting = false; });

  document.querySelectorAll('[data-color]').forEach(el => {
    el.addEventListener('click', () => {
      erasing = false;
      currentColor = el.dataset.color;
      document.querySelectorAll('[data-color]').forEach(e => e.style.borderColor = '#fff');
      el.style.borderColor = '#000080';
      document.getElementById('paint-eraser').style.borderColor = '#fff #808080 #808080 #fff';
    });
  });
  document.querySelectorAll('[data-size]').forEach(el => {
    el.addEventListener('click', () => {
      currentSize = parseInt(el.dataset.size);
      document.querySelectorAll('[data-size]').forEach(e => e.style.borderColor = '#fff #808080 #808080 #fff');
      el.style.borderColor = '#808080 #fff #fff #808080';
    });
  });
  document.getElementById('paint-clear')?.addEventListener('click', () => {
    ctx2d.fillStyle = '#fff';
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);
    saySpeech('Clean slate! 🎨', 2000);
  });
  document.getElementById('paint-eraser')?.addEventListener('click', () => {
    erasing = !erasing;
    const btn = document.getElementById('paint-eraser');
    if (btn) btn.style.borderColor = erasing ? '#808080 #fff #fff #808080' : '#fff #808080 #808080 #fff';
  });
}

/* ─── ICQ Messenger ─── */
const ICQ_HISTORY = [
  { from: 'nujabes_fan', msg: 'yo, seen the new vocaloid drops?' },
  { from: 'me', msg: 'not yet, link?' },
  { from: 'nujabes_fan', msg: 'check ur miku folder lol' },
  { from: 'system', msg: '*** wasm_enjoyer has joined ***' },
  { from: 'wasm_enjoyer', msg: 'anyone working on their thesis?' },
  { from: 'me', msg: 'always 😭' },
];

function openICQ() {
  saySpeech('You\'ve got a message! 🔔', 3000, true);
  const histHTML = ICQ_HISTORY.map(m => {
    if (m.from === 'system') return `<div style="text-align:center;color:#808080;font-size:10px;margin:2px 0">${m.msg}</div>`;
    const isMe = m.from === 'me';
    return `<div style="margin:3px 0;display:flex;flex-direction:column;align-items:${isMe?'flex-end':'flex-start'}">
      <span style="font-size:9px;color:#808080">${m.from}</span>
      <span style="font-size:11px;background:${isMe?'#ddf':'#fff'};border:1px solid #aaa;padding:2px 6px;max-width:80%;word-break:break-word">${m.msg}</span>
    </div>`;
  }).join('');

  openWindow('icq', 'ICQ — nujabes_fan', ICONS.icq, `
    <div style="display:flex;flex-direction:column;height:100%;font-family:Tahoma,Arial,sans-serif">
      <div style="background:#ff6600;color:#fff;font-size:11px;padding:4px 8px;display:flex;justify-content:space-between;align-items:center">
        <span>🟢 Online — <b>yuzhes</b></span><span style="font-size:10px">ICQ 2000b</span>
      </div>
      <div id="icq-log" style="flex:1;overflow-y:auto;padding:8px;background:#f0f0f0;border:1px inset #808080;box-sizing:border-box">
        ${histHTML}
      </div>
      <div style="display:flex;gap:4px;padding:4px;border-top:1px solid #808080">
        <input id="icq-input" type="text" placeholder="Type a message..."
          style="flex:1;font-size:11px;font-family:inherit;border:1px inset #808080;padding:2px 4px;outline:none">
        <button id="icq-send" style="font-size:11px;font-family:inherit;padding:2px 10px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">Send</button>
      </div>
    </div>
  `, { width: 300, height: 300 });

  const replies = [
    'lol', 'haha', 'brb', 'omg really?', 'ngl that slaps', 'same tbh', 'wait what', 'kk', '👀', 'gz!',
    'no way', 'thats so cool', 'have u tried turning it off and on again', 'compile it again', 'touch grass first',
  ];

  function sendMsg() {
    const input = document.getElementById('icq-input');
    const log = document.getElementById('icq-log');
    if (!input || !log || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';
    log.innerHTML += `<div style="margin:3px 0;display:flex;flex-direction:column;align-items:flex-end">
      <span style="font-size:9px;color:#808080">me</span>
      <span style="font-size:11px;background:#ddf;border:1px solid #aaa;padding:2px 6px;max-width:80%">${text}</span>
    </div>`;
    log.scrollTop = log.scrollHeight;
    // Auto-reply
    setTimeout(() => {
      if (!document.getElementById('win-icq')) return;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const log2 = document.getElementById('icq-log');
      if (log2) {
        log2.innerHTML += `<div style="margin:3px 0;display:flex;flex-direction:column;align-items:flex-start">
          <span style="font-size:9px;color:#808080">nujabes_fan</span>
          <span style="font-size:11px;background:#fff;border:1px solid #aaa;padding:2px 6px;max-width:80%">${reply}</span>
        </div>`;
        log2.scrollTop = log2.scrollHeight;
      }
      saySpeech('New message! 💬', 2000);
    }, 800 + Math.random() * 1500);
  }

  document.getElementById('icq-send')?.addEventListener('click', sendMsg);
  document.getElementById('icq-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(); });
}

/* ─── Calendar ─── */
function openCalendar() {
  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();

  function renderCal() {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const monthName = first.toLocaleString('en-US', { month: 'long' });
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    const today = now.getDate();

    let rows = '';
    let day = 1 - startDay;
    for (let r = 0; r < 6; r++) {
      let cells = '';
      for (let c = 0; c < 7; c++, day++) {
        const inMonth = day >= 1 && day <= daysInMonth;
        const isToday = isCurrentMonth && day === today;
        cells += `<td style="width:28px;height:22px;text-align:center;font-size:11px;
          ${isToday ? 'background:#000080;color:#fff;font-weight:bold;' : inMonth ? '' : 'color:#c0c0c0;'}
          border:1px solid #e0e0e0;cursor:${inMonth?'pointer':'default'}"
          ${isToday ? 'title="Today!"' : ''}>${inMonth ? day : (day < 1 ? daysInMonth + day : day - daysInMonth)}</td>`;
      }
      rows += `<tr>${cells}</tr>`;
      if (day > daysInMonth) break;
    }

    const calBody = document.getElementById('cal-body');
    const calHeader = document.getElementById('cal-header');
    if (calBody) calBody.innerHTML = rows;
    if (calHeader) calHeader.textContent = `${monthName} ${viewYear}`;
  }

  openWindow('calendar', 'Calendar', ICONS.cal, `
    <div style="display:flex;flex-direction:column;align-items:center;padding:8px;height:100%;box-sizing:border-box">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <button id="cal-prev" style="font-size:12px;padding:1px 8px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;font-family:inherit">◀</button>
        <span id="cal-header" style="font-size:12px;font-weight:bold;min-width:120px;text-align:center"></span>
        <button id="cal-next" style="font-size:12px;padding:1px 8px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;font-family:inherit">▶</button>
      </div>
      <table style="border-collapse:collapse">
        <thead>
          <tr>${['Su','Mo','Tu','We','Th','Fr','Sa'].map((d,i) =>
            `<th style="width:28px;font-size:10px;padding:2px;color:${i===0||i===6?'#c00':'#000'}">${d}</th>`
          ).join('')}</tr>
        </thead>
        <tbody id="cal-body"></tbody>
      </table>
      <p id="cal-today" style="margin-top:8px;font-size:10px;color:#808080"></p>
    </div>
  `, { width: 230, height: 260 });

  renderCal();
  const todayEl = document.getElementById('cal-today');
  if (todayEl) todayEl.textContent = `Today: ${now.toDateString()}`;

  document.getElementById('cal-prev')?.addEventListener('click', () => {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCal();
  });
  document.getElementById('cal-next')?.addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCal();
  });
}

/* ─── ICQ Properties ─── */
function openICQProps() {
  openWindow('icq-props', 'ICQ — Properties', ICONS.icq, `
    <div style="padding:12px;font-size:12px">
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">
        <div style="font-size:36px;line-height:1">💬</div>
        <div>
          <p><b>ICQ 2000b</b></p>
          <p style="color:#808080;font-size:10px;margin-top:2px">Version 2000b Build 3278</p>
        </div>
      </div>
      <div class="inset-panel" style="font-size:11px;display:flex;flex-direction:column;gap:4px">
        <div>UIN: <b>12345678</b></div>
        <div>Nickname: <b>yuzhes</b></div>
        <div>Status: <b style="color:#008000">🟢 Online</b></div>
        <div>Messages sent: <b>∞</b></div>
        <div>Contacts online: <b>2</b></div>
      </div>
      <p style="margin-top:8px;color:#808080;font-size:10px">ICQ = "I Seek You" — founded 1996 by Mirabilis</p>
      <div style="margin-top:8px;display:flex;justify-content:flex-end">
        <button onclick="document.getElementById('win-icq-props')?.remove();document.getElementById('tb-icq-props')?.remove()"
          style="font-size:11px;font-family:inherit;padding:3px 16px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">OK</button>
      </div>
    </div>
  `, { width: 260, height: 210 });
}

/* ─── Blog RSS Reader ─── */
const RSS_FEED_URLS = [
  'https://neoblog-ten.vercel.app/atom.xml',
];
let _rssEntries = [];

// Namespace-safe XML helper — getElementsByTagName ignores namespaces
function xmlGet(el, tag) {
  return el.getElementsByTagName(tag)[0] ?? null;
}
// RSS 2.0: <link> is a text node, not an href attribute
function rssLink(item) {
  return xmlGet(item, 'link')?.textContent?.trim()
      || xmlGet(item, 'guid')?.textContent?.trim()
      || '#';
}
// Friendly date from RSS <pubDate> e.g. "Thu, 12 Mar 2026 00:00:00 GMT"
function rssDate(item) {
  const raw = xmlGet(item, 'pubDate')?.textContent          // RSS 2.0
           ?? xmlGet(item, 'published')?.textContent        // Atom
           ?? xmlGet(item, 'updated')?.textContent ?? '';
  const d = new Date(raw);
  return isNaN(d) ? raw.slice(0, 10) : d.toISOString().slice(0, 10);
}
// Best available content: content:encoded → description → summary
function rssContent(item) {
  return xmlGet(item, 'encoded')?.textContent          // <content:encoded>
      ?? xmlGet(item, 'description')?.textContent      // RSS 2.0 <description>
      ?? xmlGet(item, 'summary')?.textContent          // Atom <summary>
      ?? xmlGet(item, 'content')?.textContent          // Atom <content>
      ?? '';
}

async function loadRSS() {
  const listEl  = document.getElementById('rss-list');
  const infoEl  = document.getElementById('rss-info');
  const bodyEl  = document.getElementById('rss-body');
  if (!listEl) return;

  if (infoEl) { infoEl.textContent = '📡 Fetching feed…'; infoEl.style.color = '#adf'; }
  listEl.innerHTML = '<div style="padding:8px;color:#808080;font-size:10px">Loading…</div>';

  try {
    // Try each URL in sequence until one succeeds
    let text = null;
    let lastErr = null;
    for (const feedUrl of RSS_FEED_URLS) {
      try {
        const res = await fetch(feedUrl, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
        break;
      } catch (e) { lastErr = e; }
    }
    if (text === null) throw lastErr ?? new Error('All feed URLs failed');

    const doc  = new DOMParser().parseFromString(text, 'application/xml');

    if (doc.querySelector('parsererror')) throw new Error('XML parse error');

    // Support both RSS 2.0 (<item>) and Atom (<entry>)
    _rssEntries = Array.from(doc.getElementsByTagName('item'));
    if (_rssEntries.length === 0)
      _rssEntries = Array.from(doc.getElementsByTagName('entry'));

    if (infoEl) { infoEl.textContent = `📰 ${_rssEntries.length} posts`; infoEl.style.color = '#fff'; }

    if (_rssEntries.length === 0) {
      listEl.innerHTML = '<div style="padding:8px;font-size:10px;color:#c00">No posts found.</div>';
      return;
    }

    listEl.innerHTML = _rssEntries.map((e, i) => {
      const title = xmlGet(e, 'title')?.textContent ?? '(untitled)';
      const date  = rssDate(e);
      return `<div class="rss-item" data-idx="${i}"
        style="padding:5px 8px;border-bottom:1px solid #e8e8e8;cursor:pointer;user-select:none">
        <div style="font-weight:bold;font-size:10px;line-height:1.3;margin-bottom:1px">${title}</div>
        <div style="font-size:9px;color:#808080">${date}</div>
      </div>`;
    }).join('');

    listEl.querySelectorAll('.rss-item').forEach(item => {
      item.addEventListener('click', () => {
        listEl.querySelectorAll('.rss-item').forEach(r => {
          r.style.background = ''; r.style.color = '';
          const sub = r.querySelector('div:last-child');
          if (sub) sub.style.color = '';
        });
        item.style.background = '#000080'; item.style.color = '#fff';
        const sub = item.querySelector('div:last-child');
        if (sub) sub.style.color = '#adf';
        showRSSEntry(_rssEntries[parseInt(item.dataset.idx)], bodyEl);
      });
      item.addEventListener('dblclick', () => {
        window.open(rssLink(_rssEntries[parseInt(item.dataset.idx)]), '_blank');
      });
    });

    if (_rssEntries.length) listEl.querySelector('.rss-item')?.click();
  } catch (err) {
    console.error('RSS load error:', err);
    const isDown = /503|502|fetch|network/i.test(err.message ?? '');
    if (infoEl) { infoEl.textContent = '❌ Feed unavailable'; infoEl.style.color = '#f88'; }
    listEl.innerHTML = `<div style="padding:10px;font-size:11px;color:#800000;line-height:1.6">
      ${isDown
        ? '📡 Feed server is temporarily down (503).<br>Try again later or visit the blog directly.'
        : `Error: ${err.message ?? 'Could not fetch feed.'}`
      }<br><br>
      <a href="https://blog.yuzhes.com" target="_blank" style="color:#0000ff">Open blog.yuzhes.com ↗</a>
    </div>`;
  }
}

function showRSSEntry(entry, bodyEl) {
  if (!bodyEl || !entry) return;
  const title   = xmlGet(entry, 'title')?.textContent ?? '';
  const date    = rssDate(entry);
  const link    = rssLink(entry);
  const rawHTML = rssContent(entry);
  // Strip HTML tags and decode common entities for plain-text preview
  const text = rawHTML
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
    .replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#?\w+;/g,' ')
    .replace(/\s+/g,' ').trim()
    .slice(0, 1200);

  bodyEl.innerHTML = `
    <div style="border-bottom:1px solid #c0c0c0;padding-bottom:8px;margin-bottom:8px">
      <div style="font-size:13px;font-weight:bold;color:#000080;margin-bottom:3px">${title}</div>
      <div style="font-size:10px;color:#808080">${date} ·
        <a href="${link}" target="_blank" style="color:#0000ff;text-decoration:underline">Read full post ↗</a>
      </div>
    </div>
    <div style="font-size:11px;line-height:1.65;color:#222;white-space:pre-wrap">${text}${text.length >= 1200 ? '\n\n…' : ''}</div>
    <div style="margin-top:12px;padding-top:8px;border-top:1px solid #c0c0c0">
      <a href="${link}" target="_blank" style="font-size:11px;color:#0000ff;text-decoration:underline">→ Continue reading on blog.yuzhes.com</a>
    </div>
  `;
}

function openBlogReader() {
  saySpeech('Loading blog… 📰', 3000, true);
  openWindow('blog-reader', 'Blog Reader — blog.yuzhes.com', ICONS.rss, `
    <div style="display:flex;flex-direction:column;height:100%;box-sizing:border-box">
      <div style="background:#000080;color:#fff;padding:3px 8px;font-size:10px;display:flex;align-items:center;gap:8px;flex-shrink:0">
        <span id="rss-info">📡 Initializing…</span>
        <div style="flex:1"></div>
        <button id="rss-refresh"
          style="font-size:9px;padding:1px 8px;font-family:inherit;cursor:pointer;background:#1060c0;color:#fff;border:1px solid #6090e0">
          ⟳ Refresh
        </button>
        <a href="https://blog.yuzhes.com" target="_blank"
          style="font-size:9px;color:#adf;text-decoration:underline">Open in IE</a>
      </div>
      <div style="display:flex;flex:1;overflow:hidden">
        <div id="rss-list"
          style="width:190px;flex-shrink:0;border-right:2px solid;border-color:#808080 #fff #fff #808080;overflow-y:auto;background:#fff;font-family:inherit">
        </div>
        <div id="rss-body"
          style="flex:1;overflow-y:auto;padding:10px;font-family:inherit;background:#fff">
        </div>
      </div>
    </div>
  `, { width: 560, height: 380 });

  loadRSS();
  document.getElementById('rss-refresh')?.addEventListener('click', loadRSS);
}

/* ─── Creative Lab ─── */
const CREATIVE_DEMOS = [
  { name: 'MapForge',          desc: 'Browser-based Minecraft map art generator — dithering, color matching, .schem export', url: 'https://github.com/bkmashiro/mapforge', tag: 'SvelteKit + Web Workers' },
  { name: 'creative-lab',      desc: 'Gallery of 12+ single-file visual demos shipped every two days by a Claude agent', url: 'https://github.com/bkmashiro/creative-lab', tag: 'Canvas · WebGL · Physics' },
  { name: 'Leverage Platform', desc: 'AI bot competition platform — sandboxed execution, real-time human-vs-bot, MCP server (13 tools)', url: 'https://github.com/bkmashiro/leverage', tag: 'NestJS + Nuxt 4' },
  { name: 'RedScript',         desc: 'Compiler targeting Minecraft Java Edition — entity selectors as first-class types, foreach→execute', url: 'https://yuzhes.com/posts/redscript/', tag: 'Compiler · mcfunction' },
  { name: 'yuzhes-homepage',   desc: 'This very site! Win98 CRT perspective desktop with CSS matrix3d homography', url: 'https://github.com/bkmashiro/yuzhes-homepage', tag: 'Vanilla JS · CSS3' },
];

function openCreativeLab() {
  saySpeech('Welcome to the lab! 🧪', 3000, true);
  const rowsHTML = CREATIVE_DEMOS.map(d => `
    <div style="padding:8px;border-bottom:1px solid #c0c0c0;cursor:pointer"
      onclick="window.open('${d.url}','_blank')"
      onmouseenter="this.style.background='#000080';this.querySelectorAll('*').forEach(e=>e.style.color='#fff')"
      onmouseleave="this.style.background='';this.querySelectorAll('*').forEach(e=>e.style.color='')">
      <div style="font-size:12px;font-weight:bold;margin-bottom:2px">${d.name}</div>
      <div style="font-size:10px;color:#444;margin-bottom:3px">${d.desc}</div>
      <div style="font-size:9px;font-family:monospace;background:#e8e8e8;display:inline-block;padding:1px 6px;border-radius:2px;color:#006">${d.tag}</div>
    </div>
  `).join('');

  openWindow('creative-lab', '🧪 Creative Lab — yuzhes', ICONS.lab, `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="background:#000080;color:#fff;padding:4px 10px;font-size:11px;flex-shrink:0">
        Projects &amp; Demos — double-click any to open
      </div>
      <div style="flex:1;overflow-y:auto;background:#fff">
        ${rowsHTML}
      </div>
      <div style="padding:4px 8px;font-size:10px;color:#808080;border-top:1px solid #c0c0c0;flex-shrink:0">
        ${CREATIVE_DEMOS.length} items · Click to open in browser
      </div>
    </div>
  `, { width: 420, height: 340 });
}

/* ─── Research ─── */
function openResearch() {
  const now = new Date();
  const thesisStart = new Date('2024-09-01');
  const thesisEnd   = new Date('2025-09-01');
  const elapsed = Math.max(0, Math.min(1, (now - thesisStart) / (thesisEnd - thesisStart)));
  const pct = Math.round(elapsed * 100);

  openWindow('research', 'Research — yuzhes', ICONS.research, `
    <div style="padding:12px;font-size:12px;display:flex;flex-direction:column;gap:10px;height:100%;box-sizing:border-box;overflow-y:auto">
      <div>
        <p style="font-weight:bold;margin-bottom:6px">📄 Master's Thesis</p>
        <div class="inset-panel" style="font-size:11px">
          <p><b>Topic:</b> Sandboxing Python Inside WebAssembly</p>
          <p style="margin-top:3px"><b>Stack:</b> Rust · WASI · CPython · wazero</p>
          <p style="margin-top:3px"><b>Repos:</b>
            <a href="https://github.com/bkmashiro/wasi-wheels" target="_blank" style="color:#00f">wasi-wheels</a> ·
            <a href="https://github.com/bkmashiro/shimmy-wasm-go" target="_blank" style="color:#00f">shimmy-wasm-go</a>
          </p>
          <div style="margin-top:8px">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px">
              <span>Thesis progress</span><span>${pct}%</span>
            </div>
            <div style="background:#fff;border:1px inset #808080;height:14px;position:relative">
              <div style="height:100%;width:${pct}%;background:#000080;transition:width 1s ease"></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p style="font-weight:bold;margin-bottom:6px">📊 Key Papers / Posts</p>
        <div class="inset-panel" style="font-size:11px;display:flex;flex-direction:column;gap:4px">
          <a href="https://yuzhes.com/posts/wasm-sandbox-perf/" target="_blank" style="color:#00f;text-decoration:underline">WASM vs seccomp: Benchmarking Sandbox Startup</a>
          <a href="https://yuzhes.com/posts/shimmy-wasm-sandbox/" target="_blank" style="color:#00f;text-decoration:underline">Shimmy WASM: When the Security Model Has No Syscalls</a>
          <a href="https://yuzhes.com/posts/faster-crud/" target="_blank" style="color:#00f;text-decoration:underline">@faster-crud: Killing the CRUD Boilerplate in NestJS</a>
        </div>
      </div>

      <div>
        <p style="font-weight:bold;margin-bottom:6px">⚡ Key Findings</p>
        <div class="inset-panel" style="font-size:11px;font-family:monospace;display:flex;flex-direction:column;gap:2px">
          <div>WASM startup: <b style="color:#008000">~10ms</b> (rivals Python itself)</div>
          <div>JIT speedup:  <b style="color:#008000">2–8×</b> on CPU-bound workloads</div>
          <div>Security overhead: <b style="color:#008000">~0ms</b></div>
          <div>Syscall surface: <b style="color:#008000">0</b> (capability-based WASI)</div>
        </div>
      </div>
    </div>
  `, { width: 380, height: 370 });
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
      <div class="start-menu-item" id="sm-winamp">🎵 Winamp</div>
      <div class="start-menu-item" id="sm-paint">🎨 Paint</div>
      <div class="start-menu-item" id="sm-icq">💬 ICQ</div>
      <div class="start-menu-item" id="sm-calendar">📅 Calendar</div>
      <div class="start-menu-item" id="sm-blog">📡 Blog Reader</div>
      <div class="start-menu-item" id="sm-lab">🧪 Creative Lab</div>
      <div class="start-menu-item" id="sm-research">🔬 Research</div>
      <div class="start-menu-item" id="sm-magi">🔴 MAGI System</div>
      <div class="start-menu-item" id="sm-browser">🌐 !e Browser</div>
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
  menu.querySelector('#sm-winamp')?.addEventListener('click', () => { menu.classList.remove('open'); openWinamp(); });
  menu.querySelector('#sm-paint')?.addEventListener('click', () => { menu.classList.remove('open'); openPaint(); });
  menu.querySelector('#sm-icq')?.addEventListener('click', () => { menu.classList.remove('open'); openICQ(); });
  menu.querySelector('#sm-calendar')?.addEventListener('click', () => { menu.classList.remove('open'); openCalendar(); });
  menu.querySelector('#sm-blog')?.addEventListener('click', () => { menu.classList.remove('open'); openBlogReader(); });
  menu.querySelector('#sm-lab')?.addEventListener('click', () => { menu.classList.remove('open'); openCreativeLab(); });
  menu.querySelector('#sm-research')?.addEventListener('click', () => { menu.classList.remove('open'); openResearch(); });
  menu.querySelector('#sm-magi')?.addEventListener('click', () => { menu.classList.remove('open'); openMAGI(); });
  menu.querySelector('#sm-browser')?.addEventListener('click', () => { menu.classList.remove('open'); openExclamationE(); });
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

  // Helper: rename an icon's label span
  function startRename(labelSpan) {
    labelSpan.contentEditable = 'true';
    labelSpan.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(labelSpan);
    sel.removeAllRanges();
    sel.addRange(range);
    const finish = () => { labelSpan.contentEditable = 'false'; };
    labelSpan.addEventListener('blur', finish, { once: true });
    labelSpan.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') { ev.preventDefault(); labelSpan.blur(); }
      if (ev.key === 'Escape') { ev.preventDefault(); labelSpan.blur(); }
    }, { once: true });
  }

  // Helper: delete (or reject) a desktop icon
  function deleteIcon(iconEl) {
    const allIcons = Array.from(document.querySelectorAll('#desktop-icons .desktop-icon'));
    const idx = allIcons.indexOf(iconEl);
    const def = DESKTOP_ICONS[idx];
    if (def) {
      // System icon — refuse to delete
      saySpeech('You can\'t delete that! 🚫 It\'s a system icon.', 4000, true);
    } else {
      // User-created — actually delete
      iconEl.style.transition = 'opacity 0.3s, transform 0.3s';
      iconEl.style.opacity = '0';
      iconEl.style.transform = 'scale(0.5)';
      setTimeout(() => iconEl.remove(), 300);
      saySpeech('Deleted! 🗑️', 2000);
    }
  }

  // Desktop right-click
  desktop.addEventListener('contextmenu', e => {
    // Allow right-click on .win-icon inside windows
    const clickedWinIcon = e.target.closest('.win-icon');
    if (clickedWinIcon) {
      e.preventDefault();
      e.stopPropagation();
      const actionKey = clickedWinIcon.dataset.action;
      const actionMap = {
        openProjects: openProjects, openDocuments: openDocuments,
        openC: openCDrive, openPaint: openPaint, openWinamp: openWinamp,
      };
      const openFn = actionMap[actionKey] ?? null;
      const label = clickedWinIcon.querySelector('span')?.textContent ?? 'File';
      showContextMenu(e.clientX, e.clientY, [
        { label: `Open "${label}"`, action: openFn ?? (() => saySpeech(`Opening ${label}... 📂`, 2000)) },
        '---',
        { label: 'Rename', action: () => startRename(clickedWinIcon.querySelector('span')) },
        { label: 'Copy',   action: () => saySpeech(`Copied ${label} to clipboard 📋`, 2500) },
        '---',
        { label: 'Properties' },
      ]);
      return;
    }

    // Don't show on other window content (but not win-icon — handled above)
    if (e.target.closest('.win98-window, input, textarea, a')) return;
    e.preventDefault();
    e.stopPropagation();

    const clickedIcon = e.target.closest('.desktop-icon');
    if (clickedIcon) {
      // Icon context menu — use per-icon contextItems if defined, else generic
      const allIcons = Array.from(document.querySelectorAll('#desktop-icons .desktop-icon'));
      const idx = allIcons.indexOf(clickedIcon);
      const def = DESKTOP_ICONS[idx];
      const baseItems = def?.contextItems
        ? def.contextItems(def)
        : [
            { label: 'Open', action: def?.onOpen ?? null },
            '---',
            { label: 'Send To', sub: [
              { label: '3\u00BD Floppy (A:)' },
              { label: 'Desktop (create shortcut)' },
            ]},
            '---',
            { label: 'Properties' },
          ];
      // Inject working Rename + Delete into every desktop icon menu
      const items = [
        ...baseItems,
        '---',
        { label: 'Rename', action: () => startRename(clickedIcon.querySelector('span')) },
        { label: 'Delete', action: () => deleteIcon(clickedIcon) },
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
  let volume = 75;
  let muted = false;
  let activeTrayPopup = null;
  let outsideClickHandler = null;

  function showTrayPopup(id, htmlContent) {
    // Toggle off if same popup already open
    if (activeTrayPopup && activeTrayPopup.dataset.popupId === id) {
      activeTrayPopup.remove(); activeTrayPopup = null;
      if (outsideClickHandler) document.removeEventListener('mousedown', outsideClickHandler);
      return false; // signal: closed
    }
    if (activeTrayPopup) { activeTrayPopup.remove(); activeTrayPopup = null; }

    const desktop = document.getElementById('win98-desktop');
    const taskbar = document.getElementById('taskbar');
    if (!desktop || !taskbar) return false;

    const popup = document.createElement('div');
    popup.dataset.popupId = id;
    popup.style.cssText = `
      position:absolute;background:#c0c0c0;
      border:2px solid;border-color:#fff #808080 #808080 #fff;
      box-shadow:2px 2px 4px rgba(0,0,0,0.4);
      z-index:9999;min-width:100px;
      font-family:'W95FA',Tahoma,Arial,sans-serif;font-size:11px;
    `;
    popup.innerHTML = htmlContent;
    desktop.appendChild(popup);

    // Position above taskbar at right side
    const tbH = taskbar.offsetHeight || 28;
    popup.style.bottom = `${tbH + 4}px`;
    popup.style.right = '4px';
    activeTrayPopup = popup;

    if (outsideClickHandler) document.removeEventListener('mousedown', outsideClickHandler);
    outsideClickHandler = e => {
      if (popup.contains(e.target) || e.target === volumeBtn || e.target.closest('#tray-volume') || e.target === networkBtn || e.target.closest('#tray-network')) return;
      popup.remove(); activeTrayPopup = null;
      document.removeEventListener('mousedown', outsideClickHandler);
    };
    setTimeout(() => document.addEventListener('mousedown', outsideClickHandler), 0);
    return true; // signal: opened
  }

  /* ── Volume popup ── */
  if (volumeBtn) {
    volumeBtn.addEventListener('click', e => {
      e.stopPropagation();
      const opened = showTrayPopup('vol', `
        <div style="padding:8px;display:flex;flex-direction:column;align-items:center;gap:6px">
          <div style="font-size:11px;font-weight:bold">🔊 Volume</div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
            <input id="vol-slider" type="range" min="0" max="100" value="${muted ? 0 : volume}"
              style="height:80px;cursor:pointer;accent-color:#000080"
              orient="vertical">
            <span id="vol-pct" style="font-family:monospace;font-size:12px">${muted ? 0 : volume}%</span>
          </div>
          <button id="vol-mute-btn" style="width:100%;font-size:10px;font-family:inherit;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;padding:2px 4px">
            ${muted ? '🔈 Unmute' : '🔇 Mute'}
          </button>
        </div>
      `);
      if (!opened) return;

      // Vertical slider via writing-mode (CSS fallback for browsers that don't support orient attr)
      const slider = document.getElementById('vol-slider');
      if (slider) slider.style.writingMode = 'vertical-lr';
      if (slider) slider.style.direction = 'rtl';

      document.getElementById('vol-slider')?.addEventListener('input', e => {
        volume = parseInt(e.target.value);
        muted = volume === 0;
        const pctEl = document.getElementById('vol-pct');
        if (pctEl) pctEl.textContent = `${volume}%`;
        const muteBtn = document.getElementById('vol-mute-btn');
        if (muteBtn) muteBtn.textContent = muted ? '🔈 Unmute' : '🔇 Mute';
      });

      document.getElementById('vol-mute-btn')?.addEventListener('click', () => {
        muted = !muted;
        const sl = document.getElementById('vol-slider');
        const pctEl = document.getElementById('vol-pct');
        const muteBtn = document.getElementById('vol-mute-btn');
        if (sl) sl.value = muted ? 0 : volume;
        if (pctEl) pctEl.textContent = `${muted ? 0 : volume}%`;
        if (muteBtn) muteBtn.textContent = muted ? '🔈 Unmute' : '🔇 Mute';
        saySpeech(muted ? 'Shh, I\'m working... 🤫' : `Volume: ${volume}% 🔊`, 3000, true);
      });
    });
  }

  /* ── Network popup ── */
  if (networkBtn) {
    networkBtn.addEventListener('click', e => {
      e.stopPropagation();
      const packets = Math.floor(Math.random() * 99999);
      const ping = 12 + Math.floor(Math.random() * 8);
      const opened = showTrayPopup('net', `
        <div style="padding:10px;min-width:180px">
          <div style="font-size:11px;font-weight:bold;margin-bottom:6px">🌐 Network Status</div>
          <div style="background:#fff;border:1px inset #808080;padding:6px;font-family:monospace;font-size:10px;display:flex;flex-direction:column;gap:3px">
            <div>Status: <span style="color:#008000;font-weight:bold">Connected</span></div>
            <div>IP: 127.0.0.1</div>
            <div>Speed: 56,600 bps</div>
            <div>Packets sent: ${packets.toLocaleString()}</div>
            <div id="net-ping">Ping: <span id="net-ping-val">${ping} ms</span></div>
          </div>
          <div style="display:flex;gap:4px;margin-top:6px">
            <button id="net-ping-btn" style="flex:1;font-size:10px;font-family:inherit;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;padding:2px">Ping</button>
            <button id="net-diag-btn" style="flex:1;font-size:10px;font-family:inherit;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;padding:2px">Diagnose</button>
          </div>
        </div>
      `);
      if (!opened) return;

      document.getElementById('net-ping-btn')?.addEventListener('click', () => {
        const pingVal = document.getElementById('net-ping-val');
        if (pingVal) { pingVal.textContent = 'pinging...'; pingVal.style.color = '#808080'; }
        setTimeout(() => {
          if (!pingVal) return;
          const ms = 8 + Math.floor(Math.random() * 200);
          pingVal.textContent = `${ms} ms`;
          pingVal.style.color = ms < 50 ? '#008000' : ms < 120 ? '#c07000' : '#c00000';
        }, 800 + Math.random() * 1200);
      });

      document.getElementById('net-diag-btn')?.addEventListener('click', () => {
        saySpeech('Diagnosing network... 🔌 Cause: user error.', 4000, true);
      });
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
       'MATRIX  Display matrix rain.','MAGI    Consult MAGI Supercomputer (MAGI [question])',
       'BLOG    Open blog RSS reader.','RESEARCH  Open research notes.',
       'LAB     Open creative lab.','EXIT    Quits the command prompt.'].forEach(print);
    }
    else if (cmdLow === 'format c:' || cmdLow === 'format c:\\') {
      closeWindow('terminal');
      setTimeout(() => openFormatDisk(), 300);
    }
    else if (cmdLow === 'matrix') {
      closeWindow('terminal');
      setTimeout(() => startMatrixRain(), 300);
    }
    else if (cmdLow === 'magi' || cmdLow.startsWith('magi ')) {
      const q = parts.slice(1).join(' ') || undefined;
      closeWindow('terminal');
      setTimeout(() => openMAGI(q), 300);
    }
    else if (cmdLow === 'blog') {
      closeWindow('terminal');
      setTimeout(() => openBlogReader(), 300);
    }
    else if (cmdLow === 'research') {
      closeWindow('terminal');
      setTimeout(() => openResearch(), 300);
    }
    else if (cmdLow === 'lab') {
      closeWindow('terminal');
      setTimeout(() => openCreativeLab(), 300);
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

/* ─── MAGI Supercomputer System (EVA easter egg) ─── */
const MAGI_QUESTIONS = [
  'Initiate Third Impact?',
  'Deploy Unit-01?',
  'Override self-destruct?',
  'Accept soul transfer?',
  'Terminate AT-Field?',
  'Engage dummy system?',
  'Disable pilot ejection?',
  'Open Dirac Sea?',
  'Begin Instrumentality?',
  'Erase Tokyo-3?',
];

function openMAGI(question) {
  const q = question ?? MAGI_QUESTIONS[Math.floor(Math.random() * MAGI_QUESTIONS.length)];
  // Each MAGI has a personality (Scientist / Mother / Woman)
  const votes = [
    { name: 'MELCHIOR-1', role: 'Scientist',   color: '#00ff41', delay: 800  },
    { name: 'BALTHASAR-2', role: 'Mother',      color: '#ff9900', delay: 1600 },
    { name: 'CASPER-3',    role: 'Woman',        color: '#ff0055', delay: 2400 },
  ];
  // Simulate votes: scientist tends APPROVED, mother varies, woman often rejects dramatic things
  const results = votes.map((v, i) => {
    const roll = Math.random();
    const approved = i === 0 ? roll > 0.25 : i === 1 ? roll > 0.45 : roll > 0.55;
    return { ...v, approved };
  });
  const approvedCount = results.filter(r => r.approved).length;
  const decision = approvedCount >= 2 ? 'APPROVED' : 'REJECTED';

  openWindow('magi', 'MAGI SUPERCOMPUTER SYSTEM', ICONS.myComputer, `
    <div id="magi-root" style="
      background:#000;color:#00ff41;font-family:'Courier New',monospace;
      height:100%;display:flex;flex-direction:column;padding:0;box-sizing:border-box;
      overflow:hidden;user-select:none">
      <div style="background:#001100;border-bottom:1px solid #00ff41;padding:6px 12px;font-size:10px;display:flex;justify-content:space-between">
        <span style="letter-spacing:2px">NERV MAGI SYSTEM — GEHIRN CYBERNETICS</span>
        <span id="magi-clock" style="font-size:10px"></span>
      </div>
      <div style="padding:10px 12px;font-size:11px;border-bottom:1px solid #003300">
        <span style="color:#888">QUERY: </span>
        <span style="color:#ffff00;font-weight:bold">${q}</span>
      </div>
      <div style="display:flex;flex:1;gap:0">
        ${results.map((v, i) => `
          <div style="flex:1;border-right:${i<2?'1px solid #003300':'none'};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px">
            <div style="font-size:9px;letter-spacing:1px;color:#00aa00">${v.name}</div>
            <div style="font-size:8px;color:#006600">[${v.role.toUpperCase()}]</div>
            <div id="magi-vote-${i}" style="font-size:22px;font-weight:bold;color:#003300;transition:color 0.3s">···</div>
            <div style="width:60px;height:4px;background:#003300;margin-top:4px">
              <div id="magi-bar-${i}" style="height:100%;width:0%;background:${v.color};transition:width 0.8s ease"></div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="magi-decision" style="padding:10px;text-align:center;font-size:18px;font-weight:bold;letter-spacing:4px;color:#003300;border-top:1px solid #003300;transition:color 0.5s">
        COMPUTING…
      </div>
    </div>
  `, { width: 420, height: 280 });

  // Animate clock
  const clockEl = document.getElementById('magi-clock');
  const clockTick = setInterval(() => {
    if (!clockEl || !document.getElementById('win-magi')) { clearInterval(clockTick); return; }
    clockEl.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
  }, 1000);
  if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });

  // Animate votes one by one
  results.forEach((v, i) => {
    setTimeout(() => {
      const voteEl = document.getElementById(`magi-vote-${i}`);
      const barEl  = document.getElementById(`magi-bar-${i}`);
      if (!voteEl) return;

      // Counting animation
      let count = 0;
      const ticker = setInterval(() => {
        count++;
        voteEl.textContent = count % 2 === 0 ? '█▄▀' : '▀▄█';
        voteEl.style.color = '#00aa00';
        if (count > 8) {
          clearInterval(ticker);
          voteEl.textContent = v.approved ? 'APPROVED' : 'REJECTED';
          voteEl.style.color = v.approved ? '#00ff41' : '#ff0055';
          if (barEl) barEl.style.width = '100%';

          // Final decision after last vote
          if (i === results.length - 1) {
            setTimeout(() => {
              const decEl = document.getElementById('magi-decision');
              if (!decEl) return;
              decEl.textContent = `DECISION: ${decision}`;
              decEl.style.color = decision === 'APPROVED' ? '#00ff41' : '#ff0055';
              decEl.style.textShadow = `0 0 12px ${decision === 'APPROVED' ? '#00ff41' : '#ff0055'}`;
              saySpeech(
                decision === 'APPROVED'
                  ? `MAGI System: ${approvedCount}-${3-approvedCount} — APPROVED ⚠️`
                  : `MAGI System: ${3-approvedCount}-${approvedCount} — REJECTED 🛡️`,
                5000, true
              );
            }, 600);
          }
        }
      }, 120);
    }, v.delay);
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
  window.openWinamp = openWinamp;
  window.openPaint = openPaint;
  window.openICQ = openICQ;
  window.openCalendar = openCalendar;
  window.openBlogReader = openBlogReader;
  window.openCreativeLab = openCreativeLab;
  window.openResearch = openResearch;
  window.openMAGI = openMAGI;
  window.openExclamationE = openExclamationE;
  window.openICQProps = openICQProps;
  window.openDocuments = openDocuments;
  window.openCDrive = openCDrive;
  window.openAbout = openAbout;
  window.openGuestbook = openGuestbook;
  window.openNotepadPersist = openNotepadPersist;

  // Typing sounds
  document.getElementById('win98-desktop')?.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (e.key.length===1||e.key==='Backspace'||e.key==='Enter'||e.key==='Space') playTypingClick();
    }
  }, true);
}
