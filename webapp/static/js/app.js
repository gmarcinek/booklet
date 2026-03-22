import { S }                                   from './state.js';
import { buildDivideGrid }                     from './divide-grid.js';
import { setupDragDrop, handleFile, clearFile } from './file-handler.js';
import { processFile, downloadResult }          from './process.js';
import { changePage }                           from './pdf-render.js';
import { renderExplanation }                    from './explanation.js';
import { setupFaq, openFaq, closeFaq, FAQ_HTML } from './faq.js';

// ── Expose globals for inline onclick handlers in the HTML ────────────────
window.processFile    = processFile;
window.downloadResult = downloadResult;
window.changePage     = changePage;
window.clearFile      = clearFile;
window.openFaq        = openFaq;
window.closeFaq       = closeFaq;

window.setFlip = function (val) {
    S.flip = val;
    document.querySelectorAll('.flip-btn')
        .forEach(b => b.classList.toggle('active', b.dataset.flip === val));
};

window.toggleSep = function () {
    S.sep = !S.sep;
    document.getElementById('sepToggle').classList.toggle('on', S.sep);
};

// ── Bootstrap ────────────────────────────────────────────────────────────
// Inject FAQ content and wire up drawer
document.getElementById('faqDrawer').innerHTML = FAQ_HTML;
setupFaq();

renderExplanation();
buildDivideGrid();
setupDragDrop();

// Keyboard navigation for input preview
document.addEventListener('keydown', async e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft')  await changePage('input', -1);
    if (e.key === 'ArrowRight') await changePage('input',  1);
});
