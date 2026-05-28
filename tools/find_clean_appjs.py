"""Find newest commit whose web/app.js contains UTF-8 music-note emoji in MODE_SUBTITLES."""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
marker = "MODE_SUBTITLES".encode()
emoji = "\U0001f3a7".encode("utf-8")  # headphones in passive subtitle historically

commits = subprocess.check_output(
    ["git", "log", "--oneline", "-40", "--", "web/app.js"],
    cwd=ROOT,
    text=True,
).strip().splitlines()

for line in commits:
    commit = line.split()[0]
    try:
        data = subprocess.check_output(["git", "show", f"{commit}:web/app.js"], cwd=ROOT)
    except subprocess.CalledProcessError:
        continue
    if b"???? Two beats" in data or b"I???IV" in data:
        print(commit, "CORRUPT")
        continue
    if b"\xe2\x80\x93" not in data and b"\U0001f3a7".encode("utf-8") not in data:
        # check for en-dash at least in progressions
        if b"Canon" in data and b"\xf0\x9f" not in data:
            print(commit, "PLAIN")
            continue
    result = subprocess.run(["node", "--check"], input=data, capture_output=True)
    if result.returncode != 0:
        print(commit, "SYNTAX BAD")
        continue
    print(commit, "GOOD", len(data))
    idx = data.find(marker)
    print(data[idx : idx + 120])
    break
