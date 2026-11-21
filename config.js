/* ============================================================
   CONFIG — levels, story, cosmetics, shop, dialogue
   ============================================================ */

export const LANES = [-2.7, 0, 2.7];
export const SEGMENT_LENGTH = 20;
export const SEGMENT_COUNT = 9;
export const PLAYER_Z = 0;

export const LEVELS = [
  {
    id: 1,
    key: 'airport',
    name: 'THE INDIAN AIRPORT',
    short: 'AIRPORT',
    goal: 420,
    baseSpeed: 14,
    maxSpeed: 19,
    passes: 2,
    palette: { sky: 0x86d3ff, fog: 0xc5e8ff, ground: 0xd9d2c0, accent: 0xff9f1c, lane: 0xf2f0e6, near: 42, far: 150 },
    decor: 'airport',
    obstacles: ['suitcase', 'cart', 'barrier', 'passenger', 'lowbar', 'overhead'],
    intro: 'Vyaruth lands at the airport with one mission: prove Vizag exists. His friends are already filming him for the group chat. Security is suspicious. The boarding pass is somewhere in this terminal.',
    quote: '"Bro, Vizag is real. Trust me. She texted me... in 2019."',
    taunts: [
      'SECURITY: Sir, is "Vizag" a person or a destination?',
      'FRIEND (text): Bro she left on seen again 😂',
      'ANNOUNCER: Final call for gate 3. And also for self-respect.',
      'VYARUTH: This isn\'t an airport, it\'s an interrogation.',
      'FRIEND: Send her location. VYARUTH: She lives in... the USA. Specific.',
    ],
  },
  {
    id: 2,
    key: 'plane',
    name: 'THE AIRPLANE JOURNEY',
    short: 'AIRPLANE',
    goal: 460,
    baseSpeed: 16,
    maxSpeed: 22,
    passes: 2,
    palette: { sky: 0x4aa8f0, fog: 0x9fd4ff, ground: 0xe8f4ff, accent: 0xffffff, lane: 0xc9e6ff, near: 38, far: 145 },
    decor: 'plane',
    obstacles: ['floatingluggage', 'wing', 'bird', 'cloudblock', 'turbulence', 'overhead'],
    intro: 'The airplane hits something. The seats vanish. The pilot is now a cloud. Vyaruth is somehow still running. Physics has filed a complaint.',
    quote: '"Is this a flight or a fitness test?"',
    taunts: [
      'PILOT (over intercom): We are now entering the Impossible Zone.',
      'VYARUTH: I paid for a window seat, not a portal.',
      'FRIEND: Bro your location says "Cloud 9". VYARUTH: Exactly.',
      'FLIGHT ATTENDANT: Please keep your seatbelt fastened to your imaginary friend.',
      'VYARUTH: Even the luggage is flying. Rude.',
    ],
  },
  {
    id: 3,
    key: 'sky',
    name: 'THE ENDLESS SKY',
    short: 'SKY',
    goal: 520,
    baseSpeed: 18,
    maxSpeed: 26,
    passes: 3,
    palette: { sky: 0x7b6cf6, fog: 0xc4b5ff, ground: 0xffe9a8, accent: 0xff5fa8, lane: 0xfff6d8, near: 40, far: 155 },
    decor: 'sky',
    obstacles: ['island', 'rainbow', 'wreckage', 'wind', 'ufo', 'overhead', 'lowbar'],
    intro: 'The sky becomes a highway of floating islands and rainbow platforms. Vyaruth stops asking questions. The questions started asking him.',
    quote: '"USA is 10,000 kilometres away. Keep running."',
    taunts: [
      'VYARUTH: I just ran on a rainbow. Nobody believes me either.',
      'FRIEND: Your GPS says "Nowhere". VYARUTH: It\'s a small village near Texas.',
      'A signs floats by: VIZAG → 9,999 KM. Then another: JUST KIDDING.',
      'VYARUTH: Mission: Prove the haters wrong.',
      'STRANGE VOICE: Welcome to Level 3. There is no Level 3.',
    ],
  },
  {
    id: 4,
    key: 'ocean',
    name: 'THE ATLANTIC OCEAN',
    short: 'OCEAN',
    goal: 560,
    baseSpeed: 19,
    maxSpeed: 28,
    passes: 3,
    palette: { sky: 0x1d234e, fog: 0x35407a, ground: 0x5a6ba8, accent: 0xffe36e, lane: 0x8fa4d8, near: 32, far: 120 },
    decor: 'ocean',
    obstacles: ['ship', 'stormcloud', 'wave', 'movingblock', 'wind', 'overhead'],
    intro: 'Dark clouds. Giant waves. A ship floating in the sky because of course it is. Vyaruth is soaked, windy, and still weirdly confident.',
    quote: '"Even Google Maps cannot find this girl."',
    taunts: [
      'VYARUTH: Why is there a ship in the sky? SKY: Why are you?',
      'THUNDER: *dramatic crash* VYARUTH: Relax, I\'m emotional already.',
      'FRIEND: Is Vizag real? VYARUTH: She\'s realer than this ocean road.',
      'ANNOUNCER: Next stop: America. Probably. Maybe. Keep running.',
      'VYARUTH: I\'m not wet. I\'m marinated.',
    ],
  },
  {
    id: 5,
    key: 'america',
    name: 'AMERICA?',
    short: 'AMERICA?',
    goal: 500,
    baseSpeed: 21,
    maxSpeed: 30,
    passes: 3,
    palette: { sky: 0xff9e6d, fog: 0xffd3a8, ground: 0x5ac8a8, accent: 0xff4f6d, lane: 0xffe9c2, near: 40, far: 150 },
    decor: 'america',
    obstacles: ['airportcart', 'barrier', 'movingblock', 'passenger', 'overhead', 'lowbar'],
    intro: 'LAND HO! Or maybe just a very convincing billboard. The airport runs away every time Vyaruth gets closer. America is playing hard to get.',
    quote: '"Your girlfriend is still loading..."',
    taunts: [
      'SIGN: WELCOME TO AMERICA* *offer valid in another dimension',
      'VYARUTH: I can see the airport! AIRPORT: No you can\'t.',
      'FRIEND: Bro is that a real airport? VYARUTH: It has the font.',
      'ANNOUNCER: Gate 3 has moved to gate 4. Gate 4 moved to India.',
      'VYARUTH: Vizag, if you can hear me, stop moving!',
    ],
  },
  {
    id: 6,
    key: 'vizag',
    name: 'WHERE IS VIZAG?',
    short: 'VIZAG?',
    goal: 480,
    baseSpeed: 23,
    maxSpeed: 32,
    passes: 3,
    palette: { sky: 0xff7ac0, fog: 0xffd2ec, ground: 0xffe27a, accent: 0x6cf0ff, lane: 0xfff7e0, near: 42, far: 160 },
    decor: 'final',
    obstacles: ['truthgate', 'wing', 'movingblock', 'overhead', 'lowbar', 'ufo'],
    intro: 'Final destination. A glowing gate marked "VIZAG?" stands at the end of reality. One last challenge stands between Vyaruth and the truth. No pressure.',
    quote: '"Mission: Prove the haters wrong. Final boss: everyone."',
    taunts: [
      'GATE: State your business. VYARUTH: I am here for Vizag.',
      'GATE: Define "Vizag". VYARUTH: ...uh...',
      'FRIEND: She\'s right behind you. VYARUTH: *turns around* Rude.',
      'THE TRUTH: Loading... 99%... 99%... 99%...',
      'VYARUTH: If I don\'t find her, I\'m blaming Google.',
    ],
  },
];

export const ENDLESS_THEMES = ['sky', 'plane', 'ocean', 'america', 'final', 'airport'];

export const OUTFITS = [
  { id: 'desi', name: 'THE ORIGINAL', desc: 'Saffron shirt, denim jeans, and unshakeable confidence.', cost: 0, shirt: 0xff9f1c, pants: 0x2a5bd7, skin: 0xe0a878, hair: 0x231811, bag: 0x1f7a8c, hat: null, accent: 0xffffff },
  { id: 'hoodie', name: 'CHAI HOODIE', desc: 'Comfy, suspicious, and permanently sticky.', cost: 300, shirt: 0x8a8f9e, pants: 0x33384a, skin: 0xe0a878, hair: 0x231811, bag: 0x5a3a2a, hat: 'cap', accent: 0xffffff },
  { id: 'pilot', name: 'CAPTAIN VYARUTH', desc: 'Not a real pilot. Has the hat though.', cost: 700, shirt: 0xf2f5ff, pants: 0x15307a, skin: 0xe0a878, hair: 0x231811, bag: 0x15307a, hat: 'pilot', accent: 0xffcf4a },
  { id: 'space', name: 'SKY ASTRONAUT', desc: 'For running where oxygen is optional.', cost: 1200, shirt: 0xd8dde8, pants: 0xd8dde8, skin: 0xe0a878, hair: 0x1c2030, bag: 0x5fe6ff, hat: 'helmet', accent: 0x5fe6ff },
  { id: 'fan', name: 'VIZAG FAN CLUB', desc: 'Official uniform of the one-man fan club.', cost: 2000, shirt: 0xff5fa8, pants: 0x2b1a40, skin: 0xe0a878, hair: 0x231811, bag: 0xffcf4a, hat: 'hearts', accent: 0xffffff },
  { id: 'ghost', name: 'THE BELIEVER', desc: 'Only those who uncover the final truth may wear this.', cost: 0, secret: true, shirt: 0xf7f7ff, pants: 0xcfd3ff, skin: 0xf0e6ff, hair: 0xbfc6ff, bag: 0xffcf4a, hat: 'halo', accent: 0xffcf4a },
];

export const SHOP_ITEMS = [
  { id: 'start-shield', name: 'LUCKY SHIELD', desc: 'Begin every run with a free shield.', cost: 350, icon: '🛡' },
  { id: 'start-jetpack', name: 'POCKET JETPACK', desc: 'Begin every run with 5s of flight.', cost: 600, icon: '🚀' },
  { id: 'start-magnet', name: 'COIN MAGNET', desc: 'Begin every run with 6s of magnet.', cost: 600, icon: '🧲' },
  { id: 'double-coins', name: 'COIN DOUBLER', desc: 'All coins are worth double. Forever.', cost: 1500, icon: '💰' },
  { id: 'second-chance', name: 'SECOND CHANCE', desc: 'Survive your first crash of every run.', cost: 1800, icon: '❤' },
];

export const POWERUPS = {
  jetpack: { label: 'JETPACK', duration: 6, icon: '🚀', color: 0x5fe6ff },
  magnet: { label: 'MAGNET', duration: 8, icon: '🧲', color: 0xff5fa8 },
  shield: { label: 'SHIELD', duration: 0, icon: '🛡', color: 0xffcf4a },
  boost: { label: 'BOOST', duration: 5, icon: '⚡', color: 0x6cf08b },
};

export const DIALOGUE = [
  { who: 'VYARUTH', text: 'Bro, Vizag is real. Trust me.' },
  { who: 'FRIEND', text: 'Your girlfriend is still loading...' },
  { who: 'VYARUTH', text: 'USA is 10,000 kilometres away. Keep running.' },
  { who: 'VYARUTH', text: 'Even Google Maps cannot find this girl.' },
  { who: 'VYARUTH', text: 'Mission: Prove the haters wrong.' },
  { who: 'VYARUTH', text: 'Is this a flight or a fitness test?' },
  { who: 'FRIEND', text: 'Send proof. VYARUTH: She doesn\'t do photos.' },
  { who: 'FRIEND', text: 'Bro that girl is a group project.' },
  { who: 'VYARUTH', text: 'Vizag has a name, a face, and a very real WhatsApp status.' },
  { who: 'ANNOUNCER', text: 'Will the passenger running on the wing please sit down.' },
  { who: 'VYARUTH', text: 'I\'m not lost. I\'m taking the scenic route to love.' },
  { who: 'FRIEND', text: 'Vizag replied "k". VYARUTH: She\'s shy.' },
];

export const CRASH_MESSAGES = [
  'Classic Vyaruth. Gravity won again.',
  'That obstacle had a girlfriend too. Sorry.',
  'Vizag would have seen that coming.',
  'The group chat is going to love this.',
  'Note to self: running in the sky is harder than running in arguments.',
  'Even the clouds are judging you now.',
];

export const ENDINGS = [
  {
    id: 'believer', badge: 'ENDING 1 / 4 — TRUE ENDING', title: 'VIZAG EXISTS! (ALMOST CERTAINLY)',
    text: 'The gate opens. A woman steps out, smiles, and says: "Vyaruth? I told you to stop running on airplanes." It is Vizag. She is real. She has been real this whole time. She also asks why he took four years and 3,000 kilometres to say hello. Vyaruth opens his mouth to explain. She hands him a boarding pass back to India. The group chat will NEVER believe him.',
  },
  {
    id: 'excuse', badge: 'ENDING 2 / 4 — PLAUSIBLE', title: 'SHE WAS IN THE NEXT TERMINAL',
    text: 'Vyaruth finds a note on the gate: "Gone to get chai. Back in 2019." The evidence is technically overwhelming and also completely useless. He returns home with 900 coins, a sunburn, and a new excuse. His friends say "sure bro" in the exact tone that means they do not believe him. The mystery survives.',
  },
  {
    id: 'autocorrect', badge: 'ENDING 3 / 4 — SUSPICIOUS', title: 'THE AUTOCORRECT REVEAL',
    text: 'The gate opens to reveal a phone screen. It reads: "Did you mean: Vizag, Andhra Pradesh?" Vyaruth stares. The whole journey: one autocorrect, 3,000 kilometres, and a deeply personal vendetta. Somewhere, a keyboard engineer is getting a very angry email. Vizag was real. Just not the one he thought.',
  },
  {
    id: 'mascot', badge: 'ENDING 4 / 4 — SECRET', title: 'THE AIRPORT MASCOT',
    text: 'With every boarding pass collected, the truth unlocks: Vizag is the unofficial mascot of Gate 3. A life-sized cardboard cutout with a name tag. Vyaruth hugs it. The security guard applauds. The group chat finally believes him, mostly because he posted 400 screenshots. Love is real. cardboard is real. Everything is real.',
  },
];

export function getEnding(stats) {
  if (stats.allPasses && stats.coins >= 500) return ENDINGS[3];
  if (stats.passes >= 9 && stats.coins >= 300 && stats.crashes <= 4) return ENDINGS[0];
  if (stats.coins >= 120) return ENDINGS[1];
  return ENDINGS[2];
}
