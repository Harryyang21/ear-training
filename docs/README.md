# 🎵 Ear Training v2.1.0

Browser solfege ear training — listen, tap, build pitch memory.

**Live:** https://harryyang21.github.io/ear-training/

---

## ✨ Highlights

- 🎹 **7 instruments** — piano, violin, guitar, guzheng, erhu, harp, saxophone
- 🌈 **Rainbow answers** — Do Re Mi Fa So La Ti in red → purple
- ⏱️ **Practice timer & stats** — daily goal, streak, heatmap, accuracy charts ([Stats page](https://harryyang21.github.io/ear-training/stats.html))
- 🧠 **Adaptive learning** — weak areas get more practice
- 📦 **Smart loading** — samples preload on open; cached after first visit
- 📱 **Mobile-ready** — works on phone; add to Home Screen for best results

---

## 🎯 Modes

| Mode | What it does |
|------|----------------|
| **Passive** 🎧 | Two beats to listen → answer reveals automatically |
| **Interactive** 👆 | A440 · one beat · tap the key to answer |
| **Bass** 🎸 | Low range (E1–C3) · bass timbre · tap to answer |
| **Intervals** 🎯 | Harmonic or melodic intervals · 12-button answer pad |
| **Melody** 🎼 | Hear a short melody · replay on piano · keys sound on tap (Z–M on keyboard) |
| **Chords** 🎹 | Triads, inversions, 7ths, or pop progressions · tap to answer |

---

## 🎛️ Controls

- **Range** — Beginner C4–C5 · Regular G3–G4 · Advanced C3–C5
- **A440** — reference tone anytime
- **Replay** — hear the current question again
- **Click** — metronome on/off
- **Chord preview** 🎵 — in Chords mode with basic triad sets, tap any chord before Start to hear it
- **Stats link** — total practice time on the home page opens charts & heatmap

---

## 🎸 Chord progressions (v2.1.0)

Pop and common progressions in C major, including:

- I–V–vi–IV (Axis of Awesome / pop)
- vi–IV–I–V · I–vi–IV–V · I–IV–vi–V
- ii–V–I · I–V–ii–IV · I–♭VII–IV–I
- And more — 18 patterns with style hints

---

## 📁 Project layout

| Path | Role |
|------|------|
| `web/` | App source (`index.html`, `app.js`, `styles.css`, `stats.html`) |
| `docs/` | GitHub Pages deploy output (mirror of `web/` + samples) |

Local dev: serve `web/` (e.g. `serve_lan.bat` → http://localhost:8080/web/)

---

© Hao Yang · [hyang@shanghaitech.edu.cn](mailto:hyang@shanghaitech.edu.cn)
