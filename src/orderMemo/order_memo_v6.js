/**
 * order_memo_v6.js - モックのJSロジックをそのまま移植
 * initOrderMemo(container) で初期化し、{ startWith, clearPins } を返す
 */
export function initOrderMemo(container) {
  const $ = (s) => container.querySelector(s);
  const $$ = (s) => [...container.querySelectorAll(s)];

  const state = { started: false, pins: [] };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function total() {
    return state.pins.reduce((a, p) => a + p.qty, 0);
  }

  function recalc() {
    const sumEl = $('#sum');
    if (sumEl) {
      sumEl.innerHTML = `計 ${total()}点 <small id="sum2">（${state.pins.length}ピン）</small>`;
    }
    const btnShow = $('#btnShow');
    if (btnShow) btnShow.disabled = !state.started;
  }

  function pinSvg() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="white" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
      </svg>
    `;
  }

  let editingPin = null;
  let lpTimer = null;
  let lpStart = null;

  function openLabelEditor(pin) {
    editingPin = pin;
    const input = $('#labelInput');
    if (input) input.value = pin.label || '';
    const modal = $('#labelModal');
    if (modal) {
      modal.classList.add('on');
      modal.setAttribute('aria-hidden', 'false');
    }
    setTimeout(() => {
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  function closeLabelEditor() {
    editingPin = null;
    const modal = $('#labelModal');
    if (modal) {
      modal.classList.remove('on');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  const btnLabelCancel = $('#btnLabelCancel');
  if (btnLabelCancel) btnLabelCancel.onclick = closeLabelEditor;

  const btnLabelSave = $('#btnLabelSave');
  if (btnLabelSave) {
    btnLabelSave.onclick = () => {
      if (editingPin) {
        const input = $('#labelInput');
        editingPin.label = (input ? input.value : '').trim();
      }
      closeLabelEditor();
      renderPins();
    };
  }

  function clearLongPress() {
    if (lpTimer) {
      clearTimeout(lpTimer);
      lpTimer = null;
    }
    lpStart = null;
  }

  function attachLongPress(el, pin) {
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      clearLongPress();
      lpStart = { x: e.clientX, y: e.clientY };
      lpTimer = setTimeout(() => {
        openLabelEditor(pin);
        clearLongPress();
      }, 420);
    });
    el.addEventListener('pointermove', (e) => {
      if (!lpStart) return;
      if (Math.hypot(e.clientX - lpStart.x, e.clientY - lpStart.y) > 8) clearLongPress();
    });
    el.addEventListener('pointerup', clearLongPress);
    el.addEventListener('pointercancel', clearLongPress);

    el.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      clearLongPress();
      const t = e.touches && e.touches[0];
      if (!t) return;
      lpStart = { x: t.clientX, y: t.clientY };
      lpTimer = setTimeout(() => {
        openLabelEditor(pin);
        clearLongPress();
      }, 420);
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      const t = e.touches && e.touches[0];
      if (!t || !lpStart) return;
      if (Math.hypot(t.clientX - lpStart.x, t.clientY - lpStart.y) > 10) clearLongPress();
    }, { passive: true });
    el.addEventListener('touchend', clearLongPress);
    el.addEventListener('touchcancel', clearLongPress);
  }

  function renderPins() {
    const canvas = $('#canvas');
    if (!canvas) return;
    $$('.pin').forEach((p) => p.remove());

    state.pins.forEach((p) => {
      const el = document.createElement('div');
      el.className = 'pin';
      el.style.left = p.x * 100 + '%';
      el.style.top = p.y * 100 + '%';

      const labelHtml = p.label ? `<div class="label">${escapeHtml(p.label)}</div>` : '';
      el.innerHTML = pinSvg() + `<div class="qty">×${p.qty}</div>` + labelHtml;

      attachLongPress(el, p);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        clearLongPress();
        p.qty = Math.min(99, p.qty + 1);
        const qtyEl = el.querySelector('.qty');
        if (qtyEl) qtyEl.textContent = `×${p.qty}`;
        recalc();
      });

      canvas.appendChild(el);
    });

    recalc();
  }

  function addPinAt(clientX, clientY) {
    const canvasEl = $('#canvas');
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    state.pins.push({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      qty: 1,
      label: '',
    });
    renderPins();
  }

  function startWith(src) {
    const empty = $('#empty');
    const canvas = $('#canvas');
    const img = $('#img');
    const sub = $('#sub');
    if (empty) empty.classList.remove('on');
    if (canvas) canvas.classList.add('on');
    if (img) img.src = src;
    state.started = true;
    state.pins = [];
    renderPins();
    if (sub) sub.textContent = 'タップでピン追加 / ピンで+1 / 長押しで名前';
  }

  function clearPins() {
    state.pins = [];
    renderPins();
  }

  function reset() {
    state.started = false;
    state.pins = [];
    const img = $('#img');
    const canvas = $('#canvas');
    const empty = $('#empty');
    if (img) img.src = '';
    if (canvas) canvas.classList.remove('on');
    if (empty) empty.classList.add('on');
    closeLabelEditor();
    const sheet = $('#sheet');
    if (sheet) sheet.classList.remove('on');
    recalc();
  }

  // Add pin by tapping canvas
  const canvasEl = $('#canvas');
  if (canvasEl) {
    canvasEl.addEventListener('click', (e) => {
      if (!state.started) return;
      const labelModal = $('#labelModal');
      if (labelModal && labelModal.classList.contains('on')) return;
      if (e.target.closest('.pin')) return;
      addPinAt(e.clientX, e.clientY);
    });
  }

  // Bottom actions
  const btnHelp = $('#btnHelp');
  if (btnHelp) {
    btnHelp.onclick = () => {
      const sheet = $('#sheet');
      if (sheet) {
        sheet.classList.add('on');
        sheet.setAttribute('aria-hidden', 'false');
      }
    };
  }
  const btnClose = $('#btnClose');
  if (btnClose) {
    btnClose.onclick = () => {
      const sheet = $('#sheet');
      if (sheet) {
        sheet.classList.remove('on');
        sheet.setAttribute('aria-hidden', 'true');
      }
    };
  }
  const btnHint = $('#btnHint');
  if (btnHint) {
    btnHint.onclick = () => {
      const h = $('#hint');
      if (h) {
        h.textContent = h.textContent.includes('タップ：ピン追加')
          ? 'ヒントを非表示'
          : 'タップ：ピン追加 / ピン：+1 / ピン長押し：名前';
      }
    };
  }

  const btnClear = $('#btnClear');
  if (btnClear) btnClear.onclick = clearPins;

  const btnShow = $('#btnShow');
  if (btnShow) {
    btnShow.onclick = () => {
      container.classList.add('display-mode');
      const overlay = document.createElement('div');
      overlay.className = 'display-mode-overlay';
      overlay.setAttribute('aria-label', 'タップで戻る');
      overlay.textContent = 'タップで戻る';
      overlay.onclick = () => {
        container.classList.remove('display-mode');
        overlay.remove();
      };
      container.appendChild(overlay);
    };
  }

  const btnResetHeader = $('#btnResetHeader');
  if (btnResetHeader) btnResetHeader.onclick = reset;

  recalc();

  return { startWith, clearPins, reset };
}
