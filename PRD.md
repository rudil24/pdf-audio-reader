# PRD: PDF Audio Reader

__Version:__ 0.1.0
__Status:__ Draft — Awaiting Product Owner Approval
__Author:__ Cap (Team Lead, OPST)
__Date:__ 2026-03-04

---

## 1. Problem Statement

Reading long PDF documents is cognitively expensive. Users need a way to have PDFs read aloud to them — hands-free, in the browser, with no installs and no cost — while being able to track which page is being read.

---

## 2. Goals

- Convert any local PDF into audio playback via the browser's native Web Speech API
- Deploy as a fully static site on GitHub Pages (zero backend, zero server costs)
- Support 2 concurrent users reading a ~2500-word / 10-page PDF with no degradation
- Provide basic playback controls: pause/resume and next page

---

## 3. Non-Goals

- No backend server or API proxy
- No user accounts or saved sessions
- No mobile-first optimization (desktop browser is primary target; mobile is best-effort)
- No paid TTS integration in v1

---

## 4. Users

Single-user, self-hosted tool. Primary user is the Product Owner and anyone they share the GitHub Pages URL with. No authentication required.

---

## 5. Tech Stack

- __Runtime:__ Static HTML/CSS/JS — no build step required for v1
- __PDF Parsing:__ PDF.js (Mozilla, open source, browser-native)
- __TTS:__ Web Speech API (`SpeechSynthesis`) — browser-native, free, no key
- __Hosting:__ GitHub Pages (static file serving from `main` branch `/docs` or root)
- __No frameworks required__ — vanilla JS acceptable for v1 scope

---

## 6. Features

### P0 — MVP (must ship)

#### 6.1 Local File Open

- Single "Open PDF" button using `<input type="file" accept=".pdf">`
- No drag-and-drop required in v1 (stretch)
- File is read entirely client-side via FileReader API — never uploaded anywhere

#### 6.2 PDF Rendering

- Render the active page as a canvas element using PDF.js
- Display current page number and total page count (e.g., "Page 3 of 10")
- Page advances automatically when TTS finishes reading that page's text

#### 6.3 Text Extraction

- Extract text from each PDF page using PDF.js `getTextContent()`
- Text is chunked into sentences (~200 char max per utterance) to work around Chrome's SpeechSynthesis character cap
- Chunking preserves sentence boundaries where possible (split on `.`, `?`, `!`, then by char limit)

#### 6.4 Audio Playback

- Uses `window.speechSynthesis` — no API key, no network call
- __Keepalive hack:__ timer calls `pause()`/`resume()` every 10 seconds to prevent Chrome's 60-second silence bug
- Reads the extracted text of the current page, then auto-advances to the next page
- Stops automatically after the last page

#### 6.5 Playback Controls

- __Play/Pause toggle__ — single button, toggles label between "Pause" and "Resume"
- __Next Page__ — skips remaining audio on current page and advances to next
- __Voice selector__ — dropdown populated from `speechSynthesis.getVoices()` after `voiceschanged` fires; defaults to first available English voice

#### 6.6 Page-Synced View

- The rendered PDF page visible in the UI always matches the page currently being read
- No scroll required — one page fills the viewer at a time

---

### P1 — Stretch Goals (ship if time allows)

#### 6.7 Word/Sentence Highlighting

- As each utterance chunk is spoken, highlight the corresponding text span in a text overlay positioned above (or alongside) the PDF canvas
- Requires mapping PDF.js text items to DOM spans and tracking chunk index during playback
- __Implementation note:__ render text layer via PDF.js `renderTextLayer()` and add CSS highlight class per active chunk

#### 6.8 Read from URL (HTML or PDF)

- Input field for a user-provided URL
- If URL ends in `.pdf` → fetch, parse with PDF.js, proceed as normal
- If URL points to an HTML page → fetch HTML, strip tags, feed plain text directly to SpeechSynthesis (no PDF.js needed)
- __CORS caveat:__ many URLs will be blocked by browser CORS policy; display a clear error message rather than silently failing

---

## 7. UI Layout (Wireframe Description)

```
┌─────────────────────────────────────────────┐
│  PDF Audio Reader                           │
│                                             │
│  [ Open PDF ]   [ Voice: ▼ English (US) ]  │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │           PDF Page Canvas               │ │
│ │           (PDF.js render)               │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│  Page 3 of 10                               │
│                                             │
│  [ ▶ Play / ‖ Pause ]    [ Next Page → ]   │
│                                             │
└─────────────────────────────────────────────┘
```

Clean, minimal. No sidebars. Single-column. Works at 1024px+ width.

---

## 8. Known Engineering Constraints

| Constraint | Mitigation |
|---|---|
| Chrome SpeechSynthesis stops after ~60s | Keepalive: `setInterval` calls `pause()`+`resume()` every 10s |
| Chrome utterance char cap (~200-300 chars) | Chunk text into sentences before queuing `speak()` calls |
| `getVoices()` returns empty on first call | Wait for `voiceschanged` event before populating voice selector |
| PDF.js is a large dependency (~1MB) | Load from CDN (`cdnjs` or `unpkg`) — no build step needed |
| CORS blocks arbitrary URL fetching (P1 feature) | Display descriptive error; suggest user download file locally instead |

---

## 9. Out of Scope for v1

- Drag-and-drop file open
- Progress bar / seek within a page
- Playback speed control
- Reading speed (WPM) settings
- Dark mode
- Mobile touch controls
- Saving/resuming position across sessions

---

## 10. Deliverables

- `index.html` — single-file app (HTML + inline CSS + inline JS) or split into `style.css` / `app.js`
- `README.md` — setup and usage instructions
- `LICENSE.md` — ISC License
- `LOCAL_LOG.md` — continuous project log
- Deployed to GitHub Pages

---

## 11. Success Criteria

- [ ] A 10-page, 2500-word PDF can be loaded and read aloud start-to-finish without stopping
- [ ] Pause/resume works correctly at any point during playback
- [ ] Next Page advances correctly and audio resumes on new page
- [ ] Voice selector populates and switching voices works mid-session
- [ ] App loads and runs on Chrome, Firefox, and Safari (desktop)
- [ ] Deployed URL on GitHub Pages is publicly accessible with no errors

---

_Awaiting Product Owner sign-off before TASK\_LIST.md is generated and development begins._
