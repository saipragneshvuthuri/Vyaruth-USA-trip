/* ============================================================
   STORY — 2D opening cutscene that explains the whole problem:
   Vyaruth has a girlfriend. His friends do not believe him.
   ============================================================ */

export class StoryIntro {
  constructor(ui, audio) {
    this.ui = ui;
    this.audio = audio;

    this.stage = document.getElementById('story-stage');
    this.caption = document.getElementById('story-caption');
    this.dots = [...document.querySelectorAll('#story-dots i')];
    this.scenes = [...document.querySelectorAll('#story-stage .story-scene')];
    this.skipBtn = document.getElementById('story-skip');
    this.nextBtn = document.getElementById('story-next');

    this.steps = [
      { caption: 'Vizag texted him. This is the happiest Vyaruth has ever been.', ms: 4150 },
      { caption: 'His friends have questions. Many, many questions.', ms: 4350 },
      { caption: 'So he does the reasonable thing: books a flight to America.', ms: 4250 },
      { caption: 'A completely true story. Almost.', ms: 3550, final: true },
    ];

    this.timer = null;
    this.index = -1;
    this.running = false;

    this.skipBtn.addEventListener('click', () => this.finish(true));
    this.nextBtn.addEventListener('click', () => this.finish(true));
    this.stage.addEventListener('click', (e) => {
      if (e.target === this.stage) this.next();
    });
  }

  play() {
    this.stop();
    this.running = true;
    this.index = -1;
    this.ui.showScreen('story');
    this.next();
  }

  stop() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  next() {
    if (!this.running) return;
    this.index++;
    if (this.index >= this.steps.length) {
      this.finish();
      return;
    }

    const step = this.steps[this.index];
    this.scenes.forEach((scene, i) => scene.classList.toggle('active', i === this.index));
    this.dots.forEach((dot, i) => dot.classList.toggle('active', i === this.index));
    this.caption.textContent = step.caption;
    this.nextBtn.classList.toggle('hidden', !step.final);

    this.stop();
    this.timer = setTimeout(() => this.next(), step.ms);
  }

  finish(clicked = false) {
    if (!this.running) return;
    this.stop();
    this.running = false;
    this.nextBtn.classList.add('hidden');
    this.scenes.forEach(scene => scene.classList.remove('active'));
    this.ui.showScreen('menu');
    this.ui.refreshMenu();
    if (clicked && this.audio) this.audio.ui();
  }
}
