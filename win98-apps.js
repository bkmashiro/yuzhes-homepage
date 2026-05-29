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

export function openWinamp() {
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
  { from: 'nujabes_fan', msg: 'yo, seen the new vocaloid drops?' },
  { from: 'me', msg: 'not yet, link?' },
  { from: 'nujabes_fan', msg: 'check ur miku folder lol' },
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
