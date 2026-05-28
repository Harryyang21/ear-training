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

APP.write_text(text, encoding="utf-8", newline="\n")
result = subprocess.run(["node", "--check", str(APP)], capture_output=True, text=True)
if result.returncode != 0:
    raise SystemExit(result.stderr)
if "???? Two beats" in text or "I???IV" in text:
    raise SystemExit("rebuilt app.js still looks corrupted")
if "\U0001f3a7 Two beats" not in text and "🎧 Two beats" not in text:
    raise SystemExit("emoji missing in MODE_SUBTITLES")

print(f"Wrote clean {APP} ({APP.stat().st_size} bytes)")
