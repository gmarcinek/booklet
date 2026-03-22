import { S } from './state.js';
import { showEl, hideEl, fmtBytes, showError, hideError, hideResultCard } from './ui.js';
import { renderPage } from './pdf-render.js';

// ── Load file (from input or drag-drop) ───────────────────────────────────
export async function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        showError('Plik musi być w formacie PDF');
        return;
    }
    S.file = file;

    // Show file-loaded state in drop zone
    document.getElementById('stateIdle').style.display = 'none';
    const sf = document.getElementById('stateFile');
    sf.style.display = 'flex';
    document.getElementById('fileNameEl').textContent = file.name;
    document.getElementById('fileSizeEl').textContent = fmtBytes(file.size);

    // Enable process button
    const btn = document.getElementById('processBtn');
    btn.disabled = false;
    document.getElementById('btnText').textContent = 'Generuj broszurę';

    // Fetch server-side PDF info (page count, format) — non-critical
    try {
        const fd = new FormData();
        fd.append('file', file);
        const r = await fetch('/api/info', { method: 'POST', body: fd });
        if (r.ok) _showInfoCard(await r.json(), file.size);
    } catch (_) { /* non-critical */ }

    // Render input preview entirely client-side via PDF.js
    const doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    S.docs.input  = doc;
    S.pages.input = doc.numPages;
    S.cur.input   = 1;

    document.getElementById('inTotal').textContent = doc.numPages;
    document.getElementById('inCur').textContent   = 1;
    document.getElementById('inputNav').style.display         = 'flex';
    document.getElementById('inputPlaceholder').style.display = 'none';
    document.getElementById('inputCanvasWrap').style.display  = 'block';

    await renderPage('input', 1);
    hideError();
}

function _showInfoCard(info, fileSize) {
    document.getElementById('infoPagesEl').textContent    = info.total_pages;
    document.getElementById('infoFormatEl').textContent   = info.size_name;
    document.getElementById('infoDimsEl').textContent     = `${info.page_w} × ${info.page_h} pt`;
    document.getElementById('infoFileSizeEl').textContent = fmtBytes(fileSize);
    showEl('infoCard');
}

// ── Clear file ────────────────────────────────────────────────────────────
export function clearFile(e) {
    e.stopPropagation();
    S.file       = null;
    S.docs.input = null;

    document.getElementById('stateFile').style.display = 'none';
    document.getElementById('stateIdle').style.display = 'block';
    document.getElementById('fileInput').value         = '';

    hideEl('infoCard');
    document.getElementById('inputNav').style.display         = 'none';
    document.getElementById('inputCanvasWrap').style.display  = 'none';
    document.getElementById('inputPlaceholder').style.display = 'flex';

    document.getElementById('processBtn').disabled = true;
    document.getElementById('btnText').textContent = 'Generuj broszurę';

    hideResultCard();
    hideError();
}

// ── Drag-and-drop + file input wiring ────────────────────────────────────
export function setupDragDrop() {
    const zone = document.getElementById('dropZone');

    zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    document.getElementById('fileInput').addEventListener('change', e => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });
}
