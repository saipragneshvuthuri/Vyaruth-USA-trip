/* ============================================================
   LOCK — simple password gate for the shared GitHub Pages copy.
   Change PASSWORD below to whatever you want. This is a casual
   gate, not real security: the source is public on GitHub Pages.
   ============================================================ */

const PASSWORD = 'Vyaruth and Vizag';
const STORAGE_KEY = 'vyaruth_access_v1';

export class AccessLock {
  constructor(ui, audio, onUnlock) {
    this.ui = ui;
    this.audio = audio;
    this.onUnlock = onUnlock;

    this.panel = document.querySelector('#screen-lock .lock-panel');
    this.input = document.getElementById('lock-input');
    this.error = document.getElementById('lock-error');
    this.button = document.getElementById('lock-unlock');

    this.button.addEventListener('click', () => this.submit());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submit();
    });
  }

  isUnlocked() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'yes';
    } catch (e) {
      return false;
    }
  }

  start() {
    if (this.isUnlocked()) {
      this.onUnlock();
      return;
    }
    this.ui.showScreen('lock');
    requestAnimationFrame(() => this.input.focus());
  }

  submit() {
    const value = this.input.value.trim().toLowerCase();
    if (value === PASSWORD.toLowerCase()) {
      try {
        localStorage.setItem(STORAGE_KEY, 'yes');
      } catch (e) {
        // Private browsing may block storage; unlocking still works for this visit.
      }
      this.error.classList.add('hidden');
      this.ui.showScreen(null);
      if (this.audio) {
        this.audio.init();
        this.audio.ui();
      }
      this.onUnlock();
      return;
    }

    this.error.classList.remove('hidden');
    this.panel.classList.remove('shake');
    void this.panel.offsetWidth;
    this.panel.classList.add('shake');
    this.input.select();
    if (this.audio) this.audio.crash();
  }
}

export { PASSWORD };
