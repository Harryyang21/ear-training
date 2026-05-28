"""Restore README.md as UTF-8 from git history."""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
text = subprocess.check_output(
    ["git", "show", "1f6b0f5^:README.md"],
    cwd=ROOT,
).decode("utf-8")

text = re.sub(
    r"^# .+ Ear Training v[^\n]+",
    f"# {chr(0x1F3B5)} Ear Training v2.1.5",
    text,
    count=1,
    flags=re.MULTILINE,
)

marker = "Project layout"
start = text.rfind("##", 0, text.index(marker))
end = text.index("---", start)
new_layout = f"""## {chr(0x1F4C1)} Project layout

| Path | Role |
|------|------|
| `version.json` | Single source of truth for release version |
| `web/` | App source (`index.html`, `app.js`, `stats-storage.js`, `stats.html`) |
| `docs/` | GitHub Pages deploy output (mirror of `web/` + samples) |

Release (pick one):

```bat
sync.bat
```

Or:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\\sync_web_to_docs.ps1
```

Auto bump patch version (`2.1.5` \u2192 `2.1.6`) and sync: run `bump.bat`.

Then `git add` + `git commit` + `git push` to publish `docs/` on GitHub Pages.

Local dev: serve `web/` (e.g. `serve_lan.bat` \u2192 http://localhost:8080/web/)

"""
text = text[:start] + new_layout + text[end:]

out = ROOT / "README.md"
out.write_text(text, encoding="utf-8", newline="\n")
print(f"Wrote {out}")
print(text.splitlines()[0])
