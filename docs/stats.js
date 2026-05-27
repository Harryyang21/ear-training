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

function makeRadarChart(canvas, labels, values, color) {
  if (!labels.length) return null;
  return new Chart(canvas, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "Accuracy %",
          data: values,
          borderColor: color,
          backgroundColor: `${color}33`,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, backdropColor: "transparent", color: "#8b9cb3" },
          grid: { color: "#243042" },
          angleLines: { color: "#243042" },
          pointLabels: { color: "#eef2f7", font: { size: 11 } },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

function collectWeakAreas(intervalMerged, chordMerged) {
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
      label: `Chord ${id.replace(/-root$/, "").replace(/-inv(\d+)/, " inv$1")}`,
      accuracy: acc,
      attempts: stats.attempts,
      response: avgResponseSec(stats),
    });
  }
  return rows
    .filter((row) => row.attempts >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 8);
}

function initStatsPage() {
  const days = loadDailyLog();
  const totalMs = loadTotalPracticeMs();
  const todayMs = days[localDateKey()] || 0;
  const streak = getStreak(days);
  const todayMin = Math.floor(todayMs / 60000);
  const goalMin = Math.floor(DAILY_GOAL_MS / 60000);

  document.getElementById("totalPractice").textContent = `Total practiced ${formatPracticeTime(totalMs)}`;
  document.getElementById("dailyGoalText").textContent = `Today ${todayMin} / ${goalMin} min · Streak ${streak}`;
  renderHeatmap(document.getElementById("practiceHeatmap"), heatmapCells(days));

  const allAdaptive = loadAdaptiveStats();
  const intervalMerged = mergeScopeStats(allAdaptive, "intervals:");
  const chordMerged = mergeScopeStats(allAdaptive, "chords:");

  const intervalData = buildRadarDataset(intervalMerged, INTERVAL_ORDER, INTERVAL_LABELS);
  const chordIds = Object.keys(chordMerged).sort();
  const chordData = buildRadarDataset(chordMerged, chordIds, Object.fromEntries(chordIds.map((id) => [id, id])));

  const intervalHint = document.getElementById("intervalChartHint");
  const chordHint = document.getElementById("chordChartHint");
  intervalHint.hidden = intervalData.labels.length > 0;
  chordHint.hidden = chordData.labels.length > 0;

  if (intervalData.labels.length) {
    makeRadarChart(document.getElementById("intervalRadar"), intervalData.labels, intervalData.values, "#4da3ff");
  }
  if (chordData.labels.length) {
    makeRadarChart(document.getElementById("chordRadar"), chordData.labels, chordData.values, "#69db7c");
  }

  const weakList = document.getElementById("weakList");
  const weak = collectWeakAreas(intervalMerged, chordMerged);
  weakList.innerHTML = "";
  if (!weak.length) {
    const li = document.createElement("li");
    li.textContent = "Keep practicing — weak spots will appear after a few attempts.";
    weakList.appendChild(li);
  } else {
    for (const row of weak) {
      const li = document.createElement("li");
      li.textContent = `${row.label}: ${row.accuracy}% (${row.attempts} tries, ~${row.response}s)`;
      weakList.appendChild(li);
    }
  }
}

initStatsPage();
