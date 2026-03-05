# Retrospective: PDF Audio Reader v0.1.0

__Date:__ 2026-03-05
__Scope:__ Full project — API research, PRD, build, QA, deploy

## Summary

Clean single-session build of a static PDF-to-audio web app. The OPST review-driven workflow performed well: research doc → PRD → TASK_LIST → build → Vera audit → deploy. Pre-deploy QA caught a real P0 crash bug. Product Owner rated the project positively; the research artifact was called out specifically as accelerating planning.

## What Went Well

- TTS API research was decisive and well-documented; disqualified ElevenLabs/Google/iSpeech on hard constraints before any wasted effort
- Chrome-specific bugs (60s timeout, utterance char cap) were engineered around proactively
- Vera's pre-deploy audit caught P0 (uncaught PDF load crash) before production
- Clean 3-commit git history: scaffold → bug fixes → docs
- GitHub Pages deploy: zero infrastructure, zero cost

## What Could Be Improved

- Error handling should be a first-pass checklist item, not a post-audit fix
- Text cache clear on new file load was incomplete in initial build
- No visual loading state while PDF.js parses (blank moment between file select and canvas render)
- OPST custom skill invocation fails via Skill tool — manual SKILL.md read required every time

## Learnings Extracted

- L1: Chrome SpeechSynthesis 60s timeout requires keepalive pattern
- L2: Chrome utterance char cap requires sentence-boundary text chunking
- L3: PDF.js requires HTTP — won't load over file://
- L4: Pre-deploy QA audit gate catches production blockers
- L5: Error handling belongs in first-pass checklist, not post-audit
- L6: Research artifacts as planning documents accelerate decisions
- L7: OPST custom skills don't auto-invoke via the Skill tool
- L8: Web Speech API voice quality is OS/browser-dependent

See: `.agents/learnings/2026-03-05-pdf-audio-reader.md`

## Action Items

- [ ] Add error handling to OPST TASK_LIST template as a mandatory P0 checklist item
- [ ] Document OPST skill invocation fallback in GLOBAL_EVOLUTION.md or Cap persona
- [ ] Consider adding a loading spinner/state to the viewer div for future projects with async file parsing
