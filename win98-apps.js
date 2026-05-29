/**
 * win98-apps.js
 * Application windows for the Win98 desktop environment.
 */

import { openWindow, bringToFront, openGenericProperties, closeWindow } from './win98-core.js';
import { saySpeech } from './main.js';
import { ICONS } from './win98-icons.js';
import { playTypingClick, getAudioCtx, playDialup } from './win98-audio.js';

/* ─── Window content builders ─── */
let _myComputerOpenedBefore = false;
export function openMyComputer() {
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

export function openDocuments() {
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

export function openCDrive() {
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

export function openProjects() {
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

export function openAbout() {
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

export function openInternet() {
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

export function openRecycleBin() {
  openWindow('recycle-bin', 'Recycle Bin', ICONS.recycle,
    '<p style="color:#808080;font-style:italic;padding:8px">Recycle Bin is empty.</p>');
  saySpeech("It\u2019s empty\u2026 just like my inbox \uD83D\uDCED");
}

export function emptyRecycleBin() {
  // Fake "emptying" progress then speech
  saySpeech('Emptying\u2026 \uD83D\uDDD1\uFE0F  Done! (it was already empty)', 4000, true);
}

export function openSysProps() {
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

export function openIEProps() {
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
export function openExclamationE(startUrl) {
  const url = startUrl || 'https://neoblog-ten.vercel.app/';
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
  const history  = [url];
  let histIdx    = 0;
  let loadTimer  = null;
  let currentUrl = url;
  // Navigation counter: 0 = not started, increments on each navigate()
  // Load handler ignores events where _navId === 0 (pre-navigation about:blank)
  let _navId     = 0;

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
    if (errBack) errBack.onclick = () => { if (histIdx > 0) navigate(history[--histIdx], false); };
  }
  function hideLoading() {
    if (loading) loading.style.display = 'none';
    if (errDiv)  errDiv.style.display  = 'none';
    setStatus('Done');
  }

  function navigate(href, pushHistory = true) {
    let target = href.trim();
    if (!target) return;
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

    const myId = ++_navId;
    frame.src  = target;

    // Fallback: if load never fires within 10s (server down / extreme slowness)
    loadTimer = setTimeout(() => {
      if (_navId === myId) showError();
    }, 10000);
  }

  frame.addEventListener('load', () => {
    if (_navId === 0) return; // pre-navigation about:blank load, ignore
    clearTimeout(loadTimer);

    const snapId = _navId;

    try {
      const loc = frame.contentDocument?.location?.href ?? '';
      if (loc === 'about:blank') { showError(); return; } // X-Frame-Options blocked it
      if (loc !== '') { hideLoading(); if (addr) addr.value = loc; return; } // same-origin success

      // loc==='' : Chrome's cross-origin state at load time — contentDocument accessible
      // but href reads as ''. Fall through to the 400ms recheck below.
    } catch (_) {
      // SecurityError: contentDocument inaccessible (cross-origin). Fall through.
    }

    // Shared recheck for loc==='' and SecurityError: after 400ms the page has settled.
    setTimeout(() => {
      if (_navId !== snapId) return;
      try {
        const loc2 = frame.contentDocument?.location?.href ?? '';
        if (loc2 === 'about:blank') showError();
        else hideLoading(); // '' or real URL → cross-origin success
      } catch (_) {
        hideLoading(); // still cross-origin → success
      }
    }, 400);
  });

  // Toolbar controls
  document.getElementById('ieb-go')?.addEventListener('click', () => navigate(addr.value));
  addr?.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(addr.value); });
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
  document.getElementById('ieb-refresh')?.addEventListener('click', () => navigate(currentUrl, false));

  // Start first navigation immediately — _navId is still 0 so the iframe's own
  // initial about:blank load event (fires before this) is ignored.
  navigate(url, false);
}

export function openMineHighScores() {
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

export function openGuestbook() {
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
const WINAMP_PLAYLIST_DEFAULT = [
  { title: 'Yoko Takahashi — A Cruel Angel\'s Thesis',   dur: '1:35' },
  { title: 'Joe Hisaishi — One Summer\'s Day',           dur: '3:22' },
  { title: 'Nujabes — Feather',                          dur: '5:07' },
  { title: 'Yoko Kanno — Tank!',                         dur: '3:15' },
  { title: 'ClariS — Connect',                           dur: '4:10' },
  { title: 'Susumu Hirasawa — Forces',                   dur: '4:33' },
];
// Mutable runtime playlist (may include real files)
let WINAMP_PLAYLIST = WINAMP_PLAYLIST_DEFAULT.map(t => ({ ...t }));

let _winampTrack = 0;
let _winampPlaying = false;
let _winampTimer = null;
let _winampSec = 0;

// Real audio state
let _waAudio = null;       // HTMLAudioElement for real playback
let _waAudioCtx = null;    // AudioContext for visualizer
let _waAnalyser = null;
let _waSource = null;
let _waVisRaf = null;

export function openWinamp() {
  _winampPlaying = false;
  clearInterval(_winampTimer);

  // Stop real audio if playing
  if (_waAudio) { _waAudio.pause(); }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  function trackHTML() {
    const t = WINAMP_PLAYLIST[_winampTrack] || { title: '---', dur: '0:00' };
    return `<span id="wa-time" style="font-family:monospace;color:#00ff00">${fmtTime(_winampSec)}</span>
            <span id="wa-title" style="color:#00cc00;font-size:10px;margin-left:4px;overflow:hidden;white-space:nowrap;max-width:140px;display:inline-block;text-overflow:ellipsis">${t.title}</span>`;
  }

  function buildPlaylistHTML() {
    return WINAMP_PLAYLIST.map((t, i) => `
      <div class="wa-row" data-idx="${i}" style="padding:2px 8px;display:flex;justify-content:space-between;cursor:pointer;font-size:10px;${i === _winampTrack ? 'background:#004400;color:#0f0' : 'color:#009900'}">
        <span>${(i+1).toString().padStart(2,'0')}. ${t.title}</span>
        <span style="color:#007700">${t.dur || ''}</span>
      </div>`).join('');
  }

  openWindow('winamp', 'Winamp', ICONS.winamp, `
    <div style="background:#222;color:#0f0;font-family:monospace;font-size:11px;display:flex;flex-direction:column;height:100%;box-sizing:border-box">
      <div style="background:#111;padding:6px 8px;border-bottom:1px solid #00ff0044">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
          <span style="font-size:9px;color:#00aa00">▶ NOW PLAYING</span>
          <div style="display:flex;align-items:center;gap:4px">
            <label style="font-size:9px;color:#00aa00">VOL</label>
            <input id="wa-vol" type="range" min="0" max="1" step="0.05" value="0.8" style="width:60px;height:12px;cursor:pointer;accent-color:#00ff00">
          </div>
        </div>
        <div id="wa-info" style="display:flex;align-items:center;gap:4px">${trackHTML()}</div>
        <div style="margin-top:4px;background:#111;border:1px solid #00ff0033;height:6px;border-radius:2px;overflow:hidden">
          <div id="wa-progress" style="height:100%;width:0%;background:#00ff00;transition:width 0.3s linear"></div>
        </div>
        <!-- Visualizer canvas -->
        <canvas id="wa-vis" width="260" height="30" style="display:block;margin-top:4px;background:#000;width:100%;height:30px"></canvas>
      </div>
      <div style="display:flex;justify-content:center;gap:4px;padding:4px;border-bottom:1px solid #00ff0022;align-items:center">
        <button id="wa-prev"  style="background:#333;color:#0f0;border:1px solid #555;padding:2px 7px;cursor:pointer;font-size:11px;font-family:monospace">⏮</button>
        <button id="wa-play"  style="background:#333;color:#0f0;border:1px solid #555;padding:2px 7px;cursor:pointer;font-size:11px;font-family:monospace">▶</button>
        <button id="wa-pause" style="background:#333;color:#0f0;border:1px solid #555;padding:2px 7px;cursor:pointer;font-size:11px;font-family:monospace">⏸</button>
        <button id="wa-stop"  style="background:#333;color:#0f0;border:1px solid #555;padding:2px 7px;cursor:pointer;font-size:11px;font-family:monospace">⏹</button>
        <button id="wa-next"  style="background:#333;color:#0f0;border:1px solid #555;padding:2px 7px;cursor:pointer;font-size:11px;font-family:monospace">⏭</button>
        <button id="wa-eject" style="background:#333;color:#0f0;border:1px solid #555;padding:2px 7px;cursor:pointer;font-size:11px;font-family:monospace" title="Open files">📂</button>
        <input id="wa-fileinput" type="file" accept="audio/*" multiple style="display:none">
      </div>
      <div id="wa-playlist" style="flex:1;overflow-y:auto;padding:4px 0">
        ${buildPlaylistHTML()}
      </div>
    </div>
  `, { width: 300, height: 320 });

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

  function refreshPlaylist() {
    const pl = document.getElementById('wa-playlist');
    if (pl) pl.innerHTML = buildPlaylistHTML();
    // Re-attach dblclick
    document.querySelectorAll('.wa-row').forEach(r => {
      r.addEventListener('dblclick', () => {
        _winampTrack = parseInt(r.dataset.idx); _winampSec = 0;
        playTrack();
      });
    });
  }

  // ── Real audio helpers ──
  function stopRealAudio() {
    if (_waAudio) { _waAudio.pause(); _waAudio.src = ''; _waAudio = null; }
    if (_waVisRaf) { cancelAnimationFrame(_waVisRaf); _waVisRaf = null; }
  }

  function setupVisualizer(audio) {
    try {
      if (!_waAudioCtx) _waAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (_waSource) { try { _waSource.disconnect(); } catch(e){} }
      _waSource = _waAudioCtx.createMediaElementSource(audio);
      _waAnalyser = _waAudioCtx.createAnalyser();
      _waAnalyser.fftSize = 64;
      _waSource.connect(_waAnalyser);
      _waAnalyser.connect(_waAudioCtx.destination);
    } catch(e) { /* visualizer not available */ }
  }

  function drawVisualizer() {
    const visCanvas = document.getElementById('wa-vis');
    if (!visCanvas || !document.getElementById('win-winamp')) { _waVisRaf = null; return; }
    _waVisRaf = requestAnimationFrame(drawVisualizer);
    const vc = visCanvas.getContext('2d');
    vc.fillStyle = '#000';
    vc.fillRect(0, 0, visCanvas.width, visCanvas.height);

    if (_waAnalyser) {
      const bufLen = _waAnalyser.frequencyBinCount;
      const data = new Uint8Array(bufLen);
      _waAnalyser.getByteFrequencyData(data);
      const barW = visCanvas.width / bufLen;
      for (let i = 0; i < bufLen; i++) {
        const h = (data[i] / 255) * visCanvas.height;
        const hue = (i / bufLen) * 120; // green to yellow
        vc.fillStyle = `hsl(${hue}, 100%, 50%)`;
        vc.fillRect(i * barW, visCanvas.height - h, barW - 1, h);
      }
    } else {
      // Fake visualizer bars when no real audio
      const bars = 16;
      const barW = visCanvas.width / bars;
      for (let i = 0; i < bars; i++) {
        const h = Math.random() * visCanvas.height * (_winampPlaying ? 0.7 : 0.1);
        vc.fillStyle = `hsl(${i * 8}, 100%, 50%)`;
        vc.fillRect(i * barW, visCanvas.height - h, barW - 1, h);
      }
    }
  }

  function playRealAudio(track) {
    stopRealAudio();
    if (!track.blob) return false;
    const audio = new Audio();
    audio.src = URL.createObjectURL(track.blob);
    audio.volume = parseFloat(document.getElementById('wa-vol')?.value || '0.8');
    _waAudio = audio;
    setupVisualizer(audio);
    audio.play().catch(() => {});
    _winampPlaying = true;

    audio.addEventListener('timeupdate', () => {
      if (!document.getElementById('win-winamp')) return;
      _winampSec = audio.currentTime;
      const timeEl = document.getElementById('wa-time');
      if (timeEl) timeEl.textContent = fmtTime(_winampSec);
      const prog = document.getElementById('wa-progress');
      if (prog && audio.duration) prog.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    });
    audio.addEventListener('ended', () => {
      _winampTrack = (_winampTrack + 1) % WINAMP_PLAYLIST.length;
      _winampSec = 0;
      playTrack();
    });
    return true;
  }

  function startFakePlaying() {
    clearInterval(_winampTimer);
    _winampPlaying = true;
    const track = WINAMP_PLAYLIST[_winampTrack];
    const totalSec = (track.dur || '3:00').split(':').reduce((a, v) => a*60 + parseInt(v), 0);
    _winampTimer = setInterval(() => {
      if (!document.getElementById('win-winamp')) { clearInterval(_winampTimer); return; }
      _winampSec++;
      if (_winampSec >= totalSec) {
        _winampSec = 0;
        _winampTrack = (_winampTrack + 1) % WINAMP_PLAYLIST.length;
        refreshDisplay();
      }
      const prog = document.getElementById('wa-progress');
      if (prog) prog.style.width = `${(_winampSec / totalSec) * 100}%`;
      const timeEl = document.getElementById('wa-time');
      if (timeEl) timeEl.textContent = fmtTime(_winampSec);
    }, 1000);
  }

  function playTrack() {
    clearInterval(_winampTimer);
    const track = WINAMP_PLAYLIST[_winampTrack];
    if (!track) return;
    const usedReal = playRealAudio(track);
    if (!usedReal) startFakePlaying();
    refreshDisplay();
  }

  // ── Button handlers ──
  document.getElementById('wa-play')?.addEventListener('click', () => {
    if (_waAudio) {
      _waAudio.play().catch(()=>{});
      _winampPlaying = true;
    } else {
      _winampSec = 0; playTrack();
    }
    refreshDisplay();
    saySpeech('🎵 Winamp, it really whips the llama\'s ass!', 4000, true);
  });

  document.getElementById('wa-pause')?.addEventListener('click', () => {
    if (_waAudio) {
      if (_waAudio.paused) { _waAudio.play().catch(()=>{}); _winampPlaying = true; }
      else { _waAudio.pause(); _winampPlaying = false; }
    } else {
      _winampPlaying = !_winampPlaying;
      if (_winampPlaying) startFakePlaying(); else clearInterval(_winampTimer);
    }
  });

  document.getElementById('wa-stop')?.addEventListener('click', () => {
    stopRealAudio();
    clearInterval(_winampTimer);
    _winampPlaying = false; _winampSec = 0;
    const prog = document.getElementById('wa-progress');
    if (prog) prog.style.width = '0%';
    const timeEl = document.getElementById('wa-time');
    if (timeEl) timeEl.textContent = '00:00';
  });

  document.getElementById('wa-prev')?.addEventListener('click', () => {
    _winampTrack = (_winampTrack - 1 + WINAMP_PLAYLIST.length) % WINAMP_PLAYLIST.length;
    _winampSec = 0;
    if (_winampPlaying) playTrack(); else refreshDisplay();
  });

  document.getElementById('wa-next')?.addEventListener('click', () => {
    _winampTrack = (_winampTrack + 1) % WINAMP_PLAYLIST.length;
    _winampSec = 0;
    if (_winampPlaying) playTrack(); else refreshDisplay();
  });

  // Volume
  document.getElementById('wa-vol')?.addEventListener('input', e => {
    if (_waAudio) _waAudio.volume = parseFloat(e.target.value);
  });

  // Eject / open files
  document.getElementById('wa-eject')?.addEventListener('click', () => {
    document.getElementById('wa-fileinput')?.click();
  });

  document.getElementById('wa-fileinput')?.addEventListener('change', e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // Add real files to playlist
    const newTracks = files.map(f => {
      const name = f.name.replace(/\.[^/.]+$/, ''); // strip extension
      return { title: name, dur: '', blob: f };
    });
    WINAMP_PLAYLIST = [...WINAMP_PLAYLIST, ...newTracks];
    _winampTrack = WINAMP_PLAYLIST.length - newTracks.length; // jump to first new
    _winampSec = 0;
    refreshPlaylist();
    playTrack();
    saySpeech(`📂 Loaded ${files.length} track(s) into Winamp!`, 3000, true);
  });

  // Playlist row dblclick
  document.querySelectorAll('.wa-row').forEach(r => {
    r.addEventListener('dblclick', () => {
      _winampTrack = parseInt(r.dataset.idx); _winampSec = 0;
      playTrack();
    });
  });

  // Start visualizer loop
  _waVisRaf = requestAnimationFrame(drawVisualizer);

  // Cleanup on window close
  const waObs = new MutationObserver(() => {
    if (!document.getElementById('win-winamp')) {
      stopRealAudio();
      clearInterval(_winampTimer);
      if (_waVisRaf) { cancelAnimationFrame(_waVisRaf); _waVisRaf = null; }
      waObs.disconnect();
    }
  });
  waObs.observe(document.getElementById('win98-desktop'), { childList: true, subtree: true });
}

/* ─── Paint ─── */
export function openPaint() {
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
  { from: 'Rei_Ayanami_00', msg: 'yo, seen the new vocaloid drops?' },
  { from: 'me', msg: 'not yet, link?' },
  { from: 'Rei_Ayanami_00', msg: 'check ur miku folder lol' },
  { from: 'system', msg: '*** wasm_enjoyer has joined ***' },
  { from: 'wasm_enjoyer', msg: 'anyone working on their thesis?' },
  { from: 'me', msg: 'always 😭' },
];

export function openICQ() {
  saySpeech('You\'ve got a message! 🔔', 3000, true);
  const histHTML = ICQ_HISTORY.map(m => {
    if (m.from === 'system') return `<div style="text-align:center;color:#808080;font-size:10px;margin:2px 0">${m.msg}</div>`;
    const isMe = m.from === 'me';
    return `<div style="margin:3px 0;display:flex;flex-direction:column;align-items:${isMe?'flex-end':'flex-start'}">
      <span style="font-size:9px;color:#808080">${m.from}</span>
      <span style="font-size:11px;background:${isMe?'#ddf':'#fff'};border:1px solid #aaa;padding:2px 6px;max-width:80%;word-break:break-word">${m.msg}</span>
    </div>`;
  }).join('');

  openWindow('icq', 'ICQ — Rei_Ayanami_00', ICONS.icq, `
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
          <span style="font-size:9px;color:#808080">Rei_Ayanami_00</span>
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
export function openCalendar() {
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
export function openICQProps() {
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
export const RSS_FEED_URLS = [
  'https://corsproxy.io/?url=https://neoblog-ten.vercel.app/atom.xml',
  'https://neoblog-ten.vercel.app/atom.xml',
];
export let _rssEntries = [];

// Namespace-safe XML helper — getElementsByTagName ignores namespaces
export function xmlGet(el, tag) {
  return el.getElementsByTagName(tag)[0] ?? null;
}
// RSS 2.0: <link> is a text node, not an href attribute
export function rssLink(item) {
  return xmlGet(item, 'link')?.textContent?.trim()
      || xmlGet(item, 'guid')?.textContent?.trim()
      || '#';
}
// Friendly date from RSS <pubDate> e.g. "Thu, 12 Mar 2026 00:00:00 GMT"
export function rssDate(item) {
  const raw = xmlGet(item, 'pubDate')?.textContent          // RSS 2.0
           ?? xmlGet(item, 'published')?.textContent        // Atom
           ?? xmlGet(item, 'updated')?.textContent ?? '';
  const d = new Date(raw);
  return isNaN(d) ? raw.slice(0, 10) : d.toISOString().slice(0, 10);
}
// Best available content: content:encoded → description → summary
export function rssContent(item) {
  return xmlGet(item, 'encoded')?.textContent          // <content:encoded>
      ?? xmlGet(item, 'description')?.textContent      // RSS 2.0 <description>
      ?? xmlGet(item, 'summary')?.textContent          // Atom <summary>
      ?? xmlGet(item, 'content')?.textContent          // Atom <content>
      ?? '';
}

export async function loadRSS() {
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

export function showRSSEntry(entry, bodyEl) {
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

export function openBlogReader() {
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

export function openCreativeLab() {
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
export function openResearch() {
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

export function openProjectDetail(project) {
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

/* ─── Notepad (persistent) ─── */
export function openNotepadPersist() {
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
export function openDeleteSystem32() {
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


export function openShutdownDialog() {
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

export function showBSOD() {
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


export function openFormatDisk() {
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
export function openMinesweeper() {
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
export function openDefrag() {
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
export function openDownloadRAM() {
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
export function spawnClippy() {
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
export function openY2K() {
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
export function openCalculator() {
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
export function openSnake() {
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
export function openTerminal() {
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
export function startMatrixRain() {
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
export function startStarfield() {
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

export function openMAGI(question) {
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

/* ─── Tetris ─── */
export function openTetris() {
  openWindow('tetris', 'Tetris', ICONS.mine, `
    <div style="display:flex;flex-direction:column;align-items:center;background:#1a1a2e;height:100%;box-sizing:border-box;padding:6px;gap:4px">
      <div style="display:flex;gap:8px;align-items:flex-start">
        <canvas id="tetris-canvas" width="200" height="400" style="border:2px solid #444;background:#000;image-rendering:pixelated"></canvas>
        <div style="color:#0ff;font-family:monospace;font-size:10px;min-width:70px">
          <div style="margin-bottom:6px"><b style="color:#fff">SCORE</b><br><span id="tet-score">0</span></div>
          <div style="margin-bottom:6px"><b style="color:#fff">LEVEL</b><br><span id="tet-level">1</span></div>
          <div style="margin-bottom:6px"><b style="color:#fff">LINES</b><br><span id="tet-lines">0</span></div>
          <div style="margin-top:8px;font-size:9px;color:#888">
            ← → Move<br>↑ Rotate<br>↓ Soft drop<br>Space Hard drop<br>P Pause
          </div>
        </div>
      </div>
      <div id="tet-msg" style="color:#ff0;font-family:monospace;font-size:11px;height:16px"></div>
    </div>
  `, { width: 310, height: 460 });

  const canvas = document.getElementById('tetris-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLS = 10, ROWS = 20, CELL = 20;
  const COLORS = ['','#00f0f0','#0000f0','#f0a000','#f0f000','#00f000','#a000f0','#f00000'];
  const SHAPES = [
    [],
    [[1,1,1,1]],                          // I
    [[2,0,0],[2,2,2]],                    // J
    [[0,0,3],[3,3,3]],                    // L
    [[4,4],[4,4]],                        // O
    [[0,5,5],[5,5,0]],                    // S
    [[0,6,0],[6,6,6]],                    // T
    [[7,7,0],[0,7,7]],                    // Z
  ];

  let board, piece, pieceX, pieceY, score, lines, level, paused, dead, rafId, lastTick;

  function newBoard() {
    return Array.from({length:ROWS}, () => new Array(COLS).fill(0));
  }

  function randomPiece() {
    const id = 1 + Math.floor(Math.random() * 7);
    return { id, shape: SHAPES[id].map(r => [...r]) };
  }

  function rotate(shape) {
    const R = shape.length, C = shape[0].length;
    const out = Array.from({length:C}, () => new Array(R).fill(0));
    for (let r = 0; r < R; r++)
      for (let c = 0; c < C; c++)
        out[c][R-1-r] = shape[r][c];
    return out;
  }

  function collides(sh, px, py) {
    for (let r = 0; r < sh.length; r++)
      for (let c = 0; c < sh[r].length; c++) {
        if (!sh[r][c]) continue;
        const nx = px + c, ny = py + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && board[ny][nx]) return true;
      }
    return false;
  }

  function lock() {
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const ny = pieceY + r;
        if (ny < 0) { endGame(); return; }
        board[ny][pieceX + c] = piece.id;
      }
    clearLines();
    spawn();
  }

  function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(c => c !== 0)) {
        board.splice(r, 1);
        board.unshift(new Array(COLS).fill(0));
        cleared++;
        r++;
      }
    }
    if (cleared > 0) {
      const pts = [0, 100, 300, 500, 800][Math.min(cleared, 4)] * level;
      score += pts;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      document.getElementById('tet-score').textContent = score;
      document.getElementById('tet-level').textContent = level;
      document.getElementById('tet-lines').textContent = lines;
    }
  }

  function spawn() {
    piece = randomPiece();
    pieceX = Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2);
    pieceY = -1;
    if (collides(piece.shape, pieceX, pieceY)) { endGame(); }
  }

  function endGame() {
    dead = true;
    const msg = document.getElementById('tet-msg');
    if (msg) msg.textContent = `GAME OVER — Score: ${score}`;
  }

  function ghostY() {
    let gy = pieceY;
    while (!collides(piece.shape, pieceX, gy + 1)) gy++;
    return gy;
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c]) continue;
        ctx.fillStyle = COLORS[board[r][c]];
        ctx.fillRect(c*CELL+1, r*CELL+1, CELL-2, CELL-2);
      }

    if (!dead && piece) {
      // Ghost piece
      const gy = ghostY();
      ctx.globalAlpha = 0.2;
      for (let r = 0; r < piece.shape.length; r++)
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (!piece.shape[r][c]) continue;
          ctx.fillStyle = COLORS[piece.id];
          ctx.fillRect((pieceX+c)*CELL+1, (gy+r)*CELL+1, CELL-2, CELL-2);
        }
      ctx.globalAlpha = 1;

      // Active piece
      for (let r = 0; r < piece.shape.length; r++)
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (!piece.shape[r][c]) continue;
          ctx.fillStyle = COLORS[piece.id];
          ctx.fillRect((pieceX+c)*CELL+1, (pieceY+r)*CELL+1, CELL-2, CELL-2);
        }
    }

    if (dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f00';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 12);
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 8);
      ctx.fillText('Press Space to restart', canvas.width/2, canvas.height/2 + 26);
    }

    if (paused && !dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff0';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
    }
  }

  function reset() {
    board = newBoard(); score = 0; lines = 0; level = 1; dead = false; paused = false;
    const msg = document.getElementById('tet-msg');
    if (msg) msg.textContent = '';
    document.getElementById('tet-score').textContent = '0';
    document.getElementById('tet-level').textContent = '1';
    document.getElementById('tet-lines').textContent = '0';
    spawn();
  }

  function gameLoop(ts) {
    rafId = requestAnimationFrame(gameLoop);
    draw();
    if (dead || paused) return;
    const speed = Math.max(100, 800 - (level - 1) * 70);
    if (ts - lastTick >= speed) {
      lastTick = ts;
      if (!collides(piece.shape, pieceX, pieceY + 1)) {
        pieceY++;
      } else {
        lock();
      }
    }
  }

  const tetKeyHandler = e => {
    if (!document.getElementById('win-tetris')) { document.removeEventListener('keydown', tetKeyHandler); return; }
    if (dead) { if (e.key === ' ') { e.preventDefault(); reset(); } return; }
    if (e.key === 'p' || e.key === 'P') { paused = !paused; return; }
    if (paused) return;
    if (e.key === 'ArrowLeft') { if (!collides(piece.shape, pieceX-1, pieceY)) pieceX--; }
    else if (e.key === 'ArrowRight') { if (!collides(piece.shape, pieceX+1, pieceY)) pieceX++; }
    else if (e.key === 'ArrowDown') { if (!collides(piece.shape, pieceX, pieceY+1)) pieceY++; else lock(); }
    else if (e.key === 'ArrowUp') {
      const rot = rotate(piece.shape);
      if (!collides(rot, pieceX, pieceY)) piece.shape = rot;
    }
    else if (e.key === ' ') {
      pieceY = ghostY();
      lock();
      e.preventDefault();
    }
  };
  document.addEventListener('keydown', tetKeyHandler);

  const tetObs = new MutationObserver(() => {
    if (!document.getElementById('win-tetris')) {
      cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', tetKeyHandler);
      tetObs.disconnect();
    }
  });
  tetObs.observe(document.getElementById('win98-desktop'), { childList: true, subtree: true });

  reset();
  lastTick = 0;
  rafId = requestAnimationFrame(gameLoop);
}

/* ─── Pinball ─── */
export function openPinball() {
  openWindow('pinball', 'Pinball', ICONS.mine, `
    <div style="display:flex;flex-direction:column;align-items:center;background:#1a0030;height:100%;box-sizing:border-box;padding:4px;gap:2px">
      <div style="color:#ff0;font-family:monospace;font-size:10px;width:300px;display:flex;justify-content:space-between">
        <span>SCORE: <b id="pb-score">0</b></span>
        <span>LIVES: <b id="pb-lives">❤️❤️❤️</b></span>
        <span id="pb-msg" style="color:#0ff"></span>
      </div>
      <canvas id="pinball-canvas" width="300" height="460" style="border:2px solid #440066;background:#0a0018;image-rendering:pixelated"></canvas>
      <div style="color:#888;font-family:monospace;font-size:9px">Z=Left Flipper | /=Right Flipper | Space=Launch</div>
    </div>
  `, { width: 318, height: 540 });

  const canvas = document.getElementById('pinball-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 300, H = 460;

  // Ball
  let ball = { x: 270, y: 380, vx: 0, vy: 0, r: 8 };
  let ballInPlay = false;
  let plungerCharge = 0, plungerCharging = false;
  let score = 0, lives = 3, rafId;

  // Flippers
  const flipperLen = 55;
  const leftFlipper = { cx: 70, cy: 420, angle: 30, active: false };
  const rightFlipper = { cx: 230, cy: 420, angle: 150, active: false };

  // Bumpers
  const bumpers = [
    { x: 100, y: 140, r: 20, flash: 0 },
    { x: 200, y: 120, r: 20, flash: 0 },
    { x: 150, y: 200, r: 20, flash: 0 },
  ];

  function flipperEndpoint(f) {
    const a = f.angle * Math.PI / 180;
    return { x: f.cx + Math.cos(a) * flipperLen, y: f.cy + Math.sin(a) * flipperLen };
  }

  function draw() {
    ctx.fillStyle = '#0a0018';
    ctx.fillRect(0, 0, W, H);

    // Walls
    ctx.strokeStyle = '#660099';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, W-4, H-4);

    // Plunger lane
    ctx.strokeStyle = '#440066';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(250, 300); ctx.lineTo(250, H-40); ctx.stroke();

    // Bumpers
    bumpers.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fillStyle = b.flash > 0 ? '#ffff00' : '#cc00ff';
      ctx.fill();
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (b.flash > 0) b.flash--;
    });

    // Flippers
    [leftFlipper, rightFlipper].forEach(f => {
      const end = flipperEndpoint(f);
      ctx.beginPath();
      ctx.moveTo(f.cx, f.cy);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = f.active ? '#00ffff' : '#0088cc';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    const grad = ctx.createRadialGradient(ball.x-2, ball.y-2, 1, ball.x, ball.y, ball.r);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(1, '#aaa');
    ctx.fillStyle = grad;
    ctx.fill();

    // Plunger charge bar
    if (plungerCharging) {
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(254, H-40 - plungerCharge * 1.2, 8, plungerCharge * 1.2);
    }

    if (!ballInPlay && !plungerCharging) {
      ctx.fillStyle = '#ff0';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Hold SPACE to charge', W/2, H/2);
      ctx.fillText('Release to launch', W/2, H/2 + 14);
      ctx.textAlign = 'left';
    }
  }

  function reflectOffFlipper(f) {
    const end = flipperEndpoint(f);
    const a = f.angle * Math.PI / 180;
    const nx = -Math.sin(a), ny = Math.cos(a);
    const dot = ball.vx * nx + ball.vy * ny;
    if (dot < 0) {
      ball.vx -= 2 * dot * nx;
      ball.vy -= 2 * dot * ny;
      ball.vy *= 0.85;
      if (f.active) { ball.vx *= 1.2; ball.vy = -Math.abs(ball.vy) * 1.3; }
    }
  }

  function ptSegDist2(px, py, ax, ay, bx, by) {
    const dx = bx-ax, dy = by-ay;
    const len2 = dx*dx + dy*dy;
    if (len2 === 0) return (px-ax)**2 + (py-ay)**2;
    const t = Math.max(0, Math.min(1, ((px-ax)*dx + (py-ay)*dy) / len2));
    return (px - (ax+t*dx))**2 + (py - (ay+t*dy))**2;
  }

  function updateScore(v) {
    score += v;
    const el = document.getElementById('pb-score');
    if (el) el.textContent = score;
  }

  function loseLife() {
    lives--;
    const el = document.getElementById('pb-lives');
    if (el) el.textContent = '❤️'.repeat(Math.max(0, lives));
    const msg = document.getElementById('pb-msg');
    if (lives <= 0) {
      if (msg) msg.textContent = `GAME OVER! Score:${score}`;
      ballInPlay = false;
      ball = { x: 270, y: 380, vx: 0, vy: 0, r: 8 };
      lives = 3; score = 0;
      if (document.getElementById('pb-score')) document.getElementById('pb-score').textContent = '0';
      if (el) el.textContent = '❤️❤️❤️';
    } else {
      if (msg) msg.textContent = 'OOPS!';
      setTimeout(() => { if (msg) msg.textContent = ''; }, 1500);
      ballInPlay = false;
      ball = { x: 270, y: 380, vx: 0, vy: 0, r: 8 };
    }
  }

  function update() {
    if (!ballInPlay) return;
    const GRAVITY = 0.25;
    ball.vy += GRAVITY;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounce
    if (ball.x - ball.r < 4) { ball.x = 4 + ball.r; ball.vx = Math.abs(ball.vx) * 0.85; }
    if (ball.x + ball.r > W-4) { ball.x = W-4-ball.r; ball.vx = -Math.abs(ball.vx) * 0.85; }
    if (ball.y - ball.r < 4) { ball.y = 4 + ball.r; ball.vy = Math.abs(ball.vy) * 0.85; }

    // Bumpers
    bumpers.forEach(b => {
      const dx = ball.x - b.x, dy = ball.y - b.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < b.r + ball.r) {
        const nx2 = dx/d, ny2 = dy/d;
        ball.x = b.x + nx2 * (b.r + ball.r + 1);
        ball.y = b.y + ny2 * (b.r + ball.r + 1);
        const spd = Math.sqrt(ball.vx**2 + ball.vy**2);
        ball.vx = nx2 * Math.max(spd, 4) * 1.1;
        ball.vy = ny2 * Math.max(spd, 4) * 1.1;
        b.flash = 8;
        updateScore(100);
      }
    });

    // Flippers
    [leftFlipper, rightFlipper].forEach(f => {
      const end = flipperEndpoint(f);
      const d2 = ptSegDist2(ball.x, ball.y, f.cx, f.cy, end.x, end.y);
      if (d2 < (ball.r + 5)**2) reflectOffFlipper(f);
    });

    // Lost ball
    if (ball.y > H + 20) loseLife();
  }

  function gameLoop() {
    if (!document.getElementById('win-pinball')) { cancelAnimationFrame(rafId); return; }
    rafId = requestAnimationFrame(gameLoop);
    update();
    draw();
  }

  const pbKeys = { z: false, '/': false, ' ': false };
  const pbKeyDown = e => {
    if (!document.getElementById('win-pinball')) { document.removeEventListener('keydown', pbKeyDown); document.removeEventListener('keyup', pbKeyUp); return; }
    if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowLeft') {
      leftFlipper.active = true; leftFlipper.angle = -20;
    }
    if (e.key === '/' || e.key === 'ArrowRight') {
      rightFlipper.active = true; rightFlipper.angle = 200;
    }
    if (e.key === ' ' && !ballInPlay) {
      plungerCharging = true;
      e.preventDefault();
    }
  };
  const pbKeyUp = e => {
    if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowLeft') {
      leftFlipper.active = false; leftFlipper.angle = 30;
    }
    if (e.key === '/' || e.key === 'ArrowRight') {
      rightFlipper.active = false; rightFlipper.angle = 150;
    }
    if (e.key === ' ' && plungerCharging) {
      const power = plungerCharge;
      plungerCharge = 0; plungerCharging = false;
      ball.x = 270; ball.y = 380;
      ball.vx = -1;
      ball.vy = -(power / 20) - 3;
      ballInPlay = true;
    }
  };

  let chargeInterval = setInterval(() => {
    if (!document.getElementById('win-pinball')) { clearInterval(chargeInterval); return; }
    if (plungerCharging) plungerCharge = Math.min(100, plungerCharge + 3);
  }, 30);

  document.addEventListener('keydown', pbKeyDown);
  document.addEventListener('keyup', pbKeyUp);

  const pbObs = new MutationObserver(() => {
    if (!document.getElementById('win-pinball')) {
      cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', pbKeyDown);
      document.removeEventListener('keyup', pbKeyUp);
      clearInterval(chargeInterval);
      pbObs.disconnect();
    }
  });
  pbObs.observe(document.getElementById('win98-desktop'), { childList: true, subtree: true });

  rafId = requestAnimationFrame(gameLoop);
}

/* ─── Bonzi Buddy ─── */
export function openBonziBuddy() {
  if (document.getElementById('bonzi-buddy')) return;
  const desktop = document.getElementById('win98-desktop');

  const MESSAGES = [
    "Hey! Wanna download some free screensavers?",
    "Your computer has 47 viruses! Click here to fix!",
    "You've been online for 3 hours. Your mom called.",
    "FREE RINGTONES!! Click here!!",
    "Bonzi Buddy loves you ❤️",
    "Want to set my homepage as your default? (Recommended)",
    "You have won a FREE iPod!!!",
    "Installing helpful toolbar... please wait",
    "Your horoscope says: click more ads today.",
    "WARNING: Your Internet Explorer needs updating!",
  ];
  let msgIdx = 0;

  const el = document.createElement('div');
  el.id = 'bonzi-buddy';
  el.style.cssText = `
    position:absolute; bottom:40px; right:20px; z-index:6000;
    width:120px; cursor:pointer; user-select:none;
    animation: bonzi-bounce 1.8s ease-in-out infinite;
  `;

  el.innerHTML = `
    <style>
      @keyframes bonzi-bounce {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
    </style>
    <div id="bonzi-bubble" style="
      background:#fffde7; border:2px solid #888; border-radius:8px;
      padding:7px 9px; font-size:10px; font-family:inherit;
      box-shadow:2px 2px 4px rgba(0,0,0,0.3); margin-bottom:6px;
      position:relative; max-width:160px; line-height:1.4;
    ">
      <div id="bonzi-text">Hey! Wanna download some free screensavers?</div>
      <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #888"></div>
      <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:7px solid #fffde7"></div>
    </div>
    <svg viewBox="0 0 80 90" width="80" height="90" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <ellipse cx="40" cy="62" rx="28" ry="26" fill="#7b2d8b"/>
      <!-- Belly -->
      <ellipse cx="40" cy="66" rx="16" ry="16" fill="#c47ed4"/>
      <!-- Head -->
      <circle cx="40" cy="32" r="24" fill="#7b2d8b"/>
      <!-- Face / muzzle -->
      <ellipse cx="40" cy="38" rx="14" ry="10" fill="#c47ed4"/>
      <!-- Eyes -->
      <circle cx="32" cy="26" r="5" fill="white"/>
      <circle cx="48" cy="26" r="5" fill="white"/>
      <circle cx="33" cy="27" r="2.5" fill="#111"/>
      <circle cx="49" cy="27" r="2.5" fill="#111"/>
      <!-- Eye shine -->
      <circle cx="34" cy="25.5" r="1" fill="white"/>
      <circle cx="50" cy="25.5" r="1" fill="white"/>
      <!-- Smile -->
      <path d="M30 40 Q40 50 50 40" stroke="#5a1a6a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Teeth -->
      <rect x="34" y="39" width="5" height="5" rx="1" fill="white"/>
      <rect x="41" y="39" width="5" height="5" rx="1" fill="white"/>
      <!-- Ears -->
      <circle cx="18" cy="20" r="8" fill="#7b2d8b"/>
      <circle cx="18" cy="20" r="4" fill="#c47ed4"/>
      <circle cx="62" cy="20" r="8" fill="#7b2d8b"/>
      <circle cx="62" cy="20" r="4" fill="#c47ed4"/>
      <!-- Arms -->
      <ellipse cx="14" cy="62" rx="7" ry="14" fill="#7b2d8b" transform="rotate(-20 14 62)"/>
      <ellipse cx="66" cy="62" rx="7" ry="14" fill="#7b2d8b" transform="rotate(20 66 62)"/>
    </svg>
    <button id="bonzi-close" style="
      position:absolute; top:0; right:0;
      background:#c0c0c0; border:1px outset #fff;
      font-size:9px; cursor:pointer; padding:1px 4px;
      font-family:inherit; line-height:1;
    ">✕</button>
  `;

  desktop.appendChild(el);

  el.addEventListener('click', e => {
    if (e.target.id === 'bonzi-close') {
      el.remove();
      return;
    }
    msgIdx = (msgIdx + 1) % MESSAGES.length;
    const txt = document.getElementById('bonzi-text');
    if (txt) txt.textContent = MESSAGES[msgIdx];
    saySpeech(MESSAGES[msgIdx].replace(/!+/g, '!').slice(0, 60), 3500, true);
  });

  document.getElementById('bonzi-close')?.addEventListener('click', () => el.remove());
  saySpeech('Bonzi Buddy has entered the chat 🦍', 3000, true);
}

/* ─── Task Manager ─── */
export function openTaskManager() {
  openWindow('taskmanager', 'Windows Task Manager', ICONS.myComputer, `
    <div style="display:flex;flex-direction:column;height:100%;font-size:11px;font-family:inherit;background:#c0c0c0;box-sizing:border-box">
      <!-- Tabs -->
      <div style="display:flex;border-bottom:2px solid #808080;padding-top:4px;padding-left:4px;gap:2px">
        <button id="tm-tab-proc" style="padding:2px 10px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;border-bottom:none;cursor:pointer;font-weight:bold">Processes</button>
        <button id="tm-tab-perf" style="padding:2px 10px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;border-bottom:none;cursor:pointer">Performance</button>
      </div>
      <!-- Processes panel -->
      <div id="tm-proc-panel" style="flex:1;display:flex;flex-direction:column;overflow:hidden">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:2px 6px;background:#000080;color:#fff;font-weight:bold;font-size:10px">
          <span>Image Name</span><span>CPU</span><span>Mem Usage</span>
        </div>
        <div id="tm-proc-list" style="flex:1;overflow-y:auto;background:#fff;border:1px inset #808080"></div>
        <div style="padding:4px 6px;display:flex;gap:6px;align-items:center">
          <button id="tm-endtask" style="padding:2px 12px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">End Task</button>
          <span id="tm-proc-count" style="font-size:10px;color:#444">Processes: 0</span>
        </div>
      </div>
      <!-- Performance panel -->
      <div id="tm-perf-panel" style="flex:1;display:none;flex-direction:column;padding:8px;gap:6px;overflow:auto">
        <div>
          <b>CPU Usage</b>
          <div style="background:#fff;border:1px inset #808080;height:20px;position:relative;margin-top:2px">
            <div id="tm-cpu-bar" style="height:100%;background:#008000;width:40%;transition:width 0.8s"></div>
            <span id="tm-cpu-pct" style="position:absolute;right:4px;top:2px;font-size:10px;color:#000">40%</span>
          </div>
        </div>
        <div>
          <b>CPU History</b>
          <canvas id="tm-cpu-graph" width="440" height="60" style="background:#000;border:1px inset #808080;display:block;margin-top:2px"></canvas>
        </div>
        <div style="font-size:10px;font-family:monospace;background:#fff;border:1px inset #808080;padding:6px">
          <b>Physical Memory (K)</b><br>
          Total: 65,536<br>
          Available: <span id="tm-mem-avail">32,445</span><br>
          File Cache: 8,192<br>
          <br>
          <b>Commit Charge (K)</b><br>
          Total: <span id="tm-commit">33,091</span><br>
          Limit: 131,072<br>
          Peak: 42,880
        </div>
      </div>
    </div>
  `, { width: 500, height: 400 });

  // Process data
  const baseProcs = [
    { name: 'System Idle Process', cpuBase: [60,85], mem: '16 K' },
    { name: 'EXPLORER.EXE',        cpuBase: [2,5],   mem: '8,432 K' },
    { name: 'MSGSRV32.EXE',        cpuBase: [0,0],   mem: '1,234 K' },
    { name: 'MPREXE.EXE',          cpuBase: [0,0],   mem: '892 K' },
    { name: 'mmtask.tsk',           cpuBase: [0,0],   mem: '456 K' },
    { name: 'IEXPLORE.EXE',         cpuBase: [5,12],  mem: '24,000 K' },
    { name: 'BONZI.EXE',            cpuBase: [15,25], mem: '18,234 K' },
    { name: 'MINESWEEPER.EXE',      cpuBase: [1,3],   mem: '3,128 K', cond: () => !!document.getElementById('win-minesweeper') },
    { name: 'WINAMP.EXE',           cpuBase: [3,8],   mem: '12,847 K', cond: () => !!document.getElementById('win-winamp') },
    { name: 'TETRIS.EXE',           cpuBase: [2,6],   mem: '5,120 K', cond: () => !!document.getElementById('win-tetris') },
  ];

  let spikeProc = null, spikeTimer = 0;
  const cpuHistory = [];

  function getCPU() {
    // Simulate idle process being ~70%
    return 30 + Math.floor(Math.random() * 25);
  }

  function buildProcList() {
    const list = document.getElementById('tm-proc-list');
    if (!list) return;
    const procs = baseProcs.filter(p => !p.cond || p.cond());

    // Occasional spike
    spikeTimer--;
    if (spikeTimer <= 0) {
      spikeTimer = 10 + Math.floor(Math.random() * 10);
      spikeProc = procs[Math.floor(Math.random() * procs.length)].name;
      setTimeout(() => { spikeProc = null; }, 2000);
    }

    list.innerHTML = procs.map(p => {
      let cpu;
      if (p.name === spikeProc) {
        cpu = '99%';
      } else {
        const lo = p.cpuBase[0], hi = p.cpuBase[1];
        cpu = lo === hi ? `${lo}%` : `${lo + Math.floor(Math.random() * (hi - lo + 1))}%`;
      }
      const isSpike = p.name === spikeProc;
      return `<div style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:1px 6px;font-size:10px;font-family:monospace;${isSpike?'background:#fff0f0;color:#cc0000':''}border-bottom:1px solid #e0e0e0">
        <span>${p.name}</span><span>${cpu}</span><span>${p.mem}</span>
      </div>`;
    }).join('');

    const cnt = document.getElementById('tm-proc-count');
    if (cnt) cnt.textContent = `Processes: ${procs.length}`;
  }

  function buildPerfPanel() {
    const cpuPct = getCPU();
    cpuHistory.push(cpuPct);
    if (cpuHistory.length > 60) cpuHistory.shift();

    const bar = document.getElementById('tm-cpu-bar');
    const pct = document.getElementById('tm-cpu-pct');
    if (bar) bar.style.width = `${cpuPct}%`;
    if (pct) pct.textContent = `${cpuPct}%`;

    const avail = 32000 + Math.floor(Math.random() * 1000);
    const commit = 65536 - avail;
    const memEl = document.getElementById('tm-mem-avail');
    const commitEl = document.getElementById('tm-commit');
    if (memEl) memEl.textContent = avail.toLocaleString();
    if (commitEl) commitEl.textContent = commit.toLocaleString();

    // Draw graph
    const g = document.getElementById('tm-cpu-graph');
    if (g) {
      const gc = g.getContext('2d');
      gc.fillStyle = '#000';
      gc.fillRect(0, 0, g.width, g.height);
      gc.strokeStyle = '#00ff00';
      gc.lineWidth = 1;
      gc.beginPath();
      cpuHistory.forEach((v, i) => {
        const x = (i / 59) * g.width;
        const y = g.height - (v / 100) * g.height;
        if (i === 0) gc.moveTo(x, y); else gc.lineTo(x, y);
      });
      gc.stroke();
    }
  }

  let activeTab = 'proc';
  let tmInterval = setInterval(() => {
    if (!document.getElementById('win-taskmanager')) { clearInterval(tmInterval); return; }
    buildProcList();
    buildPerfPanel();
  }, 1000);
  buildProcList();

  document.getElementById('tm-tab-proc')?.addEventListener('click', () => {
    activeTab = 'proc';
    document.getElementById('tm-proc-panel').style.display = 'flex';
    document.getElementById('tm-perf-panel').style.display = 'none';
    document.getElementById('tm-tab-proc').style.fontWeight = 'bold';
    document.getElementById('tm-tab-perf').style.fontWeight = 'normal';
  });
  document.getElementById('tm-tab-perf')?.addEventListener('click', () => {
    activeTab = 'perf';
    document.getElementById('tm-proc-panel').style.display = 'none';
    document.getElementById('tm-perf-panel').style.display = 'flex';
    document.getElementById('tm-tab-proc').style.fontWeight = 'normal';
    document.getElementById('tm-tab-perf').style.fontWeight = 'bold';
  });

  document.getElementById('tm-endtask')?.addEventListener('click', () => {
    openWindow('endtask-dlg', 'End Task', ICONS.myComputer, `
      <div style="padding:12px;font-size:12px">
        <p>⚠️ This program is not responding.</p>
        <p style="margin-top:8px">To return to Windows and check the program status,<br>click Cancel.</p>
        <p style="margin-top:4px">If you choose to end the task immediately, you will lose<br>any unsaved data. To end the task anyway, click End Task.</p>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
          <button id="etd-end" style="padding:3px 12px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">End Task</button>
          <button id="etd-cancel" style="padding:3px 12px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">Cancel</button>
        </div>
      </div>
    `, { width: 340, height: 180 });
    document.getElementById('etd-end')?.addEventListener('click', () => {
      saySpeech('Task terminated. Or did it? 👻', 3000, true);
      closeWindow('endtask-dlg');
    });
    document.getElementById('etd-cancel')?.addEventListener('click', () => closeWindow('endtask-dlg'));
  });

  saySpeech('Ctrl+Alt+Delete: the universal solve-everything combo 🖥️', 4000, true);
}

/* ─── Dial-up Internet ─── */
export function openDialup() {
  openWindow('dialup', 'Connecting to Internet...', ICONS.internet, `
    <div style="padding:12px;font-size:12px;font-family:inherit;width:340px;box-sizing:border-box">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div id="dialup-icon" style="font-size:28px;animation:dialup-spin 0.5s linear infinite">📞</div>
        <div>
          <div style="font-weight:bold">Connecting to: Internet</div>
          <div style="font-size:10px;color:#444">Phone number: 1-800-555-0196</div>
        </div>
      </div>
      <div style="background:#fff;border:1px inset #808080;padding:6px;min-height:80px;font-family:monospace;font-size:11px;overflow-y:auto" id="dialup-log"></div>
      <div style="margin-top:8px;background:#c0c0c0;border:1px inset #808080;height:14px">
        <div id="dialup-bar" style="height:100%;width:0%;background:#000080;transition:width 0.5s"></div>
      </div>
      <div style="margin-top:10px;display:flex;justify-content:flex-end">
        <button id="dialup-cancel" style="padding:3px 14px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">Cancel</button>
      </div>
    </div>
    <style>
      @keyframes dialup-spin {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(10deg); }
        75% { transform: rotate(-10deg); }
        100% { transform: rotate(0deg); }
      }
    </style>
  `, { width: 380, height: 240 });

  document.getElementById('dialup-cancel')?.addEventListener('click', () => closeWindow('dialup'));

  const log = document.getElementById('dialup-log');
  const bar = document.getElementById('dialup-bar');

  function addLog(msg, delay) {
    return new Promise(resolve => setTimeout(() => {
      if (!log) { resolve(); return; }
      const line = document.createElement('div');
      line.textContent = msg;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      resolve();
    }, delay));
  }

  function setBar(pct) {
    if (bar) bar.style.width = `${pct}%`;
  }

  // Web Audio modem sounds
  function playModemSounds() {
    try {
      const ctx = getAudioCtx();
      let t = ctx.currentTime;

      // Dial tone (440 Hz for 0.5s)
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.frequency.value = 440;
      g1.gain.setValueAtTime(0.15, t);
      g1.gain.setValueAtTime(0, t + 0.5);
      osc1.connect(g1); g1.connect(ctx.destination);
      osc1.start(t); osc1.stop(t + 0.5);

      // DTMF-ish dialing beeps
      const dtmfFreqs = [941, 1336, 697, 1477, 770, 1209, 852, 1336, 697, 1209];
      dtmfFreqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = f;
        const start = t + 0.6 + i * 0.15;
        g.gain.setValueAtTime(0.12, start);
        g.gain.setValueAtTime(0, start + 0.1);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(start); osc.stop(start + 0.1);
      });

      // Ring tones
      const ringStart = t + 2.3;
      for (let r = 0; r < 2; r++) {
        const rs = ringStart + r * 1.2;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = 480;
        g.gain.setValueAtTime(0.18, rs);
        g.gain.setValueAtTime(0, rs + 0.8);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(rs); osc.stop(rs + 0.8);
      }

      // Negotiation noise — chaotic frequency sweeps
      const noiseStart = t + 4.8;
      for (let i = 0; i < 15; i++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const ns = noiseStart + i * 0.2;
        osc.frequency.setValueAtTime(300 + Math.random() * 2800, ns);
        osc.frequency.exponentialRampToValueAtTime(200 + Math.random() * 3200, ns + 0.18);
        g.gain.setValueAtTime(0.08, ns);
        g.gain.setValueAtTime(0, ns + 0.18);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(ns); osc.stop(ns + 0.2);
      }

      // Connected tone
      const connStart = t + 7.8;
      const connOsc = ctx.createOscillator();
      const connG = ctx.createGain();
      connOsc.frequency.value = 2100;
      connG.gain.setValueAtTime(0.2, connStart);
      connG.gain.setValueAtTime(0, connStart + 0.3);
      connOsc.connect(connG); connG.connect(ctx.destination);
      connOsc.start(connStart); connOsc.stop(connStart + 0.4);
    } catch(e) { /* audio not available */ }
  }

  async function runDialup() {
    playModemSounds();
    setBar(5);
    await addLog('Dialing 1-800-555-0196...', 200);
    await addLog('  1... 8... 0... 0... 5... 5... 5...', 800);
    setBar(20);
    await addLog('Waiting for answer...', 1500);
    await addLog('  *ring* *ring*', 500);
    setBar(40);
    await addLog('  *ring* *ring*', 1200);
    setBar(55);
    await addLog('Negotiating connection speed...', 500);
    await addLog('  CARRRRRRIIIEEERRR DEEEETECT', 800);
    await addLog('  skreeeeeeeee BONG BONG eeeeeee', 600);
    await addLog('  kshhhhhhhhhhhhhhhhhhhhhhhh', 400);
    setBar(75);
    await addLog('Verifying username and password...', 1200);
    setBar(90);
    await addLog('  Checking credentials...', 800);
    await addLog('  ✓ Access granted!', 400);
    setBar(100);
    await addLog('✅ Connected to Internet! 56 Kbps', 300);

    // Show "you've got mail" notification
    setTimeout(() => {
      if (!document.getElementById('win-dialup')) return;
      closeWindow('dialup');
      // Show mail notification
      const note = document.createElement('div');
      note.style.cssText = `
        position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
        background:#ffffcc; border:2px solid #888; padding:16px 24px;
        font-family:inherit; font-size:13px; z-index:9999;
        box-shadow:4px 4px 8px rgba(0,0,0,0.4); text-align:center;
      `;
      note.innerHTML = `<div style="font-size:24px;margin-bottom:8px">📧</div>
        <b>You've Got Mail!</b><br><span style="font-size:11px">3 unread messages</span><br>
        <button style="margin-top:10px;padding:3px 14px;font-family:inherit;font-size:11px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer" onclick="this.parentElement.remove()">OK</button>`;
      (document.getElementById('win98-desktop') || document.body).appendChild(note);
      saySpeech('Connected at 56 Kbps! You\'ve got mail! 📧', 4000, true);
    }, 500);
  }

  runDialup();
}

/* ─── Ransomware ─── */
export function openRansomware() {
  openWindow('ransomware', '⚠️ CRITICAL SYSTEM ERROR ⚠️', ICONS.mine, `
    <div id="ransom-root" style="
      background:#000; color:#ff0000; font-family:'Courier New',monospace;
      height:100%; display:flex; flex-direction:column; align-items:center;
      justify-content:center; padding:16px; box-sizing:border-box; text-align:center;
      user-select:none;
    ">
      <div style="font-size:36px;margin-bottom:8px">💀</div>
      <div style="font-size:13px;font-weight:bold;letter-spacing:1px;text-shadow:0 0 8px #f00;margin-bottom:8px">
        ⚠️ YOUR FILES HAVE BEEN ENCRYPTED ⚠️
      </div>
      <div style="font-size:10px;color:#ff6666;max-width:380px;line-height:1.5;margin-bottom:10px">
        All your documents, photos, and cat pictures have been encrypted with AES-256.<br>
        Send <b style="color:#ff0">0.003 BTC</b> to unlock.
      </div>
      <div style="background:#111;border:1px solid #ff0000;padding:6px 10px;font-size:9px;color:#ff0;margin-bottom:10px;word-break:break-all">
        1BONZI8UdDY4n8gt4j7k9XbFakeNotRealDoNotSend
      </div>
      <div style="font-size:11px;color:#ff8888;margin-bottom:4px">Time remaining to pay:</div>
      <div id="ransom-timer" style="font-size:20px;font-weight:bold;color:#ff0;text-shadow:0 0 10px #ff0;margin-bottom:12px;letter-spacing:2px">72:00:00</div>
      <div style="display:flex;gap:10px;margin-bottom:12px">
        <button id="ransom-pay" style="
          background:#cc0000; color:#fff; border:2px solid #ff0000;
          padding:6px 18px; font-family:'Courier New',monospace; font-size:11px;
          cursor:pointer; font-weight:bold; text-transform:uppercase;
          box-shadow:0 0 8px #f00;
        ">💰 PAY NOW</button>
        <button id="ransom-scared" style="
          background:#330000; color:#ff6666; border:2px solid #660000;
          padding:6px 18px; font-family:'Courier New',monospace; font-size:11px;
          cursor:pointer;
        ">😱 I'm scared</button>
      </div>
      <div style="font-size:9px;color:#660000">
        This is a joke. No files were harmed. (probably)
      </div>
    </div>
  `, { width: 460, height: 400 });

  // Countdown timer
  let totalSec = 72 * 3600;
  const timerEl = document.getElementById('ransom-timer');
  const timerInt = setInterval(() => {
    if (!timerEl || !document.getElementById('win-ransomware')) { clearInterval(timerInt); return; }
    totalSec = Math.max(0, totalSec - 1);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    timerEl.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }, 1000);

  // Flash background
  const root = document.getElementById('ransom-root');
  let flashState = false;
  const flashInt = setInterval(() => {
    if (!root || !document.getElementById('win-ransomware')) { clearInterval(flashInt); return; }
    flashState = !flashState;
    root.style.background = flashState ? '#1a0000' : '#000000';
  }, 600);

  // Critical stop sound (synthesized)
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    [440, 370, 310].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'square';
      g.gain.setValueAtTime(0.18, t + i * 0.15);
      g.gain.setValueAtTime(0, t + i * 0.15 + 0.12);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.15);
    });
  } catch(e) { /* audio */ }

  document.getElementById('ransom-pay')?.addEventListener('click', () => {
    const btn = document.getElementById('ransom-pay');
    if (btn) { btn.textContent = 'just kidding lol 😂'; btn.style.background = '#006600'; btn.style.borderColor = '#00cc00'; }
    saySpeech('just kidding lol 😂 No BTC was harmed.', 4000, true);
  });

  document.getElementById('ransom-scared')?.addEventListener('click', () => {
    clearInterval(timerInt);
    clearInterval(flashInt);
    closeWindow('ransomware');
    saySpeech('Don\'t worry, it\'s just a prank! 👻', 3500, true);
  });
}

/* ═══════════════════════════════════════════════════════════════
   NEW FEATURES
   ═══════════════════════════════════════════════════════════════ */

/* ─── Outlook Express ─── */
export function openOutlookExpress() {
  const EMAILS = [
    {
      from: 'Microsoft Corporation',
      subject: 'Welcome to Outlook Express 5!',
      unread: true,
      body: `Welcome to Outlook Express 5!\n\nThank you for choosing Microsoft Outlook Express, the world's most popular email client.\n\nWith Outlook Express you can:\n• Send and receive email\n• Read newsgroups\n• Chat with friends and family\n\nFor help, visit support.microsoft.com\n\nBest regards,\nThe Microsoft Team`,
    },
    {
      from: 'Hotmail Team',
      subject: 'You have 1,847 unread messages',
      unread: true,
      body: `Dear Hotmail Member,\n\nYour inbox currently has 1,847 unread messages.\n\nYour mailbox is 98.7% full. Please delete some messages or upgrade to Hotmail Plus for just $9.99/month!\n\nAlso: you may have won a FREE vacation! Click here to claim your prize.\n\nHotmail Team\nA Microsoft Company`,
    },
    {
      from: 'AOL Member Services',
      subject: 'FREE Hours! 1000 hours of AOL for FREE!!!',
      unread: false,
      body: `YOU HAVE BEEN SELECTED!!!\n\nCongratulations! You are one of the lucky few to receive 1,000 FREE HOURS of AOL!\n\nSimply install the enclosed CD-ROM and get online TODAY!\n\nBut wait — there's MORE! Sign up now and get:\n✓ 1000 free hours (first month)\n✓ Free email @aol.com\n✓ AIM Instant Messenger\n✓ Parental Controls\n\nOFFER EXPIRES: NEVER (we'll keep mailing these forever)\n\nAOL Member Services`,
    },
    {
      from: 'Nigerian Prince',
      subject: 'URGENT: Business Proposal',
      unread: true,
      body: `DEAR FRIEND,\n\nI AM PRINCE ADEBAYO OKONKWO, SON OF THE LATE GENERAL SANI OKONKWO OF NIGERIA. I WRITE TO YOU WITH UTMOST URGENCY AND CONFIDENCE.\n\nI HAVE IN MY POSSESSION THE SUM OF $45,000,000 USD (FORTY FIVE MILLION DOLLARS) WHICH I NEED TO TRANSFER URGENTLY OUT OF MY COUNTRY.\n\nI REQUIRE YOUR ASSISTANCE TO RECEIVE THIS MONEY IN YOUR BANK ACCOUNT. FOR YOUR ASSISTANCE, YOU WILL RECEIVE 30% OF THE TOTAL SUM.\n\nKINDLY RESPOND WITH YOUR:\n- FULL NAME\n- BANK ACCOUNT NUMBER\n- DATE OF BIRTH\n- MOTHER'S MAIDEN NAME\n- SOCIAL SECURITY NUMBER\n\nGOD BLESS YOU,\nPRINCE ADEBAYO OKONKWO`,
    },
    {
      from: 'mom@home.net',
      subject: 'Are you eating enough?',
      unread: false,
      body: `Honey,\n\nAre you eating enough? I made your favorite casserole. Your father and I haven't heard from you in a week.\n\nAlso your cousin Billy got a real job at the bank. Just saying.\n\nDid you remember to install that anti-virus software I sent you? The CD is still in the envelope I mailed.\n\nCall me when you get this.\n\nLove,\nMom\n\nP.S. Forward this email to 10 friends and you'll have good luck for a year! Grandma says it works.`,
    },
    {
      from: 'Bill Gates',
      subject: 'Re: Windows 98 feedback',
      unread: false,
      body: `Thanks for the feedback on Windows 98!\n\nWe're always working to improve our products. The team has noted your concern about the "fatal error" that occurs every 45 minutes.\n\nRest assured, Windows 98 Second Edition will address many of these issues. We expect it to crash 23% less frequently.\n\nAlso, I'm giving away $1,000 to everyone who forwards this email. This is totally real. I can track emails.\n\nBest,\nBill Gates\nCEO, Microsoft Corporation\nbillg@microsoft.com`,
    },
  ];

  let selectedIdx = null;

  function msgRowHTML(email, i) {
    const unreadStyle = email.unread ? 'font-weight:bold;' : '';
    const unreadIcon = email.unread ? '●' : ' ';
    return `<div class="oe-msg-row" data-idx="${i}" style="
      display:grid;grid-template-columns:16px 1fr 1fr;
      padding:2px 4px;cursor:pointer;font-size:11px;${unreadStyle}
      border-bottom:1px solid #e0e0e0;box-sizing:border-box;
    ">
      <span style="color:#000080">${unreadIcon}</span>
      <span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${email.from}</span>
      <span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:${email.unread?'#000':'#444'}">${email.subject}</span>
    </div>`;
  }

  openWindow('outlook-express', 'Inbox - Outlook Express', ICONS.internet, `
    <div style="display:flex;flex-direction:column;height:100%;font-size:11px;font-family:inherit;background:#c0c0c0">
      <!-- Toolbar -->
      <div style="display:flex;gap:2px;padding:2px 4px;border-bottom:2px solid #808080;align-items:center">
        <button id="oe-newmail" style="display:flex;flex-direction:column;align-items:center;padding:2px 8px;font-size:10px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer;gap:1px">
          <span style="font-size:16px">✉</span>New Mail
        </button>
        <button class="oe-tb-btn" style="display:flex;flex-direction:column;align-items:center;padding:2px 8px;font-size:10px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer;gap:1px">
          <span style="font-size:16px">↩</span>Reply
        </button>
        <button class="oe-tb-btn" style="display:flex;flex-direction:column;align-items:center;padding:2px 8px;font-size:10px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer;gap:1px">
          <span style="font-size:16px">→</span>Forward
        </button>
        <button class="oe-tb-btn" style="display:flex;flex-direction:column;align-items:center;padding:2px 8px;font-size:10px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer;gap:1px">
          <span style="font-size:16px">🗑</span>Delete
        </button>
      </div>
      <!-- Main area: folder tree + message list -->
      <div style="display:flex;flex:1;overflow:hidden;border-bottom:2px solid #808080">
        <!-- Folder tree -->
        <div style="width:140px;flex-shrink:0;border-right:2px solid #808080;overflow-y:auto;background:#fff;padding:4px">
          <div style="font-weight:bold;font-size:11px;padding:2px 0">📁 Local Folders</div>
          <div class="oe-folder selected-folder" style="padding:2px 4px 2px 12px;cursor:pointer;background:#000080;color:#fff">📥 Inbox (3)</div>
          <div class="oe-folder" style="padding:2px 4px 2px 12px;cursor:pointer">📤 Sent Items</div>
          <div class="oe-folder" style="padding:2px 4px 2px 12px;cursor:pointer">📝 Drafts</div>
          <div class="oe-folder" style="padding:2px 4px 2px 12px;cursor:pointer">🗑 Deleted Items</div>
          <div class="oe-folder" style="padding:2px 4px 2px 12px;cursor:pointer">📨 Outbox</div>
        </div>
        <!-- Right panel -->
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
          <!-- Message list header -->
          <div style="display:grid;grid-template-columns:16px 1fr 1fr;padding:2px 4px;background:#c0c0c0;border-bottom:1px solid #808080;font-size:10px;font-weight:bold">
            <span>!</span><span>From</span><span>Subject</span>
          </div>
          <!-- Message list -->
          <div id="oe-msg-list" style="flex:1;overflow-y:auto;background:#fff;max-height:160px">
            ${EMAILS.map((e, i) => msgRowHTML(e, i)).join('')}
          </div>
          <!-- Preview pane -->
          <div id="oe-preview" style="flex:1;background:#fff;border-top:3px solid #808080;padding:8px;overflow-y:auto;min-height:80px;font-family:'Courier New',monospace;font-size:11px;color:#333;white-space:pre-wrap">
            <span style="color:#808080;font-style:italic">Click a message to read it.</span>
          </div>
        </div>
      </div>
      <!-- Status bar -->
      <div style="padding:2px 6px;font-size:10px;background:#c0c0c0;border-top:1px solid #808080">
        6 messages, 3 unread
      </div>
    </div>
  `, { width: 600, height: 450 });

  // Toolbar buttons — demo toast
  document.querySelectorAll('.oe-tb-btn').forEach(btn => {
    btn.addEventListener('click', () => saySpeech('Feature not available in demo 😅', 3000, true));
  });

  // New Mail button — play ding + toast
  document.getElementById('oe-newmail')?.addEventListener('click', () => {
    try {
      const ctx = getAudioCtx();
      const t = ctx.currentTime;
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        g.gain.setValueAtTime(0.2, t + i * 0.12);
        g.gain.linearRampToValueAtTime(0, t + i * 0.12 + 0.25);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.3);
      });
    } catch(e) {}
    saySpeech("You've got mail! 📧 (Feature not available in demo)", 4000, true);
  });

  // Message click → show preview
  document.getElementById('oe-msg-list')?.addEventListener('click', e => {
    const row = e.target.closest('.oe-msg-row');
    if (!row) return;
    const idx = parseInt(row.dataset.idx);
    selectedIdx = idx;
    const email = EMAILS[idx];
    if (!email) return;

    // Highlight selected row
    document.querySelectorAll('.oe-msg-row').forEach(r => r.style.background = '');
    row.style.background = '#000080';
    row.style.color = '#fff';
    row.style.fontWeight = 'normal';

    // Show in preview pane
    const preview = document.getElementById('oe-preview');
    if (preview) {
      preview.innerHTML = `<div style="border-bottom:1px solid #c0c0c0;margin-bottom:6px;padding-bottom:4px;font-family:inherit;font-size:11px">
        <div><b>From:</b> ${email.from}</div>
        <div><b>To:</b> you@hotmail.com</div>
        <div><b>Subject:</b> ${email.subject}</div>
      </div><div style="white-space:pre-wrap;font-family:'Courier New',monospace;font-size:11px">${email.body}</div>`;
    }
  });
}

/* ─── ICQ Buddy List ─── */
export function openICQBuddyList() {
  const BUDDIES = [
    { name: 'xX_DaRkAnGeL_Xx', status: 'Away', statusMsg: 'away 4 a bit brb' },
    { name: 'sk8er_boi_2003',   status: 'Away', statusMsg: 'skateboarding ✌️' },
    { name: 'cutiepie4ever',    status: 'Away', statusMsg: 'lol ttyl' },
    { name: 'l33t_h4x0r',       status: 'Away', statusMsg: 'hacking the mainframe' },
  ];

  openWindow('icq-buddy', 'ICQ - Buddy List', ICONS.icq, `
    <div style="display:flex;flex-direction:column;height:100%;background:#e8f4e8;font-family:inherit;font-size:11px">
      <!-- Header -->
      <div style="background:#009900;color:#fff;padding:4px 8px;font-weight:bold;font-size:12px;display:flex;justify-content:space-between;align-items:center">
        <span>💬 ICQ</span>
        <span style="font-size:9px">UIN: 123456789</span>
      </div>
      <!-- My status -->
      <div style="padding:4px 8px;background:#ccffcc;border-bottom:1px solid #99cc99;display:flex;align-items:center;gap:6px">
        <span style="font-size:18px">🌸</span>
        <div>
          <div style="font-weight:bold">Rei_Ayanami_00</div>
          <div style="font-size:10px;color:#008800">● Online</div>
        </div>
      </div>
      <!-- Online section -->
      <div style="padding:2px 4px;background:#99cc99;font-weight:bold;font-size:10px;color:#004400">
        Online (0)
      </div>
      <!-- Away section -->
      <div style="padding:2px 4px;background:#cceecc;font-weight:bold;font-size:10px;color:#006600">
        Away (${BUDDIES.length})
      </div>
      <div id="icq-buddy-list" style="flex:1;overflow-y:auto">
        ${BUDDIES.map(b => `
          <div class="icq-buddy-row" style="padding:4px 8px;border-bottom:1px solid #ccddcc;cursor:pointer;display:flex;align-items:center;gap:6px">
            <span style="color:#cc6600">🌙</span>
            <div>
              <div style="font-weight:bold;font-size:11px">${b.name}</div>
              <div style="font-size:9px;color:#666">${b.statusMsg}</div>
            </div>
          </div>`).join('')}
      </div>
      <!-- Bottom bar -->
      <div style="padding:3px 6px;background:#99cc99;border-top:1px solid #66aa66;display:flex;gap:4px">
        <button style="font-size:9px;padding:1px 6px;font-family:inherit;background:#c0c0c0;border:1px solid #808080;cursor:pointer">Add Contact</button>
        <button style="font-size:9px;padding:1px 6px;font-family:inherit;background:#c0c0c0;border:1px solid #808080;cursor:pointer">Search</button>
      </div>
    </div>
  `, { width: 200, height: 320 });

  // Click on buddy → message them
  document.getElementById('icq-buddy-list')?.addEventListener('click', e => {
    const row = e.target.closest('.icq-buddy-row');
    if (!row) return;
    const name = row.querySelector('div > div:first-child')?.textContent || 'buddy';
    saySpeech(`${name} is Away. They might never reply 💬`, 3500, true);
  });
}

export function initICQTray() {
  // Use the system-tray div from HTML
  const tray = document.getElementById('system-tray');
  if (!tray) return;

  // Create ICQ tray icon
  const icqTrayBtn = document.createElement('button');
  icqTrayBtn.id = 'tray-icq';
  icqTrayBtn.title = 'ICQ';
  icqTrayBtn.style.cssText = `
    background:none;border:none;cursor:pointer;padding:1px 3px;
    font-size:14px;line-height:1;display:inline-flex;align-items:center;
  `;
  icqTrayBtn.textContent = '🌸';
  tray.insertBefore(icqTrayBtn, tray.firstChild);

  icqTrayBtn.addEventListener('click', e => {
    e.stopPropagation();
    openICQBuddyList();
  });

  // After 3 seconds, play ICQ "uh-oh" sound and show popup
  setTimeout(() => {
    // Play classic ICQ "uh-oh" two-tone sound
    try {
      const ctx = getAudioCtx();
      const t = ctx.currentTime;
      // Lower tone
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.frequency.value = 440;
      osc1.type = 'sine';
      g1.gain.setValueAtTime(0.25, t);
      g1.gain.linearRampToValueAtTime(0, t + 0.15);
      osc1.connect(g1); g1.connect(ctx.destination);
      osc1.start(t); osc1.stop(t + 0.18);
      // Higher tone
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.frequency.value = 880;
      osc2.type = 'sine';
      g2.gain.setValueAtTime(0.25, t + 0.18);
      g2.gain.linearRampToValueAtTime(0, t + 0.33);
      osc2.connect(g2); g2.connect(ctx.destination);
      osc2.start(t + 0.18); osc2.stop(t + 0.36);
    } catch(e) {}

    // Show popup above tray
    const desktop = document.getElementById('win98-desktop');
    const tbEl = document.getElementById('taskbar');
    if (!desktop || !tbEl) return;
    const popup = document.createElement('div');
    popup.id = 'icq-online-popup';
    popup.style.cssText = `
      position:absolute;right:60px;
      bottom:${(tbEl.offsetHeight || 28) + 6}px;
      background:#ffffcc;border:2px solid #999933;
      padding:8px 12px;font-family:inherit;font-size:11px;
      box-shadow:2px 2px 6px rgba(0,0,0,0.35);z-index:9998;
      white-space:nowrap;border-radius:2px;
    `;
    popup.innerHTML = `<b>ICQ:</b> Rei_Ayanami_00 (14/F/Tokyo) is now online! 💙`;
    desktop.appendChild(popup);

    // Fade out after 5 seconds
    setTimeout(() => {
      popup.style.transition = 'opacity 0.8s';
      popup.style.opacity = '0';
      setTimeout(() => popup.remove(), 900);
    }, 5000);
  }, 3000);
}

/* ─── IE Favorites ─── */
export function openIEFavorites() {
  const FAV_TREE = [
    { type: 'folder', label: 'Links', open: false, children: [
      { type: 'link', label: 'Best of the Web', url: 'https://web.archive.org/web/19990117032727/http://home.microsoft.com/access/allinone.asp' },
      { type: 'link', label: 'Channel Guide', url: 'https://web.archive.org/web/1999/http://www.msn.com/' },
    ]},
    { type: 'folder', label: 'My Favorites', open: true, children: [
      { type: 'link', label: 'Geocities - Free Homepage!', url: 'https://web.archive.org/web/1999/http://www.geocities.com/' },
      { type: 'link', label: 'Napster (napster.com)', url: 'https://web.archive.org/web/2001/http://www.napster.com/' },
      { type: 'link', label: 'AltaVista Search', url: 'https://web.archive.org/web/1999/http://www.altavista.com/' },
      { type: 'link', label: 'Ask Jeeves', url: 'https://web.archive.org/web/2000/http://www.ask.com/' },
      { type: 'link', label: 'Homestar Runner', url: 'https://homestarrunner.com/' },
      { type: 'link', label: 'Newgrounds', url: 'https://www.newgrounds.com/' },
      { type: 'link', label: 'eBay - Buy stuff cheap!', url: 'https://www.ebay.com/' },
      { type: 'link', label: 'Neopets', url: 'https://www.neopets.com/' },
    ]},
    { type: 'folder', label: 'Cool Sites', open: false, children: [
      { type: 'link', label: 'hamsterdance.com', url: 'https://web.archive.org/web/1999/http://hampsterdance.com/' },
      { type: 'link', label: 'zombo.com', url: 'https://zombo.com/' },
      { type: 'link', label: 'www.badgerbadgerbadger.com', url: 'https://web.archive.org/web/2003/http://badgerbadgerbadger.com/' },
      { type: 'link', label: 'Subservient Chicken', url: 'https://web.archive.org/web/2004/http://www.subservientchicken.com/' },
    ]},
    { type: 'folder', label: 'News', open: false, children: [
      { type: 'link', label: 'Yahoo! News', url: 'https://news.yahoo.com/' },
      { type: 'link', label: 'Slashdot', url: 'https://slashdot.org/' },
    ]},
  ];

  function renderTree(items, depth) {
    return items.map(item => {
      if (item.type === 'folder') {
        const childrenHTML = item.open ? renderTree(item.children, depth + 1) : '';
        const arrow = item.open ? '▼' : '▶';
        return `<div class="ie-fav-folder" data-label="${item.label}" style="padding:2px 4px 2px ${8 + depth*12}px;cursor:pointer;font-weight:bold;font-size:11px">
          <span style="font-size:9px;margin-right:3px">${arrow}</span>📁 ${item.label}
        </div>
        <div class="ie-fav-children" data-folder="${item.label}" style="display:${item.open?'block':'none'}">
          ${childrenHTML}
        </div>`;
      } else {
        return `<div class="ie-fav-link" data-url="${item.url}" style="padding:2px 4px 2px ${8 + depth*12}px;cursor:pointer;font-size:11px;color:#0000cc">
          🌐 ${item.label}
        </div>`;
      }
    }).join('');
  }

  openWindow('ie-favorites', 'Favorites', ICONS.internet, `
    <div style="display:flex;flex-direction:column;height:100%;font-family:inherit;font-size:11px;background:#fff">
      <!-- Toolbar -->
      <div style="padding:3px 6px;background:#c0c0c0;border-bottom:1px solid #808080;display:flex;gap:4px;align-items:center">
        <button id="ie-fav-add" style="font-size:10px;padding:2px 8px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">Add...</button>
        <button style="font-size:10px;padding:2px 8px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">Organize...</button>
      </div>
      <!-- Tree -->
      <div id="ie-fav-tree" style="flex:1;overflow-y:auto;padding:4px 0">
        ${renderTree(FAV_TREE, 0)}
      </div>
    </div>
  `, { width: 280, height: 400 });

  // Add button
  document.getElementById('ie-fav-add')?.addEventListener('click', () => {
    const dlg = document.createElement('div');
    dlg.style.cssText = `
      position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;
      box-shadow:3px 3px 6px rgba(0,0,0,0.4);z-index:10001;
      font-family:inherit;font-size:12px;min-width:280px;
    `;
    dlg.innerHTML = `
      <div style="background:#000080;color:#fff;padding:3px 6px;font-size:11px;font-weight:bold;display:flex;justify-content:space-between">
        <span>Add Favorite</span>
        <button onclick="this.closest('div[style]').remove()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:11px;padding:0 2px">✕</button>
      </div>
      <div style="padding:12px">
        <p style="margin-bottom:8px">Your favorite has been added!</p>
        <div style="display:flex;gap:6px;margin-top:4px">
          <label style="font-size:11px">Name:</label>
          <input value="New Page" style="flex:1;font-family:inherit;font-size:11px;border:1px inset #808080;padding:2px">
        </div>
        <div style="display:flex;justify-content:flex-end;gap:4px;margin-top:10px">
          <button onclick="this.closest('div[style]').remove()" style="padding:3px 12px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">OK</button>
        </div>
      </div>
    `;
    (document.getElementById('win98-desktop') || document.body).appendChild(dlg);
  });

  // Folder expand/collapse
  document.getElementById('ie-fav-tree')?.addEventListener('click', e => {
    const folder = e.target.closest('.ie-fav-folder');
    const link = e.target.closest('.ie-fav-link');

    if (folder) {
      const label = folder.dataset.label;
      const children = document.querySelector(`.ie-fav-children[data-folder="${CSS.escape(label)}"]`);
      if (children) {
        const isOpen = children.style.display !== 'none';
        children.style.display = isOpen ? 'none' : 'block';
        const arrow = folder.querySelector('span');
        if (arrow) arrow.textContent = isOpen ? '▶' : '▼';
      }
    }

    if (link) {
      const url = link.dataset.url;
      if (url) {
        // Use !e browser if available
        if (typeof openExclamationE === 'function') {
          openExclamationE(url);
        } else {
          window.open(url, '_blank');
        }
      }
    }
  });
}

/* ─── Floppy Disk Error ─── */
export function openFloppyError(filename) {
  const name = filename || 'file';

  // Show copying progress first
  const progressId = `floppy-progress-${Date.now()}`;
  const dlg = document.createElement('div');
  dlg.id = progressId;
  dlg.style.cssText = `
    position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
    background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;
    box-shadow:3px 3px 8px rgba(0,0,0,0.5);z-index:10005;
    font-family:inherit;font-size:12px;min-width:340px;
  `;
  dlg.innerHTML = `
    <div style="background:#000080;color:#fff;padding:3px 8px;font-size:11px;font-weight:bold">
      Copying...
    </div>
    <div style="padding:14px 16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="font-size:24px">💾</span>
        <div>
          <div>Copying <b>${name}</b></div>
          <div style="font-size:10px;color:#444;margin-top:2px">Destination: A:\</div>
        </div>
      </div>
      <div style="background:#fff;border:1px inset #808080;height:16px;position:relative;overflow:hidden;margin-bottom:6px">
        <div id="floppy-bar" style="height:100%;width:0%;background:#000080;transition:width 0.1s linear"></div>
      </div>
      <div id="floppy-pct" style="text-align:right;font-size:10px;font-family:monospace">0%</div>
    </div>
  `;
  (document.getElementById('win98-desktop') || document.body).appendChild(dlg);

  // Animate to 73%
  let pct = 0;
  const barEl = document.getElementById('floppy-bar');
  const pctEl = document.getElementById('floppy-pct');
  const iv = setInterval(() => {
    pct += 2 + Math.random() * 3;
    if (pct >= 73) {
      pct = 73;
      clearInterval(iv);
      if (barEl) barEl.style.background = '#c0c0c0';
      // After 2 seconds show error
      setTimeout(() => {
        dlg.remove();
        // Show Win98 error dialog
        const errDlg = document.createElement('div');
        errDlg.style.cssText = `
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;
          box-shadow:3px 3px 8px rgba(0,0,0,0.5);z-index:10006;
          font-family:inherit;font-size:12px;min-width:360px;
        `;
        errDlg.innerHTML = `
          <div style="background:#000080;color:#fff;padding:3px 8px;font-size:11px;font-weight:bold;display:flex;justify-content:space-between;align-items:center">
            <span>Error Copying File</span>
            <button onclick="this.closest('div[style]').remove()" style="background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer;font-size:10px;padding:0 4px;line-height:1.2">✕</button>
          </div>
          <div style="padding:14px 16px;display:flex;gap:12px;align-items:flex-start">
            <div style="font-size:32px;flex-shrink:0">✖</div>
            <div>
              <p style="margin-bottom:8px">Cannot copy <b>${name}</b>: There is not enough free disk space.</p>
              <p>Delete one or more files to free disk space, and then try again.</p>
            </div>
          </div>
          <div style="padding:8px 16px;display:flex;justify-content:flex-end;gap:6px">
            <button onclick="this.closest('div[style]').remove()" style="padding:4px 20px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">OK</button>
          </div>
        `;
        (document.getElementById('win98-desktop') || document.body).appendChild(errDlg);
      }, 2000);
    }
    if (barEl) barEl.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${Math.floor(pct)}%`;
  }, 80);
}

/* ─── Printer Error ─── */
const PRINTER_MESSAGES = [
  'There was an error writing to LPT1: for printer (HP DeskJet 722C).\nThe printer is not ready.\nMake sure the printer is turned on.',
  'Add Printer Wizard cannot find any printers. Make sure your printer is plugged in.',
  "Your document 'untitled.doc' failed to print.\nPaper jam in Tray 2.",
  'Low ink warning: Your HP DeskJet 722C is running low on black ink.\n\nEstimated pages remaining: 3',
];

export function openPrinterError() {
  const msg = PRINTER_MESSAGES[Math.floor(Math.random() * PRINTER_MESSAGES.length)];
  const dlg = document.createElement('div');
  dlg.className = 'win98-printer-error';
  dlg.style.cssText = `
    position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
    background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;
    box-shadow:3px 3px 8px rgba(0,0,0,0.5);z-index:10004;
    font-family:inherit;font-size:12px;min-width:340px;max-width:400px;
  `;
  dlg.innerHTML = `
    <div style="background:#000080;color:#fff;padding:3px 8px;font-size:11px;font-weight:bold;display:flex;justify-content:space-between;align-items:center">
      <span>🖨️ Printers</span>
      <button class="printer-ok-btn" style="background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer;font-size:10px;padding:0 4px;line-height:1.2;color:#000">✕</button>
    </div>
    <div style="padding:14px 16px;display:flex;gap:12px;align-items:flex-start">
      <div style="font-size:32px;flex-shrink:0">🖨️</div>
      <div style="white-space:pre-wrap;line-height:1.5">${msg}</div>
    </div>
    <div style="padding:8px 16px;display:flex;justify-content:flex-end">
      <button class="printer-ok-btn" style="padding:4px 20px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">OK</button>
    </div>
  `;
  (document.getElementById('win98-desktop') || document.body).appendChild(dlg);
  dlg.querySelectorAll('.printer-ok-btn').forEach(btn => btn.addEventListener('click', () => dlg.remove()));
}

let _printerErrorInterval = null;
export function startPrinterErrors() {
  if (_printerErrorInterval) return;
  function scheduleNext() {
    const delay = 120000 + Math.random() * 60000; // 2-3 minutes
    _printerErrorInterval = setTimeout(() => {
      openPrinterError();
      scheduleNext();
    }, delay);
  }
  scheduleNext();
}

export function openPrintQueue() {
  openWindow('print-queue', 'HP DeskJet 722C', ICONS.myComputer, `
    <div style="display:flex;flex-direction:column;height:100%;font-family:inherit;font-size:11px">
      <div style="padding:2px 4px;background:#c0c0c0;border-bottom:1px solid #808080;font-size:10px;display:flex;gap:8px">
        <span style="cursor:pointer">Printer</span>
        <span style="cursor:pointer">Document</span>
        <span style="cursor:pointer">View</span>
        <span style="cursor:pointer">Help</span>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;background:#000080;color:#fff;padding:2px 4px;font-size:10px;font-weight:bold">
        <span>Document Name</span><span>Status</span><span>Owner</span><span>Progress</span>
      </div>
      <div class="inset-panel" style="flex:1;background:#fff;overflow-y:auto">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;padding:3px 4px;font-size:11px;border-bottom:1px solid #e0e0e0">
          <span>Microsoft Word - untitled.doc</span>
          <span style="color:#000080">Printing</span>
          <span>yuzhes</span>
          <span>Page 1 of 47</span>
        </div>
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;padding:3px 4px;font-size:11px;border-bottom:1px solid #e0e0e0;color:#808080">
          <span>Internet Explorer - webpage</span>
          <span>Queued</span>
          <span>yuzhes</span>
          <span>Waiting</span>
        </div>
      </div>
      <div style="padding:2px 6px;font-size:10px;background:#c0c0c0;border-top:1px solid #808080">
        2 document(s) in queue | HP DeskJet 722C on LPT1:
      </div>
    </div>
  `, { width: 480, height: 220 });
}

/* ─── Real Notepad ─── */
export function openNotepad() {
  const STORAGE_KEY = 'win98-notepad-content';
  const savedContent = localStorage.getItem(STORAGE_KEY) || '';
  let currentFilename = 'Untitled';
  let isDirty = false;

  openWindow('notepad', `${currentFilename} - Notepad`, ICONS.notepad, `
    <div style="display:flex;flex-direction:column;height:100%;box-sizing:border-box;font-family:inherit">
      <!-- Menu bar -->
      <div style="background:#c0c0c0;border-bottom:1px solid #808080;padding:1px 2px;font-size:11px;display:flex;gap:0;position:relative" id="np-menubar">
        <button id="np-file-btn"   class="np-menu-btn" style="padding:2px 8px;background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px">File</button>
        <button id="np-edit-btn"   class="np-menu-btn" style="padding:2px 8px;background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px">Edit</button>
        <button id="np-format-btn" class="np-menu-btn" style="padding:2px 8px;background:none;border:none;cursor:pointer;font-family:inherit;font-size:11px">Format</button>
        <!-- Dropdowns -->
        <div id="np-file-menu" style="display:none;position:absolute;top:100%;left:0;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;box-shadow:2px 2px 4px rgba(0,0,0,0.3);z-index:200;min-width:140px;font-size:11px">
          <div class="np-mi" data-action="new"      style="padding:4px 16px;cursor:pointer;white-space:nowrap">New</div>
          <div class="np-mi" data-action="open"     style="padding:4px 16px;cursor:pointer;white-space:nowrap">Open...</div>
          <div class="np-mi" data-action="save"     style="padding:4px 16px;cursor:pointer;white-space:nowrap">Save</div>
          <div style="border-top:1px solid #808080;margin:2px 0"></div>
          <div class="np-mi" data-action="print"    style="padding:4px 16px;cursor:pointer;white-space:nowrap">Print</div>
          <div style="border-top:1px solid #808080;margin:2px 0"></div>
          <div class="np-mi" data-action="exit"     style="padding:4px 16px;cursor:pointer;white-space:nowrap">Exit</div>
        </div>
        <div id="np-edit-menu" style="display:none;position:absolute;top:100%;left:46px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;box-shadow:2px 2px 4px rgba(0,0,0,0.3);z-index:200;min-width:160px;font-size:11px">
          <div class="np-mi" data-action="selectall" style="padding:4px 16px;cursor:pointer">Select All</div>
          <div class="np-mi" data-action="cut"       style="padding:4px 16px;cursor:pointer">Cut</div>
          <div class="np-mi" data-action="copy"      style="padding:4px 16px;cursor:pointer">Copy</div>
          <div class="np-mi" data-action="paste"     style="padding:4px 16px;cursor:pointer">Paste</div>
          <div style="border-top:1px solid #808080;margin:2px 0"></div>
          <div class="np-mi" data-action="datetime"  style="padding:4px 16px;cursor:pointer">Time/Date</div>
        </div>
        <div id="np-format-menu" style="display:none;position:absolute;top:100%;left:92px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;box-shadow:2px 2px 4px rgba(0,0,0,0.3);z-index:200;min-width:140px;font-size:11px">
          <div class="np-mi" data-action="wordwrap"  style="padding:4px 16px;cursor:pointer">Word Wrap</div>
          <div class="np-mi" data-action="font"      style="padding:4px 16px;cursor:pointer">Font...</div>
        </div>
      </div>
      <!-- File input (hidden) -->
      <input id="np-file-input" type="file" accept=".txt,text/plain" style="display:none">
      <!-- Textarea -->
      <textarea id="np-textarea" style="
        flex:1;resize:none;border:none;border:1px inset #808080;
        font-family:'Courier New',monospace;font-size:13px;
        padding:4px;box-sizing:border-box;outline:none;line-height:1.4;
      " wrap="off" spellcheck="false"></textarea>
      <!-- Status bar -->
      <div id="np-status" style="padding:1px 6px;background:#c0c0c0;border-top:1px solid #808080;font-size:10px;font-family:monospace">
        Ln 1, Col 1
      </div>
    </div>
  `, { width: 500, height: 400 });

  const textarea = document.getElementById('np-textarea');
  const statusBar = document.getElementById('np-status');
  const winEl = document.getElementById('win-notepad');

  if (!textarea) return;
  textarea.value = savedContent;

  // Word wrap state
  let wordWrap = false;

  function setTitle(name, dirty) {
    currentFilename = name;
    const t = winEl?.querySelector('.win-title');
    if (t) t.textContent = `${dirty ? '*' : ''}${name} - Notepad`;
  }

  function updateStatus() {
    const text = textarea.value;
    const pos = textarea.selectionStart;
    const lines = text.substring(0, pos).split('\n');
    const ln = lines.length;
    const col = lines[lines.length - 1].length + 1;
    if (statusBar) statusBar.textContent = `Ln ${ln}, Col ${col}`;
    // Auto-save
    localStorage.setItem(STORAGE_KEY, text);
    if (!isDirty && text !== savedContent) {
      isDirty = true;
      setTitle(currentFilename, true);
    }
  }

  textarea.addEventListener('keyup', updateStatus);
  textarea.addEventListener('click', updateStatus);
  textarea.addEventListener('input', updateStatus);

  // Menu toggle logic
  let openMenu = null;
  function closeMenus() {
    ['np-file-menu', 'np-edit-menu', 'np-format-menu'].forEach(id => {
      const m = document.getElementById(id);
      if (m) m.style.display = 'none';
    });
    openMenu = null;
  }

  function toggleMenu(menuId) {
    if (openMenu === menuId) { closeMenus(); return; }
    closeMenus();
    const m = document.getElementById(menuId);
    if (m) m.style.display = 'block';
    openMenu = menuId;
  }

  document.getElementById('np-file-btn')?.addEventListener('click',   e => { e.stopPropagation(); toggleMenu('np-file-menu'); });
  document.getElementById('np-edit-btn')?.addEventListener('click',   e => { e.stopPropagation(); toggleMenu('np-edit-menu'); });
  document.getElementById('np-format-btn')?.addEventListener('click', e => { e.stopPropagation(); toggleMenu('np-format-menu'); });
  document.addEventListener('click', closeMenus);

  // Menu item actions
  document.getElementById('win-notepad')?.addEventListener('click', e => {
    const mi = e.target.closest('.np-mi');
    if (!mi) return;
    closeMenus();
    const action = mi.dataset.action;

    if (action === 'new') {
      const doNew = () => {
        textarea.value = '';
        isDirty = false;
        currentFilename = 'Untitled';
        setTitle('Untitled', false);
        localStorage.removeItem(STORAGE_KEY);
      };
      if (isDirty) {
        if (confirm('Do you want to save changes to ' + currentFilename + '?')) {
          doSave();
        }
        doNew();
      } else {
        doNew();
      }
    }

    if (action === 'save') doSave();
    if (action === 'open') document.getElementById('np-file-input')?.click();
    if (action === 'print') {
      openPrinterError();
    }
    if (action === 'exit') closeWindow('notepad');

    if (action === 'selectall') { textarea.select(); textarea.focus(); }
    if (action === 'cut') { textarea.focus(); document.execCommand('cut'); }
    if (action === 'copy') { textarea.focus(); document.execCommand('copy'); }
    if (action === 'paste') { textarea.focus(); document.execCommand('paste'); }
    if (action === 'datetime') {
      const now = new Date();
      const str = now.toLocaleString('en-US');
      const pos = textarea.selectionStart;
      const val = textarea.value;
      textarea.value = val.substring(0, pos) + str + val.substring(textarea.selectionEnd);
      textarea.selectionStart = textarea.selectionEnd = pos + str.length;
      textarea.focus();
      updateStatus();
    }

    if (action === 'wordwrap') {
      wordWrap = !wordWrap;
      textarea.wrap = wordWrap ? 'soft' : 'off';
      textarea.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre';
      mi.textContent = (wordWrap ? '✓ ' : '') + 'Word Wrap';
    }

    if (action === 'font') {
      const fontDlg = document.createElement('div');
      fontDlg.style.cssText = `
        position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;
        box-shadow:3px 3px 8px rgba(0,0,0,0.5);z-index:10010;
        font-family:inherit;font-size:12px;min-width:280px;
      `;
      fontDlg.innerHTML = `
        <div style="background:#000080;color:#fff;padding:3px 8px;font-size:11px;font-weight:bold">Font</div>
        <div style="padding:12px">
          <label style="display:block;margin-bottom:4px;font-size:11px">Font:</label>
          <select id="np-font-sel" style="width:100%;font-family:inherit;font-size:11px;margin-bottom:8px">
            <option value="'Courier New',monospace">Courier New</option>
            <option value="'Arial',sans-serif">Arial</option>
            <option value="'Times New Roman',serif">Times New Roman</option>
            <option value="'Comic Sans MS',cursive">Comic Sans MS</option>
            <option value="monospace">Monospace</option>
          </select>
          <label style="display:block;margin-bottom:4px;font-size:11px">Size:</label>
          <select id="np-size-sel" style="width:100%;font-family:inherit;font-size:11px;margin-bottom:8px">
            <option>10</option><option>11</option><option selected>13</option>
            <option>14</option><option>16</option><option>18</option><option>24</option>
          </select>
          <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:8px">
            <button id="np-font-ok" style="padding:3px 14px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">OK</button>
            <button onclick="this.closest('div[style]').remove()" style="padding:3px 14px;font-size:11px;font-family:inherit;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer">Cancel</button>
          </div>
        </div>
      `;
      document.body.appendChild(fontDlg);
      document.getElementById('np-font-ok')?.addEventListener('click', () => {
        const font = document.getElementById('np-font-sel')?.value || "'Courier New',monospace";
        const size = document.getElementById('np-size-sel')?.value || '13';
        if (textarea) { textarea.style.fontFamily = font; textarea.style.fontSize = size + 'px'; }
        fontDlg.remove();
      });
    }
  });

  function doSave() {
    const text = textarea.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (currentFilename === 'Untitled' ? 'untitled' : currentFilename) + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    isDirty = false;
    setTitle(currentFilename, false);
    saySpeech('File saved! 💾', 2500, true);
  }

  // File open
  document.getElementById('np-file-input')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (textarea) {
        textarea.value = ev.target.result;
        currentFilename = file.name.replace(/\.txt$/i, '');
        isDirty = false;
        setTitle(currentFilename, false);
        localStorage.setItem(STORAGE_KEY, ev.target.result);
        updateStatus();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
}

/* ─── Neko desktop pet ─── */
let _nekoEl = null;
export function spawnNeko() {
  const _desktop = document.getElementById('win98-desktop') || document.body;
  if (_nekoEl && _desktop.contains(_nekoEl)) {
    saySpeech('Neko is already here! 🐱', 2500, true);
    return;
  }

  const neko = document.createElement('div');
  neko.id = 'neko-pet';
  _nekoEl = neko;
  neko.style.cssText = `
    position:absolute;z-index:8000;width:40px;height:40px;
    left:200px;top:200px;cursor:pointer;user-select:none;
    transition:left 0.3s ease, top 0.3s ease;
    pointer-events:auto;
  `;

  neko.innerHTML = `
    <style>
      @keyframes neko-ear-twitch {
        0%,90%,100% { transform: scaleY(1); }
        95% { transform: scaleY(0.6); }
      }
      @keyframes neko-sleep-zzz {
        0%,100% { opacity:0;transform:translate(0,0) scale(0.5); }
        50% { opacity:1;transform:translate(8px,-8px) scale(1); }
      }
      @keyframes neko-scratch {
        0%,100% { transform: rotate(0deg); }
        25% { transform: rotate(-15deg); }
        75% { transform: rotate(15deg); }
      }
      @keyframes neko-surprised {
        0%,100% { transform:translateY(0); }
        30% { transform:translateY(-20px); }
        60% { transform:translateY(-8px); }
      }
      #neko-pet.neko-sleeping #neko-body { animation: none; }
      #neko-pet.neko-scratching { animation: neko-scratch 0.3s ease infinite; }
      #neko-pet.neko-surprised { animation: neko-surprised 0.6s ease; }
      #neko-ear-left { animation: neko-ear-twitch 4s ease infinite; transform-origin: bottom center; }
    </style>
    <svg id="neko-body" viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <!-- Tail -->
      <path id="neko-tail" d="M28 32 Q38 28 36 20 Q34 14 30 18" fill="none" stroke="#e8c9a0" stroke-width="3" stroke-linecap="round"/>
      <!-- Body -->
      <ellipse cx="20" cy="28" rx="13" ry="10" fill="#f5e0c0" stroke="#c4a882" stroke-width="1"/>
      <!-- Head -->
      <circle cx="20" cy="16" r="11" fill="#f5e0c0" stroke="#c4a882" stroke-width="1"/>
      <!-- Ears -->
      <polygon id="neko-ear-left" points="10,8 6,2 14,6" fill="#f5e0c0" stroke="#c4a882" stroke-width="1"/>
      <polygon points="30,8 34,2 26,6" fill="#f5e0c0" stroke="#c4a882" stroke-width="1"/>
      <!-- Inner ears -->
      <polygon points="10,7 7,3 13,6" fill="#ffb6c1"/>
      <polygon points="30,7 33,3 27,6" fill="#ffb6c1"/>
      <!-- Eyes -->
      <ellipse id="neko-eye-l" cx="16" cy="15" rx="2.5" ry="2.5" fill="#222"/>
      <ellipse id="neko-eye-r" cx="24" cy="15" rx="2.5" ry="2.5" fill="#222"/>
      <!-- Eye shine -->
      <circle cx="17" cy="14" r="0.8" fill="#fff"/>
      <circle cx="25" cy="14" r="0.8" fill="#fff"/>
      <!-- Nose -->
      <ellipse cx="20" cy="19" rx="1.5" ry="1" fill="#ff9999"/>
      <!-- Mouth -->
      <path d="M18 20.5 Q20 22 22 20.5" fill="none" stroke="#c4a882" stroke-width="0.8"/>
      <!-- Whiskers -->
      <line x1="8" y1="18" x2="16" y2="19" stroke="#c4a882" stroke-width="0.6"/>
      <line x1="8" y1="20" x2="16" y2="20" stroke="#c4a882" stroke-width="0.6"/>
      <line x1="24" y1="19" x2="32" y2="18" stroke="#c4a882" stroke-width="0.6"/>
      <line x1="24" y1="20" x2="32" y2="20" stroke="#c4a882" stroke-width="0.6"/>
      <!-- Name tag -->
      <rect x="13" y="34" width="14" height="6" rx="2" fill="#ff9966" stroke="#cc6633" stroke-width="0.5"/>
      <text x="20" y="39" text-anchor="middle" font-size="4" font-family="Arial" fill="#fff" font-weight="bold">Neko</text>
    </svg>
    <div id="neko-zzz" style="
      position:absolute;top:-12px;right:-4px;font-size:10px;color:#88aaff;
      display:none;animation:neko-sleep-zzz 1.5s ease infinite;
    ">zzz</div>
  `;

  _desktop.appendChild(neko);

  // State machine
  let state = 'idle'; // idle, running, sleeping, scratching, surprised
  let targetX = 200, targetY = 200;
  let sleepTimer = null;
  let nekoName = 'Neko';

  const STATES = {
    idle:       () => { neko.style.transition = 'left 0.5s ease, top 0.5s ease'; document.getElementById('neko-zzz').style.display='none'; },
    running:    () => { neko.style.transition = 'left 0.15s linear, top 0.15s linear'; document.getElementById('neko-zzz').style.display='none'; },
    sleeping:   () => { neko.style.transition = ''; document.getElementById('neko-zzz').style.display='block'; },
    scratching: () => { neko.classList.add('neko-scratching'); document.getElementById('neko-zzz').style.display='none'; },
    surprised:  () => { neko.classList.add('neko-surprised'); setTimeout(()=>{neko.classList.remove('neko-surprised');setState('idle');},600); },
  };

  function setState(newState) {
    neko.classList.remove('neko-scratching', 'neko-surprised');
    state = newState;
    STATES[newState]?.();
  }

  function resetSleepTimer() {
    clearTimeout(sleepTimer);
    if (state === 'sleeping') setState('idle');
    sleepTimer = setTimeout(() => setState('sleeping'), 10000);
  }

  // Follow cursor — convert viewport coords to screen-content local space
  document.addEventListener('mousemove', e => {
    if (!_desktop.contains(neko)) return;
    resetSleepTimer();
    const screenEl = document.getElementById('screen-content') || _desktop;
    const rect = screenEl.getBoundingClientRect();
    // Linear approximation: map bounding rect → local pre-transform space
    const localX = rect.width  > 0 ? (e.clientX - rect.left) / rect.width  * screenEl.offsetWidth  : e.clientX;
    const localY = rect.height > 0 ? (e.clientY - rect.top)  / rect.height * screenEl.offsetHeight : e.clientY;

    const nx = parseInt(neko.style.left) || 200;
    const ny = parseInt(neko.style.top) || 200;
    const dx = localX - nx - 20;
    const dy = localY - ny - 20;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 80) {
      setState('running');
      const maxX = screenEl.offsetWidth  - 44;
      const maxY = screenEl.offsetHeight - 72; // leave room for taskbar
      neko.style.left = `${Math.max(0, Math.min(maxX, localX - 20))}px`;
      neko.style.top  = `${Math.max(0, Math.min(maxY, localY - 20))}px`;

      // Flip horizontally if moving left
      const body = neko.querySelector('#neko-body');
      if (body) body.style.transform = dx < 0 ? 'scaleX(-1)' : '';
    } else if (state === 'running') {
      setState('idle');
    }
  });

  // Right-click context menu
  neko.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    const { showContextMenu } = window._win98CoreExports || {};
    const items = [
      { label: 'Pet 🐱', action: () => {
        try {
          const ctx = getAudioCtx();
          const t = ctx.currentTime;
          // Purr — low frequency oscillation
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 80;
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.8);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(t); osc.stop(t + 0.9);
        } catch(e) {}
        saySpeech('Purrr... 🐱', 2500, true);
        setState('surprised');
      }},
      { label: 'Rename', action: () => {
        const name = prompt('Enter a name for your cat:', nekoName);
        if (name && name.trim()) {
          nekoName = name.trim();
          const tag = neko.querySelector('text');
          if (tag) tag.textContent = nekoName.slice(0, 5);
          saySpeech(`Your cat is now named ${nekoName}! 🐱`, 3000, true);
        }
      }},
      { label: 'Shoo!', action: () => {
        neko.style.transition = 'opacity 0.4s, transform 0.4s';
        neko.style.opacity = '0';
        neko.style.transform = 'scale(0)';
        setTimeout(() => { neko.remove(); _nekoEl = null; }, 450);
        saySpeech('Neko ran away! 🐱💨', 2500, true);
      }},
    ];
    // Build simple context menu inline since showContextMenu may not be importable here
    const menu = document.createElement('div');
    menu.style.cssText = `
      position:fixed;left:${e.clientX}px;top:${e.clientY}px;
      background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;
      box-shadow:2px 2px 4px rgba(0,0,0,0.4);z-index:9999;
      font-family:inherit;font-size:11px;min-width:120px;
    `;
    items.forEach(item => {
      const div = document.createElement('div');
      div.textContent = item.label;
      div.style.cssText = 'padding:4px 16px;cursor:pointer;';
      div.addEventListener('mouseenter', () => { div.style.background='#000080'; div.style.color='#fff'; });
      div.addEventListener('mouseleave', () => { div.style.background=''; div.style.color=''; });
      div.addEventListener('click', () => { item.action?.(); menu.remove(); });
      menu.appendChild(div);
    });
    document.body.appendChild(menu);
    const removeMenu = () => { menu.remove(); document.removeEventListener('click', removeMenu); };
    setTimeout(() => document.addEventListener('click', removeMenu), 0);
  });

  // Start sleep timer
  resetSleepTimer();

  // Surprised when a new window opens — observe DOM
  const nekoObs = new MutationObserver(mutations => {
    if (!_desktop.contains(neko)) { nekoObs.disconnect(); return; }
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.classList?.contains('win98-window')) {
          setState('surprised');
          break;
        }
      }
    }
  });
  nekoObs.observe(document.getElementById('win98-desktop') || document.body, { childList: true, subtree: true });

  saySpeech('🐱 Neko has arrived!', 2500, true);
}

/* ─── Internet Radio ─── */
export function openRadio() {
  const STATIONS = [
    { name: '📻 Y2K Hits', freq: '98.5', genre: 'Y2K Pop', url: 'https://streams.ilovemusic.de/iloveradio2.mp3', nowPlaying: 'Crazy in Love - Beyoncé' },
    { name: '📻 Windows 98 FM', freq: '103.1', genre: 'Synthwave', url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128', nowPlaying: 'Back to the 90s Mix' },
    { name: '📻 AOL Radio', freq: '106.7', genre: 'Pop Hits', url: 'https://streams.ilovemusic.de/iloveradio2.mp3', nowPlaying: 'Oops!... I Did It Again' },
    { name: '📻 Napster Radio', freq: '91.9', genre: 'Alternative', url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128', nowPlaying: 'Mr. Brightside - The Killers' },
  ];

  let currentStation = null;
  let radioAudio = null;
  let isPlaying = false;

  openWindow('radio', 'Internet Radio', ICONS.winamp, `
    <div style="
      display:flex;flex-direction:column;height:100%;
      background:linear-gradient(180deg,#2a2a2a,#1a1a1a);
      color:#eee;font-family:'Courier New',monospace;font-size:11px;
      box-sizing:border-box;
    ">
      <!-- Display -->
      <div style="
        background:#111;border:2px inset #444;margin:8px 8px 4px;
        padding:8px 10px;border-radius:2px;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="color:#00ff88;font-size:9px">● INTERNET RADIO</span>
          <span id="radio-freq" style="color:#ff8800;font-weight:bold;font-size:13px">-- FM</span>
        </div>
        <div style="
          background:#000;border:1px solid #333;overflow:hidden;
          white-space:nowrap;height:16px;position:relative;
        ">
          <div id="radio-marquee" style="
            display:inline-block;white-space:nowrap;
            animation:radio-scroll 12s linear infinite;color:#00ff88;font-size:10px;padding-top:2px;
          ">Select a station to start streaming...</div>
        </div>
        <style>
          @keyframes radio-scroll { 0% { transform:translateX(100%); } 100% { transform:translateX(-100%); } }
        </style>
        <div style="margin-top:4px;display:flex;justify-content:space-between;font-size:9px;color:#888">
          <span id="radio-genre">Genre: --</span>
          <span id="radio-status" style="color:#ff4444">■ STOPPED</span>
        </div>
      </div>

      <!-- Frequency dial visual -->
      <div style="
        margin:0 8px 4px;background:#222;border:1px solid #444;
        padding:4px 8px;position:relative;height:20px;border-radius:10px;overflow:hidden;
      ">
        <div style="
          position:absolute;top:0;left:0;right:0;bottom:0;
          background:repeating-linear-gradient(90deg,#333 0px,#333 1px,transparent 1px,transparent 8px);
        "></div>
        <div id="radio-tuner" style="
          position:absolute;top:0;bottom:0;width:3px;background:#ff8800;
          box-shadow:0 0 6px #ff8800;transition:left 0.4s ease;left:10%;
        "></div>
        <div style="
          position:absolute;top:2px;left:4px;right:4px;
          display:flex;justify-content:space-between;font-size:8px;color:#666;
        ">
          <span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span>
        </div>
      </div>

      <!-- Station presets -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin:0 8px 4px">
        ${STATIONS.map((s, i) => `
          <button class="radio-preset" data-idx="${i}" style="
            background:#333;color:#ccc;border:1px solid #555;
            padding:4px 6px;cursor:pointer;font-family:'Courier New',monospace;font-size:9px;
            text-align:left;border-radius:2px;transition:background 0.15s;
          ">${s.name}<br><span style="color:#888;font-size:8px">${s.freq} FM</span></button>
        `).join('')}
      </div>

      <!-- Volume + controls -->
      <div style="display:flex;align-items:center;gap:6px;margin:0 8px;padding:4px 0;border-top:1px solid #333">
        <span style="font-size:10px;color:#888">VOL</span>
        <input id="radio-vol" type="range" min="0" max="1" step="0.05" value="0.7"
          style="flex:1;accent-color:#ff8800;height:12px;cursor:pointer">
        <button id="radio-play" style="
          background:#444;color:#00ff88;border:1px solid #666;
          padding:4px 14px;cursor:pointer;font-family:monospace;font-size:13px;border-radius:2px;
        ">▶</button>
        <button id="radio-stop" style="
          background:#444;color:#ff4444;border:1px solid #666;
          padding:4px 12px;cursor:pointer;font-family:monospace;font-size:13px;border-radius:2px;
        ">■</button>
      </div>
    </div>
  `, { width: 300, height: 260 });

  function playStatic() {
    try {
      const ctx = getAudioCtx();
      const bufSize = ctx.sampleRate * 0.15;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buf;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      src.connect(gain); gain.connect(ctx.destination);
      src.start();
    } catch(e) {}
  }

  function selectStation(idx) {
    const station = STATIONS[idx];
    if (!station) return;
    currentStation = idx;
    playStatic();

    // Update tuner position
    const freqVal = parseFloat(station.freq);
    const pct = ((freqVal - 88) / (108 - 88)) * 90 + 5;
    const tuner = document.getElementById('radio-tuner');
    if (tuner) tuner.style.left = `${pct}%`;

    // Update display
    const freq = document.getElementById('radio-freq');
    const marquee = document.getElementById('radio-marquee');
    const genre = document.getElementById('radio-genre');
    if (freq) freq.textContent = `${station.freq} FM`;
    if (marquee) marquee.textContent = `♪ ${station.nowPlaying} ♪   |   ${station.name}   |   `;
    if (genre) genre.textContent = `Genre: ${station.genre}`;

    // Highlight selected preset
    document.querySelectorAll('.radio-preset').forEach((btn, i) => {
      btn.style.background = i === idx ? '#553300' : '#333';
      btn.style.borderColor = i === idx ? '#ff8800' : '#555';
      btn.style.color = i === idx ? '#ff8800' : '#ccc';
    });

    if (isPlaying) startAudio(station);
  }

  function startAudio(station) {
    if (radioAudio) { radioAudio.pause(); radioAudio = null; }
    radioAudio = new Audio();
    radioAudio.crossOrigin = 'anonymous';
    radioAudio.src = station.url;
    radioAudio.volume = parseFloat(document.getElementById('radio-vol')?.value || '0.7');
    radioAudio.play().catch(() => {
      const status = document.getElementById('radio-status');
      if (status) { status.textContent = '⚠ STREAM ERROR'; status.style.color = '#ff8800'; }
      saySpeech('Stream error — check your 56K connection 📞', 3500, true);
    });
    const status = document.getElementById('radio-status');
    const playBtn = document.getElementById('radio-play');
    if (status) { status.textContent = '▶ STREAMING'; status.style.color = '#00ff88'; }
    if (playBtn) playBtn.textContent = '⏸';
    isPlaying = true;
  }

  function stopAudio() {
    if (radioAudio) { radioAudio.pause(); radioAudio = null; }
    const status = document.getElementById('radio-status');
    const playBtn = document.getElementById('radio-play');
    if (status) { status.textContent = '■ STOPPED'; status.style.color = '#ff4444'; }
    if (playBtn) playBtn.textContent = '▶';
    isPlaying = false;
  }

  // Preset buttons
  document.querySelectorAll('.radio-preset').forEach(btn => {
    btn.addEventListener('click', () => selectStation(parseInt(btn.dataset.idx)));
  });

  // Play/Pause
  document.getElementById('radio-play')?.addEventListener('click', () => {
    if (currentStation === null) { selectStation(0); }
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio(STATIONS[currentStation]);
    }
  });

  // Stop
  document.getElementById('radio-stop')?.addEventListener('click', stopAudio);

  // Volume
  document.getElementById('radio-vol')?.addEventListener('input', e => {
    if (radioAudio) radioAudio.volume = parseFloat(e.target.value);
  });

  // Cleanup when window closes
  const radioObs = new MutationObserver(() => {
    if (!document.getElementById('win-radio')) {
      stopAudio();
      radioObs.disconnect();
    }
  });
  radioObs.observe(document.getElementById('win98-desktop') || document.body, { childList: true, subtree: true });
}
