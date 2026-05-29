/**
 * win98-core.js
 * Window manager primitives for the Win98 desktop environment.
 */

import { saySpeech } from './main.js';

/* ─── Window manager state ─── */
export let windowZBase = 20;
export const openWindows = {};

export function bringToFront(id) {
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

export function openWindow(id, title, icon, bodyHTML, opts = {}) {
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

export function minimizeWindow(id) {
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

export function restoreWindow(id) {
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

export function closeWindow(id) {
  const win = document.getElementById(`win-${id}`);
  if (win) win.remove();
  const tb = document.getElementById(`tb-${id}`);
  if (tb) tb.remove();
}

export function addTaskbarBtn(id, title, icon, win) {
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
export function toggleMaximize(id) {
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
export function makeDraggable(el, handle) {
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
export function addResizeHandles(win, id) {
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

export function dismissContextMenu() {
  document.querySelectorAll('.context-menu, .context-submenu').forEach(m => m.remove());
}

export function showContextMenu(x, y, items) {
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
}

/* ─── Generic Properties dialog (NEW) ─── */
export function openGenericProperties(def) {
  const iconId = Object.entries(def).find(([k, v]) => k === 'id')?.[1] ?? '';
  let type = 'File';
  if (iconId === 'folder' || (def.icon && def.icon.includes('ffd700'))) type = 'Folder';
  else if (iconId === 'mine' || iconId === 'minesweeper') type = 'Application';
  else if (def.icon && def.icon.includes('333')) type = 'Application';
  else if (def.label && def.label.endsWith('.exe')) type = 'Application';
  else if (def.label && def.label.endsWith('.txt')) type = 'Text Document';
  else if (def.id === 'my-computer') type = 'System';

  const name = def.label ?? 'File';
  const fakeSize = `${(Math.random() * 900 + 10).toFixed(1)} KB (${Math.floor(Math.random() * 99000 + 1000)} bytes)`;
  const fakeDate = `1/1/1998 12:00:00 AM`;

  const winId = `generic-props-${def.id ?? 'file'}`;
  openWindow(winId, `${name} Properties`, def.icon ?? '', `
    <div style="padding:12px;font-size:12px">
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
        <img src="${def.icon ?? ''}" style="width:32px;height:32px;image-rendering:pixelated">
        <div style="font-size:14px;font-weight:bold">${name}</div>
      </div>
      <div class="inset-panel" style="font-size:11px;display:flex;flex-direction:column;gap:5px">
        <div><b>Type:</b> ${type}</div>
        <div><b>Location:</b> Desktop</div>
        <div><b>Size:</b> ${fakeSize}</div>
        <div style="margin-top:4px"><b>Created:</b> ${fakeDate}</div>
        <div><b>Modified:</b> ${fakeDate}</div>
      </div>
      <div style="margin-top:10px;display:flex;justify-content:flex-end">
        <button onclick="document.getElementById('win-${winId}')?.remove();document.getElementById('tb-${winId}')?.remove()"
          style="font-size:11px;font-family:inherit;padding:3px 16px;cursor:pointer;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff">OK</button>
      </div>
    </div>
  `, { width: 280, height: 220 });
}
