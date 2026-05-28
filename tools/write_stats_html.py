"""Write stats.html as UTF-8."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = json.loads((ROOT / "version.json").read_text(encoding="utf-8"))["version"]

HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <title>Ear Training \\u00b7 Stats</title>
  <!-- build: {VERSION} -->
  <link rel="stylesheet" href="styles.css?v={VERSION}">
</head>
<body>
  <div class="app stats-page">
    <header class="header">
      <a class="back-link" href="index.html">\\u2190 Practice</a>
      <h1>Stats</h1>
      <p id="totalPractice" class="subtitle">Total practiced 0:00</p>
      <p id="dailyGoalText" class="daily-goal-text">Today 0 / 10 min \\u00b7 Streak 0</p>
    </header>

    <section class="stats-panel">
      <h2 class="stats-heading">12-week activity</h2>
      <div id="practiceHeatmap" class="practice-heatmap stats-heatmap" aria-label="Practice heatmap"></div>
    </section>

    <section class="stats-panel">
      <h2 class="stats-heading">Accuracy by mode</h2>
      <ul id="modeOverviewList" class="mode-overview-list"></ul>
    </section>

    <section class="stats-panel">
      <h2 class="stats-heading">Solfege accuracy</h2>
      <p id="solfegeChartHint" class="stats-hint">Practice Interactive or Bass to see note accuracy.</p>
      <div class="chart-wrap">
        <canvas id="solfegeRadar"></canvas>
      </div>
    </section>

    <section class="stats-panel">
      <h2 class="stats-heading">Interval accuracy</h2>
      <p id="intervalChartHint" class="stats-hint">Practice intervals to see your radar chart.</p>
      <div class="chart-wrap">
        <canvas id="intervalRadar"></canvas>
      </div>
    </section>

    <section class="stats-panel">
      <h2 class="stats-heading">Chord accuracy</h2>
      <p id="chordChartHint" class="stats-hint">Practice chords to see your radar chart.</p>
      <div class="chart-wrap">
        <canvas id="chordRadar"></canvas>
      </div>
    </section>

    <section class="stats-panel">
      <h2 class="stats-heading">Weakest areas</h2>
      <ul id="weakList" class="weak-list"></ul>
    </section>

    <footer class="footer">
      <p>\\u00a9 Hao Yang</p>
    </footer>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="stats-storage.js?v={VERSION}"></script>
  <script src="stats.js?v={VERSION}"></script>
  <script>
    if ("serviceWorker" in navigator) {{
      window.addEventListener("load", () => {{
        navigator.serviceWorker.register("sw.js?v={VERSION}").then((registration) => {{
          registration.update();
        }}).catch(() => {{}});
      }});
    }}
  </script>
</body>
</html>
"""

(ROOT / "web" / "stats.html").write_text(HTML, encoding="utf-8", newline="\n")
print("Wrote stats.html")
