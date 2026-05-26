const RANGE_PRESETS = {
  beginner: { start: 60, end: 72, label: "Beginner C4-C5" },
  regular: { start: 55, end: 67, label: "Regular G3-G4" },
  advanced: { start: 48, end: 72, label: "Advanced C3-C5" },
};

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
const BLACK_PC = new Set([1, 3, 6, 8, 10]);
const APP_VERSION = "20260528a";

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

function friendlyOrigin() {
  const { protocol, hostname, port } = window.location;
  if (!hostname || isIPv4Host(hostname)) return null;
  const portPart = port ? `:${port}` : "";
  return `${protocol}//${hostname}${portPart}`;
}

const DEFAULT_NUM_NOTES = 300;

const MODE_SUBTITLES = {
  passive: "2 beats listen · auto answer · lock screen OK",
  interactive: "2 beats listen · tap the key",
};

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
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

function instrumentRelativeSamplePath(instrumentId, sampleRef) {
  return `samples/${instrumentId === "piano" ? "piano" : `instruments/${instrumentId}`}/${normalizeSampleRef(sampleRef)}`;
}

function assetUrl(relativePath) {
  return buildAssetUrl(getAssetRoot(), relativePath);
}

const AUDIO_SOURCE_STORAGE_KEY = "earTrainingAudioSource";

function getCustomCdnUrl() {
  const raw = window.EAR_TRAINING_CUSTOM_CDN ?? window.EAR_TRAINING_CDN ?? "";
  return String(raw).replace(/\/$/, "");
}

function hasCustomCdn() {
  return Boolean(getCustomCdnUrl());
}

function getStoredAudioSource() {
  const stored = localStorage.getItem(AUDIO_SOURCE_STORAGE_KEY);
  if (stored === "custom" && hasCustomCdn()) return "custom";
  if (stored === "github") return "github";
  if (location.hostname.endsWith("github.io")) return "github";
  if (hasCustomCdn()) return "custom";
  return "github";
}

function setStoredAudioSource(source) {
  localStorage.setItem(AUDIO_SOURCE_STORAGE_KEY, source === "custom" ? "custom" : "github");
}

function assetPath(path) {
  return assetUrl(path);
}

function isCosHosted() {
  return /\.myqcloud\.com$/i.test(location.hostname);
}

function getAssetSourceLabel() {
  if (isCosHosted()) return "Tencent COS";
  if (getStoredAudioSource() === "custom" && hasCustomCdn()) return "custom CDN";
  if (getGithubPagesProjectRoot()) return "GitHub Pages";
  if (window.EAR_TRAINING_USE_CDN === false) return "GitHub Pages";
  if (getJsDelivrAssetRoots().length) return "jsDelivr CDN";
  return "local";
}

function getGithubPagesProjectRoot() {
  if (!location.hostname.endsWith("github.io")) return "";
  const [repo] = location.pathname.split("/").filter(Boolean);
  return repo && !repo.includes(".") ? `/${repo}` : "";
}

function getJsDelivrDocsRoot() {
  const match = location.pathname.match(/^(.*\/gh\/[^/]+\/[^/]+@[^/]+\/docs)/);
  return match ? `${location.origin}${match[1]}` : "";
}

function getJsDelivrAssetRoots() {
  if (window.EAR_TRAINING_USE_CDN === false) return [];
  const directRoot = getJsDelivrDocsRoot();
  if (directRoot) return [directRoot];
  if (!location.hostname.endsWith("github.io")) return [];
  const [repo] = location.pathname.split("/").filter(Boolean);
  if (!repo || repo.includes(".")) return [];
  const user = location.hostname.split(".")[0];
  const slug = `${user}/${repo}@main/docs`;
  return [
    `https://gcore.jsdelivr.net/gh/${slug}`,
    `https://fastly.jsdelivr.net/gh/${slug}`,
    `https://cdn.jsdelivr.net/gh/${slug}`,
  ];
}

function getAssetRoot() {
  if (window.EAR_TRAINING_BASE != null) {
    return String(window.EAR_TRAINING_BASE).replace(/\/$/, "");
  }
  if (isCosHosted()) {
    return "";
  }
  if (getStoredAudioSource() === "custom" && hasCustomCdn()) {
    return getCustomCdnUrl();
  }
  const pagesRoot = getGithubPagesProjectRoot();
  if (pagesRoot) return pagesRoot;
  const jsdelivrRoot = getJsDelivrDocsRoot();
  if (jsdelivrRoot) return jsdelivrRoot;
  if (hasCustomCdn()) return getCustomCdnUrl();
  const cdnRoots = getJsDelivrAssetRoots();
  if (cdnRoots.length) return cdnRoots[0];
  if (location.hostname.endsWith("gitee.io") || location.hostname.endsWith("gitcode.host")) {
    const [repo] = location.pathname.split("/").filter(Boolean);
    return repo && !repo.includes(".") ? `/${repo}` : "";
  }
  return "";
}

function getAssetLoadRoots() {
  const roots = [];
  const primary = getAssetRoot();
  if (primary) roots.push(primary);

  const pagesRoot = getGithubPagesProjectRoot();
  if (pagesRoot && !roots.includes(pagesRoot)) roots.push(pagesRoot);

  const jsdelivrRoot = getJsDelivrDocsRoot();
  if (jsdelivrRoot && !roots.includes(jsdelivrRoot)) roots.push(jsdelivrRoot);

  for (const cdnRoot of getJsDelivrAssetRoots()) {
    if (!roots.includes(cdnRoot)) roots.push(cdnRoot);
  }

  const customCdn = getCustomCdnUrl();
  if (customCdn && !roots.includes(customCdn)) roots.push(customCdn);

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

const NOTE_BEAT1_GAIN = 0.92;
const NOTE_ANSWER_GAIN = 0.32;
const SOLFEGE_GAIN = 0.58;
// Match ear_training.py METRONOME_VOLUME_DB = -20
const METRONOME_GAIN = 0.1;
const METRONOME_FREQ_HZ = 1800;
const METRONOME_DURATION_SEC = 0.012;
const METRONOME_FADE_SEC = 0.01;

const INSTRUMENTS = {
  piano: {
    label: "Piano · 钢琴",
    sfzRel: "samples/piano/UprightPianoKW-20220221.sfz",
    sampleFilter: (sample) => sample.endsWith("vL.ogg"),
  },
  violin: {
    label: "Violin · 小提琴",
    sfzRel: "samples/instruments/violin/instrument.sfz",
    gain: 1.55,
  },
  guitar: {
    label: "Guitar · 吉他",
    sfzRel: "samples/instruments/guitar/instrument.sfz",
  },
  guzheng: {
    label: "Guzheng · 古筝",
    sfzRel: "samples/instruments/guzheng/instrument.sfz",
  },
  erhu: {
    label: "Erhu · 二胡",
    sfzRel: "samples/instruments/erhu/instrument.sfz",
  },
  harp: {
    label: "Harp · 竖琴",
    sfzRel: "samples/instruments/harp/instrument.sfz",
    gain: 1.55,
  },
  saxophone: {
    label: "Saxophone · 萨克斯",
    sfzRel: "samples/instruments/saxophone/instrument.sfz",
  },
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.bufferCache = new Map();
    this.trimmedNoteCache = new Map();
    this.allInstrumentRegions = [];
    this.instrumentRegions = [];
    this.instrumentId = "piano";
    this.instrumentGain = 1;
    this.noteBeat1Gain = NOTE_BEAT1_GAIN;
    this.noteAnswerGain = NOTE_ANSWER_GAIN;
    this.clickBuffer = null;
    this.activeVoices = [];
    this.scheduledSources = [];
    this.mediaStreamDest = null;
    this.bridgeAudio = null;
    this.backgroundActive = false;
    this.resumeWatchdog = null;
    this.loadAbortController = null;
    this.warmPreloadController = null;
    this.playbackKeepalive = null;
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
  }

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.82;

    // Safari/iOS suspends Web Audio on lock screen unless output goes through
    // an HTMLMediaElement backed by a MediaStream.
    if (isIOSDevice()) {
      this.mediaStreamDest = this.ctx.createMediaStreamDestination();
      this.master.connect(this.mediaStreamDest);
      this.bridgeAudio = new Audio();
      this.bridgeAudio.srcObject = this.mediaStreamDest.stream;
      this.bridgeAudio.setAttribute("playsinline", "");
    } else {
      this.master.connect(this.ctx.destination);
    }

    await this.setInstrument(this.instrumentId);
    this.clickBuffer = this.createMetronomeClickBuffer();
  }

  async setInstrument(instrumentId) {
    const config = INSTRUMENTS[instrumentId] || INSTRUMENTS.piano;
    this.instrumentId = instrumentId in INSTRUMENTS ? instrumentId : "piano";
    this.instrumentGain = config.gain ?? 1;
    this.noteBeat1Gain = NOTE_BEAT1_GAIN;
    this.noteAnswerGain = NOTE_ANSWER_GAIN;

    const sfzText = await fetchTextAsset(config.sfzRel).catch((error) => {
      throw new Error(`Failed to load instrument map (${error.message.replace(/^HTTP /, "")})`);
    });
    this.allInstrumentRegions = parseSfz(sfzText);
    this.instrumentRegions = this.allInstrumentRegions.filter((region) =>
      config.sampleFilter ? config.sampleFilter(region.sample) : true
    );
    if (!this.instrumentRegions.length) {
      throw new Error(`No samples found for ${config.label}`);
    }
    for (const midi of [48, 55, 60, 67, 72]) {
      if (!findSampleRegion(this.instrumentRegions, midi)) {
        throw new Error(`${config.label} is missing samples for ${noteLabel(midi)}`);
      }
    }
    this.trimmedNoteCache.clear();
  }

  trimClipForBeat(buffer, wallDurationSec, playbackRate = 1, maxFadeMs = 80, fadeDivisor = 5) {
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
    const fadeStart = totalSamples - fadeSamples;
    const trimmed = this.ctx.createBuffer(buffer.numberOfChannels, totalSamples, sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const source = buffer.getChannelData(channel);
      const target = trimmed.getChannelData(channel);
      for (let i = 0; i < totalSamples; i += 1) {
        let gain = 1;
        if (i >= fadeStart) {
          gain = (totalSamples - i) / fadeSamples;
        }
        target[i] = source[i] * gain;
      }
    }

    return trimmed;
  }

  trimSolfegeForBeat(buffer, durationSec) {
    return this.trimClipForBeat(buffer, durationSec, 1, 80, 5);
  }

  trimInstrumentForBeat(buffer, durationSec, playbackRate) {
    // Match ear_training.PianoSampleBank.get_tone(): fade_out(min(200ms, beat/4))
    return this.trimClipForBeat(buffer, durationSec, playbackRate, 200, 4);
  }

  haltAudibleOutput() {
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
    }
    const index = this.scheduledSources.indexOf(source);
    if (index !== -1) this.scheduledSources.splice(index, 1);
  }

  stopAllVoices(immediate = true) {
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

  instrumentSamplePath(midi) {
    const region = findSampleRegion(this.instrumentRegions, midi);
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

  clearSampleCache() {
    this.bufferCache.clear();
    this.trimmedNoteCache.clear();
  }

  notesPreloadUrls(notes) {
    const urls = new Set();
    for (const midi of notes) {
      urls.add(this.instrumentSamplePath(midi));
      urls.add(this.solfegePath(midi));
    }
    return this.sortPreloadUrls([...urls]);
  }

  areNotesPreloaded(notes) {
    return this.notesPreloadUrls(notes).every((url) => this.bufferCache.has(url));
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

  async decodeFetchedAudio(arrayBuffer, url) {
    if (isIOSDevice()) {
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

  notesInstrumentPreloadUrls(notes) {
    const urls = new Set();
    for (const midi of notes) {
      urls.add(this.instrumentSamplePath(midi));
    }
    return this.sortPreloadUrls([...urls]);
  }

  notesSolfegePreloadUrls(notes) {
    const urls = new Set();
    for (const midi of notes) {
      urls.add(this.solfegePath(midi));
    }
    return [...urls].sort((a, b) => a.localeCompare(b));
  }

  async preloadUrls(list, concurrency, onProgress, signal, progressState) {
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
          onProgress?.(progressState.done, progressState.total, url);
          continue;
        }
        onProgress?.(progressState.done, progressState.total, url);
        await this.loadBuffer(url, { signal });
        progressState.done += 1;
        onProgress?.(progressState.done, progressState.total, url);
        if (isIPhone()) {
          await new Promise((resolve) => window.setTimeout(resolve, 0));
        }
      }
    }
  }

  async loadBuffer(url, { signal = null } = {}) {
    if (this.bufferCache.has(url)) return this.bufferCache.get(url);
    if (signal?.aborted) {
      throw new Error("Loading cancelled");
    }

    let lastError = null;
    for (const tryUrl of assetLoadUrlsWithFallbacks(url)) {
      if (this.bufferCache.has(tryUrl)) {
        const cached = this.bufferCache.get(tryUrl);
        this.bufferCache.set(url, cached);
        return cached;
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
        const audioBuffer = await this.decodeFetchedAudio(arrayBuffer, tryUrl);
        this.bufferCache.set(url, audioBuffer);
        this.bufferCache.set(tryUrl, audioBuffer);
        return audioBuffer;
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

  async preloadNotes(notes, beatSec, onProgress, signal = null) {
    const instrumentUrls = this.notesInstrumentPreloadUrls(notes);
    const solfegeUrls = this.notesSolfegePreloadUrls(notes);
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
      this.getTrimmedNoteBuffer(midi, beatSec);
      this.getTrimmedSolfegeBuffer(midi, beatSec);
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
        artist: "Passive Quick · 被动快速",
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
    const buffer = await this.loadBuffer(url);
    this.scheduleNoteBuffer(buffer, midi, when, durationSec);
  }

  scheduleNote(midi, when, durationSec, gain = 1) {
    const url = this.instrumentSamplePath(midi);
    const buffer = this.bufferCache.get(url);
    if (!buffer) throw new Error(`Sample not preloaded: ${url}`);
    this.scheduleNoteBuffer(buffer, midi, when, durationSec, gain);
  }

  scheduleNoteBuffer(buffer, midi, when, durationSec, gain = 1) {
    const trimmed = this.getTrimmedNoteBuffer(midi, durationSec);
    this.playBuffer(trimmed, when, {
      gain: gain * this.instrumentGain,
      playbackRate: this.instrumentPlaybackRate(midi),
    });
  }

  scheduleSolfege(midi, when, durationSec) {
    const buffer = this.getTrimmedSolfegeBuffer(midi, durationSec);
    this.playBuffer(buffer, when, {
      gain: SOLFEGE_GAIN,
    });
  }

  async playSolfege(midi, when, durationSec) {
    const url = this.solfegePath(midi);
    const buffer = await this.loadBuffer(url);
    const trimmed = this.trimSolfegeForBeat(buffer, durationSec);
    this.playBuffer(trimmed, when, { gain: SOLFEGE_GAIN });
  }

  playClick(when) {
    if (!this.ctx || !this.clickBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.clickBuffer;
    source.connect(this.master);
    source.start(when);
    source.stop(when + this.clickBuffer.duration + 0.001);
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

class EarTrainingApp {
  constructor() {
    this.audio = new AudioEngine();
    this.timeouts = [];
    this.running = false;
    this.interactiveResolve = null;
    this.keyboard = null;

    this.modeEl = document.getElementById("mode");
    this.subtitleEl = document.getElementById("subtitle");
    this.metronomeEl = document.getElementById("metronome");
    this.instrumentEl = document.getElementById("instrument");
    this.levelEl = document.getElementById("level");
    this.bpmEl = document.getElementById("bpm");
    this.numNotesEl = document.getElementById("numNotes");
    this.noteDisplayEl = document.getElementById("noteDisplay");
    this.progressEl = document.getElementById("progress");
    this.statusEl = document.getElementById("status");
    this.helpEl = document.getElementById("help");
    this.keyboardEl = document.getElementById("pianoKeyboard");
    this.startBtn = document.getElementById("startBtn");
    this.stopBtn = document.getElementById("stopBtn");
    this.audioSourceEl = document.getElementById("audioSource");
    this.audioSourceWrapEl = document.getElementById("audioSourceWrap");
    this.modeSourceRowEl = document.getElementById("modeSourceRow");

    this.startBtn.addEventListener("click", () => this.start());
    this.stopBtn.addEventListener("click", () => this.stop());
    this.levelEl.addEventListener("change", () => {
      this.resetKeyboard();
    });
    this.modeEl.addEventListener("change", () => this.updateModeHint());
    this.instrumentEl.addEventListener("change", () => this.onInstrumentChange());
    this.audioSourceEl?.addEventListener("change", () => this.onAudioSourceChange());

    this.initAudioSourceControl();

    this.resetKeyboard();
    this.numNotesEl.value = String(DEFAULT_NUM_NOTES);
    this.updateModeHint();
    this.setDisplay("?", "question");
    this.checkServer();
  }

  initAudioSourceControl() {
    if (!this.audioSourceEl) return;
    if (isCosHosted() || !hasCustomCdn()) {
      this.audioSourceWrapEl?.classList.add("hidden");
      this.modeSourceRowEl?.classList.add("single");
      return;
    }
    try {
      if (!localStorage.getItem(AUDIO_SOURCE_STORAGE_KEY)) {
        setStoredAudioSource("github");
      }
    } catch {
      // Ignore private mode storage errors.
    }
    this.audioSourceEl.value = getStoredAudioSource();
  }

  async onAudioSourceChange() {
    if (this.running || !this.audioSourceEl) return;
    setStoredAudioSource(this.audioSourceEl.value);
    this.audio.cancelWarmPreload();
    this.audio.cancelPendingLoads();
    this.audio.clearSampleCache();
    this.setStatus("Switching audio source...");
    await this.checkServer();
    this.setStatus("");
  }

  updateModeHint() {
    const mode = this.modeEl.value;
    this.subtitleEl.textContent = MODE_SUBTITLES[mode] || MODE_SUBTITLES.passive;
  }

  isInteractiveMode() {
    return this.modeEl.value === "interactive";
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
      if (getStoredAudioSource() !== "custom" && hasCustomCdn()) {
        setStoredAudioSource("custom");
        if (this.audioSourceEl) this.audioSourceEl.value = "custom";
        this.audio.clearSampleCache();
        try {
          await this.probeSampleAsset("samples/piano/UprightPianoKW-20220221.sfz");
        } catch (retryError) {
          this.helpEl.textContent = "Cannot load samples. Check network, then refresh.";
          this.setStatus(`Server check failed: ${retryError.message}`);
          return;
        }
      } else {
        this.helpEl.textContent = "Cannot load samples. Try another audio source, then refresh.";
        this.setStatus(`Server check failed: ${error.message}`);
        return;
      }
    }

    this.helpEl.textContent = `Connected · ${getAssetSourceLabel()} · v${APP_VERSION} · add to Home Screen · samples cache on first use`;
  }

  getPreset() {
    return RANGE_PRESETS[this.levelEl.value] || RANGE_PRESETS.advanced;
  }

  getCurrentRangeNotes() {
    const preset = this.getPreset();
    return diatonicNotes(preset.start, preset.end);
  }

  async warmPreloadForCurrentRange() {
    if (this.running) return;
    try {
      if (!this.audio.ctx) await this.audio.init();
      await this.audio.setInstrument(this.instrumentEl.value);
      const notes = this.getCurrentRangeNotes();
      const beatSec = 60 / (Number(this.bpmEl.value) || 60);
      this.audio.warmPreloadNotes(notes, beatSec);
    } catch {
      // Background preload is best-effort.
    }
  }

  async onInstrumentChange() {
    if (this.running) return;
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
    const preset = this.getPreset();
    this.keyboard = new PianoKeyboard(this.keyboardEl, preset.start, preset.end);
    this.keyboard.setInteractive(false);
  }

  setDisplay(text, tone = "question") {
    this.noteDisplayEl.textContent = text;
    this.noteDisplayEl.classList.remove("question", "answer", "correct", "wrong", "tap");
    this.noteDisplayEl.classList.add(tone);
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
    if (!this.metronomeEnabled()) return;
    for (let beat = 0; beat < totalBeats; beat += 1) {
      this.audio.playClick(startAt + beat * beatSec);
    }
  }

  waitForKeyPress() {
    return new Promise((resolve) => {
      this.interactiveResolve = resolve;
      this.keyboard.setInteractive(true, (midi) => {
        if (!this.running || !this.interactiveResolve) return;
        this.keyboard.setInteractive(false);
        const done = this.interactiveResolve;
        this.interactiveResolve = null;
        done(midi);
      });
    });
  }

  setControlsDisabled(disabled) {
    this.startBtn.disabled = disabled;
    this.stopBtn.disabled = !disabled;
    this.modeEl.disabled = disabled;
    this.metronomeEl.disabled = disabled;
    this.instrumentEl.disabled = disabled;
    this.levelEl.disabled = disabled;
    this.bpmEl.disabled = disabled;
    this.numNotesEl.disabled = disabled;
    if (this.audioSourceEl) this.audioSourceEl.disabled = disabled;
  }

  stop() {
    this.running = false;
    this.audio.cancelPendingLoads();
    this.audio.stopAllVoices(true);
    this.audio.stopPlaybackKeepalive();
    this.audio.stopBackgroundMode();
    this.clearSchedules();
    this.setDisplay("?", "question");
    this.progressEl.textContent = "Stopped";
    this.setStatus("");
    this.setControlsDisabled(false);
  }

  formatLoadingStatus(done, total, url = "") {
    const fileName = url ? url.split("/").pop() : "";
    return fileName
      ? `Loading samples ${done}/${total} · ${decodeURIComponent(fileName)}`
      : `Loading samples ${done}/${total}...`;
  }

  async prepareSession(notes, beatSec) {
    if (!this.audio.ctx) await this.audio.init();
    await this.audio.ensurePlayback();
    await this.audio.setInstrument(this.instrumentEl.value);

    this.audio.cancelPendingLoads();
    this.audio.cancelWarmPreload();
    this.audio.loadAbortController = new AbortController();
    const signal = this.audio.loadAbortController.signal;
    const beatSecValue = beatSec;

    if (!this.audio.areNotesPreloaded(notes)) {
      await this.audio.preloadNotes(
        notes,
        beatSecValue,
        (done, total, url) => {
          if (!this.running) return;
          this.setStatus(this.formatLoadingStatus(done, total, url));
        },
        signal
      );
    } else {
      for (const midi of notes) {
        this.audio.getTrimmedNoteBuffer(midi, beatSecValue);
        this.audio.getTrimmedSolfegeBuffer(midi, beatSecValue);
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
        this.progressEl.textContent = `Note ${index} / ${numNotes} · Beat 1`;
        this.keyboard.clearFeedback();
      });
      this.audio.scheduleNote(midi, noteStart, beatSec, this.audio.noteBeat1Gain);

      const beat2 = noteStart + beatSec;
      this.scheduleAt(beat2, () => {
        if (!this.running) return;
        this.setDisplay("?", "question");
        this.progressEl.textContent = `Note ${index} / ${numNotes} · Beat 2`;
      });

      const beat3 = noteStart + 2 * beatSec;
      this.scheduleAt(beat3, () => {
        if (!this.running) return;
        this.setDisplay(solfegeDisplay(midi), "answer");
        this.progressEl.textContent = `Note ${index} / ${numNotes} · Answer`;
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
      this.progressEl.textContent = `${numNotes} notes completed`;
      this.stop();
    }, totalMs);
  }

  async startInteractiveSession({ numNotes, beatSec, notes }) {
    let correctCount = 0;
    await this.audio.ensurePlayback();

    for (let i = 0; i < numNotes; i += 1) {
      if (!this.running) break;

      const targetMidi = randomChoice(notes);
      const index = i + 1;
      const beat1 = this.audio.ctx.currentTime + 0.05;
      const beat2 = beat1 + beatSec;
      const beat3 = beat2 + beatSec;

      this.setDisplay("?", "question");
      this.keyboard.clearFeedback();
      this.progressEl.textContent = `Note ${index} / ${numNotes} · Beat 1 · Score ${correctCount}`;

      this.maybeClick(beat1);
      this.audio.scheduleNote(targetMidi, beat1, beatSec, this.audio.noteBeat1Gain);
      if (!(await this.waitUntilAudio(beat2))) break;

      this.setDisplay("?", "question");
      this.progressEl.textContent = `Note ${index} / ${numNotes} · Beat 2 · Score ${correctCount}`;
      this.maybeClick(beat2);
      if (!(await this.waitUntilAudio(beat3))) break;

      this.setDisplay("Tap", "tap");
      this.progressEl.textContent = `Note ${index} / ${numNotes} · Tap the key · Score ${correctCount}`;

      const pressedMidi = await this.waitForKeyPress();
      if (!this.running || pressedMidi === null) break;

      const isCorrect = pressedMidi === targetMidi;
      if (isCorrect) correctCount += 1;

      this.keyboard.markAnswer(pressedMidi, targetMidi);
      const answerAt = Math.max(beat3, this.audio.ctx.currentTime + 0.02);
      if (isCorrect) {
        this.setDisplay(`✓ ${solfegeDisplay(targetMidi)}`, "correct");
        this.progressEl.textContent = `Note ${index} / ${numNotes} · Correct · Score ${correctCount}/${index}`;
      } else {
        this.setDisplay(`✗ ${solfegeDisplay(targetMidi)}`, "wrong");
        this.progressEl.textContent =
          `Note ${index} / ${numNotes} · You: ${noteLabel(pressedMidi)} · Answer: ${solfegeDisplay(targetMidi)} · Score ${correctCount}/${index}`;
      }

      this.maybeClick(answerAt);
      this.audio.scheduleNote(targetMidi, answerAt, beatSec, this.audio.noteAnswerGain);
      this.audio.scheduleSolfege(targetMidi, answerAt, beatSec);
      if (!(await this.waitUntilAudio(answerAt + beatSec))) break;
    }

    if (!this.running) return;

    const accuracy = numNotes ? Math.round((correctCount / numNotes) * 100) : 0;
    this.setDisplay("Done", "answer");
    this.progressEl.textContent = `${correctCount} / ${numNotes} correct (${accuracy}%)`;
    this.stop();
  }

  async start() {
    if (this.running) return;

    const preset = this.getPreset();
    const bpm = Number(this.bpmEl.value) || 60;
    const numNotes = Number(this.numNotesEl.value) || DEFAULT_NUM_NOTES;
    const notes = diatonicNotes(preset.start, preset.end);
    if (!notes.length) {
      this.setStatus("No notes in selected range.");
      return;
    }

    this.running = true;
    this.audio.resumeOnUserGesture();
    if (!this.audio.ctx) await this.audio.init();
    this.audio.resumeOnUserGesture();
    await this.audio.ensurePlayback();

    this.setControlsDisabled(true);
    this.resetKeyboard();
    this.setDisplay("?", "question");
    this.setStatus("Loading samples...");

    try {
      const beatSec = 60 / bpm;
      await this.prepareSession(notes, beatSec);

      if (this.isInteractiveMode()) {
        await this.startInteractiveSession({ numNotes, beatSec, notes });
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
