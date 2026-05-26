"""Check SFZ pitch mappings for overlap and wrong-edge pitch shifts."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INSTRUMENTS = ROOT / "docs" / "samples" / "instruments"


def parse_sfz(path: Path) -> list[dict]:
    regions: list[dict] = []
    current: dict = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line == "<region>":
            if current.get("sample"):
                regions.append(current)
            current = {}
            continue
        if not line or line.startswith("//") or line.startswith("<"):
            continue
        for part in line.split():
            if "=" not in part:
                continue
            key, value = part.split("=", 1)
            if key in {"lokey", "hikey", "pitch_keycenter", "key"}:
                current[key] = int(value)
            elif key == "sample":
                current["sample"] = value
    if current.get("sample"):
        regions.append(current)
    return regions


def region_bounds(region: dict) -> tuple[int, int, int]:
    lo = region.get("lokey", region.get("key"))
    hi = region.get("hikey", region.get("key", lo))
    center = region.get("pitch_keycenter", region.get("key", lo))
    return lo, hi, center


def analyze(path: Path) -> None:
    regions = parse_sfz(path)
    print(f"=== {path.parent.name} ===")
    for region in regions:
        lo, hi, center = region_bounds(region)
        if hi - lo >= 1:
            worst = max(abs(midi - center) for midi in range(lo, hi + 1))
            print(
                f"  span {lo}-{hi} center={center} sample={Path(region['sample']).name} "
                f"max_shift={worst}st"
            )

    for midi in range(48, 73):
        matches = [r for r in regions if region_bounds(r)[0] <= midi <= region_bounds(r)[1]]
        if not matches:
            print(f"  MISSING {midi}")
            continue
        first = matches[0]
        best = min(matches, key=lambda r: abs(midi - region_bounds(r)[2]))
        if region_bounds(first)[2] != region_bounds(best)[2]:
            print(
                f"  overlap {midi}: first={region_bounds(first)[2]} "
                f"best={region_bounds(best)[2]} ({Path(first['sample']).name})"
            )


def main() -> None:
    for sfz in sorted(INSTRUMENTS.glob("*/instrument.sfz")):
        analyze(sfz)
        print()


if __name__ == "__main__":
    main()
