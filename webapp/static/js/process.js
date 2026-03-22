import { S } from './state.js';
import { showEl, hideEl, setProgress, showError, hideError, showResultCard, hideResultCard } from './ui.js';
import { renderPage } from './pdf-render.js';

// ── Process ───────────────────────────────────────────────────────────────
export async function processFile() {
    if (!S.file) return;

    hideError();
    hideResultCard();
    setProgress(5, 'Wysyłanie pliku...');
    showEl('progressCard');

    const btn  = document.getElementById('processBtn');
    const icon = document.getElementById('btnIcon');
    btn.disabled = true;
    document.getElementById('btnText').textContent = 'Przetwarzanie...';
    icon.classList.add('spin');

    try {
        const fd = new FormData();
        fd.append('file',      S.file);
        fd.append('divide',    String(S.divide));
        fd.append('separator', S.sep ? 'true' : 'false');
        fd.append('flip',      S.flip);

        setProgress(25, 'Wysyłanie pliku...');
        const resp = await fetch('/api/process', { method: 'POST', body: fd });
        setProgress(70, 'Przetwarzanie impozycji...');

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
            throw new Error(err.detail || `HTTP ${resp.status}`);
        }

        const blob = await resp.blob();
        setProgress(95, 'Finalizowanie...');

        S.resultBlob = blob;
        S.resultName = S.file.name.replace(/\.pdf$/i, '') + '_booklet.pdf';

        showResultCard(
            resp.headers.get('X-Input-Pages')    || '?',
            resp.headers.get('X-Output-Sheets')  || '?',
            resp.headers.get('X-Booklets-Count') || '?',
            resp.headers.get('X-Padding')        || '0',
        );

        setProgress(98, 'Ładowanie podglądu...');
        await _loadOutputPreview(blob);
        setProgress(100, 'Gotowe!');

    } catch (err) {
        showError(err.message);
    } finally {
        btn.disabled = false;
        document.getElementById('btnText').textContent = 'Generuj broszurę';
        icon.classList.remove('spin');
        setTimeout(() => hideEl('progressCard'), 800);
    }
}

async function _loadOutputPreview(blob) {
    const doc = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise;
    S.docs.output  = doc;
    S.pages.output = doc.numPages;
    S.cur.output   = 1;

    document.getElementById('outTotal').textContent = doc.numPages;
    document.getElementById('outCur').textContent   = 1;
    showEl('outputPreviewCard');
    await renderPage('output', 1);
}

// ── Download ──────────────────────────────────────────────────────────────
export function downloadResult() {
    if (!S.resultBlob) return;
    const url = URL.createObjectURL(S.resultBlob);
    const a   = Object.assign(document.createElement('a'), { href: url, download: S.resultName });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 15_000);
}
