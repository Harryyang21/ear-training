const RANGE_PRESETS = {
  beginner: { start: 60, end: 72, label: "Beginner C4-C5" },
  regular: { start: 55, end: 67, label: "Regular G3-G4" },
  advanced: { start: 48, end: 72, label: "Advanced C3-C5" },
};

const BASS_RANGE = { start: 28, end: 48, label: "Bass E1-C3" };

const C_MAJOR_TRIADS = [
  { id: "C", label: "C", midis: [48, 52, 55] },
  { id: "Dm", label: "Dm", midis: [50, 53, 57] },
  { id: "Em", label: "Em", midis: [52, 55, 59] },
  { id: "F", label: "F", midis: [53, 57, 60] },
  { id: "G", label: "G", midis: [55, 59, 62] },
  { id: "Am", label: "Am", midis: [57, 60, 64] },
  { id: "Bdim", label: "B°", midis: [59, 62, 65] },
];

const A_MINOR_TRIADS = [
  { id: "Am", label: "Am", midis: [57, 60, 64] },
  { id: "Bdim", label: "B°", midis: [59, 62, 65] },
  { id: "C", label: "C", midis: [60, 64, 67] },
  { id: "Dm", label: "Dm", midis: [62, 65, 69] },
  { id: "Em", label: "Em", midis: [64, 67, 71] },
  { id: "F", label: "F", midis: [65, 69, 72] },
  { id: "G", label: "G", midis: [67, 71, 74] },
];

const C_MAJOR_SEVENTHS = [
  { id: "Cmaj7", label: "CΔ", midis: [48, 52, 55, 59] },
  { id: "Dm7", label: "Dm7", midis: [50, 53, 57, 60] },
  { id: "Em7", label: "Em7", midis: [52, 55, 59, 62] },
  { id: "Fmaj7", label: "FΔ", midis: [53, 57, 60, 64] },
  { id: "G7", label: "G7", midis: [55, 59, 62, 66] },
  { id: "Am7", label: "Am7", midis: [57, 60, 64, 67] },
  { id: "Bm7b5", label: "Bm7♭5", midis: [59, 62, 65, 69] },
];

const C_MAJOR_PROGRESSIONS = [
  { id: "I-IV-V-I", label: "I–IV–V–I", chordIds: ["C", "F", "G", "C"] },
  { id: "I-V-vi-IV", label: "I–V–vi–IV", chordIds: ["C", "G", "Am", "F"] },
  { id: "ii-V-I", label: "ii–V–I", chordIds: ["Dm", "G", "C"] },
  { id: "I-vi-IV-V", label: "I–vi–IV–V", chordIds: ["C", "Am", "F", "G"] },
];

const INVERSION_LABELS = ["", " 6", " 6/4", " 4/2"];

function inversionMidis(midis, inversion) {
  const sorted = [...midis].sort((a, b) => a - b);
  const count = sorted.length;
  const inv = ((inversion % count) + count) % count;
  const result = [];
  for (let i = 0; i < count; i += 1) {
    let note = sorted[(inv + i) % count];
    if (i > 0) {
      while (note <= result[i - 1]) note += 12;
    }
    result.push(note);
  }
  return result;
}

function expandChordsWithInversions(chords) {
  const expanded = [];
  for (const chord of chords) {
    const count = chord.midis.length;
    for (let inv = 0; inv < count; inv += 1) {
      const suffix = inv === 0 ? "-root" : `-inv${inv}`;
      const invLabel = INVERSION_LABELS[inv] ?? ` inv${inv}`;
      expanded.push({
        id: `${chord.id}${suffix}`,
        label: `${chord.label}${invLabel}`,
        midis: inversionMidis(chord.midis, inv),
        baseId: chord.id,
        inversion: inv,
      });
    }
  }
  return expanded;
}

const CHORD_SETS = {
  "c-major-triads": { label: "C major triads", type: "chord", chords: C_MAJOR_TRIADS },
  "c-major-triads-inv": {
    label: "C major triads + inversions",
    type: "chord",
    chords: expandChordsWithInversions(C_MAJOR_TRIADS),
  },
  "a-minor-triads": { label: "A minor triads", type: "chord", chords: A_MINOR_TRIADS },
  "a-minor-triads-inv": {
    label: "A minor triads + inversions",
    type: "chord",
    chords: expandChordsWithInversions(A_MINOR_TRIADS),
  },
  "c-major-7ths": { label: "C major 7ths", type: "chord", chords: C_MAJOR_SEVENTHS },
  "c-major-7ths-inv": {
    label: "C major 7ths + inversions",
    type: "chord",
    chords: expandChordsWithInversions(C_MAJOR_SEVENTHS),
  },
  progressions: { label: "Progressions", type: "progression", chords: C_MAJOR_TRIADS, progressions: C_MAJOR_PROGRESSIONS },
};

const INTERVAL_DEFS = [
  { id: "m2", label: "m2", semitones: 1 },
  { id: "M2", label: "M2", semitones: 2 },
  { id: "m3", label: "m3", semitones: 3 },
  { id: "M3", label: "M3", semitones: 4 },
  { id: "P4", label: "P4", semitones: 5 },
  { id: "TT", label: "TT", semitones: 6 },
  { id: "P5", label: "P5", semitones: 7 },
  { id: "m6", label: "m6", semitones: 8 },
  { id: "M6", label: "M6", semitones: 9 },
  { id: "m7", label: "m7", semitones: 10 },
  { id: "M7", label: "M7", semitones: 11 },
  { id: "P8", label: "P8", semitones: 12 },
];

const MELODY_MIN_LEN = 3;
const MELODY_MAX_LEN = 5;

function chordSetMidis(setKey) {
  const set = CHORD_SETS[setKey];
  if (!set) return [];
  const midis = new Set();
  for (const chord of set.chords) {
    for (const midi of chord.midis) midis.add(midi);
  }
  return [...midis].sort((a, b) => a - b);
}

function getChordPreloadMidis() {
  const midis = new Set();
  for (const key of Object.keys(CHORD_SETS)) {
    const set = CHORD_SETS[key];
    for (const chord of set.chords) {
      for (const midi of chord.midis) midis.add(midi);
    }
  }
  return [...midis].sort((a, b) => a - b);
}

function getChordSetItems(setKey) {
  const set = CHORD_SETS[setKey];
  if (!set) return { type: "chord", items: C_MAJOR_TRIADS, chordMap: buildChordMap(C_MAJOR_TRIADS) };
  if (set.type === "progression") {
    return { type: "progression", items: set.progressions, chordMap: buildChordMap(set.chords) };
  }
  return { type: "chord", items: set.chords, chordMap: buildChordMap(set.chords) };
}

function buildChordMap(chords) {
  const map = new Map();
  for (const chord of chords) map.set(chord.id, chord);
  return map;
}

function getItemById(items, id) {
  return items.find((item) => item.id === id) ?? null;
}

function chromaticNotes(start, end) {
  const notes = [];
  for (let midi = start; midi <= end; midi += 1) notes.push(midi);
  return notes;
}

function validIntervalRoots(rangeStart, rangeEnd, semitones) {
  const roots = [];
  for (let root = rangeStart; root <= rangeEnd - semitones; root += 1) {
    roots.push(root);
  }
  return roots;
}

function getIntervalById(id) {
  return INTERVAL_DEFS.find((item) => item.id === id) ?? null;
}

function questionEndForInterval(beatSec, style) {
  return style === "melodic" ? beatSec * 2 : beatSec;
}

const REFERENCE_A_SEC = 1.0;
const REFERENCE_A_GAP_SEC = 0.1;
const REFERENCE_A_GAIN = 0.42;

const DIATONIC = new Set([0, 2, 4, 5, 7, 9, 11]);

const SYLLABLE = {
  0: "do",
  2: "re",
  4: "mi",
  5: "fa",
  7: "so",
  9: "la",
  11: "ti",
};

const SYLLABLE_DISPLAY = {
  do: "Do",
  re: "Re",
  mi: "Mi",
  fa: "Fa",
  so: "So",
  la: "La",
  ti: "Ti",
};

const JENNIFER_MIN_MIDI = 48;
const SOLFEGE_MIN_MIDI = 48;
const SOLFEGE_MAX_MIDI = 72;
const BLACK_PC = new Set([1, 3, 6, 8, 10]);
const APP_VERSION = "20260531d";

const IDB_NAME = "earTrainingSamples";
const IDB_STORE = "files";
const IDB_VERSION = 1;

function getPersistentSampleKey(url) {
  const relativePath = relativeAssetPathFromUrl(url);
  return getPersistentSampleKeyForPath(relativePath);
}

function getPersistentSampleKeyForPath(relativePath) {
  if (!relativePath) return null;
  return `${getStoredAudioSource()}:${relativePath}`;
}

function alternateSampleRelativePaths(relativePath) {
  if (/\.wav$/i.test(relativePath)) {
    return [relativePath, relativePath.replace(/\.wav$/i, ".ogg")];
  }
  if (/\.ogg$/i.test(relativePath)) {
    return [relativePath, relativePath.replace(/\.ogg$/i, ".wav")];
  }
  return [relativePath];
}

async function readStoredSampleAny(relativePath) {
  for (const candidate of alternateSampleRelativePaths(relativePath)) {
    const key = getPersistentSampleKeyForPath(candidate);
    if (!key) continue;
    const stored = await readStoredSample(key);
    if (stored) return stored;
  }
  return null;
}

async function openSampleDb() {
  if (!("indexedDB" in globalThis)) return null;
  return new Promise((resolve) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(IDB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function readStoredSample(key) {
  const db = await openSampleDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const request = tx.objectStore(IDB_STORE).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

async function writeStoredSample(key, arrayBuffer) {
  const db = await openSampleDb();
  if (!db) return;
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(arrayBuffer, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore quota errors; network cache may still work.
  }
}

async function requestPersistentStorage() {
  if (navigator.storage?.persist) {
    try {
      await navigator.storage.persist();
    } catch {
      // Best effort only.
    }
  }
}

function isBlackKey(midi) {
  return BLACK_PC.has(midi % 12);
}

function noteLabel(midi) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(midi / 12) - 1;
  return `${names[midi % 12]}${octave}`;
}

function solfegeDisplay(midi) {
  const syllable = SYLLABLE[midi % 12];
  return SYLLABLE_DISPLAY[syllable] || "?";
}

function diatonicNotes(start, end) {
  const notes = [];
  for (let midi = start; midi <= end; midi += 1) {
    if (DIATONIC.has(midi % 12)) {
      notes.push(midi);
    }
  }
  return notes;
}

function isIPv4Host(hostname) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function isIPhone() {
  return /iPhone/i.test(navigator.userAgent);
}

function isIOSDevice() {
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function encodeMonoBufferToWavUrl(buffer) {
  const channel = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const numSamples = channel.length;
  const bytesPerSample = 2;
  const dataSize = numSamples * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    const sample = Math.max(-1, Math.min(1, channel[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return URL.createObjectURL(new Blob([arrayBuffer], { type: "audio/wav" }));
}

function friendlyOrigin() {
  const { protocol, hostname, port } = window.location;
  if (!hostname || isIPv4Host(hostname)) return null;
  const portPart = port ? `:${port}` : "";
  return `${protocol}//${hostname}${portPart}`;
}

const DEFAULT_NUM_NOTES = 300;

const MODE_SUBTITLES = {
  passive: "Two beats · auto reveal",
  interactive: "A440 · one beat · tap to answer",
  bass: "Low bass · A440 · tap to answer",
  chords: "Chords · tap to answer",
  intervals: "Intervals · tap to answer",
  melody: "Melody · replay on keyboard",
};

const PRACTICE_TIME_STORAGE_KEY = "earTrainingPracticeMs";
const ADAPTIVE_STATS_STORAGE_KEY = "earTrainingAdaptiveStats";

const ADAPTIVE_BASE_WEIGHT = 1;
const ADAPTIVE_MIN_WEIGHT = 1;
const ADAPTIVE_MAX_WEIGHT = 3;
const ADAPTIVE_WRONG_WEIGHT_ADD = 0.35;
const ADAPTIVE_BOOST_QUESTIONS = 5;
const ADAPTIVE_BOOST_MULTIPLIER = 1.45;
const ADAPTIVE_STREAK_TO_REDUCE = 3;
const ADAPTIVE_CORRECT_WEIGHT_REDUCE = 0.25;
const ADAPTIVE_RANDOM_MIX = 0.62;

const DAILY_GOAL_MS = 10 * 60 * 1000;
const DAILY_LOG_STORAGE_KEY = "earTrainingDailyLog";
const HEATMAP_WEEKS = 12;

function answerRainbowClass(midi) {
  const pc = midi % 12;
  return DIATONIC.has(pc) ? `rainbow-pc-${pc}` : "";
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function weightedChoice(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return randomChoice(entries.map((entry) => entry.midi));
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.midi;
  }
  return entries[entries.length - 1].midi;
}

function formatPracticeTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

class PracticeTimeTracker {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.totalMs = this.loadStoredMs();
    this.playingCount = 0;
    this.segmentStart = null;
    this.tickId = null;
    this.handlePageHide = this.handlePageHide.bind(this);
    window.addEventListener("pagehide", this.handlePageHide);
    document.addEventListener("visibilitychange", this.handlePageHide);
  }

  loadStoredMs() {
    try {
      return Math.max(0, Number(localStorage.getItem(PRACTICE_TIME_STORAGE_KEY)) || 0);
    } catch {
      return 0;
    }
  }

  persist() {
    try {
      localStorage.setItem(PRACTICE_TIME_STORAGE_KEY, String(Math.floor(this.totalMs)));
    } catch {
      // Ignore private mode storage errors.
    }
  }

  getTotalMs() {
    let ms = this.totalMs;
    if (this.segmentStart != null) {
      ms += performance.now() - this.segmentStart;
    }
    return ms;
  }

  voiceStarted() {
    this.playingCount += 1;
    if (this.playingCount === 1) {
      this.segmentStart = performance.now();
      this.startTick();
      this.onUpdate?.();
    }
  }

  voiceEnded() {
    if (this.playingCount <= 0) return;
    this.playingCount -= 1;
    if (this.playingCount === 0) {
      this.flushSegment();
      this.stopTick();
      this.onUpdate?.();
    }
  }

  resetPlaying() {
    if (this.playingCount <= 0) return;
    this.flushSegment();
    this.playingCount = 0;
    this.stopTick();
    this.onUpdate?.();
  }

  flushSegment() {
    if (this.segmentStart == null) return;
    const elapsed = performance.now() - this.segmentStart;
    this.totalMs += elapsed;
    this.segmentStart = null;
    this.onSegmentFlush?.(elapsed);
    this.persist();
  }

  startTick() {
    if (this.tickId != null) return;
    this.tickId = window.setInterval(() => this.onUpdate?.(), 1000);
  }

  stopTick() {
    if (this.tickId == null) return;
    window.clearInterval(this.tickId);
    this.tickId = null;
  }

  handlePageHide() {
    if (document.visibilityState !== "hidden") return;
    if (this.playingCount > 0 && this.segmentStart != null) {
      this.flushSegment();
      this.segmentStart = performance.now();
    } else {
      this.persist();
    }
    this.onUpdate?.();
  }
}

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

class DailyPracticeLog {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.days = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(DAILY_LOG_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  persist() {
    try {
      localStorage.setItem(DAILY_LOG_STORAGE_KEY, JSON.stringify(this.days));
    } catch {
      // Ignore private mode storage errors.
    }
  }

  addMs(ms) {
    if (ms <= 0) return;
    const key = localDateKey();
    this.days[key] = Math.max(0, (this.days[key] || 0) + ms);
    this.persist();
    this.onUpdate?.();
  }

  getDayMs(key = localDateKey()) {
    return Math.max(0, this.days[key] || 0);
  }

  getTodayMs() {
    return this.getDayMs(localDateKey());
  }

  getStreak(goalMs = DAILY_GOAL_MS) {
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const key = localDateKey(cursor);
      if ((this.days[key] || 0) >= goalMs) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  heatmapCells(weeks = HEATMAP_WEEKS) {
    const cells = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - weeks * 7 + 1);
    for (let i = 0; i < weeks * 7; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const key = localDateKey(day);
      cells.push({ key, ms: this.getDayMs(key) });
    }
    return cells;
  }
}

class AdaptiveLearning {
  constructor(scopeKey) {
    this.scopeKey = scopeKey;
    this.noteStats = this.loadScopeStats();
  }

  loadAllStats() {
    try {
      const raw = localStorage.getItem(ADAPTIVE_STATS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  loadScopeStats() {
    const all = this.loadAllStats();
    if (!all[this.scopeKey] || typeof all[this.scopeKey] !== "object") {
      all[this.scopeKey] = {};
    }
    return all[this.scopeKey];
  }

  defaultNoteStats() {
    return {
      attempts: 0,
      correct: 0,
      streak: 0,
      weight: ADAPTIVE_BASE_WEIGHT,
      boostRemaining: 0,
      totalResponseMs: 0,
    };
  }

  ensureNote(midi) {
    const key = String(midi);
    if (!this.noteStats[key]) {
      this.noteStats[key] = this.defaultNoteStats();
    }
    return this.noteStats[key];
  }

  persist() {
    try {
      const all = this.loadAllStats();
      all[this.scopeKey] = this.noteStats;
      localStorage.setItem(ADAPTIVE_STATS_STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Ignore private mode storage errors.
    }
  }

  tickQuestion() {
    for (const key of Object.keys(this.noteStats)) {
      const stats = this.noteStats[key];
      if (stats.boostRemaining > 0) {
        stats.boostRemaining -= 1;
      }
    }
  }

  weightFor(midi) {
    const stats = this.ensureNote(midi);
    let weight = stats.weight;
    if (stats.boostRemaining > 0) {
      weight *= ADAPTIVE_BOOST_MULTIPLIER;
    }
    return Math.max(0.01, weight);
  }

  pickNote(candidates) {
    if (!candidates.length) return null;
    this.tickQuestion();
    if (Math.random() < ADAPTIVE_RANDOM_MIX) {
      return randomChoice(candidates);
    }
    const entries = candidates.map((midi) => ({
      midi,
      weight: this.weightFor(midi),
    }));
    return weightedChoice(entries);
  }

  recordAnswer(midi, isCorrect, responseMs) {
    const stats = this.ensureNote(midi);
    stats.attempts += 1;
    stats.totalResponseMs += Math.max(0, responseMs);

    if (isCorrect) {
      stats.correct += 1;
      stats.streak += 1;
      if (stats.streak >= ADAPTIVE_STREAK_TO_REDUCE) {
        stats.weight = Math.max(ADAPTIVE_MIN_WEIGHT, stats.weight - ADAPTIVE_CORRECT_WEIGHT_REDUCE);
        stats.streak = 0;
      }
    } else {
      stats.streak = 0;
      stats.weight = Math.min(ADAPTIVE_MAX_WEIGHT, stats.weight + ADAPTIVE_WRONG_WEIGHT_ADD);
      stats.boostRemaining = ADAPTIVE_BOOST_QUESTIONS;
    }

    this.persist();
  }
}

function encodePathSegments(relativePath) {
  return String(relativePath)
    .replace(/^\//, "")
    .split("/")
    .map((part) => (part ? encodeURIComponent(decodeURIComponent(part)) : part))
    .join("/");
}

function buildAssetUrl(root, relativePath) {
  const encodedRelative = encodePathSegments(relativePath);
  const cleanRoot = String(root || "").replace(/\/$/, "");
  if (/^https?:\/\//i.test(cleanRoot)) {
    return `${cleanRoot}/${encodedRelative}`;
  }
  if (!cleanRoot) {
    return `/${encodedRelative}`;
  }
  return `${cleanRoot}/${encodedRelative}`;
}

function encodeAssetPath(path) {
  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path);
    const encodedPath = url.pathname
      .split("/")
      .map((part) => (part ? encodeURIComponent(decodeURIComponent(part)) : part))
      .join("/");
    return `${url.origin}${encodedPath}${url.search}`;
  }
  return encodePathSegments(path);
}

function normalizeSampleRef(sampleRef) {
  let sample = String(sampleRef).replace(/\\/g, "/");
  while (sample.startsWith("../")) {
    sample = sample.slice(3);
  }
  if (!sample.startsWith("samples/")) {
    sample = `samples/${sample.split("/").pop()}`;
  }
  return sample;
}

function normalizeResolvedSamplePath(relativePath) {
  return String(relativePath).replace(
    /^samples\/instruments\/piano\/samples\//,
    "samples/piano/samples/"
  );
}

function instrumentRelativeSamplePath(instrumentId, sampleRef) {
  const root = instrumentId === "piano" ? "samples/piano" : `samples/instruments/${instrumentId}`;
  const ref = String(sampleRef).replace(/\\/g, "/");
  if (ref.includes("..")) {
    const resolved = [];
    for (const part of `${root}/${ref}`.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") resolved.pop();
      else resolved.push(part);
    }
    return normalizeResolvedSamplePath(resolved.join("/"));
  }
  return normalizeResolvedSamplePath(`${root}/${normalizeSampleRef(sampleRef)}`);
}

function assetUrl(relativePath) {
  return buildAssetUrl(getAssetRoot(), relativePath);
}

function getStoredAudioSource() {
  if (isCosHosted() || hasCustomCdn()) return "cos";
  return "local";
}

function assetPath(path) {
  return assetUrl(path);
}

function isCosHosted() {
  return /\.myqcloud\.com$/i.test(location.hostname);
}

function getAssetSourceLabel() {
  if (isCosHosted() || hasCustomCdn()) return "Tencent COS";
  if (getGithubPagesProjectRoot()) return "GitHub Pages";
  return "local";
}

function getCustomCdnUrl() {
  const raw = window.EAR_TRAINING_CUSTOM_CDN ?? window.EAR_TRAINING_CDN ?? "";
  return String(raw).replace(/\/$/, "");
}

function hasCustomCdn() {
  return Boolean(getCustomCdnUrl());
}

function getGithubPagesProjectRoot() {
  if (!location.hostname.endsWith("github.io")) return "";
  const [repo] = location.pathname.split("/").filter(Boolean);
  return repo && !repo.includes(".") ? `/${repo}` : "";
}

function getAssetRoot() {
  if (window.EAR_TRAINING_BASE != null) {
    return String(window.EAR_TRAINING_BASE).replace(/\/$/, "");
  }
  if (isCosHosted()) {
    return "";
  }
  if (hasCustomCdn()) {
    return getCustomCdnUrl();
  }
  const pagesRoot = getGithubPagesProjectRoot();
  if (pagesRoot) return pagesRoot;
  return "";
}

function getAssetLoadRoots() {
  const roots = [];
  const primary = getAssetRoot();
  if (primary) roots.push(primary);

  const pagesRoot = getGithubPagesProjectRoot();
  if (pagesRoot && !roots.includes(pagesRoot)) roots.push(pagesRoot);

  return roots;
}

function joinAssetRoot(root, relativePath) {
  return buildAssetUrl(root, relativePath);
}

function relativeAssetPathFromUrl(url) {
  try {
    const parsed = new URL(url, location.href);
    const jsdelivrMatch = parsed.pathname.match(/\/gh\/[^/]+\/[^/]+@[^/]+\/docs\/(.+)$/);
    if (jsdelivrMatch) {
      return decodeURIComponent(jsdelivrMatch[1].replace(/%2F/gi, "/"));
    }

    const pagesRoot = getGithubPagesProjectRoot();
    if (pagesRoot && parsed.pathname.startsWith(`${pagesRoot}/`)) {
      return decodeURIComponent(parsed.pathname.slice(pagesRoot.length + 1));
    }

    if (window.EAR_TRAINING_CUSTOM_CDN || window.EAR_TRAINING_CDN) {
      const cdnRoot = getCustomCdnUrl();
      const cdnPath = new URL(cdnRoot, location.href).pathname.replace(/\/$/, "");
      if (parsed.pathname.startsWith(`${cdnPath}/`)) {
        return decodeURIComponent(parsed.pathname.slice(cdnPath.length + 1));
      }
    }

    if (parsed.origin === location.origin) {
      const prefix = pagesRoot ? `${pagesRoot}/` : "/";
      if (parsed.pathname.startsWith(prefix)) {
        return decodeURIComponent(parsed.pathname.slice(prefix.length));
      }
    }
  } catch {
    // Fall back to the original URL below.
  }
  return null;
}

function assetLoadUrls(url) {
  const relativePath = relativeAssetPathFromUrl(url);
  if (!relativePath) return [encodeAssetPath(url)];

  const roots = getAssetLoadRoots();

  const seen = new Set();
  const candidates = [];
  for (const root of roots) {
    const candidate = buildAssetUrl(root, relativePath);
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    candidates.push(candidate);
  }
  return candidates.length ? candidates : [encodeAssetPath(url)];
}

function assetLoadUrlsWithFallbacks(url) {
  const urls = [...assetLoadUrls(url)];
  const relativePath = relativeAssetPathFromUrl(url);
  if (relativePath && /\.wav$/i.test(relativePath)) {
    const oggRelative = relativePath.replace(/\.wav$/i, ".ogg");
    for (const candidate of assetLoadUrls(assetUrl(oggRelative))) {
      if (!urls.includes(candidate)) urls.push(candidate);
    }
  }
  return urls;
}

async function fetchTextAsset(relativePath) {
  const urls = assetLoadUrls(assetUrl(relativePath));
  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.text();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error(`Failed to load ${relativePath}`);
}

function parseSfz(text) {
  const regions = [];
  let currentRegion = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//")) continue;
    if (line === "<region>") {
      if (currentRegion?.sample) regions.push(currentRegion);
      currentRegion = {};
      continue;
    }
    if (line.startsWith("<")) continue;
    if (!currentRegion) continue;

    for (const part of line.split(/\s+/)) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const key = part.slice(0, eq);
      const value = part.slice(eq + 1);
      if (["lokey", "hikey", "pitch_keycenter", "key"].includes(key)) {
        currentRegion[key] = Number(value);
      } else if (key === "tune") {
        currentRegion.tune = Number(value);
      } else if (key === "sample") {
        currentRegion.sample = value;
      }
    }
  }

  if (currentRegion?.sample) regions.push(currentRegion);
  return regions.filter((region) => {
    if (!/\.(ogg|wav|flac)$/i.test(region.sample || "")) return false;
    const lo = region.lokey ?? region.key;
    const hi = region.hikey ?? region.key;
    return lo !== undefined && hi !== undefined && lo <= hi;
  });
}

function regionCenter(region) {
  return region.pitch_keycenter ?? region.key ?? region.lokey;
}

function findSampleRegion(regions, midi) {
  let best = null;
  let bestDistance = Infinity;
  for (const region of regions) {
    const lo = region.lokey ?? region.key;
    const hi = region.hikey ?? region.key;
    if (lo === undefined || hi === undefined || midi < lo || midi > hi) continue;
    const distance = Math.abs(midi - regionCenter(region));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = region;
    }
  }
  return best;
}

function findSampleRegionOrNearest(regions, midi) {
  const direct = findSampleRegion(regions, midi);
  if (direct) return direct;
  let best = null;
  let bestDistance = Infinity;
  for (const region of regions) {
    const center = regionCenter(region);
    const distance = Math.abs(midi - center);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = region;
    }
  }
  return best;
}

function solfegeSupported(midi) {
  return midi >= SOLFEGE_MIN_MIDI && midi <= SOLFEGE_MAX_MIDI;
}

const NOTE_BEAT1_GAIN = 1;
const NOTE_ANSWER_GAIN = 0.38;
const HARMONIC_MIX_HEADROOM = 0.82;
const HARMONIC_FADE_IN_SEC = 0.01;
const INSTRUMENT_PEAK_LIMIT = 0.88;
const INSTRUMENT_ATTACK_FADE_MS = 6;
const OUTPUT_MAKEUP_GAIN = 1.14;
const SOLFEGE_GAIN = 0.58;
// Match ear_training.py METRONOME_VOLUME_DB = -20
const METRONOME_GAIN = 0.1;
const METRONOME_FREQ_HZ = 1800;
const METRONOME_DURATION_SEC = 0.012;
const METRONOME_FADE_SEC = 0.01;

const INSTRUMENTS = {
  piano: {
    label: "Piano",
    sfzRel: "samples/piano/UprightPianoKW-20220221.sfz",
    sampleFilter: (sample) => sample.endsWith("vL.ogg"),
  },
  violin: {
    label: "Violin",
    sfzRel: "samples/instruments/violin/instrument.sfz",
    gain: 1.55,
  },
  guitar: {
    label: "Guitar",
    sfzRel: "samples/instruments/guitar/instrument.sfz",
  },
  guzheng: {
    label: "Guzheng",
    sfzRel: "samples/instruments/guzheng/instrument.sfz",
  },
  erhu: {
    label: "Erhu",
    sfzRel: "samples/instruments/erhu/instrument.sfz",
  },
  harp: {
    label: "Harp",
    sfzRel: "samples/instruments/harp/instrument.sfz",
    gain: 1.55,
  },
  saxophone: {
    label: "Saxophone",
    sfzRel: "samples/instruments/saxophone/instrument.sfz",
  },
  bass: {
    label: "Bass",
    sfzRel: "samples/instruments/bass/instrument.sfz",
    gain: 1.15,
    validateMidis: [28, 36, 40, 45, 48],
  },
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.compressor = null;
    this.outputGain = null;
    this.bufferCache = new Map();
    this.trimmedNoteCache = new Map();
    this.allInstrumentRegions = [];
    this.instrumentRegions = [];
    this.instrumentId = "piano";
    this.instrumentGain = 1;
    this.noteBeat1Gain = NOTE_BEAT1_GAIN;
    this.noteAnswerGain = NOTE_ANSWER_GAIN;
    this.clickBuffer = null;
    this.referenceAWavUrl = null;
    this.referenceAAudio = null;
    this.referenceATimer = null;
    this.activeVoices = [];
    this.scheduledSources = [];
    this.mediaStreamDest = null;
    this.bridgeAudio = null;
    this.backgroundActive = false;
    this.resumeWatchdog = null;
    this.loadAbortController = null;
    this.warmPreloadController = null;
    this.instrumentRegionCache = new Map();
    this.playbackKeepalive = null;
    this.practiceTracker = null;
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  connectOutputChain() {
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -22;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.002;
    this.compressor.release.value = 0.1;

    this.outputGain = this.ctx.createGain();
    this.outputGain.gain.value = OUTPUT_MAKEUP_GAIN;

    this.master.connect(this.compressor);
    this.compressor.connect(this.outputGain);

    // Safari/iOS suspends Web Audio on lock screen unless output goes through
    // an HTMLMediaElement backed by a MediaStream.
    if (isIOSDevice()) {
      this.mediaStreamDest = this.ctx.createMediaStreamDestination();
      this.outputGain.connect(this.mediaStreamDest);
      this.bridgeAudio = new Audio();
      this.bridgeAudio.srcObject = this.mediaStreamDest.stream;
      this.bridgeAudio.setAttribute("playsinline", "");
    } else {
      this.outputGain.connect(this.ctx.destination);
    }
  }

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 1;
    this.connectOutputChain();

    await this.setInstrument(this.instrumentId);
    this.clickBuffer = this.createMetronomeClickBuffer();
    this.referenceAWavUrl = encodeMonoBufferToWavUrl(this.createReferenceABuffer());
  }

  async setInstrument(instrumentId) {
    const config = INSTRUMENTS[instrumentId] || INSTRUMENTS.piano;
    this.instrumentId = instrumentId in INSTRUMENTS ? instrumentId : "piano";
    this.instrumentGain = config.gain ?? 1;
    this.noteBeat1Gain = NOTE_BEAT1_GAIN;
    this.noteAnswerGain = NOTE_ANSWER_GAIN;

    let regions = this.instrumentRegionCache.get(this.instrumentId);
    if (!regions) {
      const sfzText = await fetchTextAsset(config.sfzRel).catch((error) => {
        throw new Error(`Failed to load instrument map (${error.message.replace(/^HTTP /, "")})`);
      });
      const allRegions = parseSfz(sfzText);
      regions = allRegions.filter((region) =>
        config.sampleFilter ? config.sampleFilter(region.sample) : true
      );
      if (!regions.length) {
        throw new Error(`No samples found for ${config.label}`);
      }
      this.instrumentRegionCache.set(this.instrumentId, regions);
    }

    this.allInstrumentRegions = regions;
    this.instrumentRegions = regions;
    const checkMidis = config.validateMidis ?? [48, 55, 60, 67, 72];
    for (const midi of checkMidis) {
      if (!findSampleRegion(this.instrumentRegions, midi)) {
        throw new Error(`${config.label} is missing samples for ${noteLabel(midi)}`);
      }
    }
    this.trimmedNoteCache.clear();
  }

  trimClipForBeat(
    buffer,
    wallDurationSec,
    playbackRate = 1,
    maxFadeMs = 80,
    fadeDivisor = 5,
    { attackFadeMs = 0, peakLimit = null } = {}
  ) {
    const sampleRate = buffer.sampleRate;
    const durationMs = wallDurationSec * 1000;
    const fadeMs = Math.min(maxFadeMs, Math.max(1, durationMs / fadeDivisor));
    const totalSamples = Math.min(
      buffer.length,
      Math.ceil(wallDurationSec * playbackRate * sampleRate)
    );
    const fadeSamples = Math.min(
      totalSamples,
      Math.max(1, Math.round((fadeMs / 1000) * sampleRate * playbackRate))
    );
    const attackSamples =
      attackFadeMs > 0
        ? Math.min(
            totalSamples,
            Math.max(1, Math.round((attackFadeMs / 1000) * sampleRate * playbackRate))
          )
        : 0;
    const fadeStart = totalSamples - fadeSamples;
    const trimmed = this.ctx.createBuffer(buffer.numberOfChannels, totalSamples, sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const source = buffer.getChannelData(channel);
      const target = trimmed.getChannelData(channel);
      for (let i = 0; i < totalSamples; i += 1) {
        let gain = 1;
        if (attackSamples > 0 && i < attackSamples) {
          gain = (i + 1) / attackSamples;
        } else if (i >= fadeStart) {
          gain = (totalSamples - i) / fadeSamples;
        }
        target[i] = source[i] * gain;
      }
    }

    if (peakLimit != null && peakLimit > 0) {
      let peak = 0;
      for (let channel = 0; channel < trimmed.numberOfChannels; channel += 1) {
        const data = trimmed.getChannelData(channel);
        for (let i = 0; i < totalSamples; i += 1) {
          peak = Math.max(peak, Math.abs(data[i]));
        }
      }
      if (peak > peakLimit) {
        const scale = peakLimit / peak;
        for (let channel = 0; channel < trimmed.numberOfChannels; channel += 1) {
          const data = trimmed.getChannelData(channel);
          for (let i = 0; i < totalSamples; i += 1) {
            data[i] *= scale;
          }
        }
      }
    }

    return trimmed;
  }

  trimSolfegeForBeat(buffer, durationSec) {
    return this.trimClipForBeat(buffer, durationSec, 1, 80, 5);
  }

  trimInstrumentForBeat(buffer, durationSec, playbackRate) {
    // Match ear_training.PianoSampleBank.get_tone(): fade_out(min(200ms, beat/4))
    return this.trimClipForBeat(buffer, durationSec, playbackRate, 200, 4, {
      attackFadeMs: INSTRUMENT_ATTACK_FADE_MS,
      peakLimit: INSTRUMENT_PEAK_LIMIT,
    });
  }

  haltAudibleOutput() {
    this.stopReferenceA();
    this.stopAllVoices(true);
  }

  resumeOnUserGesture() {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    if (this.bridgeAudio?.paused) {
      void this.bridgeAudio.play().catch(() => {});
    }
  }

  registerVoice(source, gainNode) {
    this.activeVoices.push({ source, gainNode });
    this.scheduledSources.push(source);
    this.practiceTracker?.voiceStarted();
  }

  releaseVoice(source) {
    const voiceIndex = this.activeVoices.findIndex((voice) => voice.source === source);
    if (voiceIndex !== -1) {
      const [voice] = this.activeVoices.splice(voiceIndex, 1);
      try {
        voice.source.disconnect();
        voice.gainNode.disconnect();
      } catch {
        // Already disconnected.
      }
      this.practiceTracker?.voiceEnded();
    }
    const index = this.scheduledSources.indexOf(source);
    if (index !== -1) this.scheduledSources.splice(index, 1);
  }

  stopAllVoices(immediate = true) {
    this.stopReferenceA();
    if (!this.ctx) {
      this.activeVoices = [];
      this.scheduledSources = [];
      return;
    }
    const now = this.ctx.currentTime;
    for (const { source, gainNode } of this.activeVoices) {
      try {
        gainNode.gain.cancelScheduledValues(now);
        if (immediate) {
          const level = Math.max(gainNode.gain.value, 0.001);
          gainNode.gain.setValueAtTime(level, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
          source.stop(now + 0.022);
        } else {
          source.stop();
        }
        source.disconnect();
        gainNode.disconnect();
      } catch {
        // Already stopped.
      }
    }
    this.activeVoices = [];
    this.scheduledSources = [];
    this.practiceTracker?.resetPlaying();
  }

  createMetronomeClickBuffer() {
    // Match ear_training.make_metronome_click(): Sine(1800), 12ms, fade_out(10ms), -20 dB
    const sampleRate = this.ctx.sampleRate;
    const length = Math.max(1, Math.round(METRONOME_DURATION_SEC * sampleRate));
    const fadeSamples = Math.min(
      length,
      Math.max(1, Math.round(METRONOME_FADE_SEC * sampleRate))
    );
    const fadeStart = length - fadeSamples;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      const t = i / sampleRate;
      let env = 1;
      if (i >= fadeStart) {
        env = (length - i) / fadeSamples;
      }
      data[i] = Math.sin(2 * Math.PI * METRONOME_FREQ_HZ * t) * env * METRONOME_GAIN;
    }

    return buffer;
  }

  createReferenceABuffer() {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.max(1, Math.round(REFERENCE_A_SEC * sampleRate));
    const fadeSamples = Math.min(length, Math.max(1, Math.round(0.04 * sampleRate)));
    const fadeStart = length - fadeSamples;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      const t = i / sampleRate;
      let env = 1;
      if (i < fadeSamples) env = i / fadeSamples;
      else if (i >= fadeStart) env = (length - i) / fadeSamples;
      data[i] = Math.sin(2 * Math.PI * 440 * t) * env * REFERENCE_A_GAIN;
    }

    return buffer;
  }

  stopReferenceA() {
    if (this.referenceATimer != null) {
      window.clearTimeout(this.referenceATimer);
      this.referenceATimer = null;
    }
    if (!this.referenceAAudio) return;
    try {
      this.referenceAAudio.onended = null;
      this.referenceAAudio.pause();
      this.referenceAAudio.currentTime = 0;
    } catch {
      // Already stopped.
    }
    this.referenceAAudio = null;
  }

  startReferenceAAudio() {
    if (!this.referenceAWavUrl) return;

    const audio = new Audio(this.referenceAWavUrl);
    audio.setAttribute("playsinline", "");
    audio.preload = "auto";
    this.referenceAAudio = audio;
    audio.onended = () => {
      if (this.referenceAAudio === audio) {
        this.referenceAAudio = null;
      }
    };
    void audio.play().catch(() => {});
  }

  playReferenceA(when) {
    this.stopReferenceA();
    if (!this.referenceAWavUrl) return;

    if (when == null || !this.ctx) {
      this.startReferenceAAudio();
      return;
    }

    const now = this.ctx.currentTime;
    const delayMs = Math.max(0, (Math.max(when, now) - now) * 1000);
    if (delayMs <= 1) {
      this.startReferenceAAudio();
      return;
    }

    this.referenceATimer = window.setTimeout(() => {
      this.referenceATimer = null;
      this.startReferenceAAudio();
    }, delayMs);
  }

  playReferenceANow() {
    this.playReferenceA(null);
  }

  instrumentSamplePath(midi) {
    const region = findSampleRegionOrNearest(this.instrumentRegions, midi);
    if (!region) throw new Error(`No sample for MIDI ${midi}`);
    let relativePath = instrumentRelativeSamplePath(this.instrumentId, region.sample);
    if (this.instrumentId === "piano") {
      relativePath = relativePath.replace(/\.ogg$/i, ".wav");
    }
    return assetUrl(relativePath);
  }

  instrumentPlaybackRate(midi) {
    const region = findSampleRegion(this.instrumentRegions, midi);
    const center = regionCenter(region);
    const semitoneRate = 2 ** ((midi - center) / 12);
    const tuneCents = region.tune ?? 0;
    return semitoneRate * 2 ** (tuneCents / 1200);
  }

  solfegePath(midi) {
    const syllable = SYLLABLE[midi % 12];
    const folder = midi >= JENNIFER_MIN_MIDI ? "jennifer" : "daisy";
    return assetPath(`samples/solfege/${folder}/wav/${String(midi).padStart(3, "0")}-${syllable}.wav`);
  }

  cancelPendingLoads() {
    this.loadAbortController?.abort();
    this.loadAbortController = null;
  }

  cancelWarmPreload() {
    this.warmPreloadController?.abort();
    this.warmPreloadController = null;
  }

  notesPreloadUrls(notes, { includeSolfege = true } = {}) {
    const urls = new Set();
    for (const midi of notes) {
      if (this.hasInstrumentSample(midi)) {
        urls.add(this.instrumentSamplePath(midi));
      }
      if (includeSolfege && solfegeSupported(midi)) {
        urls.add(this.solfegePath(midi));
      }
    }
    return this.sortPreloadUrls([...urls]);
  }

  areNotesPreloaded(notes, { includeSolfege = true } = {}) {
    return this.notesPreloadUrls(notes, { includeSolfege }).every((url) => this.bufferCache.has(url));
  }

  decodeAudioDataSafely(arrayBuffer) {
    const copy = arrayBuffer.slice(0);
    const decodePromise = new Promise((resolve, reject) => {
      this.ctx.decodeAudioData(
        copy,
        (buffer) => resolve(buffer),
        (error) => reject(error ?? new Error("Audio decode failed"))
      );
    });
    if (!isIOSDevice()) return decodePromise;
    const timeoutMs = 15000;
    return Promise.race([
      decodePromise,
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error("Audio decode timed out")), timeoutMs);
      }),
    ]);
  }

  isOggUrl(url) {
    return /\.ogg(?:$|[?#])/i.test(url);
  }

  async decodeFetchedAudio(arrayBuffer, url, { silent = false } = {}) {
    if (isIOSDevice() && !silent) {
      await this.ensurePlayback();
    }
    let buffer = await this.decodeAudioDataSafely(arrayBuffer);
    if (buffer.duration > 1.35) {
      buffer = this.trimAudioBuffer(buffer, 1.2);
    }
    if (isIOSDevice()) {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    }
    return buffer;
  }

  isSolfegeUrl(url) {
    return /\/solfege\//i.test(url);
  }

  hasInstrumentSample(midi) {
    return Boolean(findSampleRegion(this.instrumentRegions, midi));
  }

  notesInstrumentPreloadUrls(notes) {
    const urls = new Set();
    for (const midi of notes) {
      if (!this.hasInstrumentSample(midi)) continue;
      urls.add(this.instrumentSamplePath(midi));
    }
    return this.sortPreloadUrls([...urls]);
  }

  notesSolfegePreloadUrls(notes) {
    const urls = new Set();
    for (const midi of notes) {
      if (!solfegeSupported(midi)) continue;
      urls.add(this.solfegePath(midi));
    }
    return [...urls].sort((a, b) => a.localeCompare(b));
  }

  async preloadUrls(list, concurrency, onProgress, signal, progressState, { silent = false, continueOnError = false } = {}) {
    for (let i = 0; i < list.length; i += concurrency) {
      if (signal?.aborted) {
        throw new Error("Loading cancelled");
      }
      const batch = list.slice(i, i + concurrency);
      for (const url of batch) {
        if (signal?.aborted) {
          throw new Error("Loading cancelled");
        }
        if (this.bufferCache.has(url)) {
          progressState.done += 1;
          onProgress?.(progressState.done, progressState.total, url, { fromCache: true });
          continue;
        }
        onProgress?.(progressState.done, progressState.total, url, { fromCache: false });
        try {
          const fromCache = await this.loadBuffer(url, { signal, silent });
          progressState.done += 1;
          onProgress?.(progressState.done, progressState.total, url, { fromCache });
        } catch (error) {
          if (continueOnError) {
            progressState.done += 1;
            onProgress?.(progressState.done, progressState.total, url, { fromCache: false, failed: true });
            continue;
          }
          throw error;
        }
        if (isIPhone()) {
          await new Promise((resolve) => window.setTimeout(resolve, 0));
        }
      }
    }
  }

  clearSampleCache() {
    this.bufferCache.clear();
    this.trimmedNoteCache.clear();
    this.instrumentRegionCache.clear();
  }

  async collectAllPreloadUrls(notes) {
    const instrumentUrls = new Set();
    const savedId = this.instrumentId;

    for (const instrumentId of Object.keys(INSTRUMENTS)) {
      await this.setInstrument(instrumentId);
      for (const url of this.notesInstrumentPreloadUrls(notes)) {
        instrumentUrls.add(url);
      }
    }

    await this.setInstrument(savedId);
    const solfegeUrls = this.notesSolfegePreloadUrls(notes);
    return this.sortPreloadUrls([...instrumentUrls, ...solfegeUrls]);
  }

  rememberDecodedBuffer(url, tryUrl, audioBuffer) {
    this.bufferCache.set(url, audioBuffer);
    this.bufferCache.set(tryUrl, audioBuffer);
  }

  async loadBuffer(url, { signal = null, silent = false } = {}) {
    if (this.bufferCache.has(url)) return true;
    if (signal?.aborted) {
      throw new Error("Loading cancelled");
    }

    const canonicalRelative = relativeAssetPathFromUrl(url);
    const storeKey = getPersistentSampleKeyForPath(canonicalRelative);
    if (canonicalRelative) {
      try {
        const stored = await readStoredSampleAny(canonicalRelative);
        if (stored) {
          const audioBuffer = await this.decodeFetchedAudio(stored, url, { silent });
          this.rememberDecodedBuffer(url, url, audioBuffer);
          return true;
        }
      } catch (error) {
        if (signal?.aborted || error?.name === "AbortError") {
          throw new Error("Loading cancelled");
        }
      }
    }

    let lastError = null;
    for (const tryUrl of assetLoadUrlsWithFallbacks(url)) {
      if (this.bufferCache.has(tryUrl)) {
        const cached = this.bufferCache.get(tryUrl);
        this.bufferCache.set(url, cached);
        return true;
      }
      if (signal?.aborted) {
        throw new Error("Loading cancelled");
      }

      try {
        const response = await fetch(tryUrl, { signal });
        if (!response.ok) {
          lastError = new Error(`Failed to load ${tryUrl} (${response.status})`);
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();
        if (storeKey) {
          await writeStoredSample(storeKey, arrayBuffer);
        }
        const audioBuffer = await this.decodeFetchedAudio(arrayBuffer, tryUrl, { silent });
        this.rememberDecodedBuffer(url, tryUrl, audioBuffer);
        return false;
      } catch (error) {
        if (signal?.aborted || error?.name === "AbortError") {
          throw new Error("Loading cancelled");
        }
        lastError = error;
      }
    }

    throw lastError ?? new Error(`Failed to load ${url}`);
  }

  sortPreloadUrls(urls) {
    return [...urls].sort((a, b) => {
      const aOgg = a.endsWith(".ogg");
      const bOgg = b.endsWith(".ogg");
      if (aOgg !== bOgg) return aOgg ? 1 : -1;
      return a.localeCompare(b);
    });
  }

  async preloadNotes(notes, beatSec, onProgress, signal = null, { includeSolfege = true } = {}) {
    const instrumentUrls = this.notesInstrumentPreloadUrls(notes);
    const solfegeUrls = includeSolfege ? this.notesSolfegePreloadUrls(notes) : [];
    const total = instrumentUrls.length + solfegeUrls.length;
    const progressState = { done: 0, total };
    const wavConcurrency = isIPhone() ? 1 : 6;
    const oggConcurrency = isIPhone() ? 1 : 3;

    const instrumentWav = instrumentUrls.filter((url) => !this.isOggUrl(url));
    const instrumentOgg = instrumentUrls.filter((url) => this.isOggUrl(url));

    await this.preloadUrls(instrumentWav, wavConcurrency, onProgress, signal, progressState);
    await this.preloadUrls(instrumentOgg, oggConcurrency, onProgress, signal, progressState);
    await this.preloadUrls(solfegeUrls, wavConcurrency, onProgress, signal, progressState);

    for (const midi of notes) {
      if (this.hasInstrumentSample(midi)) {
        this.getTrimmedNoteBuffer(midi, beatSec);
      }
      if (includeSolfege && solfegeSupported(midi)) {
        this.getTrimmedSolfegeBuffer(midi, beatSec);
      }
    }
  }

  warmPreloadNotes(notes, beatSec) {
    if (!notes.length) return;
    const instrumentUrls = this.notesInstrumentPreloadUrls(notes);
    if (instrumentUrls.every((url) => this.bufferCache.has(url))) return;
    this.cancelWarmPreload();
    this.warmPreloadController = new AbortController();
    const signal = this.warmPreloadController.signal;
    const progressState = { done: 0, total: instrumentUrls.length };
    const concurrency = isIPhone() ? 1 : 4;
    void this.preloadUrls(instrumentUrls, concurrency, null, signal, progressState).catch(() => {
      // Ignore background preload errors; Start will retry.
    });
  }

  trimAudioBuffer(buffer, sourceDurationSec) {
    const sampleRate = buffer.sampleRate;
    const totalSamples = Math.max(
      1,
      Math.min(buffer.length, Math.ceil(sourceDurationSec * sampleRate))
    );
    if (totalSamples >= buffer.length) {
      return buffer;
    }

    const trimmed = this.ctx.createBuffer(buffer.numberOfChannels, totalSamples, sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      trimmed.getChannelData(channel).set(buffer.getChannelData(channel).subarray(0, totalSamples));
    }
    return trimmed;
  }

  getTrimmedSolfegeBuffer(midi, durationSec) {
    const url = this.solfegePath(midi);
    const cacheKey = `solfege@${url}@${durationSec.toFixed(4)}`;
    if (this.trimmedNoteCache.has(cacheKey)) {
      return this.trimmedNoteCache.get(cacheKey);
    }

    const sourceBuffer = this.bufferCache.get(url);
    if (!sourceBuffer) throw new Error(`Solfege sample not preloaded: ${url}`);
    const trimmed = this.trimSolfegeForBeat(sourceBuffer, durationSec);
    this.trimmedNoteCache.set(cacheKey, trimmed);
    return trimmed;
  }

  getTrimmedNoteBuffer(midi, durationSec) {
    const url = this.instrumentSamplePath(midi);
    const playbackRate = this.instrumentPlaybackRate(midi);
    const cacheKey = `${this.instrumentId}@${url}@${durationSec.toFixed(4)}@${playbackRate.toFixed(4)}`;
    if (this.trimmedNoteCache.has(cacheKey)) {
      return this.trimmedNoteCache.get(cacheKey);
    }

    const sourceBuffer = this.bufferCache.get(url);
    if (!sourceBuffer) throw new Error(`Sample not preloaded: ${url}`);
    const trimmed = this.trimInstrumentForBeat(sourceBuffer, durationSec, playbackRate);
    this.trimmedNoteCache.set(cacheKey, trimmed);
    return trimmed;
  }

  playBuffer(
    buffer,
    when,
    {
      gain = 1,
      playbackRate = 1,
      fadeIn = 0,
    } = {},
    output = this.master
  ) {
    const source = this.ctx.createBufferSource();
    const gainNode = this.ctx.createGain();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    if (fadeIn > 0) {
      gainNode.gain.setValueAtTime(0, when);
      gainNode.gain.linearRampToValueAtTime(gain, when + fadeIn);
    } else {
      gainNode.gain.setValueAtTime(gain, when);
    }

    source.connect(gainNode).connect(output);
    source.start(when);
    this.registerVoice(source, gainNode);
    source.onended = () => {
      this.releaseVoice(source);
    };

    return source;
  }

  stopAllScheduled() {
    this.stopAllVoices(true);
  }

  onVisibilityChange() {
    if (!this.backgroundActive) return;
    this.ensurePlayback();
  }

  async ensurePlayback() {
    if (!this.ctx) return false;
    try {
      if (navigator.audioSession?.type !== undefined) {
        navigator.audioSession.type = "playback";
      }
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
      if (this.bridgeAudio?.paused) {
        await this.bridgeAudio.play();
      }
      return this.ctx.state === "running";
    } catch {
      return false;
    }
  }

  startPlaybackKeepalive() {
    this.stopPlaybackKeepalive();
    if (!isIOSDevice()) return;
    this.playbackKeepalive = window.setInterval(() => {
      void this.ensurePlayback();
    }, 1500);
  }

  stopPlaybackKeepalive() {
    if (this.playbackKeepalive !== null) {
      window.clearInterval(this.playbackKeepalive);
      this.playbackKeepalive = null;
    }
  }

  startBackgroundMode() {
    if (this.backgroundActive || !this.ctx) return;
    this.backgroundActive = true;

    void this.ensurePlayback();

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "Ear Training",
        artist: "Ear Training",
      });
      navigator.mediaSession.playbackState = "playing";
      try {
        navigator.mediaSession.setActionHandler("play", () => {
          void this.ensurePlayback();
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          void this.ensurePlayback();
        });
      } catch {
        // Some Safari versions reject action handlers.
      }
    }

    document.addEventListener("visibilitychange", this.onVisibilityChange);
    window.addEventListener("pageshow", this.onVisibilityChange);
    window.addEventListener("focus", this.onVisibilityChange);

    this.resumeWatchdog = window.setInterval(() => {
      if (this.backgroundActive) {
        void this.ensurePlayback();
      }
    }, 800);
  }

  stopBackgroundMode() {
    if (!this.backgroundActive) return;
    this.backgroundActive = false;
    this.stopPlaybackKeepalive();

    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    window.removeEventListener("pageshow", this.onVisibilityChange);
    window.removeEventListener("focus", this.onVisibilityChange);

    if (this.resumeWatchdog !== null) {
      window.clearInterval(this.resumeWatchdog);
      this.resumeWatchdog = null;
    }

    if (this.bridgeAudio) {
      this.bridgeAudio.pause();
    }

    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      } catch {
        // Ignore cleanup failures.
      }
    }
  }

  async playNote(midi, when, durationSec) {
    const url = this.instrumentSamplePath(midi);
    await this.loadBuffer(url);
    const buffer = this.bufferCache.get(url);
    if (!buffer) throw new Error(`Sample not loaded: ${url}`);
    this.scheduleNoteBuffer(buffer, midi, when, durationSec);
  }

  simultaneousVoiceGain(voiceCount, baseGain = 1) {
    if (voiceCount <= 1) return baseGain;
    // Peak-safe linear mix: overlapping attacks add in amplitude, not RMS.
    return (baseGain * HARMONIC_MIX_HEADROOM) / voiceCount;
  }

  scheduleSimultaneousNotes(midis, when, durationSec, gain = 1) {
    const voiceGain = this.simultaneousVoiceGain(midis.length, gain);
    const fadeIn = midis.length > 1 ? HARMONIC_FADE_IN_SEC : 0;
    for (const midi of midis) {
      this.scheduleNote(midi, when, durationSec, voiceGain, fadeIn);
    }
  }

  scheduleNote(midi, when, durationSec, gain = 1, fadeIn = 0) {
    const url = this.instrumentSamplePath(midi);
    const buffer = this.bufferCache.get(url);
    if (!buffer) throw new Error(`Sample not preloaded: ${url}`);
    this.scheduleNoteBuffer(buffer, midi, when, durationSec, gain, fadeIn);
  }

  scheduleChord(midis, when, durationSec, gain = 1) {
    this.scheduleSimultaneousNotes(midis, when, durationSec, gain);
  }

  scheduleProgression(chordMap, chordIds, when, beatSec, gain = 1) {
    for (let i = 0; i < chordIds.length; i += 1) {
      const chord = chordMap.get(chordIds[i]);
      if (!chord) continue;
      const at = when + i * beatSec;
      this.scheduleChord(chord.midis, at, beatSec, gain);
    }
  }

  scheduleInterval(lowMidi, highMidi, when, beatSec, style, gain = 1) {
    if (style === "harmonic") {
      this.scheduleSimultaneousNotes([lowMidi, highMidi], when, beatSec, gain);
      return;
    }
    this.scheduleNote(lowMidi, when, beatSec, gain);
    this.scheduleNote(highMidi, when + beatSec, beatSec, gain);
  }

  scheduleMelody(midis, when, beatSec, gain = 1) {
    for (let i = 0; i < midis.length; i += 1) {
      this.scheduleNote(midis[i], when + i * beatSec, beatSec, gain);
    }
  }

  chordNow(midis, durationSec, gain = 1) {
    if (!this.ctx) return;
    this.scheduleChord(midis, this.ctx.currentTime, durationSec, gain);
  }

  scheduleNoteBuffer(buffer, midi, when, durationSec, gain = 1, fadeIn = 0) {
    const trimmed = this.getTrimmedNoteBuffer(midi, durationSec);
    this.playBuffer(trimmed, when, {
      gain: gain * this.instrumentGain,
      playbackRate: this.instrumentPlaybackRate(midi),
      fadeIn,
    });
  }

  scheduleSolfege(midi, when, durationSec) {
    if (!solfegeSupported(midi)) return;
    const buffer = this.getTrimmedSolfegeBuffer(midi, durationSec);
    this.playBuffer(buffer, when, {
      gain: SOLFEGE_GAIN,
    });
  }

  async playSolfege(midi, when, durationSec) {
    const url = this.solfegePath(midi);
    await this.loadBuffer(url);
    const buffer = this.bufferCache.get(url);
    if (!buffer) throw new Error(`Solfege sample not loaded: ${url}`);
    const trimmed = this.trimSolfegeForBeat(buffer, durationSec);
    this.playBuffer(trimmed, when, { gain: SOLFEGE_GAIN });
  }

  playClick(when) {
    if (!this.ctx || !this.clickBuffer) return;

    const now = this.ctx.currentTime;
    // Skip beats missed during lag/suspend; avoids a burst of catch-up clicks.
    if (when < now - 0.03) return;

    const startAt = Math.max(when, now + 0.001);
    const source = this.ctx.createBufferSource();
    source.buffer = this.clickBuffer;
    source.connect(this.master);
    source.start(startAt);
    source.stop(startAt + this.clickBuffer.duration + 0.001);
    this.practiceTracker?.voiceStarted();
    source.onended = () => {
      this.practiceTracker?.voiceEnded();
    };
  }

  clickNow() {
    if (!this.ctx) return;
    this.playClick(this.ctx.currentTime);
  }

  noteNow(midi, durationSec, gain = null) {
    if (!this.ctx) return;
    this.scheduleNote(
      midi,
      this.ctx.currentTime,
      durationSec,
      gain ?? this.noteBeat1Gain
    );
  }

  solfegeNow(midi, durationSec) {
    if (!this.ctx) return;
    this.scheduleSolfege(midi, this.ctx.currentTime, durationSec);
  }
}

class PianoKeyboard {
  constructor(root, startMidi, endMidi) {
    this.root = root;
    this.scrollWrap = root.parentElement;
    this.startMidi = startMidi;
    this.endMidi = endMidi;
    this.keyElements = new Map();
    this.resizeObserver = null;
    this.interactive = false;
    this.onKeyPress = null;
    this.pendingTap = null;
    this.scrollGateUntil = 0;
    this.lastScrollLeft = 0;
    this.tapMoveThreshold = 10;
    this.onScrollGuard = this.onScrollGuard.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.abortController = new AbortController();
    this.build(startMidi, endMidi);
    if (this.scrollWrap) {
      this.lastScrollLeft = this.scrollWrap.scrollLeft;
      this.scrollWrap.addEventListener("scroll", this.onScrollGuard, {
        passive: true,
        signal: this.abortController.signal,
      });
    }
  }

  destroy() {
    this.abortController.abort();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.setInteractive(false);
  }

  isHorizontalScrollGesture(dx, dy) {
    return (
      Math.abs(dx) > this.tapMoveThreshold && Math.abs(dx) > Math.abs(dy) * 1.2
    );
  }

  isVerticalScrollGesture(dx, dy) {
    return (
      Math.abs(dy) > this.tapMoveThreshold && Math.abs(dy) > Math.abs(dx) * 1.2
    );
  }

  keyboardScrolledSince(startScrollLeft) {
    if (!this.scrollWrap) return false;
    return Math.abs(this.scrollWrap.scrollLeft - startScrollLeft) > 2;
  }

  onScrollGuard() {
    if (!this.scrollWrap) return;
    const moved = Math.abs(this.scrollWrap.scrollLeft - this.lastScrollLeft) > 1;
    this.lastScrollLeft = this.scrollWrap.scrollLeft;
    if (!moved) return;
    this.scrollGateUntil = Date.now() + 200;
    this.pendingTap = null;
  }

  onPointerMove(event) {
    if (!this.pendingTap || event.pointerId !== this.pendingTap.pointerId) return;
    const dx = event.clientX - this.pendingTap.x;
    const dy = event.clientY - this.pendingTap.y;
    if (this.isHorizontalScrollGesture(dx, dy)) {
      this.pendingTap = null;
      return;
    }
    if (this.keyboardScrolledSince(this.pendingTap.scrollLeft)) {
      this.pendingTap = null;
    }
  }

  onPointerCancel(event) {
    if (!this.pendingTap || event.pointerId !== this.pendingTap.pointerId) return;
    this.releasePendingCapture(event.pointerId);
    this.pendingTap = null;
  }

  releasePendingCapture(pointerId) {
    if (!this.pendingTap?.target) return;
    if (this.pendingTap.target.hasPointerCapture?.(pointerId)) {
      this.pendingTap.target.releasePointerCapture(pointerId);
    }
  }

  bindKeyPress(key, midi) {
    key.addEventListener(
      "pointerdown",
      (event) => {
        if (!this.interactive || !this.onKeyPress) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;

        if (key.setPointerCapture) {
          try {
            key.setPointerCapture(event.pointerId);
          } catch {
            // Ignore capture failures on unsupported browsers.
          }
        }

        this.pendingTap = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          midi,
          startedAt: Date.now(),
          scrollLeft: this.scrollWrap?.scrollLeft ?? 0,
          target: key,
        };
      },
      { passive: true }
    );

    key.addEventListener("pointerup", (event) => {
      if (!this.interactive || !this.onKeyPress || !this.pendingTap) return;
      if (event.pointerId !== this.pendingTap.pointerId) return;
      if (this.pendingTap.midi !== midi) return;

      const dx = event.clientX - this.pendingTap.x;
      const dy = event.clientY - this.pendingTap.y;
      const elapsed = Date.now() - this.pendingTap.startedAt;
      const tap = this.pendingTap;
      this.releasePendingCapture(event.pointerId);
      this.pendingTap = null;

      if (Date.now() < this.scrollGateUntil) return;
      if (this.keyboardScrolledSince(tap.scrollLeft)) return;
      if (this.isHorizontalScrollGesture(dx, dy)) return;
      if (this.isVerticalScrollGesture(dx, dy)) return;
      if (elapsed > 450) return;

      event.preventDefault();
      this.onKeyPress(midi);
    });

    key.addEventListener("pointercancel", this.onPointerCancel);
  }

  setInteractive(enabled, onKeyPress = null) {
    this.interactive = enabled;
    this.onKeyPress = onKeyPress;
    this.pendingTap = null;
    this.root.classList.toggle("interactive", enabled);
    for (const key of this.keyElements.values()) {
      key.classList.toggle("pressable", enabled);
    }

    if (enabled) {
      this.root.addEventListener("pointermove", this.onPointerMove, { passive: true });
    } else {
      this.root.removeEventListener("pointermove", this.onPointerMove);
    }
  }

  build(startMidi, endMidi) {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.root.innerHTML = "";
    this.keyElements.clear();

    const whiteKeys = [];
    for (let midi = startMidi; midi <= endMidi; midi += 1) {
      if (!isBlackKey(midi)) whiteKeys.push(midi);
    }

    const whiteCount = whiteKeys.length;
    if (!whiteCount) return;

    this.root.style.minWidth = `${Math.max(whiteCount * 30, 320)}px`;

    for (const midi of whiteKeys) {
      const key = document.createElement("div");
      key.className = "key white";
      key.dataset.midi = String(midi);
      key.innerHTML = `<span class="key-label">${noteLabel(midi)}</span>`;
      this.bindKeyPress(key, midi);
      this.root.appendChild(key);
      this.keyElements.set(midi, key);
    }

    for (let midi = startMidi; midi <= endMidi; midi += 1) {
      if (!isBlackKey(midi)) continue;

      const key = document.createElement("div");
      key.className = "key black";
      key.dataset.midi = String(midi);
      key.innerHTML = `<span class="key-label">${noteLabel(midi)}</span>`;
      this.bindKeyPress(key, midi);
      this.root.appendChild(key);
      this.keyElements.set(midi, key);
    }

    this.layoutBlackKeys();
    this.resizeObserver = new ResizeObserver(() => this.layoutBlackKeys());
    this.resizeObserver.observe(this.root);
  }

  layoutBlackKeys() {
    const whiteEls = [...this.root.querySelectorAll(".key.white")];
    const whiteByMidi = new Map(
      whiteEls.map((el) => [Number(el.dataset.midi), el])
    );
    const rootRect = this.root.getBoundingClientRect();

    for (const key of this.root.querySelectorAll(".key.black")) {
      const midi = Number(key.dataset.midi);
      let leftMidi = midi - 1;
      while (leftMidi >= 0 && isBlackKey(leftMidi)) leftMidi -= 1;

      const leftEl = whiteByMidi.get(leftMidi);
      if (!leftEl) continue;

      const leftIndex = whiteEls.indexOf(leftEl);
      const rightEl = whiteEls[leftIndex + 1];
      if (!rightEl) continue;

      const leftRect = leftEl.getBoundingClientRect();
      const rightRect = rightEl.getBoundingClientRect();
      const center = (leftRect.right + rightRect.left) / 2 - rootRect.left;
      const width = leftRect.width * 0.56;

      key.style.left = `${center}px`;
      key.style.width = `${Math.max(width, 10)}px`;
    }
  }

  highlight(midi, active) {
    const key = this.keyElements.get(midi);
    if (!key) return;
    key.classList.toggle("active", active);
    if (active) {
      key.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }

  clearHighlight() {
    for (const key of this.keyElements.values()) {
      key.classList.remove("active");
    }
  }

  clearFeedback() {
    for (const key of this.keyElements.values()) {
      key.classList.remove("active", "correct", "wrong", "reveal");
    }
  }

  markAnswer(pressedMidi, targetMidi) {
    this.clearFeedback();
    const pressedKey = this.keyElements.get(pressedMidi);
    const targetKey = this.keyElements.get(targetMidi);
    if (pressedMidi === targetMidi) {
      pressedKey?.classList.add("correct");
      return;
    }
    pressedKey?.classList.add("wrong");
    targetKey?.classList.add("reveal");
    targetKey?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

class ChordPad {
  constructor(root, items) {
    this.root = root;
    this.items = items;
    this.buttonElements = new Map();
    this.interactive = false;
    this.onPress = null;
    this.build();
  }

  destroy() {
    this.root.innerHTML = "";
    this.buttonElements.clear();
  }

  build() {
    this.root.innerHTML = "";
    this.root.className = "chord-pad";
    for (const item of this.items) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chord-btn";
      button.textContent = item.label;
      button.dataset.chordId = item.id;
      button.addEventListener("click", () => {
        if (this.interactive && this.onPress) this.onPress(item.id);
      });
      this.root.appendChild(button);
      this.buttonElements.set(item.id, button);
    }
  }

  setInteractive(enabled, onPress = null) {
    this.interactive = enabled;
    this.onPress = onPress;
    this.root.classList.toggle("interactive", enabled);
    for (const button of this.buttonElements.values()) {
      button.disabled = !enabled;
    }
  }

  clearFeedback() {
    for (const button of this.buttonElements.values()) {
      button.classList.remove("correct", "wrong", "reveal");
    }
  }

  markAnswer(pressedId, targetId) {
    this.clearFeedback();
    const pressedButton = this.buttonElements.get(pressedId);
    const targetButton = this.buttonElements.get(targetId);
    if (pressedId === targetId) {
      pressedButton?.classList.add("correct");
      return;
    }
    pressedButton?.classList.add("wrong");
    targetButton?.classList.add("reveal");
  }
}

function instrumentLabelFromSampleUrl(url) {
  if (/\/samples\/piano\//i.test(url)) return INSTRUMENTS.piano.label;
  for (const [id, config] of Object.entries(INSTRUMENTS)) {
    if (id !== "piano" && url.includes(`/instruments/${id}/`)) {
      return config.label;
    }
  }
  if (/\/solfege\//i.test(url)) return "Solfege";
  return "";
}

function getBootstrapNotes() {
  const advanced = diatonicNotes(RANGE_PRESETS.advanced.start, RANGE_PRESETS.advanced.end);
  const bass = diatonicNotes(BASS_RANGE.start, BASS_RANGE.end);
  const merged = new Set([...advanced, ...bass, ...getChordPreloadMidis()]);
  return [...merged].sort((a, b) => a - b);
}

class EarTrainingApp {
  constructor() {
    this.practiceTimeLinkEl = document.getElementById("practiceTimeLink");
    this.dailyLog = new DailyPracticeLog();
    this.practiceTracker = new PracticeTimeTracker(() => this.updatePracticeTimeDisplay());
    this.practiceTracker.onSegmentFlush = (ms) => this.dailyLog.addMs(ms);
    this.audio = new AudioEngine();
    this.audio.practiceTracker = this.practiceTracker;
    this.timeouts = [];
    this.running = false;
    this.samplesReady = false;
    this.bootstrapController = null;
    this.metronomeScheduler = null;
    this.interactiveResolve = null;
    this.keyboard = null;
    this.currentQuestion = null;
    this.chordItems = C_MAJOR_TRIADS;
    this.chordMap = buildChordMap(C_MAJOR_TRIADS);

    this.modeEl = document.getElementById("mode");
    this.subtitleEl = document.getElementById("subtitle");
    this.metronomeEl = document.getElementById("metronome");
    this.instrumentEl = document.getElementById("instrument");
    this.levelEl = document.getElementById("level");
    this.chordSetEl = document.getElementById("chordSet");
    this.intervalStyleEl = document.getElementById("intervalStyle");
    this.chordOptionsRow = document.getElementById("chordOptionsRow");
    this.intervalOptionsRow = document.getElementById("intervalOptionsRow");
    this.bpmEl = document.getElementById("bpm");
    this.numNotesEl = document.getElementById("numNotes");
    this.noteDisplayEl = document.getElementById("noteDisplay");
    this.progressEl = document.getElementById("progress");
    this.statusEl = document.getElementById("status");
    this.helpEl = document.getElementById("help");
    this.keyboardEl = document.getElementById("pianoKeyboard");
    this.startBtn = document.getElementById("startBtn");
    this.stopBtn = document.getElementById("stopBtn");
    this.refABtn = document.getElementById("refABtn");
    this.replayBtn = document.getElementById("replayBtn");

    this.startBtn.addEventListener("click", () => this.start());
    this.stopBtn.addEventListener("click", () => this.stop());
    this.refABtn?.addEventListener("click", () => this.playReferenceA());
    this.replayBtn?.addEventListener("click", () => this.replayCurrentQuestion());
    this.levelEl.addEventListener("change", () => this.resetKeyboard());
    this.modeEl.addEventListener("change", () => this.onModeChange());
    this.chordSetEl?.addEventListener("change", () => this.onChordSetChange());
    this.instrumentEl.addEventListener("change", () => this.onInstrumentChange());

    this.onModeChange();
    this.numNotesEl.value = String(DEFAULT_NUM_NOTES);
    this.setDisplay("?", "question");
    this.progressEl.textContent = "Loading samples...";
    this.setControlsDisabled(true);
    this.updatePracticeTimeDisplay();
    void this.bootstrapSamples();
  }

  updatePracticeTimeDisplay() {
    if (!this.practiceTimeLinkEl) return;
    this.practiceTimeLinkEl.textContent = `Practiced ${formatPracticeTime(this.practiceTracker.getTotalMs())}`;
  }

  onChordSetChange() {
    const set = getChordSetItems(this.chordSetEl?.value || "c-major-triads");
    this.chordItems = set.items;
    this.chordMap = set.chordMap;
    if (this.isChordMode()) this.resetKeyboard();
  }

  showModeOptions() {
    const mode = this.modeEl.value;
    this.chordOptionsRow?.classList.toggle("hidden", mode !== "chords");
    this.intervalOptionsRow?.classList.toggle("hidden", mode !== "intervals");
  }

  updateModeHint() {
    const mode = this.modeEl.value;
    this.subtitleEl.textContent = MODE_SUBTITLES[mode] || MODE_SUBTITLES.passive;
  }

  onModeChange() {
    const bass = this.isBassMode();
    const chords = this.isChordMode();
    const intervals = this.isIntervalMode();
    const melody = this.isMelodyMode();
    const fixedInstrument = bass || chords;
    if (this.instrumentEl) {
      this.instrumentEl.disabled = fixedInstrument;
      if (bass) this.instrumentEl.value = "bass";
      if (chords) this.instrumentEl.value = "piano";
    }
    if (this.levelEl) {
      this.levelEl.disabled = bass || chords;
    }
    if (chords) this.onChordSetChange();
    this.showModeOptions();
    this.updateModeHint();
    this.resetKeyboard();
  }

  isBassMode() {
    return this.modeEl.value === "bass";
  }

  isChordMode() {
    return this.modeEl.value === "chords";
  }

  isIntervalMode() {
    return this.modeEl.value === "intervals";
  }

  isMelodyMode() {
    return this.modeEl.value === "melody";
  }

  isInteractiveMode() {
    return (
      this.modeEl.value === "interactive" ||
      this.isBassMode() ||
      this.isChordMode() ||
      this.isIntervalMode() ||
      this.isMelodyMode()
    );
  }

  usesReferenceA() {
    return this.modeEl.value === "interactive" || this.isBassMode();
  }

  usesSolfege() {
    return this.modeEl.value === "passive" || this.modeEl.value === "interactive";
  }

  answerDisplay(midi) {
    return solfegeDisplay(midi);
  }

  adaptiveScopeKey(notes) {
    const min = Math.min(...notes);
    const max = Math.max(...notes);
    return `${this.modeEl.value}:${min}-${max}`;
  }

  getPreset() {
    return RANGE_PRESETS[this.levelEl.value] || RANGE_PRESETS.advanced;
  }

  getRangeBounds() {
    const preset = this.getPreset();
    return { start: preset.start, end: preset.end };
  }

  getKeyboardRange() {
    if (this.isBassMode()) return BASS_RANGE;
    return this.getPreset();
  }

  getSessionNotes() {
    if (this.isChordMode()) {
      return chordSetMidis(this.chordSetEl?.value || "c-major-triads");
    }
    if (this.isBassMode()) {
      return diatonicNotes(BASS_RANGE.start, BASS_RANGE.end);
    }
    if (this.isIntervalMode()) {
      const { start, end } = this.getRangeBounds();
      return chromaticNotes(start, end);
    }
    const preset = this.getPreset();
    return diatonicNotes(preset.start, preset.end);
  }

  getSessionInstrumentId() {
    if (this.isBassMode()) return "bass";
    if (this.isChordMode()) return "piano";
    return this.instrumentEl.value;
  }

  getIntervalStyle() {
    const style = this.intervalStyleEl?.value || "random";
    if (style === "random") return Math.random() < 0.5 ? "harmonic" : "melodic";
    return style;
  }

  getChoicePadItems() {
    if (this.isIntervalMode()) {
      return INTERVAL_DEFS.map((item) => ({ id: item.id, label: item.label }));
    }
    return this.chordItems.map((item) => ({ id: item.id, label: item.label }));
  }

  async playReferenceA() {
    if (!this.samplesReady) return;
    await this.ensureAudioReadyForControls();
    this.audio.playReferenceANow();
  }

  async replayCurrentQuestion() {
    if (!this.running || !this.currentQuestion) return;
    await this.ensureAudioReadyForControls();
    this.audio.stopAllVoices(true);
    const { beatSec } = this.currentQuestion;
    const when = this.audio.ctx.currentTime + 0.02;

    if (this.currentQuestion.progression) {
      this.audio.scheduleProgression(
        this.currentQuestion.chordMap,
        this.currentQuestion.progression.chordIds,
        when,
        beatSec,
        this.audio.noteBeat1Gain
      );
      return;
    }
    if (this.currentQuestion.chord) {
      this.audio.scheduleChord(
        this.currentQuestion.chord.midis,
        when,
        beatSec,
        this.audio.noteBeat1Gain
      );
      return;
    }
    if (this.currentQuestion.interval) {
      const { lowMidi, highMidi, style } = this.currentQuestion.interval;
      this.audio.scheduleInterval(lowMidi, highMidi, when, beatSec, style, this.audio.noteBeat1Gain);
      return;
    }
    if (this.currentQuestion.melody) {
      this.audio.scheduleMelody(this.currentQuestion.melody, when, beatSec, this.audio.noteBeat1Gain);
      return;
    }
    const { midi } = this.currentQuestion;
    this.audio.scheduleNote(midi, when, beatSec, this.audio.noteBeat1Gain);
  }

  async ensureAudioReadyForControls() {
    if (!this.audio.ctx) await this.audio.init();
    this.audio.resumeOnUserGesture();
    await this.audio.ensurePlayback();
  }

  metronomeEnabled() {
    return this.metronomeEl.checked;
  }

  maybeClick(when) {
    if (this.metronomeEnabled()) {
      this.audio.playClick(when);
    }
  }

  maybeClickNow() {
    if (this.metronomeEnabled()) {
      this.audio.clickNow();
    }
  }

  async probeSampleAsset(relativePath) {
    const urls = assetLoadUrls(assetUrl(relativePath));
    let lastError = null;
    for (const url of urls) {
      try {
        let response = await fetch(url, { method: "HEAD" });
        if (response.ok) return response;

        response = await fetch(url, {
          method: "GET",
          headers: { Range: "bytes=0-0" },
        });
        if (response.ok || response.status === 206) return response;
        lastError = new Error(`Sample check failed (${response.status})`);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError ?? new Error(`Sample check failed for ${relativePath}`);
  }

  async checkServer() {
    try {
      await this.probeSampleAsset("samples/piano/UprightPianoKW-20220221.sfz");
    } catch (error) {
      this.helpEl.textContent = "Cannot reach sample server. Check network and refresh.";
      this.setStatus(`Connection failed: ${error.message}`);
      this.progressEl.textContent = "Offline · refresh to retry";
      return false;
    }

    this.helpEl.textContent = `Ready · v${APP_VERSION}`;
    void requestPersistentStorage();
    return true;
  }

  formatBootstrapStatus(done, total, url = "", { fromCache = false } = {}) {
    const fileName = url ? url.split("/").pop() : "";
    const group = instrumentLabelFromSampleUrl(url);
    const prefix = fromCache ? "Cache" : "Download";
    const groupPart = group ? ` · ${group}` : "";
    return fileName
      ? `${prefix} ${done}/${total}${groupPart}`
      : `${prefix} ${done}/${total}${groupPart}...`;
  }

  async bootstrapSamples() {
    this.bootstrapController?.abort();
    this.bootstrapController = new AbortController();
    const signal = this.bootstrapController.signal;

    const serverOk = await this.checkServer();
    if (!serverOk || signal.aborted) return;

    try {
      if (!this.audio.ctx) await this.audio.init();
      await this.audio.setInstrument(this.instrumentEl.value);

      const notes = getBootstrapNotes();
      const urls = await this.audio.collectAllPreloadUrls(notes);
      const progressState = { done: 0, total: urls.length };
      const concurrency = isIPhone() ? 1 : 6;

      await this.audio.preloadUrls(
        urls,
        concurrency,
        (done, total, url, meta = {}) => {
          if (signal.aborted) return;
          const status = this.formatBootstrapStatus(done, total, url, meta);
          this.setStatus(status);
          this.progressEl.textContent = status;
        },
        signal,
        progressState,
        { silent: true, continueOnError: true }
      );

      if (signal.aborted) return;

      this.samplesReady = true;
      this.setStatus("");
      this.progressEl.textContent = "Ready";
      this.setControlsDisabled(false);
    } catch (error) {
      if (signal.aborted || error.message === "Loading cancelled") return;
      this.samplesReady = false;
      this.setStatus(`Load failed: ${error.message}`);
      this.progressEl.textContent = "Load failed · refresh";
      this.startBtn.disabled = true;
    } finally {
      if (this.bootstrapController?.signal === signal) {
        this.bootstrapController = null;
      }
    }
  }

  async onInstrumentChange() {
    if (this.running || !this.samplesReady || this.isBassMode() || this.isChordMode()) return;
    try {
      if (!this.audio.ctx) await this.audio.init();
      this.audio.cancelWarmPreload();
      this.audio.cancelPendingLoads();
      this.audio.haltAudibleOutput();
      await this.audio.setInstrument(this.instrumentEl.value);
    } catch (error) {
      this.setStatus(`Instrument change failed: ${error.message}`);
    }
  }

  resetKeyboard() {
    this.keyboard?.destroy();
    if (this.isChordMode() || this.isIntervalMode()) {
      const items = this.getChoicePadItems().map((item) => ({ id: item.id, label: item.label }));
      this.keyboard = new ChordPad(this.keyboardEl, items);
      if (this.isIntervalMode()) this.keyboardEl.classList.add("interval-pad");
    } else {
      this.keyboardEl.className = "piano-keyboard";
      const range = this.getKeyboardRange();
      this.keyboard = new PianoKeyboard(this.keyboardEl, range.start, range.end);
    }
    this.keyboard.setInteractive(false);
  }

  setDisplay(text, tone = "question", midi = null, { mark = null } = {}) {
    if (mark != null) {
      this.noteDisplayEl.innerHTML =
        `<span class="result-mark">${mark}</span><span class="result-label">${text}</span>`;
    } else {
      this.noteDisplayEl.textContent = text;
    }
    this.noteDisplayEl.classList.remove(
      "question",
      "answer",
      "correct",
      "wrong",
      "tap",
      "rainbow-pc-0",
      "rainbow-pc-2",
      "rainbow-pc-4",
      "rainbow-pc-5",
      "rainbow-pc-7",
      "rainbow-pc-9",
      "rainbow-pc-11"
    );
    this.noteDisplayEl.classList.add(tone);
    if (this.modeEl.value === "passive" && midi != null) {
      const rainbowClass = answerRainbowClass(midi);
      if (rainbowClass) this.noteDisplayEl.classList.add(rainbowClass);
    }
  }

  setStatus(text) {
    this.statusEl.textContent = text;
  }

  schedule(fn, delayMs) {
    const id = window.setTimeout(fn, delayMs);
    this.timeouts.push(id);
  }

  scheduleAt(audioTime, fn) {
    const delayMs = Math.max(0, (audioTime - this.audio.ctx.currentTime) * 1000);
    this.schedule(fn, delayMs);
  }

  clearSchedules() {
    this.stopMetronomeScheduler();
    for (const id of this.timeouts) window.clearTimeout(id);
    this.timeouts = [];
    this.keyboard?.setInteractive(false);
    this.keyboard?.clearFeedback();
    if (this.interactiveResolve) {
      this.interactiveResolve(null);
      this.interactiveResolve = null;
    }
  }

  delay(ms) {
    return new Promise((resolve) => {
      this.schedule(() => resolve(this.running), ms);
    });
  }

  waitUntilAudio(audioTime) {
    return new Promise((resolve) => {
      const tick = () => {
        if (!this.running) {
          resolve(false);
          return;
        }
        const remainingMs = (audioTime - this.audio.ctx.currentTime) * 1000;
        if (remainingMs <= 4) {
          resolve(true);
          return;
        }
        this.schedule(() => resolve(this.running), remainingMs);
      };
      tick();
    });
  }

  scheduleMetronomeGrid(startAt, beatSec, totalBeats) {
    this.stopMetronomeScheduler();
    if (!this.metronomeEnabled()) return;

    this.metronomeScheduler = {
      startAt,
      beatSec,
      totalBeats,
      nextBeat: 0,
      timerId: null,
    };

    const tick = () => {
      const scheduler = this.metronomeScheduler;
      if (!this.running || !scheduler) return;
      if (!this.metronomeEnabled()) {
        this.stopMetronomeScheduler();
        return;
      }

      const now = this.audio.ctx.currentTime;
      const horizon = now + 0.3;
      while (scheduler.nextBeat < scheduler.totalBeats) {
        const when = scheduler.startAt + scheduler.nextBeat * scheduler.beatSec;
        if (when > horizon) break;
        this.audio.playClick(when);
        scheduler.nextBeat += 1;
      }

      if (scheduler.nextBeat < scheduler.totalBeats && this.running) {
        scheduler.timerId = window.setTimeout(tick, 80);
      } else if (scheduler.nextBeat >= scheduler.totalBeats) {
        this.stopMetronomeScheduler();
      }
    };

    tick();
  }

  stopMetronomeScheduler() {
    if (this.metronomeScheduler?.timerId != null) {
      window.clearTimeout(this.metronomeScheduler.timerId);
    }
    this.metronomeScheduler = null;
  }

  waitForKeyPress() {
    return new Promise((resolve) => {
      this.interactiveResolve = resolve;
      this.keyboard.setInteractive(true, (value) => {
        if (!this.running || !this.interactiveResolve) return;
        this.keyboard.setInteractive(false);
        const done = this.interactiveResolve;
        this.interactiveResolve = null;
        done(value);
      });
    });
  }

  waitForMelodySequence(length) {
    return new Promise((resolve) => {
      const sequence = [];
      this.interactiveResolve = () => resolve(null);
      this.keyboard.setInteractive(true, (midi) => {
        if (!this.running) return;
        sequence.push(midi);
        this.keyboard.highlight(midi, true);
        window.setTimeout(() => this.keyboard.highlight(midi, false), 180);
        if (sequence.length >= length) {
          this.keyboard.setInteractive(false);
          this.interactiveResolve = null;
          resolve(sequence);
        }
      });
    });
  }

  setControlsDisabled(disabled) {
    const settingsLocked = disabled || !this.samplesReady;
    const bass = this.isBassMode();
    const chords = this.isChordMode();
    const fixedRange = bass || chords;
    this.startBtn.disabled = disabled || !this.samplesReady;
    this.stopBtn.disabled = !disabled;
    this.modeEl.disabled = settingsLocked;
    this.metronomeEl.disabled = settingsLocked;
    this.instrumentEl.disabled = settingsLocked || bass || chords;
    this.levelEl.disabled = settingsLocked || fixedRange;
    this.bpmEl.disabled = settingsLocked;
    this.numNotesEl.disabled = settingsLocked;
    if (this.refABtn) this.refABtn.disabled = !this.samplesReady;
    if (this.replayBtn) this.replayBtn.disabled = !this.running || !this.currentQuestion;
  }

  updateAuxControls() {
    if (this.refABtn) this.refABtn.disabled = !this.samplesReady;
    if (this.replayBtn) this.replayBtn.disabled = !this.running || !this.currentQuestion;
  }

  stop() {
    this.running = false;
    this.currentQuestion = null;
    this.stopMetronomeScheduler();
    this.audio.cancelPendingLoads();
    this.audio.stopAllVoices(true);
    this.audio.stopPlaybackKeepalive();
    this.audio.stopBackgroundMode();
    this.clearSchedules();
    this.setDisplay("?", "question");
    this.progressEl.textContent = this.samplesReady ? "Ready" : "Stopped";
    this.setStatus("");
    this.setControlsDisabled(false);
  }

  formatLoadingStatus(done, total, url = "", { fromCache = false } = {}) {
    const fileName = url ? url.split("/").pop() : "";
    const prefix = fromCache ? "Cache" : "Download";
    return fileName
      ? `${prefix} ${done}/${total}`
      : `${prefix} ${done}/${total}...`;
  }

  async prepareSession(notes, beatSec) {
    if (!this.audio.ctx) await this.audio.init();
    await this.audio.ensurePlayback();
    await this.audio.setInstrument(this.getSessionInstrumentId());

    this.audio.cancelPendingLoads();
    this.audio.cancelWarmPreload();
    this.audio.loadAbortController = new AbortController();
    const signal = this.audio.loadAbortController.signal;
    const beatSecValue = beatSec;

    if (!this.audio.areNotesPreloaded(notes, { includeSolfege: this.usesSolfege() })) {
      await this.audio.preloadNotes(
        notes,
        beatSecValue,
        (done, total, url, meta = {}) => {
          if (!this.running) return;
          this.setStatus(this.formatLoadingStatus(done, total, url, meta));
        },
        signal,
        { includeSolfege: this.usesSolfege() }
      );
      void requestPersistentStorage();
    } else {
      for (const midi of notes) {
        if (this.audio.hasInstrumentSample(midi)) {
          this.audio.getTrimmedNoteBuffer(midi, beatSecValue);
        }
        if (this.usesSolfege() && solfegeSupported(midi)) {
          this.audio.getTrimmedSolfegeBuffer(midi, beatSecValue);
        }
      }
    }

    this.audio.loadAbortController = null;
    if (!this.running) {
      throw new Error("Loading cancelled");
    }

    await this.audio.ensurePlayback();
    this.setStatus("");
    if (!this.isInteractiveMode()) {
      this.audio.startBackgroundMode();
    } else {
      this.audio.startPlaybackKeepalive();
    }
  }

  async startPassiveSession({ numNotes, beatSec, notes }) {
    await this.audio.ensurePlayback();
    const startAt = this.audio.ctx.currentTime + 0.2;
    this.scheduleMetronomeGrid(startAt, beatSec, numNotes * 3);

    for (let i = 0; i < numNotes; i += 1) {
      if (!this.running) break;

      const midi = randomChoice(notes);
      const noteStart = startAt + i * 3 * beatSec;
      const index = i + 1;

      this.scheduleAt(noteStart, () => {
        if (!this.running) return;
        this.setDisplay("?", "question");
        this.progressEl.textContent = `${index}/${numNotes} · beat 1`;
        this.keyboard.clearFeedback();
      });
      this.audio.scheduleNote(midi, noteStart, beatSec, this.audio.noteBeat1Gain);

      const beat2 = noteStart + beatSec;
      this.scheduleAt(beat2, () => {
        if (!this.running) return;
        this.setDisplay("?", "question");
        this.progressEl.textContent = `${index}/${numNotes} · beat 2`;
      });

      const beat3 = noteStart + 2 * beatSec;
      this.scheduleAt(beat3, () => {
        if (!this.running) return;
        this.setDisplay(solfegeDisplay(midi), "answer", midi);
        this.progressEl.textContent = `${index}/${numNotes} · answer`;
        this.keyboard.clearFeedback();
        this.keyboard.highlight(midi, true);
      });
      this.audio.scheduleNote(midi, beat3, beatSec, this.audio.noteAnswerGain);
      this.audio.scheduleSolfege(midi, beat3, beatSec);
      this.scheduleAt(beat3 + beatSec, () => this.keyboard.highlight(midi, false));
    }

    const totalMs = (startAt + numNotes * 3 * beatSec - this.audio.ctx.currentTime) * 1000 + 200;
    this.schedule(() => {
      if (!this.running) return;
      this.setDisplay("Done", "answer");
      this.progressEl.textContent = `${numNotes} done`;
      this.stop();
    }, totalMs);
  }

  async startInteractiveSession({ numNotes, beatSec, notes, withReferenceA = false }) {
    let correctCount = 0;
    const adaptive = new AdaptiveLearning(this.adaptiveScopeKey(notes));
    await this.audio.ensurePlayback();

    for (let i = 0; i < numNotes; i += 1) {
      if (!this.running) break;

      const targetMidi = adaptive.pickNote(notes);
      if (targetMidi == null) break;
      const index = i + 1;
      const playRef = withReferenceA && i === 0;
      const refLead = playRef ? REFERENCE_A_SEC + REFERENCE_A_GAP_SEC : 0;
      const base = this.audio.ctx.currentTime + 0.05;
      const questionStart = base + refLead;
      const questionEnd = questionStart + beatSec;

      this.currentQuestion = { midi: targetMidi, beatSec };
      this.updateAuxControls();

      this.setDisplay("?", "question");
      this.keyboard.clearFeedback();

      if (playRef) {
        this.progressEl.textContent = `${index}/${numNotes} · A440 · ${correctCount}`;
        this.audio.playReferenceA(base);
        if (!(await this.waitUntilAudio(questionStart))) break;
      }

      this.progressEl.textContent = `${index}/${numNotes} · listen · ${correctCount}`;
      this.maybeClick(questionStart);
      this.audio.scheduleNote(targetMidi, questionStart, beatSec, this.audio.noteBeat1Gain);
      if (!(await this.waitUntilAudio(questionEnd))) break;

      this.setDisplay("Tap", "tap");
      this.progressEl.textContent = `${index}/${numNotes} · tap · ${correctCount}`;
      this.maybeClick(questionEnd);

      const tapStartedAt = performance.now();
      const pressedMidi = await this.waitForKeyPress();
      if (!this.running || pressedMidi === null) break;

      const isCorrect = pressedMidi === targetMidi;
      if (isCorrect) correctCount += 1;
      adaptive.recordAnswer(targetMidi, isCorrect, performance.now() - tapStartedAt);

      this.keyboard.markAnswer(pressedMidi, targetMidi);
      const answerAt = Math.max(questionEnd, this.audio.ctx.currentTime + 0.02);
      if (isCorrect) {
        this.setDisplay(this.answerDisplay(targetMidi), "correct", null, { mark: "✓" });
        this.progressEl.textContent = `${index}/${numNotes} · correct · ${correctCount}/${index}`;
      } else {
        this.setDisplay(this.answerDisplay(targetMidi), "wrong", null, { mark: "×" });
        this.progressEl.textContent =
          `${index}/${numNotes} · ${noteLabel(pressedMidi)} → ${this.answerDisplay(targetMidi)} · ${correctCount}/${index}`;
      }

      this.maybeClick(answerAt);
      this.audio.scheduleNote(targetMidi, answerAt, beatSec, this.audio.noteAnswerGain);
      if (this.usesSolfege()) {
        this.audio.scheduleSolfege(targetMidi, answerAt, beatSec);
      }
      if (!(await this.waitUntilAudio(answerAt + beatSec))) break;
    }

    if (!this.running) return;

    const accuracy = numNotes ? Math.round((correctCount / numNotes) * 100) : 0;
    this.setDisplay("Done", "answer");
    this.progressEl.textContent = `${correctCount}/${numNotes} (${accuracy}%)`;
    this.stop();
  }

  async startChordSession({ numNotes, beatSec }) {
    let correctCount = 0;
    const setKey = this.chordSetEl?.value || "c-major-triads";
    const { type, items, chordMap } = getChordSetItems(setKey);
    const choiceIds = items.map((item) => item.id);
    const adaptive = new AdaptiveLearning(`chords:${setKey}`);
    await this.audio.ensurePlayback();

    for (let i = 0; i < numNotes; i += 1) {
      if (!this.running) break;

      const targetId = adaptive.pickNote(choiceIds);
      const targetItem = getItemById(items, targetId);
      if (!targetItem) break;

      const index = i + 1;
      const base = this.audio.ctx.currentTime + 0.05;
      const questionStart = base;
      const listenEnd =
        type === "progression"
          ? questionStart + targetItem.chordIds.length * beatSec
          : questionStart + beatSec;

      this.currentQuestion =
        type === "progression"
          ? { progression: targetItem, chordMap, beatSec }
          : { chord: targetItem, beatSec };
      this.updateAuxControls();

      this.setDisplay("?", "question");
      this.keyboard.clearFeedback();

      this.progressEl.textContent = `${index}/${numNotes} · listen · ${correctCount}`;
      this.maybeClick(questionStart);
      if (type === "progression") {
        this.audio.scheduleProgression(
          chordMap,
          targetItem.chordIds,
          questionStart,
          beatSec,
          this.audio.noteBeat1Gain
        );
      } else {
        this.audio.scheduleChord(targetItem.midis, questionStart, beatSec, this.audio.noteBeat1Gain);
      }
      if (!(await this.waitUntilAudio(listenEnd))) break;

      this.setDisplay("Tap", "tap");
      this.progressEl.textContent = `${index}/${numNotes} · tap · ${correctCount}`;
      this.maybeClick(listenEnd);

      const tapStartedAt = performance.now();
      const pressedId = await this.waitForKeyPress();
      if (!this.running || pressedId === null) break;

      const isCorrect = pressedId === targetItem.id;
      if (isCorrect) correctCount += 1;
      adaptive.recordAnswer(targetItem.id, isCorrect, performance.now() - tapStartedAt);

      this.keyboard.markAnswer(pressedId, targetItem.id);
      const answerAt = Math.max(listenEnd, this.audio.ctx.currentTime + 0.02);
      const pressedLabel = getItemById(items, pressedId)?.label ?? pressedId;
      if (isCorrect) {
        this.setDisplay(targetItem.label, "correct", null, { mark: "✓" });
        this.progressEl.textContent = `${index}/${numNotes} · correct · ${correctCount}/${index}`;
      } else {
        this.setDisplay(targetItem.label, "wrong", null, { mark: "×" });
        this.progressEl.textContent =
          `${index}/${numNotes} · ${pressedLabel} → ${targetItem.label} · ${correctCount}/${index}`;
      }

      this.maybeClick(answerAt);
      if (type === "progression") {
        this.audio.scheduleProgression(
          chordMap,
          targetItem.chordIds,
          answerAt,
          beatSec,
          this.audio.noteAnswerGain
        );
        if (!(await this.waitUntilAudio(answerAt + targetItem.chordIds.length * beatSec))) break;
      } else {
        this.audio.scheduleChord(targetItem.midis, answerAt, beatSec, this.audio.noteAnswerGain);
        if (!(await this.waitUntilAudio(answerAt + beatSec))) break;
      }
    }

    if (!this.running) return;

    const accuracy = numNotes ? Math.round((correctCount / numNotes) * 100) : 0;
    this.setDisplay("Done", "answer");
    this.progressEl.textContent = `${correctCount}/${numNotes} (${accuracy}%)`;
    this.stop();
  }

  async startIntervalSession({ numNotes, beatSec, notes }) {
    let correctCount = 0;
    const { start, end } = this.getRangeBounds();
    const intervalIds = INTERVAL_DEFS.map((item) => item.id);
    const adaptive = new AdaptiveLearning(this.adaptiveScopeKey(notes));
    await this.audio.ensurePlayback();

    for (let i = 0; i < numNotes; i += 1) {
      if (!this.running) break;

      const targetId = adaptive.pickNote(intervalIds);
      const targetInterval = getIntervalById(targetId);
      if (!targetInterval) break;

      const roots = validIntervalRoots(start, end, targetInterval.semitones);
      if (!roots.length) continue;

      const lowMidi = randomChoice(roots);
      const highMidi = lowMidi + targetInterval.semitones;
      const style = this.getIntervalStyle();
      const listenDur = questionEndForInterval(beatSec, style);

      const index = i + 1;
      const questionStart = this.audio.ctx.currentTime + 0.05;
      const questionEnd = questionStart + listenDur;

      this.currentQuestion = {
        interval: { lowMidi, highMidi, style, id: targetInterval.id },
        beatSec,
      };
      this.updateAuxControls();

      this.setDisplay("?", "question");
      this.keyboard.clearFeedback();

      this.progressEl.textContent = `${index}/${numNotes} · ${style} · ${correctCount}`;
      this.maybeClick(questionStart);
      this.audio.scheduleInterval(
        lowMidi,
        highMidi,
        questionStart,
        beatSec,
        style,
        this.audio.noteBeat1Gain
      );
      if (!(await this.waitUntilAudio(questionEnd))) break;

      this.setDisplay("Tap", "tap");
      this.progressEl.textContent = `${index}/${numNotes} · tap · ${correctCount}`;
      this.maybeClick(questionEnd);

      const tapStartedAt = performance.now();
      const pressedId = await this.waitForKeyPress();
      if (!this.running || pressedId === null) break;

      const isCorrect = pressedId === targetInterval.id;
      if (isCorrect) correctCount += 1;
      adaptive.recordAnswer(targetInterval.id, isCorrect, performance.now() - tapStartedAt);

      this.keyboard.markAnswer(pressedId, targetInterval.id);
      const answerAt = Math.max(questionEnd, this.audio.ctx.currentTime + 0.02);
      const pressedLabel = getIntervalById(pressedId)?.label ?? pressedId;
      if (isCorrect) {
        this.setDisplay(targetInterval.label, "correct", null, { mark: "✓" });
        this.progressEl.textContent = `${index}/${numNotes} · correct · ${correctCount}/${index}`;
      } else {
        this.setDisplay(targetInterval.label, "wrong", null, { mark: "×" });
        this.progressEl.textContent =
          `${index}/${numNotes} · ${pressedLabel} → ${targetInterval.label} · ${correctCount}/${index}`;
      }

      this.maybeClick(answerAt);
      this.audio.scheduleInterval(
        lowMidi,
        highMidi,
        answerAt,
        beatSec,
        style,
        this.audio.noteAnswerGain
      );
      if (!(await this.waitUntilAudio(answerAt + listenDur))) break;
    }

    if (!this.running) return;

    const accuracy = numNotes ? Math.round((correctCount / numNotes) * 100) : 0;
    this.setDisplay("Done", "answer");
    this.progressEl.textContent = `${correctCount}/${numNotes} (${accuracy}%)`;
    this.stop();
  }

  async startMelodySession({ numNotes, beatSec, notes }) {
    let correctCount = 0;
    const adaptive = new AdaptiveLearning(this.adaptiveScopeKey(notes));
    await this.audio.ensurePlayback();

    for (let i = 0; i < numNotes; i += 1) {
      if (!this.running) break;

      const length =
        MELODY_MIN_LEN +
        Math.floor(Math.random() * (MELODY_MAX_LEN - MELODY_MIN_LEN + 1));
      const melody = [];
      for (let n = 0; n < length; n += 1) {
        melody.push(adaptive.pickNote(notes));
      }
      const melodyKey = melody.join("-");
      const index = i + 1;
      const questionStart = this.audio.ctx.currentTime + 0.05;
      const listenEnd = questionStart + melody.length * beatSec;

      this.currentQuestion = { melody, beatSec };
      this.updateAuxControls();

      this.setDisplay("?", "question");
      this.keyboard.clearFeedback();

      this.progressEl.textContent = `${index}/${numNotes} · ${melody.length} notes · ${correctCount}`;
      this.maybeClick(questionStart);
      this.audio.scheduleMelody(melody, questionStart, beatSec, this.audio.noteBeat1Gain);
      if (!(await this.waitUntilAudio(listenEnd))) break;

      this.setDisplay("Replay", "tap");
      this.progressEl.textContent = `${index}/${numNotes} · replay · ${correctCount}`;

      const tapStartedAt = performance.now();
      const entered = await this.waitForMelodySequence(melody.length);
      if (!this.running || !entered) break;

      const isCorrect = entered.every((midi, idx) => midi === melody[idx]);
      if (isCorrect) correctCount += 1;
      adaptive.recordAnswer(melodyKey, isCorrect, performance.now() - tapStartedAt);

      const answerAt = Math.max(listenEnd, this.audio.ctx.currentTime + 0.02);
      if (isCorrect) {
        this.setDisplay(`${melody.length} notes`, "correct", null, { mark: "✓" });
        this.progressEl.textContent = `${index}/${numNotes} · correct · ${correctCount}/${index}`;
      } else {
        this.setDisplay(`${melody.length} notes`, "wrong", null, { mark: "×" });
        this.progressEl.textContent = `${index}/${numNotes} · wrong · ${correctCount}/${index}`;
      }

      this.maybeClick(answerAt);
      this.audio.scheduleMelody(melody, answerAt, beatSec, this.audio.noteAnswerGain);
      if (!(await this.waitUntilAudio(answerAt + melody.length * beatSec))) break;
    }

    if (!this.running) return;

    const accuracy = numNotes ? Math.round((correctCount / numNotes) * 100) : 0;
    this.setDisplay("Done", "answer");
    this.progressEl.textContent = `${correctCount}/${numNotes} (${accuracy}%)`;
    this.stop();
  }

  async start() {
    if (this.running || !this.samplesReady) return;

    const bpm = Number(this.bpmEl.value) || 60;
    const numNotes = Number(this.numNotesEl.value) || DEFAULT_NUM_NOTES;
    const notes = this.getSessionNotes();
    if (!notes.length) {
      this.setStatus("No notes in selected range.");
      return;
    }

    this.running = true;
    this.currentQuestion = null;
    this.audio.resumeOnUserGesture();
    if (!this.audio.ctx) await this.audio.init();
    this.audio.resumeOnUserGesture();
    await this.audio.ensurePlayback();

    this.setControlsDisabled(true);
    this.resetKeyboard();
    this.setDisplay("?", "question");
    this.setStatus("");

    try {
      const beatSec = 60 / bpm;
      await this.prepareSession(notes, beatSec);

      if (this.isChordMode()) {
        await this.startChordSession({ numNotes, beatSec });
      } else if (this.isIntervalMode()) {
        await this.startIntervalSession({ numNotes, beatSec, notes });
      } else if (this.isMelodyMode()) {
        await this.startMelodySession({ numNotes, beatSec, notes });
      } else if (this.isInteractiveMode()) {
        await this.startInteractiveSession({
          numNotes,
          beatSec,
          notes,
          withReferenceA: this.usesReferenceA(),
        });
      } else {
        await this.startPassiveSession({ numNotes, beatSec, notes });
      }
    } catch (error) {
      if (error.message !== "Loading cancelled") {
        this.setStatus(`Load failed: ${error.message}`);
      }
      this.stop();
    }
  }
}

function disablePageZoom() {
  const blockGesture = (event) => event.preventDefault();
  document.addEventListener("gesturestart", blockGesture, { passive: false });
  document.addEventListener("gesturechange", blockGesture, { passive: false });
  document.addEventListener("gestureend", blockGesture, { passive: false });
}

disablePageZoom();
new EarTrainingApp();
