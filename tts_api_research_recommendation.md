# TTS API Decision

## Disqualified immediately

| API | Why out |
|---|---|
| __iSpeech__ | No free tier for production. Terms ban static distribution. Probably dead. |
| __ElevenLabs__ | 10,000 chars/month free limit. One 2500-word PDF = ~15,000 chars. Burned in a single session. |
| __Google Cloud TTS__ | CORS not reliably supported for direct browser calls. API key fully exposed client-side with no safe restriction mechanism. |

---

## The real choice: 2 viable options

__Option A — Web Speech API (browser-native)__

- Zero cost, zero keys, zero infrastructure
- Built into Chrome, Firefox, Safari, Edge
- Unlimited characters
- Voice choices come from the user's OS (Chrome surfaces 50+ on macOS/Windows)
- __Known bugs to engineer around:__
  - Chrome silently stops after ~60 seconds → need a keepalive timer hack
  - Chrome caps utterances at ~200-300 chars → must chunk text into sentences and queue them
  - `getVoices()` returns empty on first call → must wait for `voiceschanged` event
- Mobile support is patchy (iOS Safari quirks, Android varies)

__Option B — AWS Polly (via Cognito)__

- 5 million Standard chars/month free (ongoing, not time-limited)
- Consistent, controlled voice quality across all devices
- __The safe pattern:__ Cognito Unauthenticated Identity Pool → temporary scoped credentials → no permanent secret in client JS
- Voices like Matthew, Joanna — decent quality, many languages
- __Cost:__ Half-day of AWS setup (IAM, Cognito, SDK config). Requires credit card on AWS account.

---

## Cap's recommendation

__Ship with Web Speech API.__ Here's why:

The chunking and keepalive bugs are well-documented and the fixes are ~50 lines of JS. The GitHub Pages constraint is perfectly served — no backend, no keys, no billing account, no rate limits. Voice selection from OS voices is actually a nice feature ("choose your narrator"). This is the right tool for this scope.

__AWS Polly as a clearly-labeled future upgrade path__ — if you ever want production-grade voice consistency, it's documented and doable without changing the app architecture, just swapping the synthesis layer.

---

## Decision

__Web Speech API selected.__ AWS Polly documented as future upgrade path.