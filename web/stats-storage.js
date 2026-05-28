/* Shared practice stats storage and helpers for app.js + stats.js */
(function (global) {
  const PRACTICE_TIME_STORAGE_KEY = "earTrainingPracticeMs";
  const DAILY_LOG_STORAGE_KEY = "earTrainingDailyLog";
  const ADAPTIVE_STATS_STORAGE_KEY = "earTrainingAdaptiveStats";
  const DAILY_GOAL_MS = 10 * 60 * 1000;
  const HEATMAP_WEEKS = 12;

  const INTERVAL_ORDER = ["m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7", "P8"];
  const INTERVAL_LABELS = {
    m2: "m2",
    M2: "M2",
    m3: "m3",
    M3: "M3",
    P4: "P4",
    TT: "TT",
    P5: "P5",
    m6: "m6",
    M6: "M6",
    m7: "m7",
    M7: "M7",
    P8: "P8",
  };

  const MODE_LABELS = {
    interactive: "Interactive",
    bass: "Bass",
    melody: "Melody",
    intervals: "Intervals",
    chords: "Chords",
  };

  const DIATONIC = new Set([0, 2, 4, 5, 7, 9, 11]);
  const SYLLABLE = {
    0: "Do",
    2: "Re",
    4: "Mi",
    5: "Fa",
    7: "So",
    9: "La",
    11: "Ti",
  };

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

  function localDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function loadDailyLog() {
    try {
      return JSON.parse(localStorage.getItem(DAILY_LOG_STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function loadTotalPracticeMs() {
    try {
      return Math.max(0, Number(localStorage.getItem(PRACTICE_TIME_STORAGE_KEY)) || 0);
    } catch {
      return 0;
    }
  }

  function loadAdaptiveStats() {
    try {
      return JSON.parse(localStorage.getItem(ADAPTIVE_STATS_STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function accuracyPercent(stats) {
    if (!stats?.attempts) return null;
    return Math.round((stats.correct / stats.attempts) * 100);
  }

  function avgResponseSec(stats) {
    if (!stats?.attempts) return null;
    return (stats.totalResponseMs / stats.attempts / 1000).toFixed(1);
  }

  function mergeScopeStats(allStats, prefix) {
    const merged = {};
    for (const [scope, notes] of Object.entries(allStats)) {
      if (!scope.startsWith(prefix)) continue;
      for (const [id, stats] of Object.entries(notes)) {
        if (!merged[id]) {
          merged[id] = { attempts: 0, correct: 0, totalResponseMs: 0 };
        }
        merged[id].attempts += stats.attempts || 0;
        merged[id].correct += stats.correct || 0;
        merged[id].totalResponseMs += stats.totalResponseMs || 0;
      }
    }
    return merged;
  }

  function mergeScopesByPrefixes(allStats, prefixes) {
    const merged = {};
    for (const [scope, notes] of Object.entries(allStats)) {
      if (!prefixes.some((prefix) => scope.startsWith(prefix))) continue;
      for (const [id, stats] of Object.entries(notes)) {
        if (!merged[id]) {
          merged[id] = { attempts: 0, correct: 0, totalResponseMs: 0 };
        }
        merged[id].attempts += stats.attempts || 0;
        merged[id].correct += stats.correct || 0;
        merged[id].totalResponseMs += stats.totalResponseMs || 0;
      }
    }
    return merged;
  }

  function noteDisplayLabel(midi) {
    const pc = midi % 12;
    const sol = SYLLABLE[pc];
    if (DIATONIC.has(pc) && sol) return sol;
    const sharpNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const flatNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const preferFlat = pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
    const name = preferFlat ? flatNames[pc] : sharpNames[pc];
    return `${name}${Math.floor(midi / 12) - 1}`;
  }

  function isMidiKey(key) {
    return /^\d+$/.test(String(key));
  }

  function buildRadarDataset(merged, order, labelMap) {
    const labels = [];
    const values = [];
    for (const id of order) {
      if (!merged[id]?.attempts) continue;
      labels.push(labelMap[id] || id);
      values.push(accuracyPercent(merged[id]) ?? 0);
    }
    return { labels, values };
  }

  function buildSolfegeRadarDataset(merged) {
    const midiKeys = Object.keys(merged)
      .filter(isMidiKey)
      .map(Number)
      .sort((a, b) => a - b);
    const labels = [];
    const values = [];
    for (const midi of midiKeys) {
      const stats = merged[String(midi)];
      if (!stats?.attempts) continue;
      labels.push(noteDisplayLabel(midi));
      values.push(accuracyPercent(stats) ?? 0);
    }
    return { labels, values };
  }

  function summarizeModes(allStats) {
    const summary = {};
    for (const [scope, notes] of Object.entries(allStats)) {
      const mode = scope.split(":")[0];
      if (!summary[mode]) {
        summary[mode] = { attempts: 0, correct: 0, totalResponseMs: 0 };
      }
      for (const stats of Object.values(notes)) {
        summary[mode].attempts += stats.attempts || 0;
        summary[mode].correct += stats.correct || 0;
        summary[mode].totalResponseMs += stats.totalResponseMs || 0;
      }
    }
    return summary;
  }

  function renderHeatmap(container, days) {
    container.innerHTML = "";
    for (const cell of days) {
      const el = document.createElement("span");
      el.className = "heatmap-cell";
      el.title = `${cell.key}: ${Math.round(cell.ms / 60000)} min`;
      const ratio = Math.min(1, cell.ms / DAILY_GOAL_MS);
      if (ratio >= 1) el.classList.add("level-4");
      else if (ratio >= 0.75) el.classList.add("level-3");
      else if (ratio >= 0.4) el.classList.add("level-2");
      else if (ratio > 0) el.classList.add("level-1");
      container.appendChild(el);
    }
  }

  function heatmapCells(days, weeks = HEATMAP_WEEKS) {
    const cells = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - weeks * 7 + 1);
    for (let i = 0; i < weeks * 7; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const key = localDateKey(day);
      cells.push({ key, ms: Math.max(0, days[key] || 0) });
    }
    return cells;
  }

  function getStreak(days, goalMs = DAILY_GOAL_MS) {
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const key = localDateKey(cursor);
      if ((days[key] || 0) >= goalMs) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  function formatChordWeakLabel(id) {
    return id.replace(/-root$/, "").replace(/-inv(\d+)/, " inv$1");
  }

  function collectWeakAreas({
    intervalMerged = {},
    chordMerged = {},
    solfegeMerged = {},
    melodyMerged = {},
  } = {}) {
    const rows = [];
    for (const [id, stats] of Object.entries(intervalMerged)) {
      const acc = accuracyPercent(stats);
      if (acc == null) continue;
      rows.push({
        label: `Interval ${INTERVAL_LABELS[id] || id}`,
        accuracy: acc,
        attempts: stats.attempts,
        response: avgResponseSec(stats),
      });
    }
    for (const [id, stats] of Object.entries(chordMerged)) {
      const acc = accuracyPercent(stats);
      if (acc == null) continue;
      rows.push({
        label: `Chord ${formatChordWeakLabel(id)}`,
        accuracy: acc,
        attempts: stats.attempts,
        response: avgResponseSec(stats),
      });
    }
    for (const [id, stats] of Object.entries(solfegeMerged)) {
      if (!isMidiKey(id)) continue;
      const acc = accuracyPercent(stats);
      if (acc == null) continue;
      rows.push({
        label: `Note ${noteDisplayLabel(Number(id))}`,
        accuracy: acc,
        attempts: stats.attempts,
        response: avgResponseSec(stats),
      });
    }
    for (const [id, stats] of Object.entries(melodyMerged)) {
      const acc = accuracyPercent(stats);
      if (acc == null) continue;
      const noteCount = String(id).split("-").length;
      rows.push({
        label: `Melody (${noteCount} notes)`,
        accuracy: acc,
        attempts: stats.attempts,
        response: avgResponseSec(stats),
      });
    }
    return rows
      .filter((row) => row.attempts >= 3)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);
  }

  global.EarTrainingStats = {
    PRACTICE_TIME_STORAGE_KEY,
    DAILY_LOG_STORAGE_KEY,
    ADAPTIVE_STATS_STORAGE_KEY,
    DAILY_GOAL_MS,
    HEATMAP_WEEKS,
    INTERVAL_ORDER,
    INTERVAL_LABELS,
    MODE_LABELS,
    formatPracticeTime,
    localDateKey,
    loadDailyLog,
    loadTotalPracticeMs,
    loadAdaptiveStats,
    accuracyPercent,
    avgResponseSec,
    mergeScopeStats,
    mergeScopesByPrefixes,
    buildRadarDataset,
    buildSolfegeRadarDataset,
    summarizeModes,
    noteDisplayLabel,
    renderHeatmap,
    heatmapCells,
    getStreak,
    collectWeakAreas,
  };
})(window);
