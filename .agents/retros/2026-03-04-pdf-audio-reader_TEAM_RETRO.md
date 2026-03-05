# Team Retro: PDF Audio Reader v0.1.0

__Date:__ 2026-03-04
__Scope:__ Full project — scoping, API research, build, QA, deploy
__Facilitator:__ Cap (Team Lead)

---

## What went well

__Cap (Team Lead):__

- TTS API research was thorough and decisive. The agent-assisted research surfaced the Web Speech API as the obvious winner quickly, with iSpeech/ElevenLabs/Google Cloud TTS disqualified on hard constraints before we spent any time on them.
- The OPST review-driven workflow (owner.txt → PRD → TASK_LIST → build → QA → deploy) worked exactly as intended. No mass edits happened without a human approval gate.
- Vera's pre-deploy QA audit caught a real P0 blocker (uncaught promise on corrupt PDF) that would have been embarrassing in production. The audit-before-deploy protocol paid off.
- Three commits told a clean story: scaffold → bug fixes → docs. Easy to understand git history.

__Vera (QA/Frontend):__

- The Chrome-specific keepalive hack and utterance chunker were planned and implemented upfront — not discovered as bugs post-launch. Engineering known-knowns into the design ahead of time made the TTS engine solid on first pass.
- CSS was clean. The responsive scale calculation (`Math.min(1.5, containerWidth / pageWidth)`) handled narrow viewports without any layout bugs.
- The `isPaused` guard on `utter.onend` correctly prevented double-advance at chunk boundaries — subtle logic that was right the first time.

---

## What went wrong

__Cap (Team Lead):__

- The `teamlead-wakeup` skill failed to invoke via the Skill tool (unknown skill error) and had to be executed manually by reading the SKILL.md directly. The Skill tool only works for skills registered in the Claude Code skill registry — OPST custom skills are not auto-registered. This caused minor friction at boot.
- The text cache clear on new file load (`textCache[0] = undefined`) was incomplete — only cleared key 0, not the full cache. Vera caught this and the fix used `Object.keys(textCache).forEach(k => delete textCache[k])`. Should have been correct the first time.

__Vera (QA/Frontend):__

- No error handling on PDF load or text extraction in the initial build — both were P0/P1 issues. Error handling should be part of the first-pass implementation checklist, not a post-audit fix.
- The file input not resetting after load (same file wouldn't re-trigger `change`) was a known UX pattern that was missed. Simple fix but should be instinctive.
- No visual loading state while PDF.js parses the file. On large PDFs there's a blank moment between file select and canvas render with no feedback to the user.

---

## What did we discover

__Cap (Team Lead):__

- __Web Speech API has a well-documented Chrome 60s timeout bug__ that requires an active keepalive workaround. This is a non-obvious production gotcha — not surfaced in basic API docs. Any future project using SpeechSynthesis needs this pattern from day one.
- __PDF.js won't run over `file://`__ — requires HTTP. This is a critical deployment detail that affects local dev workflow and was worth calling out explicitly in the README.
- __GitHub Pages is a genuinely viable target for rich browser apps__ — PDF rendering, TTS, and file I/O all work in a static context with zero infrastructure.
- __OPST skill invocation gap:__ Custom OPST skills need to be manually read and executed in Claude Code; the Skill tool only resolves built-in skills. This is a workflow friction point worth addressing at the OPST level.

__Vera (QA/Frontend):__

- __Scanned/image PDFs produce zero extractable text from PDF.js.__ This is a fundamental limitation with no v1 solution — it needs to be surfaced to users clearly, which we now do via the `showError()` path.
- __Voice availability is entirely OS/browser-dependent.__ The voice selector experience will differ significantly between macOS Chrome (50+ voices) and a Linux machine (possibly 2-3 voices). No way to normalize this without a paid TTS API.

---

## Product Owner Section

_Rudi — please add your thoughts below. What went well from your perspective? Anything that felt slow, confusing, or missing? Any features you wished were in v1?_

Everything really clean on this project, great job by the team researching the options and placing them into [../../tts_api_research_recommendations.mp](../../tts_api_research_recommendation.md), which helped us move forward quickly into planning. The first Amazon voice is pretty good (for free) but the others are poorer quality. Still, it gives users a choice and a web portal for easy free translation! 

---

_Awaiting Product Owner sign-off before extracting learnings._
