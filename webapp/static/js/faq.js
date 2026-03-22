// FAQ drawer — slide-in panel with full explanation
const DRAWER_ID  = 'faqDrawer';
const OVERLAY_ID = 'faqOverlay';

export function setupFaq() {
    // close on overlay click + Escape key
    document.getElementById(OVERLAY_ID).addEventListener('click', closeFaq);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeFaq();
    });
}

export function openFaq() {
    document.getElementById(OVERLAY_ID).classList.add('active');
    document.getElementById(DRAWER_ID).classList.add('active');
    document.body.style.overflow = 'hidden';
}

export function closeFaq() {
    document.getElementById(OVERLAY_ID).classList.remove('active');
    document.getElementById(DRAWER_ID).classList.remove('active');
    document.body.style.overflow = '';
}

// ── FAQ content (HTML string) ─────────────────────────────────────────────
export const FAQ_HTML = `
<div class="faq-close-row">
    <span class="faq-drawer-title">Jak to działa?</span>
    <button class="faq-close-btn" onclick="closeFaq()">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    </button>
</div>

<div class="faq-body">

    <section class="faq-section">
        <h3 class="faq-h3">Co to jest impozycja broszurowa?</h3>
        <p>Kiedy drukujesz broszurę, kartki papieru są <strong>składane na pół</strong> i wkładane jedna w drugą
        — tak powstaje zeszyt z prawdziwymi stronami. Problem polega na tym, że strony muszą trafić
        na papier w zupełnie innej kolejności niż ta, w której je czytasz.</p>
        <p>Weźmy najprostszy przykład: broszura 8-stronicowa (2 złożone arkusze A4 = 8 stron A5).
        Na pierwszym arkuszu musisz wydrukować strony <strong>8 i 1</strong> (na zewnątrz)
        oraz <strong>2 i 7</strong> (wewnątrz). Na drugim: <strong>6 i 3</strong> i <strong>4 i 5</strong>.
        Ręczne obliczanie tego dla dokumentu o 60 stronach jest uciążliwe i podatne na błędy.
        <em>Ten program robi to automatycznie.</em></p>
    </section>

    <section class="faq-section">
        <h3 class="faq-h3">Co oznacza „2-up"?</h3>
        <p>Na każdej kartce A4 drukowane są <strong>dwie strony A5</strong> obok siebie.
        Po wydrukowaniu arkusz składasz wzdłuż osi i dostajesz strony formatu A5 —
        typowy rozmiar broszury lub zeszytu.
        Stąd nazwa <em>2-up</em> (dwie strony na jeden arkusz).</p>
        <p>Program obsługuje strony wejściowe w formacie A5 lub A4. Strony A5 trafiają
        bezpośrednio na arkusz A4. Strony A4 są skalowane do A5.</p>
    </section>

    <section class="faq-section">
        <h3 class="faq-h3">Dlaczego liczba stron musi być wielokrotnością 4?</h3>
        <p>Każdy złożony arkusz tworzy dokładnie <strong>4 strony</strong>
        (przód-lewo, przód-prawo, tył-lewo, tył-prawo). Dlatego każda broszura lub zeszyt
        musi zawierać liczbę stron będącą wielokrotnością 4 (4, 8, 12, 16…).</p>
        <p>Jeśli Twój dokument ma np. 18 stron, program automatycznie dodaje
        <strong>2 puste strony dopełnienia</strong> (padding), by osiągnąć 20.
        Zostanie to zaznaczone w wynikach przetwarzania.</p>
    </section>

    <section class="faq-section">
        <h3 class="faq-h3">Po co dzielić na wiele broszur?</h3>
        <p>Bardzo gruby zeszyt jest trudny do złożenia i zszycia — papier stawia opór
        przy składaniu, brzegi stron odstają, całość wygląda nieprofesjonalnie.
        Przyjmuje się, że zeszyt nie powinien przekraczać <strong>32&nbsp;stron</strong>
        (8 złożonych arkuszy).</p>
        <p>Ustawienie <strong>Wielkość broszury</strong> określa ile stron ma mieć
        każdy zeszyt. Program podzieli dokument na tyle zeszytów, ile potrzeba,
        i połączy je w jeden plik PDF — każdy zeszyt po kolei.
        Gotowe zeszyty drukujesz razem, potem rozdzielasz (opcjonalny
        <em>separator</em> pomaga je odróżnić) i każdy zszyjesz oddzielnie.</p>
    </section>

    <section class="faq-section">
        <h3 class="faq-h3">Krótka vs długa krawędź — co wybrać?</h3>
        <p>Przy dupleksie (druku dwustronnym) drukarka musi wiedzieć, wzdłuż której
        krawędzi „obraca" kartkę przed wydrukowaniem drugiej strony:</p>
        <ul class="faq-list">
            <li><strong>Krótka krawędź (zalecane)</strong> — obracanie wzdłuż górnej/dolnej
            krawędzi strony. Używane przy orientacji poziomej (landscape). Wydruk A4 poziomo
            = dwie strony A5 pionowo, złożenie wzdłuż osi pionowej — to właśnie ten tryb.</li>
            <li><strong>Długa krawędź</strong> — standardowy dupleks dla pionowych dokumentów.
            Niektóre starsze modele drukarek używają tego trybu nawet dla formatu poziomego.</li>
        </ul>
        <p>Jeżeli po wydrukowaniu tył strony wychodzi do góry nogami, <em>zmień opcję</em>
        i spróbuj ponownie.</p>
    </section>

    <section class="faq-section">
        <h3 class="faq-h3">Do czego służy separator między broszurami?</h3>
        <p>Gdy drukujesz wiele zeszytów w jednym przebiegu drukarki,
        puste kartki separatorów ułatwiają ręczne rozdzielenie gotowych wydruków.
        Bez separatora można się pomylić gdzie kończy się jeden zeszyt a zaczyna następny,
        zwłaszcza przy dużych ilościach.</p>
        <p>Separator to jedna pusta strona (= pół arkusza) wstawiona między każdy zeszyt.
        Możesz go wyłączyć jeśli drukujesz tylko jedną broszurę lub robisz to ręcznie w inny sposób.</p>
    </section>

    <section class="faq-section">
        <h3 class="faq-h3">Jak wydrukować broszurę — krok po kroku</h3>
        <ol class="faq-list faq-list--ol">
            <li>Wygeneruj plik broszury tym programem i pobierz go.</li>
            <li>Otwórz PDF w dowolnym programie (Adobe Reader, przeglądarka, itp.).</li>
            <li>W oknie drukowania ustaw: <strong>druk dwustronny</strong>,
            orientacja <strong>pozioma (landscape)</strong>, rozmiar papieru <strong>A4</strong>.</li>
            <li>Ustaw przerzucanie wzdłuż <strong>krótszej krawędzi</strong>
            (short-edge binding / flip on short edge).</li>
            <li>Wydrukuj <em>wszystkie</em> strony — każda strona PDF to jeden arkusz A4.</li>
            <li>Posortuj arkusze (powinny być już w dobrej kolejności).</li>
            <li>Złóż każdą grupę arkuszy na pół (wzdłuż osi pionowej).</li>
            <li>Zszyj lub zaklipsuj wzdłuż złamania — gotowe!</li>
        </ol>
    </section>

    <section class="faq-section">
        <h3 class="faq-h3">Jakie pliki są obsługiwane?</h3>
        <p>Program przyjmuje pliki <strong>PDF do 50&thinsp;MB</strong>.
        Strony mogą być w formacie A4 lub A5 (inne formaty są obsługiwane
        z automatycznym dopasowaniem). PDF może mieć dowolną liczbę stron —
        program sam zaplanuje optymalny podział na zeszyty.</p>
        <p>Podgląd wejściowego i wynikowego PDF renderowany jest po stronie przeglądarki
        (biblioteka PDF.js) — żadne dane nie są przechowywane na serwerze po zakończeniu przetwarzania.</p>
    </section>

    <section class="faq-section faq-section--last">
        <h3 class="faq-h3">Skrót klawiszowy</h3>
        <p>Po wczytaniu pliku możesz przeglądać podgląd stron za pomocą
        klawiszy <strong>← →</strong> (strzałki lewo/prawo).</p>
    </section>

</div>
`;
