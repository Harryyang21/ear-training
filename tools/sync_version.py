"""Apply version.json to web shell files. UTF-8 safe."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
VERSION_FILE = ROOT / "version.json"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8", newline="\n")


def main() -> None:
    version = json.loads(VERSION_FILE.read_text(encoding="utf-8"))["version"]
    print(f"Applying version {version}...")

    app_js = WEB / "app.js"
    text = read_text(app_js)
    updated = re.sub(
        r'const APP_VERSION = "[^"]+";',
        f'const APP_VERSION = "{version}";',
        text,
        count=1,
    )
    if updated != text:
        write_text(app_js, updated)
        print("  updated app.js")

    sw_js = WEB / "sw.js"
    text = read_text(sw_js)
    updated = re.sub(
        r'const CACHE = "ear-training-[^"]+";',
        f'const CACHE = "ear-training-{version}";',
        text,
        count=1,
    )
    if updated != text:
        write_text(sw_js, updated)
        print("  updated sw.js")

    for name in ("index.html", "stats.html"):
        path = WEB / name
        text = read_text(path)
        updated = text
        updated = re.sub(r"<!-- build: [^ ]+ -->", f"<!-- build: {version} -->", updated, count=1)
        updated = re.sub(r"styles\.css\?v=[^\"]+", f"styles.css?v={version}", updated)
        updated = re.sub(r"stats-storage\.js\?v=[^\"]+", f"stats-storage.js?v={version}", updated)
        updated = re.sub(r"app\.js\?v=[^\"]+", f"app.js?v={version}", updated)
        updated = re.sub(r"stats\.js\?v=[^\"]+", f"stats.js?v={version}", updated)
        updated = re.sub(r"sw\.js\?v=[^\"]+", f"sw.js?v={version}", updated)
        if updated != text:
            write_text(path, updated)
            print(f"  updated {name}")

    print(f"Version {version} applied.")


if __name__ == "__main__":
    main()
