# Learnings: PDF Audio Reader v0.1.0

__Date:__ 2026-03-05
__Project:__ pdf-audio-reader
__Source:__ TEAM_RETRO + LOCAL_LOG + chat transcript

---

# Learning: Chrome SpeechSynthesis 60s Timeout Requires Keepalive

__ID__: L1
__Category__: architecture
__Confidence__: high

## What We Learned

Chrome's `SpeechSynthesis` implementation silently stops speaking after ~60 seconds unless you call `speechSynthesis.pause()` followed by `speechSynthesis.resume()` on a timer (every ~10 seconds). This bug affects any long-form TTS playback in Chrome.

## Why It Matters

Any future project using Web Speech API for content longer than ~60 seconds will silently fail in Chrome without this workaround. It must be implemented from day one, not discovered post-launch.

## Source

pdf-audio-reader build + Vera QA audit

---

# Learning: Chrome SpeechSynthesis Utterance Character Cap Requires Text Chunking

__ID__: L2
__Category__: architecture
__Confidence__: high

## What We Learned

Chrome imposes a practical character limit (~200-300 chars) per `SpeechSynthesisUtterance`. Long text passed as a single utterance will be cut off mid-sentence. Text must be split into sentence-boundary-aware chunks and queued as sequential `speak()` calls.

## Why It Matters

Any Web Speech API implementation reading paragraphs or pages of text needs a chunker. The pattern: split on `.!?` boundaries first, then hard-split any chunk still over the limit.

## Source

pdf-audio-reader build

---

# Learning: PDF.js Requires HTTP — Won't Load Over file://

__ID__: L3
__Category__: debugging
__Confidence__: high

## What We Learned

PDF.js blocks document loading when the page is served over the `file://` protocol. Local development requires a simple HTTP server (`python3 -m http.server` or Live Server). This must be documented in the README and communicated to any developer running the project locally.

## Why It Matters

Silently fails with no obvious error if opened as a local file. Wastes debugging time if not known upfront.

## Source

pdf-audio-reader build + LOCAL_LOG

---

# Learning: Pre-Deploy QA Audit Gate Catches Production Blockers

__ID__: L4
__Category__: process
__Confidence__: high

## What We Learned

Running Vera's code audit against the PRD success criteria before deploying caught a P0 crash bug (uncaught promise rejection on corrupt PDF load) that would have hit production. The audit-before-deploy step is worth the time on every project, even small ones.

## Why It Matters

A corrupt PDF would have silently crashed the app with no user feedback. The 10-minute audit prevented a production embarrassment.

## Source

Vera QA audit — pdf-audio-reader

---

# Learning: Error Handling Belongs in First-Pass Checklist, Not Post-Audit

__ID__: L5
__Category__: process
__Confidence__: high

## What We Learned

Error handling for external inputs (file load, API calls, text extraction) was missing from the initial build and only added after Vera's audit. It should be a mandatory checklist item in the first-pass implementation, not a catch-up fix.

## Why It Matters

Missing error handlers are consistently caught in QA rather than written proactively. Adding them to the TASK_LIST template will prevent this pattern from recurring.

## Source

Vera QA audit findings — pdf-audio-reader

---

# Learning: Research Artifacts as Planning Documents Accelerate Decisions

__ID__: L6
__Category__: process
__Confidence__: high

## What We Learned

Saving the TTS API research as `tts_api_research_recommendation.md` before writing the PRD gave the Product Owner a concrete artifact to align on. Rudi cited it directly as what helped the team move quickly into planning. Externalizing research decisions into a named document creates a shared reference and avoids re-litigating decisions later.

## Why It Matters

Product Owner sign-off on a research doc is faster and more informed than sign-off on a PRD alone. Future projects with non-trivial technology decisions should produce a `<topic>_research_recommendation.md` before the PRD.

## Source

Product Owner feedback — TEAM_RETRO

---

# Learning: OPST Custom Skills Don't Auto-Invoke via the Skill Tool

__ID__: L7
__Category__: process
__Confidence__: high

## What We Learned

The Claude Code Skill tool only resolves skills registered in the built-in skill registry. OPST custom skills (e.g., `teamlead-wakeup`, `retro`) are not auto-registered and must be executed manually by reading `_OPST/assets/SKILLS/<skill-name>/SKILL.md` directly.

## Why It Matters

Every project boot will fail the Skill tool invocation for `teamlead-wakeup` until OPST skills are registered. The fallback (reading SKILL.md directly) works fine but creates a predictable friction point at every wakeup.

## Source

Cap boot sequence — pdf-audio-reader

---

# Learning: Web Speech API Voice Quality Is OS/Browser-Dependent

__ID__: L8
__Category__: architecture
__Confidence__: high

## What We Learned

Voice availability and quality varies significantly by OS and browser. macOS Chrome surfaces 50+ voices (including high-quality Google cloud voices); Linux may offer only 2-3 low-quality local voices. The first voice in the list tends to be the best available. There is no way to guarantee a specific voice without a paid TTS API.

## Why It Matters

User experience with the voice selector will differ widely. Future projects requiring consistent voice quality across all platforms should budget for AWS Polly (Cognito pattern) or accept the variability trade-off explicitly.

## Source

Product Owner feedback + Vera audit — pdf-audio-reader
