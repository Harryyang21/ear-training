"""Find last git commit with valid web/app.js syntax."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
commits = subprocess.check_output(
    ["git", "log", "--oneline", "-20", "--", "web/app.js"],
    cwd=ROOT,
    text=True,
).strip().splitlines()

for line in commits:
    commit = line.split()[0]
    try:
        data = subprocess.check_output(["git", "show", f"{commit}:web/app.js"], cwd=ROOT)
    except subprocess.CalledProcessError:
        continue
    tmp = ROOT / "tools" / "_test.js"
    tmp.write_bytes(data)
    result = subprocess.run(["node", "--check", str(tmp)], capture_output=True)
    ok = result.returncode == 0
    print(commit, "OK" if ok else "BAD")
    if ok:
        print(data[:200])
        break
else:
    sys.exit(1)
