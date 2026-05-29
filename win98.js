/**
 * win98.js
 * Lightweight Win98-style desktop environment.
 * Creates icons, handles drag-to-move windows, taskbar, clock, start menu.
 */

import { saySpeech } from './main.js';
import mikuArt1 from './miku-ascii-art-1.txt?raw';
import mikuArt2 from './miku-ascii-art-2.txt?raw';

import { ICONS } from './win98-icons.js';
import { playTypingClick } from './win98-audio.js';
import {
  openWindow, bringToFront, closeWindow,
  dismissContextMenu, showContextMenu, openGenericProperties,
} from './win98-core.js';
import {
  openMyComputer, openDocuments, openCDrive, openProjects, openAbout,
  openInternet, openRecycleBin, emptyRecycleBin, openSysProps, openIEProps,
  openExclamationE, openMineHighScores, openGuestbook, openWinamp, openPaint,
  openICQ, openCalendar, openICQProps, openBlogReader, openCreativeLab,
  openResearch, openProjectDetail, openNotepadPersist, openDeleteSystem32,
  openShutdownDialog, showBSOD, openFormatDisk, openMinesweeper, openDefrag,
  openDownloadRAM, spawnClippy, openY2K, openCalculator, openSnake,
  openTerminal, startMatrixRain, startStarfield, openMAGI,
  loadRSS,
  openTetris, openPinball, openBonziBuddy, openTaskManager, openDialup, openRansomware,
  // New features
  openOutlookExpress, openICQBuddyList, initICQTray,
  openIEFavorites, openFloppyError,
  openPrinterError, startPrinterErrors, openPrintQueue,
  openNotepad, spawnNeko, openRadio,
} from './win98-apps.js';

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
  {
    id: 'tetris',
    label: 'Tetris',
    icon: ICONS.mine,
    onOpen: openTetris,
    contextItems: def => [
      { label: 'Open',       action: def.onOpen },
      { label: 'High Scores', action: () => saySpeech('High score: 0. You can do better!', 3000) },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'pinball',
    label: 'Pinball',
    icon: ICONS.mine,
    onOpen: openPinball,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'bonzi',
    label: 'Bonzi Buddy.exe',
    icon: ICONS.winamp,
    onOpen: openBonziBuddy,
    contextItems: def => [
      { label: 'Open',    action: def.onOpen },
      { label: 'Dismiss', action: () => document.getElementById('bonzi-buddy')?.remove() },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'dialup',
    label: 'Dial-up Internet',
    icon: ICONS.internet,
    onOpen: openDialup,
    contextItems: def => [
      { label: 'Connect', action: def.onOpen },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'ransomware',
    label: 'RANSOMWARE.exe',
    icon: ICONS.mine,
    onOpen: openRansomware,
    contextItems: def => [
      { label: 'Open (if you dare)', action: def.onOpen },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'outlook-express',
    label: 'Outlook Express',
    icon: ICONS.internet,
    onOpen: openOutlookExpress,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      { label: 'Check Mail', action: def.onOpen },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'ie-favorites',
    label: 'Favorites',
    icon: ICONS.internet,
    onOpen: openIEFavorites,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      '---',
      { label: 'Add Favorite...', action: () => saySpeech('Added to Favorites! ⭐', 2500, true) },
      { label: 'Properties' },
    ],
  },
  {
    id: 'print-queue',
    label: 'Printers',
    icon: ICONS.myComputer,
    onOpen: openPrintQueue,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      { label: 'Set as Default Printer', action: () => saySpeech('HP DeskJet 722C set as default 🖨️', 3000, true) },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'neko',
    label: 'Neko.exe',
    icon: ICONS.winamp,
    onOpen: spawnNeko,
    contextItems: def => [
      { label: 'Run', action: def.onOpen },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'radio',
    label: 'Internet Radio',
    icon: ICONS.winamp,
    onOpen: openRadio,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      { label: 'Play', action: def.onOpen },
      '---',
      { label: 'Properties' },
    ],
  },
  {
    id: 'notepad-new',
    label: 'Notepad',
    icon: ICONS.notepad,
    onOpen: openNotepad,
    contextItems: def => [
      { label: 'Open', action: def.onOpen },
      { label: 'Print', action: openPrinterError },
      '---',
      { label: 'Properties' },
    ],
  },
];

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
      <div class="start-menu-item" id="sm-tetris">🎮 Tetris</div>
      <div class="start-menu-item" id="sm-pinball">🎱 Pinball</div>
      <div class="start-menu-item" id="sm-bonzi">🦍 Bonzi Buddy</div>
      <div class="start-menu-item" id="sm-taskmanager">🖥️ Task Manager</div>
      <div class="start-menu-item" id="sm-dialup">📞 Dial-up Internet</div>
      <div class="start-menu-item" id="sm-ransomware">💀 RANSOMWARE.exe</div>
      <div class="start-menu-separator"></div>
      <div class="start-menu-item" id="sm-outlook">📧 Outlook Express</div>
      <div class="start-menu-item" id="sm-ie-favorites">⭐ Favorites</div>
      <div class="start-menu-item" id="sm-notepad-new">📝 Notepad</div>
      <div class="start-menu-item" id="sm-radio">📻 Internet Radio</div>
      <div class="start-menu-item" id="sm-neko">🐱 Neko.exe</div>
      <div class="start-menu-item" id="sm-printqueue">🖨️ Printers</div>
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
  menu.querySelector('#sm-tetris')?.addEventListener('click', () => { menu.classList.remove('open'); openTetris(); });
  menu.querySelector('#sm-pinball')?.addEventListener('click', () => { menu.classList.remove('open'); openPinball(); });
  menu.querySelector('#sm-bonzi')?.addEventListener('click', () => { menu.classList.remove('open'); openBonziBuddy(); });
  menu.querySelector('#sm-taskmanager')?.addEventListener('click', () => { menu.classList.remove('open'); openTaskManager(); });
  menu.querySelector('#sm-dialup')?.addEventListener('click', () => { menu.classList.remove('open'); openDialup(); });
  menu.querySelector('#sm-ransomware')?.addEventListener('click', () => { menu.classList.remove('open'); openRansomware(); });
  menu.querySelector('#sm-outlook')?.addEventListener('click', () => { menu.classList.remove('open'); openOutlookExpress(); });
  menu.querySelector('#sm-ie-favorites')?.addEventListener('click', () => { menu.classList.remove('open'); openIEFavorites(); });
  menu.querySelector('#sm-notepad-new')?.addEventListener('click', () => { menu.classList.remove('open'); openNotepad(); });
  menu.querySelector('#sm-radio')?.addEventListener('click', () => { menu.classList.remove('open'); openRadio(); });
  menu.querySelector('#sm-neko')?.addEventListener('click', () => { menu.classList.remove('open'); spawnNeko(); });
  menu.querySelector('#sm-printqueue')?.addEventListener('click', () => { menu.classList.remove('open'); openPrintQueue(); });
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

/* ─── Right-click context menus ─── */
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
      // Auto-fill missing Properties actions
      const iconLabel = clickedIcon.querySelector('span')?.textContent ?? 'file';
      const mappedItems = baseItems.map(item => {
        if (item === '---') return item;
        if (item.label === 'Properties' && !item.action) {
          return { ...item, action: () => openGenericProperties(def) };
        }
        // Enhance existing "Send To" submenus to include floppy action
        if (item.label === 'Send To' && item.sub) {
          return {
            ...item, sub: item.sub.map(sub => {
              if (sub.label && (sub.label.includes('Floppy') || sub.label.includes('3½'))) {
                return { ...sub, label: 'My Floppy Disk (A:)', action: () => openFloppyError(iconLabel) };
              }
              return sub;
            })
          };
        }
        return item;
      });
      // If no "Send To" was in the menu, inject one
      const hasSendTo = mappedItems.some(i => i !== '---' && i.label === 'Send To');
      const sendToItem = {
        label: 'Send To',
        sub: [
          { label: 'My Floppy Disk (A:)', action: () => openFloppyError(iconLabel) },
          { label: 'Desktop (create shortcut)' },
        ],
      };
      // Inject working Rename + Delete into every desktop icon menu
      const items = [
        ...mappedItems,
        ...(hasSendTo ? [] : ['---', sendToItem]),
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
  initICQTray();
  startPrinterErrors();

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

  // Ctrl+Alt+Delete → Task Manager
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.altKey && e.key === 'Delete') {
      e.preventDefault();
      openTaskManager();
    }
  });

  // Expose new functions for inline handlers
  window.openTetris = openTetris;
  window.openPinball = openPinball;
  window.openBonziBuddy = openBonziBuddy;
  window.openTaskManager = openTaskManager;
  window.openDialup = openDialup;
  window.openRansomware = openRansomware;
  window.openOutlookExpress = openOutlookExpress;
  window.openICQBuddyList = openICQBuddyList;
  window.openIEFavorites = openIEFavorites;
  window.openFloppyError = openFloppyError;
  window.openPrinterError = openPrinterError;
  window.openPrintQueue = openPrintQueue;
  window.openNotepad = openNotepad;
  window.spawnNeko = spawnNeko;
  window.openRadio = openRadio;
}
