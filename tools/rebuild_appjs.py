"""Restore clean UTF-8 app.js from git and apply bootstrap patches."""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "web" / "app.js"
SOURCE_COMMIT = "13be18b"

text = subprocess.check_output(["git", "show", f"{SOURCE_COMMIT}:web/app.js"], cwd=ROOT).decode("utf-8")

# Bootstrap: add helpers after collectAllPreloadUrls block
if "collectBootstrapPreloadUrls" not in text:
    old = """  async collectAllPreloadUrls(notes) {
    const instrumentUrls = new Set();
    const savedId = this.instrumentId;

    for (const instrumentId of Object.keys(INSTRUMENTS)) {
      await this.setInstrument(instrumentId);
      for (const url of this.notesInstrumentPreloadUrls(notes)) {
        instrumentUrls.add(url);
      }
    }

    await this.setInstrument(savedId);
    const solfegeUrls = this.notesSolfegePreloadUrls(notes);
    return this.sortPreloadUrls([...instrumentUrls, ...solfegeUrls]);
  }

  rememberDecodedBuffer(url, tryUrl, audioBuffer) {"""

    new = """  async collectAllPreloadUrls(notes) {
    const instrumentUrls = new Set();
    const savedId = this.instrumentId;

    for (const instrumentId of Object.keys(INSTRUMENTS)) {
      await this.setInstrument(instrumentId);
      for (const url of this.notesInstrumentPreloadUrls(notes)) {
        instrumentUrls.add(url);
      }
    }

    await this.setInstrument(savedId);
    const solfegeUrls = this.notesSolfegePreloadUrls(notes);
    return this.sortPreloadUrls([...instrumentUrls, ...solfegeUrls]);
  }

  collectBootstrapPreloadUrls(notes) {
    const instrumentUrls = this.notesInstrumentPreloadUrls(notes);
    const solfegeUrls = this.notesSolfegePreloadUrls(notes);
    return this.sortPreloadUrls([...instrumentUrls, ...solfegeUrls]);
  }

  async warmRemainingInstruments(notes, signal) {
    const savedId = this.instrumentId;
    for (const instrumentId of Object.keys(INSTRUMENTS)) {
      if (signal?.aborted) break;
      if (instrumentId === savedId) continue;
      await this.setInstrument(instrumentId);
      const urls = this.notesInstrumentPreloadUrls(notes).filter((url) => !this.bufferCache.has(url));
      if (!urls.length) continue;
      const progressState = { done: 0, total: urls.length };
      const concurrency = isIPhone() ? 1 : 3;
      await this.preloadUrls(urls, concurrency, null, signal, progressState, {
        silent: true,
        continueOnError: true,
      });
    }
    if (!signal?.aborted) {
      await this.setInstrument(savedId);
    }
  }

  rememberDecodedBuffer(url, tryUrl, audioBuffer) {"""
    if old not in text:
        raise SystemExit("collectAllPreloadUrls anchor not found")
    text = text.replace(old, new, 1)

# Constructor backgroundWarmController
if "backgroundWarmController" not in text:
    text = text.replace(
        "    this.bootstrapController = null;\n    this.metronomeScheduler = null;",
        "    this.bootstrapController = null;\n    this.backgroundWarmController = null;\n    this.metronomeScheduler = null;",
        1,
    )

# bootstrapSamples
if "collectBootstrapPreloadUrls(notes)" not in text:
    text = text.replace(
        "  async bootstrapSamples() {\n    this.bootstrapController?.abort();\n    this.bootstrapController = new AbortController();",
        "  async bootstrapSamples() {\n    this.bootstrapController?.abort();\n    this.backgroundWarmController?.abort();\n    this.bootstrapController = new AbortController();",
        1,
    )
    text = text.replace(
        "      const urls = await this.audio.collectAllPreloadUrls(notes);",
        "      const urls = this.audio.collectBootstrapPreloadUrls(notes);",
        1,
    )
    text = text.replace(
        "      this.updateHelpText();\n    } catch (error) {\n      if (signal.aborted || error.message === \"Loading cancelled\") return;\n      this.samplesReady = false;",
        """      this.updateHelpText();

      this.backgroundWarmController?.abort();
      this.backgroundWarmController = new AbortController();
      const warmSignal = this.backgroundWarmController.signal;
      void this.audio.warmRemainingInstruments(notes, warmSignal).catch(() => {});
    } catch (error) {
      if (signal.aborted || error.message === \"Loading cancelled\") return;
      this.samplesReady = false;""",
        1,
    )

# ChordPad: no preview sound during answer
old_pad = """        if (this.previewHandler) {
          this.previewHandler(item);
        }
        if (this.interactive && this.onPress) {
          this.onPress(item.id);
        }"""
new_pad = """        if (this.interactive && this.onPress) {
          this.onPress(item.id);
          return;
        }
        if (this.previewHandler) {
          this.previewHandler(item);
        }"""
if old_pad in text:
    text = text.replace(old_pad, new_pad, 1)

# Piano answer: no preview on press
text = text.replace(
    "        if (this.keyboard === this.piano) void this.previewNote(value);\n        this.keyboard?.setInteractive(false);",
    "        this.keyboard?.setInteractive(false);",
    1,
)

# Pause/resume: suspend AudioContext instead of canceling scheduled voices
if "async suspendOutput()" not in text:
    text = text.replace(
        "  haltAudibleOutput() {\n    this.stopReferenceA();\n    this.stopAllVoices(true);\n  }",
        """  async suspendOutput() {
    this.stopReferenceA();
    this.practiceTracker?.resetPlaying();
    if (!this.ctx) return;
    if (this.bridgeAudio && !this.bridgeAudio.paused) {
      this.bridgeAudio.pause();
    }
    if (this.ctx.state === "running") {
      try {
        await this.ctx.suspend();
      } catch {
        // Ignore suspend failures on unsupported browsers.
      }
    }
  }

  haltAudibleOutput() {
    this.stopReferenceA();
    this.stopAllVoices(true);
  }""",
        1,
    )

text = text.replace(
    """  pauseSession() {
    if (!this.running || this.paused) return;
    this.paused = true;
    this.audio.stopAllVoices(true);
    this.stopMetronomeScheduler();""",
    """  pauseSession() {
    if (!this.running || this.paused) return;
    this.paused = true;
    void this.audio.suspendOutput();
    this.stopMetronomeScheduler();""",
    1,
)

text = text.replace(
    """  resumeSession() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    if (this.pauseBtn) this.pauseBtn.textContent = "Pause";""",
    """  resumeSession() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.audio.resumeOnUserGesture();
    void this.audio.ensurePlayback();
    if (this.pauseBtn) this.pauseBtn.textContent = "Pause";""",
    1,
)

if "scheduleAt(audioTime, fn) {\n    const tick = () => {" not in text:
    text = text.replace(
        """  scheduleAt(audioTime, fn) {
    const delayMs = Math.max(0, (audioTime - this.audio.ctx.currentTime) * 1000);
    this.schedule(fn, delayMs);
  }""",
        """  scheduleAt(audioTime, fn) {
    const tick = () => {
      if (!this.running) return;
      if (this.paused || this.audio.ctx?.state === "suspended") {
        this.schedule(tick, 150);
        return;
      }
      const remainingMs = (audioTime - this.audio.ctx.currentTime) * 1000;
      if (remainingMs > 4) {
        this.schedule(tick, Math.min(remainingMs, 80));
        return;
      }
      fn();
    };
    tick();
  }""",
        1,
    )

if "this.audio.ctx?.state === \"suspended\"" not in text.split("waitUntilAudio(audioTime)")[1].split("scheduleMetronomeGrid")[0]:
    text = text.replace(
        """        if (this.paused) {
          this.schedule(tick, 150);
          return;
        }
        const remainingMs = (audioTime - this.audio.ctx.currentTime) * 1000;
        if (remainingMs <= 4) {
          resolve(true);
          return;
        }
        this.schedule(() => resolve(this.running && !this.paused), remainingMs);""",
        """        if (this.paused) {
          this.schedule(tick, 150);
          return;
        }
        if (this.audio.ctx?.state === "suspended") {
          this.schedule(tick, 150);
          return;
        }
        const remainingMs = (audioTime - this.audio.ctx.currentTime) * 1000;
        if (remainingMs <= 4) {
          resolve(true);
          return;
        }
        this.schedule(() => resolve(this.running && !this.paused), remainingMs);""",
        1,
    )

text = text.replace(
    """      if (!this.running || !scheduler) return;
      if (!this.metronomeEnabled()) {""",
    """      if (!this.running || !scheduler) return;
      if (this.paused || this.audio.ctx?.state === "suspended") {
        scheduler.timerId = window.setTimeout(tick, 150);
        return;
      }
      if (!this.metronomeEnabled()) {""",
    1,
)

text = text.replace(
    """    const totalMs = (startAt + numNotes * 3 * beatSec - this.audio.ctx.currentTime) * 1000 + 200;
    this.schedule(() => {
      if (!this.running) return;
      this.setDisplay("Done", "answer");
      this.progressEl.textContent = `${numNotes} done`;
      this.stop();
    }, totalMs);""",
    """    const endAt = startAt + numNotes * 3 * beatSec + 0.2;
    this.scheduleAt(endAt, () => {
      if (!this.running) return;
      this.setDisplay("Done", "answer");
      this.progressEl.textContent = `${numNotes} done`;
      this.stop();
    });""",
    1,
)

APP.write_text(text, encoding="utf-8", newline="\n")
result = subprocess.run(["node", "--check", str(APP)], capture_output=True, text=True)
if result.returncode != 0:
    raise SystemExit(result.stderr)
if "???? Two beats" in text or "I???IV" in text:
    raise SystemExit("rebuilt app.js still looks corrupted")
if "\U0001f3a7 Two beats" not in text and "🎧 Two beats" not in text:
    raise SystemExit("emoji missing in MODE_SUBTITLES")

print(f"Wrote clean {APP} ({APP.stat().st_size} bytes)")
