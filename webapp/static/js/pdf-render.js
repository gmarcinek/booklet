import { S } from './state.js';

// ── Render a single page into an <input|output>Canvas ────────────────────
export async function renderPage(which, pageNum) {
    const doc = S.docs[which];
    if (!doc) return;

    const canvas = document.getElementById(which === 'input' ? 'inputCanvas' : 'outputCanvas');
    const ctx    = canvas.getContext('2d');
    const page   = await doc.getPage(pageNum);

    const vp0  = page.getViewport({ scale: 1 });
    const maxW = (canvas.parentElement.offsetWidth || 520) - 28;
    const vp   = page.getViewport({ scale: Math.min(1.8, maxW / vp0.width) });

    canvas.width  = vp.width;
    canvas.height = vp.height;

    await page.render({ canvasContext: ctx, viewport: vp }).promise;

    S.cur[which] = pageNum;
    document.getElementById(which === 'input' ? 'inCur' : 'outCur').textContent = pageNum;
}

// ── Navigate by delta (±1) ────────────────────────────────────────────────
export async function changePage(which, delta) {
    const next = S.cur[which] + delta;
    if (next < 1 || next > S.pages[which]) return;
    await renderPage(which, next);
}
