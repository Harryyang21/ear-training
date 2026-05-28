"""Restore web/index.html as UTF-8 from git and apply current script tags."""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web" / "index.html"
VERSION = "2.1.5"

text = subprocess.check_output(
    ["git", "show", "0d1a3cc:web/index.html"],
    cwd=ROOT,
).decode("utf-8")

# Ensure stats-storage loads before app.js
if "stats-storage.js" not in text:
    text = text.replace(
        '  <script src="app.js?v=',
        '  <script src="stats-storage.js?v=2.1.5"></script>\n  <script src="app.js?v=',
        1,
    )

text = re.sub(r"<!-- build: [^ ]+ -->", f"<!-- build: {VERSION} -->", text)
text = re.sub(r"styles\.css\?v=[^\"]+", f"styles.css?v={VERSION}", text)
text = re.sub(r"stats-storage\.js\?v=[^\"]+", f"stats-storage.js?v={VERSION}", text)
text = re.sub(r"app\.js\?v=[^\"]+", f"app.js?v={VERSION}", text)
text = re.sub(r"sw\.js\?v=[^\"]+", f"sw.js?v={VERSION}", text)

# Fix broken Next button if present
text = re.sub(
    r'<button id="nextBtn"[^>]*>.*?</button>',
    '<button id="nextBtn" class="btn review-next hidden" type="button" disabled>Next \u2192</button>',
    text,
    count=1,
    flags=re.DOTALL,
)
if 'id="nextBtn"' not in text:
    text = text.replace(
        '      <button id="stopBtn" class="btn" disabled>Stop</button>\n    </section>',
        '      <button id="stopBtn" class="btn" disabled>Stop</button>\n'
        '      <button id="nextBtn" class="btn review-next hidden" type="button" disabled>Next \u2192</button>\n'
        "    </section>",
        1,
    )

WEB.write_text(text, encoding="utf-8", newline="\n")
print(f"Wrote {WEB}")
