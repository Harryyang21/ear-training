"""Generate bass instrument.sfz mapped to low piano samples (swap in real bass wav later)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASS_DIR = ROOT / "samples" / "instruments" / "bass"
MIN_MIDI = 28
MAX_MIDI = 48

# Piano vL samples already on COS under samples/piano/samples/
PIANO_CENTERS: list[tuple[int, str]] = [
    (21, "A0vL.ogg"),
    (24, "C1vL.ogg"),
    (27, "D#1vL.ogg"),
    (30, "F#1vL.ogg"),
    (33, "A1vL.ogg"),
    (36, "C2vL.ogg"),
    (39, "D#2vL.ogg"),
    (42, "F#2vL.ogg"),
    (45, "A2vL.ogg"),
    (48, "C3vL.ogg"),
]


def nearest_piano_sample(midi: int) -> tuple[int, str]:
    center, name = min(PIANO_CENTERS, key=lambda item: abs(item[0] - midi))
    return center, name


def main() -> None:
    BASS_DIR.mkdir(parents=True, exist_ok=True)
    lines = [
        "// Bass map for ear training (low range).",
        "// Default samples point at piano low notes on COS.",
        "// Replace sample= paths with files in samples/ when you upload a bass library.",
        "",
    ]

    for midi in range(MIN_MIDI, MAX_MIDI + 1):
        center, sample_name = nearest_piano_sample(midi)
        lines.extend(
            [
                "<region>",
                f"lokey={midi} hikey={midi} pitch_keycenter={center}",
                f"sample=../../piano/samples/{sample_name}",
                "",
            ]
        )

    out = BASS_DIR / "instrument.sfz"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
