import { S } from './state.js';

// ── DOM helpers ───────────────────────────────────────────────────────────
export function showEl(id) { document.getElementById(id).style.display = 'block'; }
export function hideEl(id) { document.getElementById(id).style.display = 'none'; }

export function fmtBytes(b) {
    if (b < 1024)            return b + ' B';
    if (b < 1024 * 1024)     return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}

// ── Progress ──────────────────────────────────────────────────────────────
export function setProgress(pct, label) {
    document.getElementById('progressBar').style.width   = pct + '%';
    document.getElementById('progressPct').textContent   = pct + '%';
    document.getElementById('progressLabel').textContent = label;
}

// ── Error card ────────────────────────────────────────────────────────────
export function showError(msg) {
    document.getElementById('errorMsg').textContent = msg;
    showEl('errorCard');
}
export function hideError() { hideEl('errorCard'); }

// ── Result card ───────────────────────────────────────────────────────────
export function showResultCard(inPages, outSheets, nBooks, padding) {
    document.getElementById('rInPages').textContent  = inPages;
    document.getElementById('rSheets').textContent   = outSheets;
    document.getElementById('rBooklets').textContent = nBooks;

    const bd = document.getElementById('rBreakdown');
    bd.innerHTML = (+padding > 0)
        ? `<span style="color:#f59e0b;">+${padding} pustych stron (dopełnienie)</span>`
        : '';

    showEl('resultCard');
    // Scroll to result card with a short delay so the element is fully rendered
    setTimeout(() => {
        document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
}

export function hideResultCard() {
    hideEl('resultCard');
    hideEl('outputPreviewCard');
    S.resultBlob = null;
}
