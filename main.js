/* ============================================================
   MAIN — boot the game
   ============================================================ */
import { UI } from './ui.js';
import { Game } from './game.js';
import { store } from './storage.js';
import { audio } from './audio.js';
import { StoryIntro } from './story.js';
import { AccessLock } from './lock.js';

function fatal(err) {
  const el = document.getElementById('fatal-error');
  el.classList.remove('hidden');
  el.textContent = 'Vyaruth could not start the plane. Error: ' + (err && err.message ? err.message : err) +
    ' — Please use a modern browser with WebGL enabled.';
  console.error(err);
}

try {
  const canvas = document.getElementById('game-canvas');
  const ui = new UI();
  const game = new Game(canvas, ui);
  ui.attach(game);
  const story = new StoryIntro(ui, audio);
  ui.story = story;
  const lock = new AccessLock(ui, audio, () => story.play());
  ui.lock = lock;

  // First user gesture unlocks WebAudio
  const unlock = () => {
    audio.init();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock);

  ui.refreshMenu();
  ui.syncSettings();
  lock.start();

  window.Vyaruth = { game, ui, store, audio, story, lock };
} catch (e) {
  fatal(e);
}
