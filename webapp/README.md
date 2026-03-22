# PDF Booklet – Web App

Impozytor broszurowy 2-up działający jako webapp z backendem Python (FastAPI).  
Wszystko odbywa się **w pamięci** – żaden plik nie jest zapisywany na dysku.

## Szybki start

```bash
cd webapp
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# otwórz http://localhost:8000
```

---

## Deployment

### 🟢 Render.com (zalecane, darmowe)

1. Wrzuć folder `webapp/` na GitHub
2. Utwórz nowy **Web Service** na [render.com](https://render.com)
3. Ustaw:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Kliknij Deploy → gotowe (darmowy tier bez karty kredytowej)

### 🟡 Railway

```bash
railway init
railway up
```

### ⚠️ Netlify – ograniczenia

Netlify to hosting statycznych stron. Netlify Functions (serverless Python) mają:

- **limit 6 MB** na żądanie/odpowiedź – za mało dla PDF-ów
- **10 sekund** na wykonanie – za mało dla dużych plików

**Rozwiązanie:** Frontend na Netlify (`static/index.html`) + backend na Render.

---

## Architektura

```
webapp/
├── main.py          # FastAPI – serwuje UI i API
├── booklet_core.py  # silnik impozycji (BytesIO, bez plików)
├── requirements.txt
└── static/
    └── index.html   # frontend (Tailwind + PDF.js)
```

### Endpointy API

| Metoda | Ścieżka        | Opis                                    |
| ------ | -------------- | --------------------------------------- |
| `GET`  | `/`            | Strona główna (index.html)              |
| `POST` | `/api/info`    | Informacje o PDF (liczba stron, format) |
| `POST` | `/api/process` | Generuje broszurę, zwraca PDF           |

### Parametry `/api/process`

| Pole        | Typ              | Domyślnie | Opis                                      |
| ----------- | ---------------- | --------- | ----------------------------------------- |
| `file`      | PDF upload       | wymagany  | Plik wejściowy                            |
| `divide`    | int              | `16`      | Stron na broszurę (4/8/12/16/20/24/28/32) |
| `separator` | `"true"/"false"` | `"true"`  | Pusta kartka między broszurami            |
| `flip`      | `"short"/"long"` | `"short"` | Typ dupleksu                              |

Wynik: plik PDF + nagłówki `X-Input-Pages`, `X-Output-Sheets`, `X-Booklets-Count`.
