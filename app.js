// ─── PDF.js Worker ────────────────────────────────────────────────────────────
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ─── State ────────────────────────────────────────────────────────────────────
let pdfDoc       = null;
let currentPage  = 1;
let totalPages   = 0;
const textCache  = {};   // { pageNum: string }

let chunks       = [];   // string[] for current page
let chunkIndex   = 0;
let isPlaying    = false;
let isPaused     = false;
let keepalive    = null;

// ─── DOM ──────────────────────────────────────────────────────────────────────
const fileInput    = document.getElementById('fileInput');
const voiceSelect  = document.getElementById('voiceSelect');
const canvas       = document.getElementById('pdfCanvas');
const ctx          = canvas.getContext('2d');
const emptyState   = document.getElementById('emptyState');
const pageCounter  = document.getElementById('pageCounter');
const playPauseBtn = document.getElementById('playPauseBtn');
const nextPageBtn  = document.getElementById('nextPageBtn');

// ─── Voices ───────────────────────────────────────────────────────────────────
function populateVoices() {
  const all     = speechSynthesis.getVoices();
  const english = all.filter(v => v.lang.startsWith('en'));
  const list    = english.length ? english : all;

  voiceSelect.innerHTML = '';
  list.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
}

speechSynthesis.addEventListener('voiceschanged', populateVoices);
populateVoices(); // Firefox: voices already available on load

function getSelectedVoice() {
  const all     = speechSynthesis.getVoices();
  const english = all.filter(v => v.lang.startsWith('en'));
  const list    = english.length ? english : all;
  return list[parseInt(voiceSelect.value, 10)] || null;
}

// ─── File Open ────────────────────────────────────────────────────────────────
fileInput.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;

  stopTTS();
  textCache[0] = undefined; // clear cache on new file

  const buffer = await file.arrayBuffer();
  pdfDoc      = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  totalPages  = pdfDoc.numPages;
  currentPage = 1;

  showCanvas();
  await renderPage(currentPage);
  updateCounter();
  enableControls();
  await playPage(currentPage);
});

// ─── Render ───────────────────────────────────────────────────────────────────
async function renderPage(pageNum) {
  const page     = await pdfDoc.getPage(pageNum);
  const scale    = Math.min(1.5, (window.innerWidth - 48) / page.getViewport({ scale: 1 }).width);
  const viewport = page.getViewport({ scale });

  canvas.width  = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;
}

// ─── Text Extraction ──────────────────────────────────────────────────────────
async function extractPageText(pageNum) {
  if (textCache[pageNum]) return textCache[pageNum];

  const page    = await pdfDoc.getPage(pageNum);
  const content = await page.getTextContent();
  const text    = content.items
    .map(item => item.str)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  textCache[pageNum] = text;
  return text;
}

// ─── Text Chunker ─────────────────────────────────────────────────────────────
function chunkText(text, maxLen = 200) {
  // Split on sentence boundaries first
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
  const result    = [];
  let current     = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxLen && current) {
      result.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) result.push(current.trim());

  // Hard-split any chunk still over maxLen
  return result.flatMap(chunk => {
    if (chunk.length <= maxLen) return [chunk];
    const parts = [];
    for (let i = 0; i < chunk.length; i += maxLen) {
      parts.push(chunk.slice(i, i + maxLen));
    }
    return parts;
  });
}

// ─── TTS Playback ─────────────────────────────────────────────────────────────
async function playPage(pageNum) {
  const text = await extractPageText(pageNum);

  if (!text) {
    // Skip empty pages
    if (currentPage < totalPages) {
      currentPage++;
      updateCounter();
      await renderPage(currentPage);
      await playPage(currentPage);
    } else {
      stopTTS();
    }
    return;
  }

  chunks     = chunkText(text);
  chunkIndex = 0;
  isPlaying  = true;
  isPaused   = false;

  updatePlayPauseBtn();
  startKeepalive();
  speakChunk(0);
}

function speakChunk(index) {
  if (index >= chunks.length) {
    advancePage();
    return;
  }

  const utter = new SpeechSynthesisUtterance(chunks[index]);
  const voice = getSelectedVoice();
  if (voice) utter.voice = voice;

  utter.onend = () => {
    if (!isPaused) {
      chunkIndex = index + 1;
      speakChunk(chunkIndex);
    }
  };

  utter.onerror = e => {
    // 'interrupted' fires on speechSynthesis.cancel() — expected, not an error
    if (e.error !== 'interrupted') {
      console.error('SpeechSynthesis error:', e.error);
    }
  };

  speechSynthesis.speak(utter);
}

async function advancePage() {
  if (currentPage >= totalPages) {
    stopTTS();
    return;
  }
  currentPage++;
  updateCounter();
  await renderPage(currentPage);
  await playPage(currentPage);
}

function stopTTS() {
  speechSynthesis.cancel();
  stopKeepalive();
  isPlaying  = false;
  isPaused   = false;
  chunks     = [];
  chunkIndex = 0;
  updatePlayPauseBtn();
}

// ─── Chrome 60s Keepalive ─────────────────────────────────────────────────────
function startKeepalive() {
  stopKeepalive();
  keepalive = setInterval(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 10000);
}

function stopKeepalive() {
  if (keepalive) {
    clearInterval(keepalive);
    keepalive = null;
  }
}

// ─── Controls ─────────────────────────────────────────────────────────────────
playPauseBtn.addEventListener('click', () => {
  if (!isPlaying && !isPaused) return;

  if (isPaused) {
    isPaused = false;
    speechSynthesis.resume();
    startKeepalive();
    // If synthesis already ended at a chunk boundary while paused, restart from current chunk
    if (!speechSynthesis.speaking) {
      speakChunk(chunkIndex);
    }
  } else {
    isPaused = true;
    speechSynthesis.pause();
    stopKeepalive();
  }
  updatePlayPauseBtn();
});

nextPageBtn.addEventListener('click', async () => {
  if (!pdfDoc || currentPage >= totalPages) return;
  stopTTS();
  currentPage++;
  updateCounter();
  await renderPage(currentPage);
  await playPage(currentPage);
});

voiceSelect.addEventListener('change', async () => {
  if (!pdfDoc || (!isPlaying && !isPaused)) return;
  // Restart current page from beginning with new voice
  speechSynthesis.cancel();
  stopKeepalive();
  await playPage(currentPage);
});

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function showCanvas() {
  emptyState.style.display = 'none';
  canvas.style.display     = 'block';
}

function updateCounter() {
  pageCounter.textContent = totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : '';
}

function updatePlayPauseBtn() {
  if (isPaused) {
    playPauseBtn.textContent = 'Resume';
  } else if (isPlaying) {
    playPauseBtn.textContent = 'Pause';
  } else {
    playPauseBtn.textContent = 'Play';
  }
}

function enableControls() {
  playPauseBtn.disabled = false;
  nextPageBtn.disabled  = false;
}
