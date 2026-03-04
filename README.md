# PDF Audio Reader

A static web app that reads PDF files aloud using the browser's built-in Web Speech API. No backend, no API keys, no install — runs entirely in the browser and deploys to GitHub Pages.

---

## Features

- Open any local PDF and have it read aloud page by page
- Pause / Resume playback at any time
- Skip to the next page manually
- Voice selector — choose from your OS's available voices
- Page counter synced to audio
- Zero cost, zero data sent anywhere

## How to Use

1. Open the app in Chrome, Firefox, or Safari (desktop)
2. Click __Open PDF__ and select a `.pdf` file from your computer
3. The app renders the first page and begins reading automatically
4. Use __Pause__ / __Resume__ and __Next Page__ to control playback
5. Switch voices from the dropdown at any time

## Browser Support

| Browser | Status |
|---|---|
| Chrome (desktop) | Full support |
| Firefox (desktop) | Full support |
| Safari (desktop) | Full support |
| Mobile browsers | Partial — iOS Safari has known quirks |

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to __Settings → Pages__
3. Set source to `main` branch, root folder `/`
4. Your app will be live at `https://<username>.github.io/<repo-name>/`

No build step required.

## Known Limitations

- Chrome has a ~60-second TTS timeout bug — mitigated with a keepalive timer
- Text extraction quality depends on the PDF's encoding (scanned/image PDFs will have no extractable text)
- Voice availability depends on the user's OS and browser

## Project Files

- [PRD.md](PRD.md) — Product Requirements Document
- [TASK_LIST.md](TASK_LIST.md) — Development task list
- [LOCAL_LOG.md](LOCAL_LOG.md) — Project log

## License

[ISC](LICENSE.md)
