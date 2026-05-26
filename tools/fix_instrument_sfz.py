"""Rebuild instrument SFZ maps with tighter per-note pitch mapping."""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INSTRUMENTS = ROOT / "samples" / "instruments"
MIN_MIDI = 48
MAX_MIDI = 72

GUZHENG_SAMPLES = [
    (60, "lapharppick_C4.wav", -15),
    (62, "lapharppick_D4.wav", -12),
    (64, "lapharppick_E4.wav", -5),
    (65, "lapharppick_F4.wav", -10),
    (67, "lapharppick_G4.wav", -18),
    (69, "lapharppick_A4.wav", -13),
    (71, "lapharppick_B4.wav", -8),
    (72, "lapharppick_C5.wav", -10),
]

VIOLIN_SAMPLES = [
    (55, "LLVln_ArcoVib_G3_p.wav"),
    (60, "LLVln_ArcoVib_C4_p.wav"),
    (64, "LLVln_ArcoVib_E4_p.wav"),
    (67, "LLVln_ArcoVib_G4_p.wav"),
    (72, "LLVln_ArcoVib_C5_p.wav"),
    (76, "LLVln_ArcoVib_E5_p.wav"),
    (79, "LLVln_ArcoVib_G5_p.wav"),
    (84, "LLVln_ArcoVib_C6_p.wav"),
]

HARP_SAMPLES = [
    (48, "KSHarp_C3_mf.wav"),
    (52, "KSHarp_E3_mf.wav"),
    (55, "KSHarp_G3_mf.wav"),
    (59, "KSHarp_B3_mf.wav"),
    (62, "KSHarp_D4_mf.wav"),
    (65, "KSHarp_F4_mf.wav"),
    (69, "KSHarp_A4_mf.wav"),
    (72, "KSHarp_C5_mf.wav"),
]


def write_sfz(path: Path, regions: list[str]) -> None:
    lines = ["// Auto-generated for ear training web app", ""]
    lines.extend(regions)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def append_note_region(
    regions: list[str],
    midi: int,
    center: int,
    sample_name: str,
    tune: int = 0,
) -> None:
    regions.append("<region>")
    if tune:
        regions.append(f"lokey={midi} hikey={midi} pitch_keycenter={center} tune={tune}")
    else:
        regions.append(f"lokey={midi} hikey={midi} pitch_keycenter={center}")
    regions.append(f"sample=samples/{sample_name}")
    regions.append("")


def rebuild_nearest_note_sfz(
    path: Path,
    samples: list[tuple[int, str, int] | tuple[int, str]],
) -> None:
    normalized: list[tuple[int, str, int]] = [
        (item[0], item[1], item[2]) if len(item) == 3 else (item[0], item[1], 0)
        for item in samples
    ]
    regions: list[str] = []
    for midi in range(MIN_MIDI, MAX_MIDI + 1):
        center, sample_name, tune = min(
            normalized,
            key=lambda item: abs(midi - item[0]),
        )
        append_note_region(regions, midi, center, sample_name, tune)
    write_sfz(path, regions)


def rebuild_guzheng() -> None:
    rebuild_nearest_note_sfz(INSTRUMENTS / "guzheng" / "instrument.sfz", GUZHENG_SAMPLES)


def rebuild_violin() -> None:
    rebuild_nearest_note_sfz(INSTRUMENTS / "violin" / "instrument.sfz", VIOLIN_SAMPLES)


def rebuild_harp() -> None:
    rebuild_nearest_note_sfz(INSTRUMENTS / "harp" / "instrument.sfz", HARP_SAMPLES)


def sync_to_docs() -> None:
    src = INSTRUMENTS
    dest = ROOT / "docs" / "samples" / "instruments"
    for name in ("guzheng", "violin", "harp"):
        shutil.copy2(src / name / "instrument.sfz", dest / name / "instrument.sfz")


def main() -> None:
    rebuild_guzheng()
    rebuild_violin()
    rebuild_harp()
    sync_to_docs()
    print("Rebuilt guzheng, violin, and harp SFZ maps.")


if __name__ == "__main__":
    main()
