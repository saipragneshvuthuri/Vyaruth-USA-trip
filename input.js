/* ============================================================
   INPUT — keyboard, swipe gestures and on-screen touch buttons
   ============================================================ */

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.queue = [];
    this.enabled = false;
    this.touchStart = null;
    this.lastSwipe = 0;

    window.addEventListener('keydown', (e) => this.onKey(e), { passive: false });
    window.addEventListener('keyup', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });

    document.querySelectorAll('.touch-btn').forEach(btn => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (this.enabled) this.push(btn.dataset.action);
      }, { passive: false });
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (this.enabled) this.push(btn.dataset.action);
      });
    });
  }

  push(action) {
    if (!this.enabled) return;
    if (this.queue.length < 6) this.queue.push(action);
  }

  onKey(e) {
    const map = {
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
      ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
      ArrowDown: 'slide', KeyS: 'slide',
      Escape: 'pause', KeyP: 'pause',
    };
    const action = map[e.code];
    if (!action) return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (action === 'pause') {
      window.dispatchEvent(new CustomEvent('vyaruth:pause'));
      return;
    }
    if (!e.repeat) this.push(action);
  }

  onTouchStart(e) {
    if (!this.enabled || !e.touches.length) return;
    const t = e.touches[0];
    this.touchStart = { x: t.clientX, y: t.clientY, time: performance.now() };
  }

  onTouchEnd(e) {
    if (!this.enabled || !this.touchStart || !e.changedTouches.length) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - this.touchStart.x;
    const dy = t.clientY - this.touchStart.y;
    const dt = performance.now() - this.touchStart.time;
    this.touchStart = null;
    if (dt > 800) return;
    const threshold = 26;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > threshold) this.push(dx > 0 ? 'right' : 'left');
    } else {
      if (Math.abs(dy) > threshold) this.push(dy > 0 ? 'slide' : 'jump');
    }
  }

  consume() {
    return this.queue.splice(0, this.queue.length);
  }

  clear() { this.queue.length = 0; }
  setEnabled(v) { this.enabled = v; if (!v) this.clear(); }
}
