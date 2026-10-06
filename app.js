(() => {
'use strict';

/* ================= palette + theory ================= */
const COL = {
  bg: '#15120C', s1: '#201C14', s2: '#2A2419', khaki: '#4A402E',
  rasp: '#D81E5B', grass: '#6DE442', moss: '#578901', mint: '#0BBA94', cream: '#F1EDE0',
};
const FN = {
  T: { c: COL.mint,  ink: COL.bg,   name: 'Tonic' },
  S: { c: COL.grass, ink: COL.bg,   name: 'Subdominant' },
  D: { c: COL.rasp,  ink: '#ffffff', name: 'Dominant' },
  X: { c: COL.cream, ink: COL.bg,   name: 'Outside the key' },
};
const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const IVL = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], dim7: [0, 3, 6, 9] };
const QNAME = { maj: ' major', min: ' minor', dim: ' diminished', aug: ' augmented', dim7: ' diminished 7th' };
const QSUF = { maj: '', min: 'm', dim: '°', aug: '+', dim7: '°7' };
const SPECIAL_TEXT = {
  aug: 'Two stacked major thirds. Perfectly symmetric — it splits the octave into three equal parts, so any of its notes could be the root.',
  dim7: 'Stacked minor thirds that split the octave into four equal parts. Any note can be its root — a pivot into four different keys.',
};

const mod = (n, m) => ((n % m) + m) % m;
const adiff = (a, b) => mod(a - b + 180, 360) - 180;
// position i on the wheel (0 = top, clockwise) <-> pitch class
const outerPc = i => mod(i * 7, 12);
const innerPc = i => mod(i * 7 + 9, 12);
const outerIdx = pc => mod(pc * 7, 12);
const innerIdx = pc => mod((pc - 9) * 7, 12);
const outerRoot = i => (i <= 6 ? SHARP : FLAT)[outerPc(i)];
const innerRoot = i => (i <= 5 ? SHARP : FLAT)[innerPc(i)];
const keyUsesSharps = k => k >= 1 && k <= 6;

// Each chord of a key: interval from the tonic, quality, roman numeral, harmonic function,
// the bubble's visual (shape, count, variant), what it does, and where it likes to go next.
const MAJOR = {
  tonicPc: k => outerPc(k),
  degs: [
    { iv: 0,  q: 'maj', num: 'I',    fn: 'T', viz: ['flower', 6],          text: 'Home base. Stable and resolved — progressions love to start and end here.' },
    { iv: 2,  q: 'min', num: 'ii',   fn: 'S', viz: ['leaf', 2],            text: 'Pre-dominant. Leans gently toward V — the “ii” in jazz’s famous ii–V–I.' },
    { iv: 4,  q: 'min', num: 'iii',  fn: 'T', viz: ['flower', 4, 'slow'],  text: 'A soft, hazy stand-in for the tonic. It bridges I toward vi or IV.' },
    { iv: 5,  q: 'maj', num: 'IV',   fn: 'S', viz: ['leaf', 3],            text: 'Departure. Steps away from home with an open, hopeful lift.' },
    { iv: 7,  q: 'maj', num: 'V',    fn: 'D', viz: ['bud', 8],             text: 'Tension! The strongest pull in music — it wants to resolve back to I.' },
    { iv: 9,  q: 'min', num: 'vi',   fn: 'T', viz: ['flower', 5, 'rev'],   text: 'The relative minor: the same notes as the key with a darker mood.' },
    { iv: 11, q: 'dim', num: 'vii°', fn: 'D', viz: ['star', 5],            text: 'Diminished and unstable. It acts like a dominant and resolves up to I.' },
  ],
  next: [[3, 4, 5, 1], [4, 6], [5, 3], [4, 0, 1], [0, 5], [1, 3], [0, 2]],
  why: [
    'Anything goes from home — IV and V are the strongest moves.',
    'ii loves to move to V.',
    'iii flows naturally into vi or IV.',
    'IV pushes on to V, or relaxes straight back to I.',
    'V wants to resolve to I — or fake you out with vi.',
    'vi slides down a fifth to ii, or lifts to IV.',
    'vii° resolves upward to I.',
  ],
  progs: [
    { name: 'Pop Axis',    degs: [0, 4, 5, 3], text: 'The four chords behind hundreds of hits: home → tension → melancholy → lift.' },
    { name: 'ii–V–I',      degs: [1, 4, 0, 0], text: 'The backbone of jazz. Every move falls one step counter‑clockwise around the wheel.' },
    { name: 'Doo-wop',     degs: [0, 5, 3, 4], text: 'A 1950s staple. Watch the shape hop across the wheel and come back home.' },
    { name: 'Sad Pop',     degs: [5, 3, 0, 4], text: 'The Pop Axis started on its minor chord. Same chords, moodier story.' },
    { name: 'Fifths Fall', degs: [5, 1, 4, 0], text: 'Pure circle motion: each chord steps counter‑clockwise until you land home.' },
    { name: 'Three Chord', degs: [0, 3, 4, 0], text: 'Folk, blues and rock in three chords — Tonic, Subdominant, Dominant.' },
    { name: 'Canon',       degs: [0, 4, 5, 2, 3, 0, 3, 4], text: 'Pachelbel’s Canon. Eight chords that have been reused for 300 years.' },
  ],
};
// Natural minor, plus the major V borrowed from harmonic minor (index 7)
const MINOR = {
  tonicPc: k => innerPc(k),
  degs: [
    { iv: 0,  q: 'min', num: 'i',    fn: 'T', viz: ['flower', 6, 'rev'],  text: 'Home in minor. Darker and more inward than a major tonic, but just as stable.' },
    { iv: 2,  q: 'dim', num: 'ii°',  fn: 'S', viz: ['leaf', 1],           text: 'A fragile, diminished pre-dominant. It leans hard toward V.' },
    { iv: 3,  q: 'maj', num: 'III',  fn: 'T', viz: ['flower', 5],         text: 'The relative major: the same notes as the key, with a brighter, hopeful lift.' },
    { iv: 5,  q: 'min', num: 'iv',   fn: 'S', viz: ['leaf', 3],           text: 'The minor subdominant. A sighing, melancholy step away from home.' },
    { iv: 7,  q: 'min', num: 'v',    fn: 'D', viz: ['bud', 5],            text: 'The natural-minor dominant. Soft and modal — it hints at home without insisting.' },
    { iv: 8,  q: 'maj', num: 'VI',   fn: 'S', viz: ['leaf', 2],           text: 'Warm and bittersweet. A favourite of film scores, ballads and epic choruses.' },
    { iv: 10, q: 'maj', num: 'VII',  fn: 'D', viz: ['bud', 6],            text: 'The subtonic. A bold, rock-flavoured step that loops back up to i.' },
    { iv: 7,  q: 'maj', num: 'V',    fn: 'D', viz: ['bud', 8], extra: true, text: 'Borrowed from harmonic minor. Its raised 7th becomes a leading tone that pulls hard to i.' },
  ],
  next: [[3, 5, 6, 7], [7, 4], [5, 3], [7, 0, 4], [0, 5], [6, 3, 1], [2, 0], [0, 5]],
  why: [
    'From home, iv, VI, VII and V are all strong moves.',
    'ii° wants to fall to V — the classic minor ii°–V–i.',
    'III flows into VI or iv.',
    'iv pushes to V, or sinks straight back to i.',
    'The soft v drifts home to i, or deceptively to VI.',
    'VI leads to VII, iv or ii°.',
    'VII climbs to III, or back up to i.',
    'V resolves home to i — or swerves to VI.',
  ],
  progs: [
    { name: 'Andalusian',  degs: [0, 6, 5, 7], text: 'Flamenco’s famous descent: i → VII → VI → V, stepping down to a dramatic dominant.' },
    { name: 'Epic',        degs: [0, 5, 2, 6], text: 'i → VI → III → VII. The sound of countless film scores and stadium anthems.' },
    { name: 'ii°–V–i',     degs: [1, 7, 0, 0], text: 'The minor-key version of jazz’s ii–V–I, falling around the wheel to home.' },
    { name: 'Rock Minor',  degs: [0, 6, 5, 6], text: 'i → VII → VI → VII. A rolling, riff-driven loop that never quite settles.' },
    { name: 'Lament',      degs: [0, 3, 7, 0], text: 'i → iv → V → i. The borrowed V pulls home much harder than the natural v.' },
    { name: 'Modal',       degs: [0, 3, 4, 0], text: 'i → iv → v → i with no borrowing — a softer, ancient-sounding minor.' },
    { name: 'Sad Ballad',  degs: [0, 5, 3, 7], text: 'i → VI → iv → V. Bittersweet, then tension before returning home.' },
  ],
};
// The feeling of each common move: [mood, what it feels like]
MAJOR.start = ['Home', 'grounded and open — a place to begin'];
MAJOR.moods = {
  '0>3': ['Hopeful lift', 'the room opens up, like stepping outside'],
  '0>4': ['Anticipation', 'a held breath — something is about to happen'],
  '0>5': ['Wistful', 'the light dims into gentle melancholy'],
  '0>1': ['Easy stroll', 'relaxed, forward-moving, unhurried'],
  '0>2': ['Dreamy drift', 'soft focus, like a half-remembered moment'],
  '1>4': ['Gathering momentum', 'the setup before the punchline'],
  '1>6': ['Tightening', 'suspense creeps in at the edges'],
  '2>5': ['Sinking softly', 'a quiet sigh downward'],
  '2>3': ['Blossoming', 'warmth unfolds out of the haze'],
  '3>4': ['Rising tension', 'climbing toward the peak'],
  '3>0': ['Amen', 'a warm, gentle homecoming — church-like and kind'],
  '3>1': ['Reflective', 'a thoughtful pause before moving on'],
  '4>0': ['Resolution', 'tension melts into relief'],
  '4>5': ['Plot twist', 'you expect home and land somewhere sadder'],
  '5>1': ['Melancholy flow', 'falling gently, like leaves'],
  '5>3': ['Yearning', 'sadness reaching up for hope'],
  '6>0': ['Release', 'nervous energy finds solid ground'],
  '6>2': ['Mysterious', 'an unexpected, shadowy landing'],
};
MINOR.start = ['Home in the dark', 'moody and inward — a place to begin'];
MINOR.moods = {
  '0>3': ['Brooding', 'sinking deeper into the shadows'],
  '0>5': ['Bittersweet bloom', 'warmth breaking through the sadness'],
  '0>6': ['Defiant', 'a bold, rocky stride forward'],
  '0>7': ['Dread', 'a storm gathering on the horizon'],
  '1>7': ['Suspense', 'fragile tension on a knife edge'],
  '1>4': ['Uneasy', 'unsettled, never quite safe'],
  '2>5': ['Heroic glow', 'bright, cinematic and wide'],
  '2>3': ['Shadow falls', 'the light fades back to grey'],
  '3>7': ['Drama', 'tension wound to its peak'],
  '3>0': ['Resigned', 'a weary sigh back home'],
  '3>4': ['Ancient', 'modal and folk-like, heavy with history'],
  '4>0': ['Gentle return', 'a soft homecoming that doesn’t insist'],
  '4>5': ['Drifting', 'floats away instead of settling'],
  '5>6': ['Epic ascent', 'rising, triumphant, mountain-top'],
  '5>3': ['Aching', 'the heartache deepens'],
  '5>1': ['Unsettled', 'the ground shifts under your feet'],
  '6>2': ['Triumph', 'bursting out into brightness'],
  '6>0': ['Rock homecoming', 'a strong, defiant return'],
  '7>0': ['Catharsis', 'dark tension finally breaks'],
  '7>5': ['Heartbreak', 'resolution denied — a sad surprise'],
};
const SYS = () => S.minor ? MINOR : MAJOR;

// Any move, even outside the key: curated if we know it, otherwise read from the root motion
function moodOf(from, to) {
  const a = analyse(from), b = analyse(to);
  if (a.deg >= 0 && b.deg >= 0) {
    const m = SYS().moods[`${a.deg}>${b.deg}`];
    if (m) return m;
  }
  if (sameChord(from, to)) return ['Steady', 'holding still and letting it ring'];
  const iv = mod(to.root - from.root, 12);
  const dark = q => q === 'min' || q === 'dim' || q === 'dim7';
  if (iv === 0) return dark(to.q) ? ['Darkening', 'the same root, but the light goes out'] : ['Sunrise', 'the same root turns bright'];
  if (to.q === 'aug') return ['Weightless', 'floating, unresolved, dreamlike'];
  if (to.q === 'dim7') return ['Hair-raising', 'pure suspense — it could go anywhere'];
  if (b.deg < 0) {
    if ([3, 4, 8, 9].includes(iv) && from.q === to.q) return ['Cinematic shift', 'a magical, colourful leap — film-score territory'];
    if (iv === 6) return ['Otherworldly', 'as far as you can travel — strange and striking'];
    return ['Borrowed colour', 'steps outside the key for a splash of surprise'];
  }
  if (iv === 5) return ['Settling', 'falls a fifth — the most natural way to move'];
  if (iv === 7) return ['Lifting', 'climbs a fifth, building energy'];
  if (iv === 2) return ['Stepping up', 'a gentle push forward'];
  if (iv === 10) return ['Stepping down', 'easing back, loosening'];
  if (dark(to.q) && !dark(from.q)) return ['Clouding over', 'shares notes, but the mood turns'];
  if (!dark(to.q) && dark(from.q)) return ['Clearing skies', 'shares notes, and the light comes back'];
  return ['Wandering', 'an open, exploratory move'];
}

/* ================= state ================= */
const S = {
  key: 0, minor: false, view: 'circle', rot: 0, rotTarget: 0, rotVel: 0, dragging: false,
  bloom: 0.35, bloomVel: 0,
  mode: 'explore', current: null, seq: [], sel: -1, bpm: 92, prog: 0, playing: false,
  voices: [], blobA: [0, 120, 240], blobT: [0, 120, 240], blobAlpha: 0, liveAmp: 0, liveUntil: 0,
  waveColor: COL.mint,
};

const noteName = (pc, k = S.key) => (k === 6 && pc === 5) ? 'E♯' : (keyUsesSharps(k) ? SHARP : FLAT)[pc];
// every chord the key offers (in minor this includes the borrowed V)
const keyChords = (k = S.key) => {
  const sys = SYS();
  return sys.degs.map((d, i) => ({ root: mod(sys.tonicPc(k) + d.iv, 12), q: d.q, num: d.num, fn: d.fn, deg: i, viz: d.viz, extra: !!d.extra }));
};
// just the seven chords built on the scale
const diatonic = (k = S.key) => keyChords(k).filter(d => !d.extra);
const sameChord = (a, b) => !!a && !!b && a.root === b.root && a.q === b.q;
function analyse(ch, k = S.key) {
  return keyChords(k).find(d => sameChord(d, ch)) || { root: ch.root, q: ch.q, num: null, fn: 'X', deg: -1 };
}
function rootSpell(ch) {
  if (ch.q === 'maj') return outerRoot(outerIdx(ch.root));
  if (ch.q === 'min') return innerRoot(innerIdx(ch.root));
  return noteName(ch.root);
}
const chordName = ch => rootSpell(ch) + QSUF[ch.q];
const chordFull = ch => rootSpell(ch) + QNAME[ch.q];
const chordPcs = ch => IVL[ch.q].map(v => mod(ch.root + v, 12));
const keyRoot = (k = S.key, minor = S.minor) => minor ? innerRoot(k) : outerRoot(k);
const keyName = () => keyRoot() + (S.minor ? ' minor' : ' major');

const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const buzz = ms => {
  const ua = navigator.userActivation;
  if (!navigator.vibrate || (ua && !ua.hasBeenActive)) return;
  try { navigator.vibrate(ms); } catch (e) {}
};
const retrigger = (node, cls) => { node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls); };

/* ================= persistence ================= */
function save() {
  try { localStorage.setItem('circle5', JSON.stringify({ key: S.key, minor: S.minor, view: S.view, seq: S.seq, bpm: S.bpm, prog: S.prog })); } catch (e) {}
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem('circle5') || 'null');
    if (d) {
      S.key = mod(d.key | 0, 12);
      S.minor = !!d.minor;
      if (['circle', 'tonnetz', 'clock'].includes(d.view)) S.view = d.view;
      S.seq = Array.isArray(d.seq) ? d.seq.filter(c => c && IVL[c.q] && c.root >= 0 && c.root < 12).slice(0, 16) : [];
      S.bpm = Math.min(180, Math.max(48, d.bpm | 0 || 92));
      S.prog = Math.min(SYS().progs.length - 1, Math.max(0, d.prog | 0));
    }
  } catch (e) {}
  S.rotTarget = -S.key * 30;
  S.rot = S.rotTarget + 140; // the wheel unfurls into place on load
}

/* ================= audio ================= */
let AC = null, master, wet;
function initAudio() {
  if (AC) return;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return;
  AC = new Ctor();
  const comp = AC.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 4;
  comp.connect(AC.destination);
  master = AC.createGain(); master.gain.value = 0.6; master.connect(comp);
  const conv = AC.createConvolver(); conv.buffer = impulse(2.8);
  wet = AC.createGain(); wet.gain.value = 0.32; wet.connect(conv); conv.connect(comp);
}
function resumeAudio() { initAudio(); if (AC && AC.state === 'suspended') AC.resume(); }
function impulse(sec) {
  const len = Math.floor(AC.sampleRate * sec), b = AC.createBuffer(2, len, AC.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return b;
}
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function tone(midi, t, dur, vel, bass) {
  const f = mtof(midi);
  const g = AC.createGain(), lp = AC.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = bass ? 700 : 2600; lp.Q.value = 0.3;
  const o1 = AC.createOscillator(); o1.type = 'sine'; o1.frequency.value = f;
  const o2 = AC.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f; o2.detune.value = bass ? 0 : 7;
  const g2 = AC.createGain(); g2.gain.value = bass ? 0.6 : 0.35;
  o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(master);
  if (!bass) lp.connect(wet);
  const rel = bass ? 0.25 : 0.9;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vel, t + 0.015);
  g.gain.setTargetAtTime(vel * 0.55, t + 0.015, 0.3);
  g.gain.setTargetAtTime(0, t + dur, rel / 4);
  const end = t + dur + rel * 1.6;
  o1.start(t); o2.start(t); o1.stop(end); o2.stop(end);
}
function blip() {
  if (!AC) return;
  const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.frequency.value = 1500;
  g.gain.setValueAtTime(0.04, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.06);
}
// close voicing between G#3 and G4 so chord changes move smoothly, plus a bass root
function voicing(ch) {
  const notes = chordPcs(ch).map(pc => { let m = 60 + pc; while (m > 67) m -= 12; while (m < 56) m += 12; return m; }).sort((a, b) => a - b);
  return { notes, bass: 36 + ch.root };
}
function scheduleChord(ch, t, dur, bar) {
  const v = voicing(ch);
  v.notes.forEach((m, j) => tone(m, t + j * 0.014, dur, 0.15, false));
  tone(v.bass, t, bar ? bar * 0.45 : dur, 0.22, true);
  if (bar) tone(v.bass, t + bar / 2, bar * 0.4, 0.15, true);
}
function play(ch, extra) {
  resumeAudio();
  if (AC) scheduleChord(ch, AC.currentTime + 0.01, 1.4);
  showChord(ch, 1.4, extra);
}

/* ================= sequencer ================= */
const Player = {
  timer: null, nextTime: 0, idx: 0, get: null, onStep: null, mode: null,
  start(mode, get, onStep) {
    resumeAudio();
    if (!AC) return;
    this.stop();
    if (!get().length) return;
    Object.assign(this, { mode, get, onStep, idx: 0, nextTime: AC.currentTime + 0.08 });
    S.playing = true;
    this.timer = setInterval(() => this.tick(), 25);
    this.tick();
    updatePlayButtons();
  },
  tick() {
    const list = this.get();
    if (!list.length) { this.stop(); return; }
    const bar = 240 / S.bpm;
    while (this.nextTime < AC.currentTime + 0.15) {
      const i = this.idx % list.length, ch = list[i], at = this.nextTime;
      scheduleChord(ch, at, bar * 0.92, bar);
      setTimeout(() => { if (S.playing) this.onStep(i, ch, bar); }, Math.max(0, (at - AC.currentTime) * 1000));
      this.nextTime += bar;
      this.idx++;
    }
  },
  stop() {
    clearInterval(this.timer);
    this.timer = null;
    S.playing = false;
    updatePlayButtons();
  },
};

/* ================= wheel (SVG) ================= */
const NS = 'http://www.w3.org/2000/svg';
const R = { o1: 198, o0: 144, i0: 100, dots: 75 };
const svg = $('#wheel');
const mk = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const P = (r, a) => { const t = a * Math.PI / 180; return [r * Math.sin(t), -r * Math.cos(t)]; };
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const pt = p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

// an annular sector with soft, rounded corners and an even gap — a petal
function petal(r0, r1, a0, a1, gap, cr) {
  const deg = 180 / Math.PI;
  const go = gap / 2 / r1 * deg, gi = gap / 2 / r0 * deg;
  const A0o = a0 + go, A1o = a1 - go, A0i = a0 + gi, A1i = a1 - gi;
  const co = cr / r1 * deg, ci = cr / r0 * deg;
  const C1 = P(r1, A0o), C2 = P(r1, A1o), C3 = P(r0, A1i), C4 = P(r0, A0i);
  const t = cr / Math.hypot(C3[0] - C2[0], C3[1] - C2[1]);
  return `M${pt(P(r1, A0o + co))}` +
    `A${r1} ${r1} 0 0 1 ${pt(P(r1, A1o - co))}` +
    `Q${pt(C2)} ${pt(lerp2(C2, C3, t))}` +
    `L${pt(lerp2(C3, C2, t))}` +
    `Q${pt(C3)} ${pt(P(r0, A1i - ci))}` +
    `A${r0} ${r0} 0 0 0 ${pt(P(r0, A0i + ci))}` +
    `Q${pt(C4)} ${pt(lerp2(C4, C1, t))}` +
    `L${pt(lerp2(C1, C4, t))}` +
    `Q${pt(C1)} ${pt(P(r1, A0o + co))}Z`;
}
// closed Catmull-Rom curve through points — turns the chord triangle into a soft droplet
function smoothClosed(pts) {
  const n = pts.length;
  let d = `M${pt(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d + 'Z';
}

const defs = mk('defs', {}, svg);
defs.innerHTML = `<radialGradient id="lake"><stop offset="0" stop-color="${COL.s2}"/><stop offset="1" stop-color="${COL.bg}" stop-opacity=".2"/></radialGradient>`;
const vCircle = mk('g', { class: 'view' }, svg);
const wheel = mk('g', {}, vCircle);
mk('circle', { r: R.i0 - 4, fill: 'url(#lake)' }, wheel);
const ringO = mk('g', {}, wheel), ringI = mk('g', {}, wheel);
const ripG = mk('g', {}, wheel);
const blob = mk('path', { class: 'blob', d: 'M0 0Z' }, wheel);
const dotsG = mk('g', {}, wheel);
const segs = [], dots = [];

for (const ring of ['o', 'i']) {
  for (let i = 0; i < 12; i++) {
    const big = ring === 'o';
    const r0 = big ? R.o0 : R.i0, r1 = big ? R.o1 : R.o0;
    const g = mk('g', { class: 'seg', 'data-ring': ring, 'data-i': i }, big ? ringO : ringI);
    const path = mk('path', { d: petal(r0, r1, i * 30 - 15, i * 30 + 15, 5, big ? 15 : 11) }, g);
    const [x, y] = P((r0 + r1) / 2, i * 30);
    const lbl = mk('g', { class: 'lbl' }, g);
    const label = mk('text', { y: -3, 'font-size': big ? 21 : 14.5, 'font-weight': 900 }, lbl);
    const sub = mk('text', { y: big ? 15 : 12, 'font-size': 10.5, 'font-weight': 900 }, lbl);
    segs.push({ ring, i, g, path, lbl, label, sub, x, y, chord: null });
  }
}
for (let i = 0; i < 12; i++) {
  const [x, y] = P(R.dots, i * 30);
  const g = mk('g', { class: 'dotg' }, dotsG);
  const dc = mk('g', { class: 'dc' }, g);
  const circle = mk('circle', { r: 11.5 }, dc);
  const text = mk('text', { 'font-size': 10, 'font-weight': 900 }, dc);
  dots.push({ i, pc: outerPc(i), g, dc, circle, text, x, y });
}

// fixed overlay: the key "window" (I, IV, V + ii, iii, vi + vii°) always sits at the top
const frameD = (() => {
  const a = P(R.o1 + 3, -46), b = P(R.o1 + 3, 46), c = P(R.o0, 46), d = P(R.o0, 76), e = P(R.i0 - 3, 76), f = P(R.i0 - 3, -46);
  return `M${pt(a)}A${R.o1 + 3} ${R.o1 + 3} 0 0 1 ${pt(b)}L${pt(c)}A${R.o0} ${R.o0} 0 0 1 ${pt(d)}L${pt(e)}A${R.i0 - 3} ${R.i0 - 3} 0 0 0 ${pt(f)}Z`;
})();
mk('path', { class: 'frame', d: frameD }, vCircle);
mk('path', { d: 'M0 -199 C -5 -206, -9 -210, 0 -214 C 9 -210, 5 -206, 0 -199Z', fill: COL.grass }, vCircle);
const ripCenter = mk('g', {}, vCircle);
const center = mk('g', { class: 'center' }, vCircle);
const cName = mk('text', { class: 'cname', y: -6, 'font-size': 36, 'font-weight': 900, fill: COL.cream }, center);
const cSub = mk('text', { y: 22, 'font-size': 9.5, 'font-weight': 900, 'letter-spacing': '.16em' }, center);

function ripple(parent, x, y, r, color, n, cls) {
  for (let k = 0; k < n; k++) {
    const c = mk('circle', { cx: x, cy: y, r, class: cls }, parent);
    c.style.stroke = color;
    c.style.animationDelay = `${k * 0.18}s`;
    setTimeout(() => c.remove(), 1800 + k * 180);
  }
}

function updateWheel() {
  const dia = diatonic(), dim = dia.find(d => d.q === 'dim');
  for (const s of segs) {
    let ch = s.ring === 'o' ? { root: outerPc(s.i), q: 'maj' } : { root: innerPc(s.i), q: 'min' };
    if (s.ring === 'i' && ch.root === dim.root) ch = { root: ch.root, q: 'dim' };
    s.chord = ch;
    const a = analyse(ch), f = FN[a.fn], on = sameChord(S.current, ch);
    s.label.textContent = chordName(ch);
    s.sub.textContent = a.num || '';
    if (a.deg >= 0) {
      s.path.style.fill = on ? f.c : hexA(f.c, s.ring === 'o' ? 0.26 : 0.18);
      s.label.style.fill = on ? f.ink : COL.cream;
      s.sub.style.fill = on ? f.ink : f.c;
    } else {
      s.path.style.fill = on ? COL.cream : (s.ring === 'o' ? '#262117' : '#1E1A13');
      s.label.style.fill = on ? COL.bg : 'rgba(241,237,224,.42)';
      s.sub.style.fill = COL.bg;
    }
  }
  const scale = new Set(dia.map(d => d.root));
  const lit = S.current ? chordPcs(S.current) : [];
  const fc = S.current ? FN[analyse(S.current).fn] : FN.T;
  for (const d of dots) {
    const on = lit.includes(d.pc);
    d.text.textContent = noteName(d.pc);
    d.dc.classList.toggle('on', on);
    d.circle.style.fill = on ? fc.c : (scale.has(d.pc) ? '#3A3224' : '#1E1A13');
    d.text.style.fill = on ? fc.ink : (scale.has(d.pc) ? COL.cream : 'rgba(241,237,224,.3)');
  }
  if (S.current) {
    cName.textContent = chordName(S.current);
    const a = analyse(S.current);
    cSub.textContent = a.deg >= 0 ? `${a.num} · ${FN[a.fn].name.toUpperCase()}` : 'OUTSIDE KEY';
    cSub.style.fill = a.deg >= 0 ? FN[a.fn].c : COL.cream;
  } else {
    cName.textContent = keyRoot() + (S.minor ? 'm' : '');
    cSub.textContent = 'HOME KEY';
    cSub.style.fill = COL.grass;
  }
}
const segFor = ch => segs.find(s => sameChord(s.chord, ch));
function placeLabels() {
  const r = -S.rot;
  for (const s of segs) s.lbl.setAttribute('transform', `translate(${s.x} ${s.y}) rotate(${r})`);
  for (const d of dots) d.g.setAttribute('transform', `translate(${d.x} ${d.y}) rotate(${r})`);
}

/* ================= shared view helpers ================= */
// Line a new set of angles up with the current one so shapes glide instead of jumping.
// Equal sizes: best cyclic shift. Different sizes: each new vertex grows out of its nearest old one.
function retarget(curr, tgt) {
  if (!curr.length) return { start: tgt.slice(), tgt: tgt.slice() };
  if (curr.length === tgt.length) {
    let best = tgt, bestCost = Infinity;
    for (let sh = 0; sh < tgt.length; sh++) {
      const cand = tgt.map((_, j) => tgt[(j + sh) % tgt.length]);
      const cost = cand.reduce((acc, t, j) => acc + Math.abs(adiff(t, curr[j])), 0);
      if (cost < bestCost) { bestCost = cost; best = cand; }
    }
    return { start: curr.slice(), tgt: best };
  }
  const near = t => curr.reduce((b, c) => Math.abs(adiff(c, t)) < Math.abs(adiff(b, t)) ? c : b);
  return { start: tgt.map(near), tgt: tgt.slice() };
}
const mixHex = (a, b, t) => {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const ch = sh => Math.round(((x >> sh) & 255) * t + ((y >> sh) & 255) * (1 - t));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
const DARK = '#1A160F';
function act(ch, extra) {
  if (S.mode === 'compose') addToSeq(ch);
  else if (!S.playing) play(ch, extra);
}

/* ================= Tonnetz ================= */
// Fifths run along x, major thirds up-right, minor thirds down-right.
// Up-triangles are major triads, down-triangles are minor; neighbours share two notes.
const TD = 84, TH = TD * Math.sqrt(3) / 2;
const TA = 7, TB = 5; // rendered lattice: a ∈ [-TA, TA], b ∈ [-TB, TB]
const tpos = (a, b) => [a * TD + b * TD / 2, -b * TH];
const tpitch = (a, b) => mod(7 * a + 4 * b, 12);
const PER1 = { da: 4, db: -1 }, PER2 = { da: 0, db: 3 }; // lattice periods (same pitches)

const vTonnetz = mk('g', { class: 'view' }, svg);
const tnLayer = mk('g', {}, vTonnetz);
const tnTriG = mk('g', {}, tnLayer);
const tnShape = mk('path', { class: 'tnshape', d: 'M0 0Z' }, tnLayer);
const tnTrailG = mk('g', { class: 'trail' }, tnLayer);
const tnNodeG = mk('g', {}, tnLayer);
const tnLitG = mk('g', {}, tnLayer);
const tnRipG = mk('g', {}, tnLayer);
const tnLegend = mk('g', { class: 'legend' }, vTonnetz);
tnLegend.innerHTML = `
  <text x="-120" y="197">→ fifths</text>
  <text x="-6" y="197">↗ major 3rds</text>
  <text x="112" y="197">↘ minor 3rds</text>`;

const tris = [], tnodes = [];
const triKey = (a, b, t) => `${a},${b},${t}`;
const triIndex = new Map();
function buildTonnetz() {
  for (let a = -TA; a < TA; a++) {
    for (let b = -TB; b < TB; b++) {
      const p = tpitch(a, b);
      addTri([[a, b], [a + 1, b], [a, b + 1]], { root: p, q: 'maj' }, a, b, 'u');
      addTri([[a + 1, b], [a, b + 1], [a + 1, b + 1]], { root: mod(p + 4, 12), q: 'min' }, a, b, 'd');
    }
  }
  for (let a = -TA; a <= TA; a++) {
    for (let b = -TB; b <= TB; b++) {
      const [x, y] = tpos(a, b);
      const g = mk('g', { class: 'tnode', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, tnNodeG);
      const circle = mk('circle', { r: 12.5 }, g);
      const text = mk('text', { 'font-size': 10.5, 'font-weight': 900 }, g);
      tnodes.push({ a, b, pc: tpitch(a, b), g, circle, text });
    }
  }
}
function addTri(nodes, ch, a, b, t) {
  const pts = nodes.map(n => tpos(...n));
  const c = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
  // inset, then a fat same-colour stroke with round joins = a soft, rounded triangle with gaps.
  // Pulling corners in by 15 moves edges in by 7.5 (inradius = half circumradius); the 10px stroke gives 5 back.
  const inset = pts.map(q => { const dx = q[0] - c[0], dy = q[1] - c[1], d = Math.hypot(dx, dy); return [c[0] + dx * (1 - 15 / d), c[1] + dy * (1 - 15 / d)]; });
  const g = mk('g', { class: 'tri', 'data-n': tris.length }, tnTriG);
  const path = mk('path', { d: `M${pt(inset[0])}L${pt(inset[1])}L${pt(inset[2])}Z` }, g);
  const label = mk('text', { x: c[0].toFixed(1), y: (c[1] - 3).toFixed(1), 'font-size': 12.5, 'font-weight': 900 }, g);
  const sub = mk('text', { x: c[0].toFixed(1), y: (c[1] + 9).toFixed(1), 'font-size': 8.5, 'font-weight': 900 }, g);
  triIndex.set(triKey(a, b, t), tris.length);
  tris.push({ g, path, label, sub, ch, c, a, b, t });
}
function tnUpdate() {
  const map = new Map(keyChords().map(d => [`${d.root}${d.q}`, d]));
  for (const tr of tris) {
    const d = map.get(`${tr.ch.root}${tr.ch.q}`), on = tr.g.classList.contains('on');
    const f = d ? FN[d.fn] : null;
    const fill = on ? (f || FN.X).c : d ? mixHex(f.c, DARK, 0.32) : '#2A241A';
    tr.path.style.fill = fill; tr.path.style.stroke = fill;
    tr.label.textContent = chordName(tr.ch);
    tr.label.style.fill = on ? (f || FN.X).ink : d ? COL.cream : 'rgba(241,237,224,.34)';
    tr.sub.textContent = d ? d.num : '';
    tr.sub.style.fill = on ? (f || FN.X).ink : d ? f.c : 'transparent';
  }
  const scale = new Set(diatonic().map(d => d.root)), tonic = diatonic()[0].root;
  for (const n of tnodes) {
    n.text.textContent = noteName(n.pc);
    n.circle.style.fill = n.pc === tonic ? COL.mint : scale.has(n.pc) ? '#3A3224' : DARK;
    n.text.style.fill = n.pc === tonic ? COL.bg : scale.has(n.pc) ? COL.cream : 'rgba(241,237,224,.32)';
  }
}

// lattice nodes making up a chord whose root sits at (a, b), in [root, …] order — or null
function shapeAt(ch, a, b) {
  const p = tpitch(a, b);
  switch (ch.q) {
    case 'maj':  return p === ch.root ? [[a, b], [a, b + 1], [a + 1, b]] : null;
    case 'min':  return p === mod(ch.root - 4, 12) ? [[a, b + 1], [a + 1, b], [a + 1, b + 1]] : null;
    case 'dim':  return p === ch.root ? [[a, b], [a + 1, b - 1], [a + 2, b - 2]] : null;
    case 'aug':  return p === ch.root ? [[a, b], [a, b + 1], [a, b + 2]] : null;
    case 'dim7': return p === ch.root ? [[a, b], [a + 1, b - 1], [a + 2, b - 2], [a + 3, b - 3]] : null;
  }
  return null;
}
const inRange = ([a, b]) => a >= -TA && a <= TA && b >= -TB && b <= TB;
const centroidOf = pts => [pts.reduce((s, q) => s + q[0], 0) / pts.length, pts.reduce((s, q) => s + q[1], 0) / pts.length];
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
// the copy of a chord nearest to `near` — consecutive chords land on neighbouring triangles
function tnPlace(ch, near) {
  let best = null, bd = Infinity;
  for (let a = -TA; a <= TA; a++) {
    for (let b = -TB; b <= TB; b++) {
      const nodes = shapeAt(ch, a, b);
      if (!nodes || !nodes.every(inRange)) continue;
      const c = centroidOf(nodes.map(n => tpos(...n)));
      const d = dist(c, near);
      if (d < bd) { bd = d; best = { nodes, c, a, b }; }
    }
  }
  return best;
}

const TN = {
  pan: [0, 0], vel: [0, 0], target: null, dragging: false,
  anchor: null, trail: [], on: null,
  shape: { pts: [], tgt: [], pcs: [], color: COL.mint, line: false },
  lit: [],
};
function tnInit() {
  buildTonnetz();
  const home = tnPlace(diatonic()[0], [0, 0]);
  TN.pan = home.c.slice();
  TN.anchor = home.c.slice();
  tnUpdate();
}
function tnSetOn(key) {
  if (TN.on != null && tris[TN.on]) tris[TN.on].g.classList.remove('on');
  TN.on = key == null ? null : triIndex.get(key) ?? null;
  if (TN.on != null) { const g = tris[TN.on].g; g.classList.add('on'); g.parentNode.appendChild(g); retrigger(g, 'pop'); }
  tnUpdate();
}
function tnRecentre() {
  // after a key change, glide to the nearest copy of the new tonic chord
  const home = tnPlace(diatonic()[0], TN.pan);
  if (home) { TN.target = home.c.slice(); TN.anchor = home.c.slice(); }
}
function tnShowChord(ch, f) {
  const place = tnPlace(ch, TN.anchor || TN.pan);
  if (!place) return;
  const pcs = chordPcs(ch);
  const tgt = place.nodes.map(n => tpos(...n));
  // keep shared notes exactly where they are; only the moving note slides
  const prev = TN.shape, used = new Set();
  const start = tgt.map((q, j) => {
    let i = prev.pcs.findIndex((pc, k) => !used.has(k) && pc === pcs[j] && dist(prev.tgt[k] || [1e9, 0], q) < 1);
    if (i < 0) {
      let bd = Infinity;
      prev.pts.forEach((pp, k) => { const d = dist(pp, q); if (!used.has(k) && d < bd) { bd = d; i = k; } });
    }
    if (i >= 0) { used.add(i); return prev.pts[i].slice(); }
    return q.slice();
  });
  TN.shape = { pts: start, tgt, pcs, color: f.c, ink: f.ink, line: !(ch.q === 'maj' || ch.q === 'min'), rested: false };
  tnShape.classList.toggle('line', TN.shape.line);
  tnShape.style.stroke = f.c;
  tnShape.style.fill = hexA(f.c, 0.25);
  // vertex dots carry the note names
  tnLitG.innerHTML = '';
  TN.lit = pcs.map(pc => {
    const g = mk('g', { class: 'tlit' }, tnLitG);
    mk('circle', { r: 14, fill: f.c }, g);
    const t = mk('text', { 'font-size': 11, 'font-weight': 900, fill: f.ink }, g);
    t.textContent = noteName(pc);
    return g;
  });
  tnSetOn(ch.q === 'maj' || ch.q === 'min' ? triKey(place.a, place.b, ch.q === 'maj' ? 'u' : 'd') : null);
  // the path of the progression
  TN.trail.push({ c: place.c.slice(), color: f.c });
  if (TN.trail.length > 7) TN.trail.shift();
  tnDrawTrail();
  ripple(tnRipG, place.c[0], place.c[1], 16, f.c, 3, 'rip');
  TN.anchor = place.c.slice();
  if (!TN.dragging && dist(place.c, TN.target || TN.pan) > 90) TN.target = place.c.slice();
}
function tnDrawTrail() {
  tnTrailG.innerHTML = '';
  const n = TN.trail.length;
  for (let i = 1; i < n; i++) {
    const a = TN.trail[i - 1].c, b = TN.trail[i].c, age = (n - 1 - i) / 6;
    const line = mk('path', { d: `M${pt(a)}L${pt(b)}` }, tnTrailG);
    line.style.stroke = TN.trail[i].color;
    line.style.opacity = (0.9 - age * 0.75).toFixed(2);
  }
  TN.trail.forEach((s, i) => {
    const d = mk('circle', { cx: s.c[0].toFixed(1), cy: s.c[1].toFixed(1), r: i === n - 1 ? 5 : 3.5 }, tnTrailG);
    d.style.fill = s.color;
    d.style.opacity = (1 - (n - 1 - i) / 7).toFixed(2);
  });
}
// pan wraps by lattice periods so you can wander forever
function tnWrap() {
  const shift = (da, db, k) => {
    const [dx, dy] = tpos(da * k, db * k);
    const mv = q => { if (q) { q[0] -= dx; q[1] -= dy; } };
    mv(TN.pan); mv(TN.target); mv(TN.anchor);
    TN.trail.forEach(s => mv(s.c));
    TN.shape.pts.forEach(mv); TN.shape.tgt.forEach(mv);
    if (TN.on != null) {
      const t = tris[TN.on];
      tnSetOn(triKey(t.a - da * k, t.b - db * k, t.t));
    }
    tnDrawTrail();
    tnRipG.innerHTML = '';
  };
  let bL = -TN.pan[1] / TH, aL = (TN.pan[0] - bL * TD / 2) / TD;
  const n = Math.floor((aL + 2) / 4);
  if (n) shift(PER1.da, PER1.db, n);
  bL = -TN.pan[1] / TH;
  const m = Math.floor((bL + 1.5) / 3);
  if (m) shift(PER2.da, PER2.db, m);
}
let tnLastPan = '';
function tnFrame(dt, now) {
  if (S.view !== 'tonnetz') return;
  if (!TN.dragging) {
    if (TN.target) {
      const k = 60, c = 2 * Math.sqrt(k) * 0.85;
      for (let i = 0; i < 2; i++) {
        TN.vel[i] += (k * (TN.target[i] - TN.pan[i]) - c * TN.vel[i]) * dt;
        TN.pan[i] += TN.vel[i] * dt;
      }
      if (dist(TN.pan, TN.target) < 0.05 && Math.hypot(...TN.vel) < 0.05) { TN.pan = TN.target.slice(); TN.vel = [0, 0]; TN.target = null; }
    } else if (Math.hypot(...TN.vel) > 0.5) {
      // momentum after a flick
      const fr = Math.exp(-dt * 4);
      TN.vel = TN.vel.map(v => v * fr);
      TN.pan = TN.pan.map((p, i) => p + TN.vel[i] * dt);
    }
    tnWrap();
  }
  const key = `${TN.pan[0].toFixed(2)},${TN.pan[1].toFixed(2)}`;
  if (key !== tnLastPan) { tnLayer.setAttribute('transform', `translate(${(-TN.pan[0]).toFixed(2)} ${(-TN.pan[1]).toFixed(2)})`); tnLastPan = key; }

  const sh = TN.shape;
  const moving = sh.pts.some((q, i) => Math.abs(sh.tgt[i][0] - q[0]) + Math.abs(sh.tgt[i][1] - q[1]) > 0.05);
  if (sh.pts.length && (moving || S.liveAmp > 0.002 || !sh.rested)) {
    sh.rested = !moving && S.liveAmp <= 0.002;
    const k = Math.min(1, dt * 9);
    const live = S.liveAmp;
    sh.pts = sh.pts.map((q, i) => [q[0] + (sh.tgt[i][0] - q[0]) * k, q[1] + (sh.tgt[i][1] - q[1]) * k]);
    const c = centroidOf(sh.pts);
    // breathe outward a little while the chord sounds
    const pts = sh.pts.map((q, i) => {
      const s = 1 + 0.06 * live * Math.sin(now / 240 + i * 2);
      return [c[0] + (q[0] - c[0]) * s, c[1] + (q[1] - c[1]) * s];
    });
    tnShape.setAttribute('d', `M${pts.map(pt).join('L')}Z`);
    TN.lit.forEach((g, i) => g.setAttribute('transform', `translate(${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}) scale(${(1 + 0.12 * live).toFixed(3)})`));
  }
}

/* ================= Chromatic clock ================= */
// The 12 notes in semitone order: chords and scales become polygons, symmetry becomes visible.
const CK = { r0: 152, r1: 198, node: 132 };
const vClock = mk('g', { class: 'view' }, svg);
const ckSegG = mk('g', {}, vClock);
const ckScale = mk('path', { class: 'cscale', d: 'M0 0Z' }, vClock);
const ckPoly = mk('path', { class: 'cchord', d: 'M0 0Z' }, vClock);
const ckNodeG = mk('g', {}, vClock);
const ckEdgeG = mk('g', { class: 'edges' }, vClock);
const ckRipG = mk('g', {}, vClock);
const ckCenter = mk('g', { class: 'center' }, vClock);
const ckName = mk('text', { class: 'cname', y: -16, 'font-size': 34, 'font-weight': 900, fill: COL.cream }, ckCenter);
const ckIvl = mk('text', { y: 14, 'font-size': 12, 'font-weight': 900, 'letter-spacing': '.08em' }, ckCenter);
const ckNote = mk('text', { y: 32, 'font-size': 9.5, 'font-weight': 800, fill: 'rgba(241,237,224,.6)' }, ckCenter);
const cksegs = [], cknodes = [];
for (let pc = 0; pc < 12; pc++) {
  const g = mk('g', { class: 'seg cseg', 'data-pc': pc }, ckSegG);
  const path = mk('path', { d: petal(CK.r0, CK.r1, pc * 30 - 15, pc * 30 + 15, 5, 13) }, g);
  const [x, y] = P((CK.r0 + CK.r1) / 2, pc * 30);
  const label = mk('text', { x: x.toFixed(1), y: y.toFixed(1), 'font-size': 17, 'font-weight': 900, class: 'cl' }, g);
  cksegs.push({ pc, g, path, label, x, y });
  const [nx, ny] = P(CK.node, pc * 30);
  cknodes.push(mk('circle', { cx: nx.toFixed(1), cy: ny.toFixed(1), r: 3.2, class: 'cnode' }, ckNodeG));
}
const CKS = { ang: [], tgt: [], pcs: [], color: COL.mint, alpha: 0 };
const polyD = angs => angs.length ? `M${angs.map(a => pt(P(CK.node, a))).join('L')}Z` : 'M0 0Z';
function ckUpdate() {
  const scale = diatonic().map(d => d.root), tonic = scale[0], lit = new Set(CKS.pcs);
  const f = FN[S.current ? analyse(S.current).fn : 'T'];
  for (const s of cksegs) {
    const inScale = scale.includes(s.pc), on = lit.has(s.pc);
    s.path.style.fill = on ? CKS.color : s.pc === tonic ? mixHex(COL.mint, DARK, 0.45) : inScale ? mixHex(COL.moss, DARK, 0.42) : '#211C14';
    s.label.textContent = noteName(s.pc);
    s.label.style.fill = on ? (CKS.ink || f.ink) : inScale ? COL.cream : 'rgba(241,237,224,.38)';
  }
  cknodes.forEach((n, pc) => { n.style.fill = scale.includes(pc) ? COL.moss : '#3A3224'; });
  ckScale.setAttribute('d', polyD(scale.slice().sort((a, b) => a - b).map(pc => pc * 30)));
  if (!CKS.pcs.length) {
    ckName.textContent = keyRoot() + (S.minor ? 'm' : '');
    ckIvl.textContent = intervalsOf(scale.slice().sort((a, b) => mod(a - tonic, 12) - mod(b - tonic, 12))).join(' · ');
    ckIvl.style.fill = COL.moss;
    ckNote.textContent = (S.minor ? 'NATURAL MINOR' : 'MAJOR') + ' SCALE · SEMITONES';
  }
}
const intervalsOf = pcs => pcs.map((p, i) => mod(pcs[(i + 1) % pcs.length] - p, 12) || 12);
function ckSetShape(pcs, f, name, note) {
  const m = retarget(CKS.ang, pcs.map(pc => pc * 30).sort((a, b) => a - b));
  Object.assign(CKS, { ang: m.start, tgt: m.tgt, pcs: pcs.slice(), color: f.c, ink: f.ink, rested: false });
  ckPoly.style.stroke = f.c;
  ckPoly.style.fill = hexA(f.c, 0.2);
  const ivl = intervalsOf(pcs);
  ckName.textContent = name;
  retrigger(ckName, 'pop');
  ckIvl.textContent = ivl.join(' · ');
  ckIvl.style.fill = f.c;
  const symmetric = ivl.every(v => v === ivl[0]);
  ckNote.textContent = note || (symmetric
    ? `SYMMETRIC · ONLY ${ivl[0]} TRANSPOSITION${ivl[0] > 1 ? 'S' : ''}`
    : 'SEMITONES BETWEEN NOTES');
  // edge labels
  ckEdgeG.innerHTML = '';
  CKS.edges = m.tgt.map(() => {
    const g = mk('g', {}, ckEdgeG);
    mk('circle', { r: 9 }, g);
    mk('text', { 'font-size': 10, 'font-weight': 900 }, g);
    return g;
  });
  const root = ckSegs(pcs[0]);
  if (root) { root.g.parentNode.appendChild(root.g); retrigger(root.g, 'pop'); ripple(ckRipG, root.x, root.y, 14, f.c, 3, 'rip'); }
  ckUpdate();
}
const ckSegs = pc => cksegs.find(s => s.pc === pc);
function ckShowChord(ch, f) {
  ckSetShape(chordPcs(ch), f, chordName(ch), null);
}
function ckFrame(dt) {
  if (S.view !== 'clock' || !CKS.tgt.length) return;
  const moving = CKS.ang.some((a, i) => Math.abs(adiff(CKS.tgt[i], a)) > 0.02);
  if (!moving && S.liveAmp <= 0.002 && CKS.rested) return;
  CKS.rested = !moving && S.liveAmp <= 0.002;
  const k = Math.min(1, dt * 9);
  CKS.ang = CKS.ang.map((a, i) => a + adiff(CKS.tgt[i], a) * k);
  const r = CK.node * (1 + 0.025 * S.liveAmp * Math.sin(performance.now() / 200));
  ckPoly.setAttribute('d', `M${CKS.ang.map(a => pt(P(r, a))).join('L')}Z`);
  const n = CKS.ang.length;
  (CKS.edges || []).forEach((g, i) => {
    const a = CKS.ang[i], b = CKS.ang[(i + 1) % n];
    const p = P(r, a), q = P(r, b);
    const mx = (p[0] + q[0]) / 2 * 0.86, my = (p[1] + q[1]) / 2 * 0.86;
    g.setAttribute('transform', `translate(${mx.toFixed(1)} ${my.toFixed(1)})`);
    const v = mod(Math.round((CKS.tgt[(i + 1) % n] - CKS.tgt[i]) / 30), 12) || 12;
    const t = g.lastChild;
    if (t.textContent !== String(v)) t.textContent = v;
  });
}
// symmetric shapes and scales, rooted on the current chord (or the tonic)
function ckShape(kind) {
  resumeAudio();
  const root = S.current ? S.current.root : diatonic()[0].root;
  if (kind === 'aug' || kind === 'dim7') { act({ root, q: kind }); return; }
  const tonic = diatonic()[0].root;
  const pcs = kind === 'whole'
    ? [0, 2, 4, 6, 8, 10].map(v => mod(root + v, 12))
    : diatonic().map(d => d.root);
  const start = kind === 'whole' ? root : tonic;
  const f = kind === 'whole' ? { c: COL.grass, ink: COL.bg } : { c: COL.moss, ink: COL.cream };
  const ordered = pcs.slice().sort((a, b) => mod(a - start, 12) - mod(b - start, 12));
  ckSetShape(ordered, f, kind === 'whole' ? 'Whole-tone' : keyName(),
    kind === 'whole' ? 'SYMMETRIC · ONLY 2 TRANSPOSITIONS' : 'THE SCALE’S SHAPE · SEMITONES');
  // arpeggiate up and back to the top note
  if (AC) {
    const notes = ordered.map(pc => 48 + start + mod(pc - start, 12));
    notes.push(notes[0] + 12);
    notes.forEach((m, i) => {
      const t = AC.currentTime + 0.02 + i * 0.16;
      tone(m, t, 0.4, 0.16, false);
      setTimeout(() => { const kEl = keyEls[m]; if (kEl) { retrigger(kEl, 'tap'); setTimeout(() => kEl.classList.remove('tap'), 220); } }, i * 160);
    });
  }
  buzz(8);
}

/* ================= view switching ================= */
const VIEWS = { circle: vCircle, tonnetz: vTonnetz, clock: vClock };
const VIEW_INFO = {
  circle:  { label: 'Circle of fifths', hint: 'Drag the wheel to change key · Hold a chord to make it the home key' },
  tonnetz: { label: 'Tonnetz', hint: 'Drag to wander the lattice · Neighbouring triangles share two notes · Hold one to make it home' },
  clock:   { label: 'Chromatic clock', hint: 'Tap a note for its chord · Hold to make it home · Try the symmetric shapes' },
};
function setView(v, instant) {
  S.view = v;
  for (const k in VIEWS) VIEWS[k].classList.toggle('on', k === v);
  const stage = $('.stage');
  stage.dataset.view = v;
  $$('.vmenu [data-view]').forEach(b => b.setAttribute('aria-selected', b.dataset.view === v));
  $('#viewBtn').innerHTML = $(`.vmenu [data-view="${v}"] i`).innerHTML + '<em>▾</em>';
  $('#viewBtn').setAttribute('aria-label', `View: ${VIEW_INFO[v].label}. Change view`);
  $('#exHint').textContent = VIEW_INFO[v].hint;
  if (v === 'tonnetz' && !instant) tnRecentre();
  TN.shape.rested = false; CKS.rested = false; S.blobRested = false; tnLastPan = '';
  if (!instant) { save(); buzz(8); }
}
function toggleViewMenu(open) {
  const pick = $('.viewpick');
  const isOpen = open ?? !pick.classList.contains('open');
  pick.classList.toggle('open', isOpen);
  $('#viewBtn').setAttribute('aria-expanded', isOpen);
}
$('#viewBtn').addEventListener('click', e => { e.stopPropagation(); toggleViewMenu(); });
$$('.vmenu [data-view]').forEach(b => b.addEventListener('click', e => {
  e.stopPropagation();
  setView(b.dataset.view);
  toggleViewMenu(false);
}));
document.addEventListener('pointerdown', e => { if (!e.target.closest('.viewpick')) toggleViewMenu(false); });
$$('#shapes [data-shape]').forEach(b => b.addEventListener('click', () => ckShape(b.dataset.shape)));

/* ================= piano ================= */
const KLO = 48, KHI = 71, BLACK = new Set([1, 3, 6, 8, 10]);
const keyEls = {};
const piano = $('#piano');
function buildPiano() {
  const whites = [];
  for (let m = KLO; m <= KHI; m++) if (!BLACK.has(m % 12)) whites.push(m);
  const W = 100 / whites.length;
  const addKey = (m, cls, left, width) => {
    const k = document.createElement('div');
    k.className = 'k ' + cls;
    k.style.left = left; k.style.width = width;
    k.innerHTML = '<i></i><b></b>';
    k.addEventListener('pointerdown', e => { e.preventDefault(); tapKey(m); });
    piano.appendChild(k);
    keyEls[m] = k;
  };
  whites.forEach((m, i) => addKey(m, 'w', `calc(${i * W}% + 1.5px)`, `calc(${W}% - 3px)`));
  for (let m = KLO; m <= KHI; m++) {
    if (!BLACK.has(m % 12)) continue;
    const i = whites.indexOf(m - 1);
    addKey(m, 'b', `${(i + 1) * W - W * 0.31}%`, `${W * 0.62}%`);
  }
}
function updatePianoScale() {
  const scale = new Set(diatonic().map(d => d.root));
  for (const m in keyEls) {
    keyEls[m].classList.toggle('sc', scale.has(m % 12));
    keyEls[m].querySelector('b').textContent = noteName(m % 12);
  }
}
let pianoTimer = null;
function pressKeys(ch, f, dur) {
  clearTimeout(pianoTimer);
  piano.style.setProperty('--c', f.c);
  piano.style.setProperty('--ink', f.ink);
  const v = voicing(ch);
  for (const m in keyEls) keyEls[m].classList.remove('down', 'bass');
  v.notes.forEach(m => keyEls[m] && keyEls[m].classList.add('down'));
  const bk = keyEls[v.bass + 12];
  if (bk) bk.classList.add('bass');
  pianoTimer = setTimeout(() => {
    for (const m in keyEls) keyEls[m].classList.remove('down');
  }, dur * 1000);
}
function tapKey(m) {
  resumeAudio();
  if (AC) tone(m, AC.currentTime + 0.005, 0.5, 0.18, false);
  const k = keyEls[m];
  retrigger(k, 'tap');
  setTimeout(() => k.classList.remove('tap'), 260);
  S.voices.push({ f: mtof(m), amp: 0, tgt: 0.8, releaseAt: performance.now() + 500, col: COL.cream });
  buzz(5);
}

/* ================= bubble visuals ================= */
const petalsSVG = (n, len) => Array.from({ length: n }, (_, i) =>
  `<ellipse cx="0" cy="${-len}" rx="${len * 0.52}" ry="${len}" transform="rotate(${(i * 360 / n).toFixed(1)})"/>`).join('');
const leafSVG = (rot, len) =>
  `<path d="M0 30 C ${-len * .55} ${30 - len * .45}, ${-len * .38} ${30 - len * .95}, 0 ${30 - len} C ${len * .38} ${30 - len * .95}, ${len * .55} ${30 - len * .45}, 0 30Z" transform="rotate(${rot} 0 30)"/>`;
const seedsSVG = (n, r) => Array.from({ length: n }, (_, i) => {
  const [x, y] = P(r, i * 360 / n);
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 2 ? 2.4 : 3.4}"/>`;
}).join('');
const BUD = 'M0 -22 C 13 -10, 16 8, 0 18 C -16 8, -13 -10, 0 -22Z';
const STAR = (() => {
  const p = [];
  for (let i = 0; i < 10; i++) p.push(P(i % 2 ? 9 : 21, i * 36));
  return smoothClosed(p); // a softened, prickly star
})();
const DROP = 'M0 -20 C 7 -9, 14 -1, 14 7 A 14 14 0 0 1 -14 7 C -14 -1, -7 -9, 0 -20Z';

const LEAVES = {
  1: [[-8, 48]],
  2: [[-26, 44], [28, 40]],
  3: [[-40, 38], [40, 38], [0, 50]],
};
function vizSVG(a) {
  const rings = r => `<g class="rings"><circle r="${r}"/><circle r="${r}"/><circle r="${r}"/></g>`;
  const pollen = '<g class="pollen"><circle cx="-9" cy="5" r="2.5"/><circle cx="8" cy="-3" r="2.1"/><circle cx="0" cy="11" r="2.3"/></g>';
  const [shape, n, variant] = a.viz || ['drop'];
  let body;
  const len = { 6: 15, 5: 14, 4: 12 }[n] || 14;
  switch (shape) {
    case 'flower': body = `${rings(len - 1)}<g class="res"><g class="spin${variant ? ' ' + variant : ''}">${petalsSVG(n, len)}</g><circle r="${(len * 0.43).toFixed(1)}"/></g>`; break;
    case 'leaf':   body = `<g class="sway"><g class="flut"><g class="grow">${LEAVES[n].map(([r, l]) => leafSVG(r, l)).join('')}</g></g></g>${pollen}`; break;
    case 'bud':    body = `<g class="orb"><g class="orb2">${seedsSVG(n, 31)}</g></g><g class="trem"><g class="tense"><path d="${BUD}"/><circle class="eye" r="4"/></g></g>`; break;
    case 'star':   body = `<g class="orb"><g class="orb2">${seedsSVG(n, 31)}</g></g><g class="trem"><g class="tense"><path d="${STAR}"/><circle class="eye" r="3.5"/></g></g>`; break;
    default:       body = `${rings(10)}<g class="bobv"><path d="${DROP}"/></g>`;
  }
  return `<svg class="viz" viewBox="-50 -50 100 100" aria-hidden="true">${body}</svg>`;
}
function bubble(ch, tag = 'button') {
  const a = analyse(ch), f = FN[a.fn];
  const b = document.createElement(tag);
  b.className = 'bub';
  b.dataset.root = ch.root; b.dataset.q = ch.q; b.dataset.deg = a.deg;
  b.style.setProperty('--c', f.c);
  b.style.setProperty('--ink', f.ink);
  const rr = () => 40 + Math.round(Math.random() * 18);
  b.style.setProperty('--br', `${rr()}% ${rr()}% ${rr()}% ${rr()}% / ${rr()}% ${rr()}% ${rr()}% ${rr()}%`);
  b.innerHTML = `${vizSVG(a)}<span class="num">${a.num || '✦'}</span><span class="nm">${chordName(ch)}</span>`;
  return b;
}

// the "live" state drives every bubble's --amp: motion swells while the chord sounds
let liveTimer = null;
function setLive(els, dur) {
  $$('.bub.live').forEach(e => e.classList.remove('live'));
  els.forEach(e => e && e.classList.add('live'));
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => els.forEach(e => e && e.classList.remove('live')), dur * 1000);
}

/* ================= show a chord ================= */
function showChord(ch, dur, extra = []) {
  const prev = S.current;
  S.current = { root: ch.root, q: ch.q };
  const a = analyse(ch), f = FN[a.fn];
  updateWheel();

  // raindrop: ripples from the petal, and wider rings across the pond
  const seg = segFor(ch);
  if (seg) {
    seg.g.parentNode.appendChild(seg.g);
    retrigger(seg.g, 'pop');
    ripple(ripG, seg.x, seg.y, 14, f.c, 3, 'rip');
  }
  ripple(ripCenter, 0, 0, R.i0, f.c, 3, 'rip big');
  if (!sameChord(prev, ch)) retrigger(cName, 'pop');

  // chord-shape target on the note ring, matched to minimise travel
  const m = retarget(S.blobA, chordPcs(ch).map(pc => outerIdx(pc) * 30).sort((x, y) => x - y));
  S.blobA = m.start; S.blobT = m.tgt; S.blobRested = false;
  tnShowChord(ch, f);
  ckShowChord(ch, f);
  blob.style.fill = hexA(f.c, 0.2);
  blob.style.stroke = f.c;
  S.liveUntil = performance.now() + dur * 1000;

  // wave voices
  const now = performance.now();
  S.voices.forEach(v => { v.tgt = 0; v.releaseAt = 0; });
  voicing(ch).notes.forEach((m, j) => S.voices.push({ f: mtof(m), amp: 0, tgt: 1, releaseAt: now + dur * 1000, col: j === 0 ? f.c : COL.cream }));
  S.waveColor = f.c;

  pressKeys(ch, f, dur);

  const glow = $('#glow');
  glow.style.color = f.c;
  retrigger(glow, 'hit');

  const matching = $$('.chords .bub').filter(b => +b.dataset.root === ch.root && b.dataset.q === ch.q);
  $$('.chords .bub').forEach(b => b.classList.toggle('on', matching.includes(b)));
  setLive([...matching, ...extra], dur);
  updateInfo();
  buzz(8);
}

/* ================= info card ================= */
function updateInfo() {
  const ch = S.current, I = diatonic()[0], sys = SYS();
  let f, badge, title, tag, text, pcs, rootPc;
  if (!ch) {
    f = FN.T; badge = keyRoot() + (S.minor ? 'm' : ''); title = keyName(); tag = 'Home key';
    text = S.minor
      ? `The dotted window holds the chords of ${keyName()} — the same seven notes as its relative major, ${outerRoot(S.key)}. Minor keys also borrow a major V (${chordName(keyChords()[7])}) from harmonic minor for a stronger pull home. Parallel major: ${keyRoot()} major.`
      : `The dotted window holds the seven chords of ${keyName()}. Neighbouring keys share six of their seven notes — that’s why moving by fifths sounds so natural. Relative minor: ${innerRoot(S.key)}m.`;
    pcs = diatonic().map(d => d.root); rootPc = I.root;
  } else {
    const a = analyse(ch);
    f = FN[a.fn]; badge = a.num || '✦'; title = chordFull(ch); tag = a.deg >= 0 ? f.name : 'Outside the key';
    text = a.deg >= 0 ? sys.degs[a.deg].text : SPECIAL_TEXT[ch.q] || `Not in ${keyName()}. A borrowed or chromatic chord — use it for colour and surprise.`;
    if (!sameChord(ch, I)) {
      const n = chordPcs(ch).filter(p => chordPcs(I).includes(p)).length;
      text += n ? ` Shares ${n} note${n > 1 ? 's' : ''} with ${chordName(I)}.` : ` Shares no notes with ${chordName(I)} — a bold move.`;
    }
    pcs = chordPcs(ch); rootPc = ch.root;
  }
  const box = $('#info');
  box.style.setProperty('--c', f.c);
  box.style.setProperty('--ink', f.ink);
  $('#iBadge').textContent = badge;
  $('#iTitle').textContent = title;
  $('#iTag').textContent = tag;
  $('#iText').textContent = text;
  $('#iNotes').innerHTML = pcs.map(pc => `<span class="note${pc === rootPc ? ' root' : ''}">${noteName(pc)}</span>`).join('');
  if (S.mode === 'explore') retrigger(box, 'swap');
}

/* ================= chord rows ================= */
function buildChordRow(container, onTap) {
  container.innerHTML = '';
  const list = keyChords();
  container.style.setProperty('--n', list.length);
  for (const d of list) {
    const b = bubble(d);
    if (sameChord(S.current, d)) b.classList.add('on');
    b.addEventListener('click', () => onTap(d, b));
    container.appendChild(b);
  }
}

/* ================= progressions ================= */
const progChords = () => SYS().progs[S.prog].degs.map(i => keyChords()[i]);
function renderChips() {
  const box = $('#progChips');
  box.innerHTML = '';
  SYS().progs.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'chip' + (i === S.prog ? ' on' : '');
    b.textContent = p.name;
    b.addEventListener('click', () => {
      S.prog = i; save();
      $$('.chip').forEach((c, j) => c.classList.toggle('on', j === i));
      renderSteps(true);
      if (S.playing && Player.mode === 'progress') startProgress();
      else play(progChords()[0], [$('#progSteps').children[0]]);
    });
    box.appendChild(b);
  });
}
function renderSteps(animate) {
  const box = $('#progSteps');
  box.innerHTML = '';
  const list = progChords();
  box.style.setProperty('--n', list.length);
  list.forEach((ch, i) => {
    const t = bubble(ch);
    if (animate) { t.classList.add('enter'); t.style.setProperty('--ed', `${i * 55}ms`); }
    t.addEventListener('click', () => { if (!S.playing) play(ch, [t]); });
    box.appendChild(t);
  });
  $('#progDesc').textContent = SYS().progs[S.prog].text;
}
function startProgress() {
  Player.start('progress', progChords, (i, ch, bar) => showChord(ch, bar * 0.92, [$('#progSteps').children[i]]));
}

/* ================= compose ================= */
function renderSeq(enterIdx = -1) {
  const box = $('#seq');
  box.innerHTML = '';
  S.seq.forEach((ch, i) => {
    const t = bubble(ch);
    if (i === enterIdx) t.classList.add('enter');
    if (i === S.sel) t.classList.add('sel');
    t.addEventListener('click', () => {
      if (S.sel === i) {
        S.seq.splice(i, 1); S.sel = -1; buzz(15);
        renderSeq(); save(); updateSuggest();
      } else {
        S.sel = i;
        $$('#seq .bub').forEach((b, j) => b.classList.toggle('sel', j === i));
        if (!S.playing) play(ch, [t]);
      }
    });
    box.appendChild(t);
  });
  if (S.seq.length < 16) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.textContent = '+';
    box.appendChild(slot);
  }
  $('#seqCount').textContent = `${S.seq.length} / 16`;
  if (enterIdx >= 0) box.scrollTo({ left: box.scrollWidth, behavior: 'smooth' });
  floatCache.n = -1;
}
function addToSeq(ch) {
  if (S.seq.length >= 16) { buzz([20, 40, 20]); return; }
  S.seq.push({ root: ch.root, q: ch.q });
  S.sel = -1;
  renderSeq(S.seq.length - 1);
  if (!S.playing) play(ch, [$('#seq').children[S.seq.length - 1]]);
  save();
  updateSuggest();
}
function updateSuggest() {
  const last = S.seq[S.seq.length - 1];
  const dia = keyChords(), sys = SYS();
  let sugg;
  if (!last) {
    sugg = [0];
  } else {
    const a = analyse(last);
    sugg = a.deg >= 0 ? sys.next[a.deg] : [0, S.minor ? 7 : 4]; // home, or the strong dominant
  }
  const box = $('#suggest');
  box.innerHTML = '';
  sugg.forEach((i, n) => {
    const ch = dia[i], f = FN[ch.fn];
    const [mood, feel] = last ? moodOf(last, ch) : sys.start;
    const card = document.createElement('button');
    card.className = 'moodcard';
    card.style.setProperty('--c', f.c);
    card.style.setProperty('--d', `${(-Math.random() * 9).toFixed(2)}s`);
    card.style.animationDelay = `${n * 50}ms, var(--d)`;
    card.innerHTML = `<span class="mc-top"><b>${chordName(ch)}</b><em>${ch.num}</em></span>` +
      `<span class="mc-mood">${mood}</span><span class="mc-feel">${feel}</span>`;
    card.addEventListener('click', () => addToSeq(ch));
    box.appendChild(card);
  });
  box.scrollLeft = 0;
  setMoodNow(S.seq[S.seq.length - 2], last);
  $$('#coChords .bub').forEach(b => b.classList.toggle('sug', sugg.includes(+b.dataset.deg)));
}
// the feeling of the move you just made (or the one playing right now)
function setMoodNow(from, to) {
  const el = $('#moodNow');
  if (!to) {
    el.innerHTML = '<span class="mn-lead">Pick a first chord</span><span class="mn-feel">— each suggestion shows how the move will feel</span>';
  } else {
    const [mood, feel] = from ? moodOf(from, to) : SYS().start;
    const f = FN[analyse(to).fn];
    el.style.setProperty('--c', f.c);
    el.innerHTML = (from ? `<span class="mn-path">${chordName(from)} → ${chordName(to)}</span>` : `<span class="mn-path">${chordName(to)}</span>`) +
      `<span class="mn-mood">${mood}</span><span class="mn-feel">${feel}</span>`;
  }
  retrigger(el, 'swap');
}
function startCompose() {
  Player.start('compose', () => S.seq, (i, ch, bar) => {
    const tile = $('#seq').children[i];
    showChord(ch, bar * 0.92, [tile]);
    if (S.seq.length > 1) setMoodNow(S.seq[mod(i - 1, S.seq.length)], ch);
    if (tile) tile.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });
}

/* ================= transport ================= */
const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>';
const ICON_STOP = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="4"/></svg>';
function updatePlayButtons() {
  $$('.play').forEach(b => {
    const on = S.playing && Player.mode === b.dataset.play;
    b.classList.toggle('on', on);
    b.innerHTML = on ? `${ICON_STOP}Stop` : `${ICON_PLAY}Play`;
  });
}
function updateBpm() { $$('.bpm-val').forEach(v => { v.innerHTML = `${S.bpm}<small>BPM</small>`; }); }
$$('.play').forEach(b => b.addEventListener('click', () => {
  if (S.playing) { Player.stop(); return; }
  if (b.dataset.play === 'progress') startProgress();
  else if (S.seq.length) startCompose();
  else { buzz([20, 40, 20]); retrigger($('#seq'), 'swap'); }
}));
$$('[data-bpm]').forEach(b => b.addEventListener('click', () => {
  S.bpm = Math.min(180, Math.max(48, S.bpm + +b.dataset.bpm));
  updateBpm(); save(); buzz(5);
}));
$('#undo').addEventListener('click', () => {
  if (!S.seq.length) return;
  S.seq.pop(); S.sel = -1; buzz(12);
  renderSeq(); save(); updateSuggest();
  if (!S.seq.length && S.playing) Player.stop();
});
$('#clear').addEventListener('click', () => {
  if (!S.seq.length) return;
  if (S.playing) Player.stop();
  S.seq = []; S.sel = -1; buzz(25);
  renderSeq(); save(); updateSuggest();
});

/* ================= key changes ================= */
function onKeyChange() {
  const kn = $('#keyName');
  kn.textContent = keyName();
  retrigger(kn, 'flip');
  updateWheel();
  tnUpdate();
  ckUpdate();
  updatePianoScale();
  buildChordRow($('#exChords'), (d, b) => play(d, [b]));
  buildChordRow($('#coChords'), d => addToSeq(d));
  renderSteps(false);
  renderSeq();
  updateSuggest();
  updateInfo();
}
function setKey(k, playTonic, minor = S.minor) {
  k = mod(k, 12);
  const keyWas = S.key, minorWas = S.minor;
  const delta = mod(k - S.key + 6, 12) - 6;
  S.rotTarget = Math.round(S.rotTarget / 30) * 30 - delta * 30;
  const modeChanged = minor !== S.minor;
  if (k !== S.key || modeChanged) {
    S.key = k; S.minor = minor;
    if (modeChanged) { updateModeSwitch(); renderChips(); }
    onKeyChange(); save();
    if (k !== keyWas || minor !== minorWas) tnRecentre();
  }
  if (playTonic && !S.playing) play(diatonic()[0]);
}
// parallel major/minor share a tonic; on the wheel the minor sits three steps anticlockwise
function setMinor(minor) {
  if (minor === S.minor) return;
  resumeAudio();
  buzz(10);
  setKey(S.key + (minor ? -3 : 3), true, minor);
}
function updateModeSwitch() {
  $$('.modesw button').forEach(b => b.classList.toggle('on', (b.dataset.minor === '1') === S.minor));
  $('.modesw').classList.toggle('minor', S.minor);
}
$$('.modesw button').forEach(b => b.addEventListener('click', () => setMinor(b.dataset.minor === '1')));
$('#keyPrev').addEventListener('click', () => { resumeAudio(); setKey(S.key - 1, true); });
$('#keyNext').addEventListener('click', () => { resumeAudio(); setKey(S.key + 1, true); });

/* ================= gestures ================= */
// circle: drag rotates through keys · tonnetz: drag pans the lattice · clock: taps only
// everywhere: tap plays (or adds, in Compose), hold sets the home key
let pd = null;
const angleOf = e => {
  const r = svg.getBoundingClientRect();
  return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
};
const angDiff = adiff;
const svgPt = e => {
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  return [p.x, p.y];
};
const holdTarget = (v, t) => v === 'circle' ? t.closest('.seg') : v === 'tonnetz' ? t.closest('.tri') : t.closest('.cseg');
function holdSetsKey(v, el) {
  if (v === 'circle') return setKey(+el.dataset.i, true, el.dataset.ring === 'i'); // outer → major, inner → minor
  if (v === 'tonnetz') {
    const ch = tris[+el.dataset.n].ch;
    return ch.q === 'maj' ? setKey(outerIdx(ch.root), true, false) : setKey(innerIdx(ch.root), true, true);
  }
  const pc = +el.dataset.pc; // clock keeps the current major/minor choice
  return S.minor ? setKey(innerIdx(pc), true, true) : setKey(outerIdx(pc), true, false);
}
function tapView(v, target) {
  if (v === 'circle') {
    const el = target.closest('.seg'), s = el && segs.find(x => x.g === el);
    if (s) return act(s.chord);
  } else if (v === 'tonnetz') {
    const node = target.closest('.tnode');
    if (node) return tapKey(60 + tnodes.find(n => n.g === node).pc);
    const tri = target.closest('.tri');
    if (tri) return act(tris[+tri.dataset.n].ch);
    return;
  } else {
    const el = target.closest('.cseg');
    if (el) {
      const pc = +el.dataset.pc, ch = diatonic().find(d => d.root === pc);
      return ch ? act(ch) : tapKey(60 + pc); // scale notes play their chord; others a single note
    }
  }
  if (!S.playing) play(S.current || diatonic()[0]);
}

svg.addEventListener('pointerdown', e => {
  resumeAudio();
  const v = S.view, el = holdTarget(v, e.target);
  pd = { id: e.pointerId, v, target: e.target, last: angleOf(e), lastPt: svgPt(e), acc: 0, move: 0, moved: false, long: false, t: performance.now() };
  try { svg.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
  if (el) {
    pd.lp = setTimeout(() => {
      if (!pd || pd.moved) return;
      pd.long = true;
      buzz(25);
      holdSetsKey(v, el);
    }, 480);
  }
});
svg.addEventListener('pointermove', e => {
  if (!pd || e.pointerId !== pd.id) return;
  if (pd.v === 'circle') {
    const a = angleOf(e), d = angDiff(a, pd.last);
    pd.last = a;
    pd.acc += d;
    if (!pd.moved && Math.abs(pd.acc) > 8) {
      pd.moved = true; clearTimeout(pd.lp);
      S.dragging = true; S.rotVel = 0;
      S.rot += pd.acc - d; // catch up the dead-zone
    }
    if (pd.moved) {
      const before = Math.round(S.rot / 30);
      S.rot += d;
      S.rotTarget = S.rot;
      const after = Math.round(S.rot / 30);
      if (before !== after) {
        blip(); buzz(4);
        const k = mod(-after, 12);
        if (k !== S.key) { S.key = k; onKeyChange(); }
      }
    }
  } else if (pd.v === 'tonnetz') {
    const q = svgPt(e), dx = q[0] - pd.lastPt[0], dy = q[1] - pd.lastPt[1];
    const nowT = performance.now(), dts = Math.max(0.008, (nowT - pd.t) / 1000);
    pd.lastPt = q; pd.t = nowT;
    pd.move += Math.hypot(dx, dy);
    if (!pd.moved && pd.move > 8) { pd.moved = true; clearTimeout(pd.lp); TN.dragging = true; TN.target = null; }
    if (pd.moved) {
      TN.pan[0] -= dx; TN.pan[1] -= dy;
      TN.vel = [-dx / dts * 0.6 + TN.vel[0] * 0.4, -dy / dts * 0.6 + TN.vel[1] * 0.4];
    }
  } else {
    const q = svgPt(e);
    pd.move += Math.hypot(q[0] - pd.lastPt[0], q[1] - pd.lastPt[1]);
    pd.lastPt = q;
    if (pd.move > 12) { pd.moved = true; clearTimeout(pd.lp); }
  }
});
function endPointer(e, cancelled) {
  if (!pd || e.pointerId !== pd.id) return;
  clearTimeout(pd.lp);
  if (pd.moved && pd.v === 'circle') {
    S.dragging = false;
    S.rotTarget = Math.round(S.rot / 30) * 30;
    save();
    if (!S.playing) play(diatonic()[0]);
  } else if (pd.moved && pd.v === 'tonnetz') {
    TN.dragging = false;
    if (performance.now() - pd.t > 80) TN.vel = [0, 0]; // held still before letting go: no flick
  } else if (!pd.moved && !cancelled && !pd.long) {
    tapView(pd.v, pd.target);
  }
  pd = null;
}
svg.addEventListener('pointerup', e => endPointer(e, false));
svg.addEventListener('pointercancel', e => endPointer(e, true));

/* ================= tabs / modes ================= */
const MODES = ['explore', 'progress', 'compose'];
function setMode(m) {
  if (m === S.mode) return;
  if (S.playing) Player.stop();
  S.mode = m;
  $('.app').dataset.mode = m;
  activePanel = null;
  const idx = MODES.indexOf(m);
  $$('.panel').forEach(p => {
    const j = MODES.indexOf(p.dataset.mode);
    p.classList.toggle('on', j === idx);
    p.classList.toggle('left', j < idx);
  });
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === m));
  $('#ind').style.transform = `translateX(${idx * 100}%)`;
  if (m === 'progress') renderSteps(true);
  buzz(6);
}
$$('.tab').forEach(t => t.addEventListener('click', () => setMode(t.dataset.tab)));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { resumeAudio(); setKey(S.key - 1, true); }
  else if (e.key === 'ArrowRight') { resumeAudio(); setKey(S.key + 1, true); }
  else if (e.key === 'm' || e.key === 'M') setMinor(!S.minor);
  else if (e.key === 'v' || e.key === 'V') setView(['circle', 'tonnetz', 'clock'][(['circle', 'tonnetz', 'clock'].indexOf(S.view) + 1) % 3]);
  else if (e.key === ' ') {
    e.preventDefault();
    if (S.playing) Player.stop();
    else if (S.mode === 'progress') startProgress();
    else if (S.mode === 'compose' && S.seq.length) startCompose();
    else play(S.current || diatonic()[0]);
  }
});

/* ================= water surface (sine waves) ================= */
const canvases = $$('.wv');
let dpr = 1;
function sizeCanvas(cv) {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(cv.clientWidth * dpr);
  cv.height = Math.round(cv.clientHeight * dpr);
}
const ro = new ResizeObserver(entries => entries.forEach(en => sizeCanvas(en.target)));
canvases.forEach(cv => { ro.observe(cv); sizeCanvas(cv); });

const WIN = 0.021; // seconds of signal across the surface
function surface(xn, now) {
  const T = now / 1000 * 0.006;
  let s = 0, peak = 0;
  for (const v of S.voices) {
    s += v.amp * Math.sin(2 * Math.PI * v.f * (xn * WIN + T));
    if (v.amp > peak) peak = v.amp;
  }
  // a gentle idle swell so the pond is never still
  const idle = (0.22 + 0.06 * Math.sin(now / 1300)) * Math.max(0, 1 - peak);
  return s / 2.4 + Math.sin(xn * Math.PI * 4 + now / 650) * idle;
}
function drawWave(cv, now) {
  const g = cv.getContext('2d'), w = cv.width, h = cv.height;
  if (!w || !h) return;
  g.clearRect(0, 0, w, h);
  const mid = h * 0.42, A = h * 0.32, step = 2 * dpr, col = S.waveColor;

  // faint partials
  const T = now / 1000 * 0.006;
  g.lineWidth = 1.1 * dpr;
  for (const v of S.voices) {
    if (v.amp < 0.01) continue;
    g.strokeStyle = hexA(v.col, 0.3 * v.amp);
    g.beginPath();
    for (let x = 0; x <= w; x += step) {
      const y = mid - Math.sin(2 * Math.PI * v.f * (x / w * WIN + T)) * A * 0.45 * v.amp;
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }

  // the surface itself, with water below
  g.beginPath();
  for (let x = 0; x <= w; x += step) {
    const y = mid - surface(x / w, now) * A;
    x ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.save();
  g.lineTo(w, h); g.lineTo(0, h); g.closePath();
  const water = g.createLinearGradient(0, mid - A, 0, h);
  water.addColorStop(0, hexA(col, 0.22));
  water.addColorStop(1, hexA(col, 0));
  g.fillStyle = water;
  g.fill();
  g.restore();

  g.beginPath();
  for (let x = 0; x <= w; x += step) {
    const y = mid - surface(x / w, now) * A;
    x ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = hexA(col, 0.22); // soft halo (canvas shadowBlur is very slow on phones)
  g.lineWidth = 9 * dpr;
  g.stroke();
  g.strokeStyle = col;
  g.lineWidth = 2.4 * dpr;
  g.stroke();

  // fade both edges into the pond
  g.globalCompositeOperation = 'destination-in';
  const fade = g.createLinearGradient(0, 0, w, 0);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(0.1, 'rgba(0,0,0,1)');
  fade.addColorStop(0.9, 'rgba(0,0,0,1)');
  fade.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = fade;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
}
// bubbles bob on the surface beneath them
const floatCache = { panel: null, n: -1, age: 0, items: [], h: 0 };
function floatBubbles(panel, cv, now) {
  const list = panel.querySelectorAll('.floaty > .bub');
  // re-measure only when the row changes, or every ~half second (scrolling, resizing)
  if (floatCache.panel !== panel || floatCache.n !== list.length || ++floatCache.age > 30) {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    floatCache.items = [...list].map(b => {
      const br = b.getBoundingClientRect();
      return { b, xn: (br.left + br.width / 2 - r.left) / r.width };
    });
    Object.assign(floatCache, { panel, n: list.length, age: 0, h: r.height });
  }
  const A = floatCache.h * 0.32 * 0.55;
  for (const it of floatCache.items) it.b.style.translate = `0 ${(-surface(it.xn, now) * A).toFixed(1)}px`;
}

/* ================= animation loop ================= */
let lastT = performance.now(), lastRot = NaN, lastBloom = NaN, activePanel = null;
function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  // springy wheel rotation + opening bloom
  if (!S.dragging) {
    const k = 150, c = 2 * Math.sqrt(k) * 0.6;
    S.rotVel += (k * (S.rotTarget - S.rot) - c * S.rotVel) * dt;
    S.rot += S.rotVel * dt;
    if (Math.abs(S.rotTarget - S.rot) < 0.01 && Math.abs(S.rotVel) < 0.01) { S.rot = S.rotTarget; S.rotVel = 0; }
  }
  {
    const k = 90, c = 2 * Math.sqrt(k) * 0.5;
    S.bloomVel += (k * (1 - S.bloom) - c * S.bloomVel) * dt;
    S.bloom += S.bloomVel * dt;
    if (Math.abs(1 - S.bloom) < 0.0005 && Math.abs(S.bloomVel) < 0.001) { S.bloom = 1; S.bloomVel = 0; }
  }
  if (S.rot !== lastRot || S.bloom !== lastBloom) {
    wheel.setAttribute('transform', `rotate(${S.rot}) scale(${S.bloom})`);
    placeLabels();
    lastRot = S.rot; lastBloom = S.bloom;
  }

  // voices
  for (const v of S.voices) {
    if (now > v.releaseAt) v.tgt = 0;
    v.amp += (v.tgt - v.amp) * Math.min(1, dt * (v.tgt > v.amp ? 12 : 2.2));
  }
  S.voices = S.voices.filter(v => !(v.tgt === 0 && v.amp < 0.003));

  // chord droplet: morphs between shapes and breathes while sounding
  const pk = Math.min(1, dt * 9);
  S.blobAlpha += ((S.current ? 1 : 0) - S.blobAlpha) * pk;
  S.liveAmp += ((now < S.liveUntil ? 1 : 0) - S.liveAmp) * Math.min(1, dt * 4);
  const blobMoving = S.blobA.some((a, j) => Math.abs(adiff(S.blobT[j], a)) > 0.02);
  S.blobA = S.blobA.map((a, j) => a + adiff(S.blobT[j], a) * pk);
  if (S.view === 'circle' && (blobMoving || S.liveAmp > 0.002 || Math.abs(S.blobAlpha - (S.current ? 1 : 0)) > 0.002 || !S.blobRested)) {
    S.blobRested = !blobMoving && S.liveAmp <= 0.002;
    const pts = S.blobA.map((a, j) => P(R.dots + Math.sin(now / 260 + j * 2.1) * 3.5 * S.liveAmp, a));
    blob.setAttribute('d', smoothClosed(pts));
    blob.style.opacity = S.blobAlpha.toFixed(3);
  }

  tnFrame(dt, now);
  ckFrame(dt, now);

  const panel = activePanel || (activePanel = $('.panel.on')), cv = panel && (panel._wv || (panel._wv = panel.querySelector('.wv')));
  if (cv) { drawWave(cv, now); floatBubbles(panel, cv, now); }
  requestAnimationFrame(frame);
}

/* ================= boot ================= */
load();
tnInit();
setView(S.view, true);
updateModeSwitch();
buildPiano();
renderChips();
onKeyChange();
updatePlayButtons();
updateBpm();
$('#keyName').classList.remove('flip');
requestAnimationFrame(frame);
})();
