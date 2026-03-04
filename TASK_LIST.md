# TASK_LIST: PDF Audio Reader

__Version:__ 0.1.0
__Status:__ Awaiting Product Owner Approval
__Author:__ Cap (Team Lead, OPST)
__Date:__ 2026-03-04

---

## Phase 1 — Project Scaffold

- [ ] T01: Create `index.html` with base structure (viewport, CDN links for PDF.js, semantic layout)
- [ ] T02: Create `style.css` — minimal clean layout, single-column, controls bar
- [ ] T03: Create `app.js` — empty module scaffold with section comments

## Phase 2 — PDF Loading & Rendering

- [ ] T04: Implement file open button → FileReader → PDF.js `pdfjsLib.getDocument()`
- [ ] T05: Render current page to `<canvas>` via PDF.js `page.render()`
- [ ] T06: Display page counter ("Page X of Y")
- [ ] T07: Extract text per page via `page.getTextContent()` and store in page cache

## Phase 3 — TTS Engine

- [ ] T08: Implement text chunker — split page text into ≤200 char sentence-safe chunks
- [ ] T09: Implement chunk queue player — `speak()` loop through chunks, advance page on queue empty
- [ ] T10: Implement Chrome 60s keepalive — `setInterval` pause/resume every 10s during playback
- [ ] T11: Populate voice selector — wait for `voiceschanged`, filter to English voices, default to first

## Phase 4 — Playback Controls

- [ ] T12: Play/Pause toggle button — calls `speechSynthesis.pause()` / `resume()`, updates label
- [ ] T13: Next Page button — cancels current utterances, advances page, restarts TTS on new page
- [ ] T14: Auto-advance — when chunk queue empties, load next page text and continue

## Phase 5 — Integration & Polish

- [ ] T15: Wire up full flow end-to-end: open file → render page 1 → extract text → auto-play
- [ ] T16: Handle edge cases: last page end (stop gracefully), empty text pages (skip), PDF load errors
- [ ] T17: Voice switch mid-session — changing voice selector cancels and restarts current page TTS

## Phase 6 — Docs & Deploy Prep

- [ ] T18: Create `README.md`
- [ ] T19: Create `LICENSE.md` (ISC)
- [ ] T20: Create `LOCAL_LOG.md`
- [ ] T21: Verify app runs correctly loaded as a local file (`file://`) and via a simple HTTP server
- [ ] T22: Add GitHub Pages deploy instructions to README

---

## P1 Stretch (post-MVP)

- [ ] S01: Text highlight layer — PDF.js `renderTextLayer()` + CSS highlight on active chunk
- [ ] S02: URL input — fetch PDF or HTML from user URL, CORS error handling

---

_Approve this list to begin development. Cap will execute phases sequentially, marking tasks complete in real time._
