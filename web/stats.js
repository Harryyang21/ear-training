const S = window.EarTrainingStats;

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

function renderModeOverview(container, modeSummary) {
  container.innerHTML = "";
  const order = ["interactive", "bass", "melody", "intervals", "chords"];
  let hasRows = false;

  for (const mode of order) {
    const stats = modeSummary[mode];
    if (!stats?.attempts) continue;
    hasRows = true;
    const li = document.createElement("li");
    const acc = S.accuracyPercent(stats);
    const avgSec = S.avgResponseSec(stats);
    li.textContent = `${S.MODE_LABELS[mode] || mode}: ${acc}% (${stats.attempts} tries, ~${avgSec}s avg)`;
    container.appendChild(li);
  }

  if (!hasRows) {
    const li = document.createElement("li");
    li.textContent = "Start an interactive session to track accuracy by mode.";
    container.appendChild(li);
  }
}

function initStatsPage() {
  const days = S.loadDailyLog();
  const totalMs = S.loadTotalPracticeMs();
  const todayMs = days[S.localDateKey()] || 0;
  const streak = S.getStreak(days);
  const todayMin = Math.floor(todayMs / 60000);
  const goalMin = Math.floor(S.DAILY_GOAL_MS / 60000);

  document.getElementById("totalPractice").textContent = `Total practiced ${S.formatPracticeTime(totalMs)}`;
  document.getElementById("dailyGoalText").textContent = `Today ${todayMin} / ${goalMin} min · Streak ${streak}`;
  S.renderHeatmap(document.getElementById("practiceHeatmap"), S.heatmapCells(days));

  const allAdaptive = S.loadAdaptiveStats();
  const modeSummary = S.summarizeModes(allAdaptive);
  renderModeOverview(document.getElementById("modeOverviewList"), modeSummary);

  const solfegeMerged = S.mergeScopesByPrefixes(allAdaptive, ["interactive:", "bass:"]);
  const intervalMerged = S.mergeScopeStats(allAdaptive, "intervals:");
  const chordMerged = S.mergeScopeStats(allAdaptive, "chords:");
  const melodyMerged = S.mergeScopeStats(allAdaptive, "melody:");

  const solfegeData = S.buildSolfegeRadarDataset(solfegeMerged);
  const intervalData = S.buildRadarDataset(intervalMerged, S.INTERVAL_ORDER, S.INTERVAL_LABELS);
  const chordIds = Object.keys(chordMerged).sort();
  const chordData = S.buildRadarDataset(
    chordMerged,
    chordIds,
    Object.fromEntries(chordIds.map((id) => [id, id]))
  );

  const solfegeHint = document.getElementById("solfegeChartHint");
  const intervalHint = document.getElementById("intervalChartHint");
  const chordHint = document.getElementById("chordChartHint");
  solfegeHint.hidden = solfegeData.labels.length > 0;
  intervalHint.hidden = intervalData.labels.length > 0;
  chordHint.hidden = chordData.labels.length > 0;

  if (solfegeData.labels.length) {
    makeRadarChart(document.getElementById("solfegeRadar"), solfegeData.labels, solfegeData.values, "#ffd43b");
  }
  if (intervalData.labels.length) {
    makeRadarChart(document.getElementById("intervalRadar"), intervalData.labels, intervalData.values, "#4da3ff");
  }
  if (chordData.labels.length) {
    makeRadarChart(document.getElementById("chordRadar"), chordData.labels, chordData.values, "#69db7c");
  }

  const weakList = document.getElementById("weakList");
  const weak = S.collectWeakAreas({ intervalMerged, chordMerged, solfegeMerged, melodyMerged });
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
