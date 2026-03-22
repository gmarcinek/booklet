// Explanation banner component.
// Renders into #explanationBanner; replace img src once you have a real image.
export function renderExplanation() {
    const root = document.getElementById('explanationBanner');
    if (!root) return;

    root.innerHTML = `
        <div class="expl-banner">
            <div class="expl-img-wrap">
                <img id="explImg" src="/static/images/dwa12.jpg" alt="Schemat działania impozycji broszurowej" />
                <div class="expl-img-placeholder-label" id="explImgPlaceholder">
                    <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.2"
                         viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Placeholder — podmień src w explanation.js</span>
                </div>
            </div>
            <div class="expl-content">
                <h2 class="expl-title">Co robi ten program?</h2>
                <p class="expl-text">
                    <strong>PDF Booklet</strong> przekształca dowolny plik PDF w gotowy do druku układ
                    broszury (<em>impozycja 2-up</em>). Program automatycznie przeorganizowuje strony,
                    tak że po wydrukowaniu dwustronnym i złożeniu kartek na pół otrzymujesz prawdziwą
                    broszurę — bez żadnych ręcznych przeliczeń kolejności stron.
                </p>
                <p class="expl-text">
                    Obsługuje podział na wiele broszur (każda o konfigurowalnej liczbie stron),
                    dupleks na <em>krótką</em> lub <em>długą krawędź</em> oraz opcjonalną pustą
                    kartkę separującą między zeszytami.
                </p>
            </div>
        </div>
    `;

    // Hide placeholder label once a real image loads
    const img = document.getElementById('explImg');
    img.addEventListener('load', () => {
        document.getElementById('explImgPlaceholder').style.display = 'none';
    });
}
