# LOCAL_LOG: PDF Audio Reader

__Project:__ PDF Audio Reader
__Team Lead:__ Cap
__Started:__ 2026-03-04

---

## Stage 1 — Scope & Design (2026-03-04)

### Decisions

- __TTS API selected:__ Web Speech API (browser-native `SpeechSynthesis`)
  - Rationale: zero cost, zero keys, unlimited chars, works on GitHub Pages with no backend
  - AWS Polly documented as future upgrade path if consistent voice quality becomes a requirement
  - ElevenLabs disqualified: 10K char/month free limit is below a single 2500-word session
  - Google Cloud TTS disqualified: CORS not reliable for browser-direct calls; key fully exposed client-side
- __PDF parsing:__ PDF.js 3.11.174 from cdnjs CDN — no build step needed
- __Stack:__ Vanilla JS, no framework — scope does not warrant added complexity
- __Deploy target:__ GitHub Pages (static, root of repo)

### Known Engineering Constraints Logged

- Chrome SpeechSynthesis stops after ~60s → keepalive timer (pause/resume every 10s)
- Chrome utterance char cap ~200-300 → text chunker splits on sentence boundaries
- `getVoices()` returns empty on first call → wait for `voiceschanged` event
- PDF.js loaded from CDN → no local install required

### Files Created

- `owner.txt` (provided by Product Owner)
- `tts_api_research_recommendation.md`
- `PRD.md`
- `TASK_LIST.md`

---

## Stage 2 — Development (2026-03-04)

### Files Built

- `index.html` — base structure, PDF.js CDN, layout
- `style.css` — dark theme, single-column, toolbar + viewer + controls
- `app.js` — full application: PDF loading, rendering, text extraction, TTS engine, controls

### Implementation Notes

- Scale calculation is responsive: `Math.min(1.5, containerWidth / pageWidth)` — fits narrow screens
- Text chunker splits on sentence boundaries (`.!?`) then hard-splits any chunk still over 200 chars
- `isPaused` flag guards `utter.onend` callback so pausing mid-chunk doesn't trigger next-chunk advance
- `voiceschanged` listener + immediate `populateVoices()` call handles both Chrome (async) and Firefox (sync)
- Voice selector filters to English voices first, falls back to all voices if none found
- Empty pages (no extractable text) are silently skipped — auto-advances to next page
- `textCache` prevents re-fetching page text on repeated visits to same page
- `stopTTS()` always calls `speechSynthesis.cancel()` before state reset to prevent zombie utterances

---

## Stage 3 — Deployment & Retro (2026-03-05)

### Deployment

- GitHub repo created: [github.com/rudil24/pdf-audio-reader](https://github.com/rudil24/pdf-audio-reader)
- GitHub Pages enabled: [rudil24.github.io/pdf-audio-reader](https://rudil24.github.io/pdf-audio-reader)
- 3 commits: scaffold → Vera QA bug fixes → docs

### Retro

- Product Owner sign-off received. Rated project positively.
- 8 learnings extracted. Key ones: Chrome keepalive pattern, utterance chunking, PDF.js HTTP requirement, pre-deploy audit gate, research-as-artifact process.
- Retro files: `.agents/retros/2026-03-05-pdf-audio-reader.md`
- Learnings file: `.agents/learnings/2026-03-05-pdf-audio-reader.md`
- TASK_LIST.md: all MVP tasks checked off. Stretch goals (highlight layer, URL input) deferred to v0.2.0.

### Project Status: COMPLETE (v0.1.0)
