"""
main.py – FastAPI backend dla PDF Booklet Imposer

Uruchom lokalnie:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
    # otwórz http://localhost:8000
"""

from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from booklet_core import ALLOWED_SIZES, MAX_PDF_BYTES, get_pdf_info, process_booklet

app = FastAPI(title="PDF Booklet Imposer", version="1.0")

STATIC_DIR = Path(__file__).parent / "static"


# ── Strona główna ───────────────────────────────────────────────────────────

@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")


# ── API ─────────────────────────────────────────────────────────────────────

@app.post("/api/info")
async def pdf_info(file: UploadFile = File(...)):
    """Zwraca informacje o wgranym PDF (liczba stron, format strony)."""
    _check_extension(file)
    content = await file.read()
    _check_size(content)
    try:
        return get_pdf_info(content)
    except Exception as exc:
        raise HTTPException(400, f"Nie można odczytać PDF: {exc}") from exc


@app.post("/api/process")
async def process_pdf(
    file: UploadFile = File(...),
    divide: int = Form(16),
    separator: str = Form("true"),   # string bo FormData nie ma booleanów
    flip: str = Form("short"),
):
    """Przetwarza PDF w pamięci i zwraca gotową broszurę do pobrania."""
    _check_extension(file)

    if divide not in ALLOWED_SIZES:
        raise HTTPException(400, f"divide musi być jednym z: {ALLOWED_SIZES}")
    if flip not in ("short", "long"):
        raise HTTPException(400, "flip musi być 'short' lub 'long'")

    sep_bool = separator.lower() in ("true", "1", "yes", "on")

    content = await file.read()
    _check_size(content)

    try:
        result_bytes, info = process_booklet(
            content,
            divide=divide,
            separator=sep_bool,
            flip=flip,
        )
    except Exception as exc:
        raise HTTPException(500, f"Błąd przetwarzania: {exc}") from exc

    stem = Path(file.filename or "output").stem
    return Response(
        content=result_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{stem}_booklet.pdf"',
            "X-Input-Pages":    str(info["input_pages"]),
            "X-Output-Pages":   str(info["output_pages"]),
            "X-Output-Sheets":  str(info["output_sheets"]),
            "X-Booklets-Count": str(len(info["booklets"])),
            "X-Size-Name":      info["size_name"],
            "X-Padding":        str(info["padding"]),
            # wymagane, żeby JS mógł te nagłówki odczytać
            "Access-Control-Expose-Headers": (
                "X-Input-Pages, X-Output-Pages, X-Output-Sheets, "
                "X-Booklets-Count, X-Size-Name, X-Padding"
            ),
        },
    )


# ── Walidacja ───────────────────────────────────────────────────────────────

def _check_extension(file: UploadFile) -> None:
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Plik musi być w formacie PDF (.pdf)")


def _check_size(content: bytes) -> None:
    if len(content) > MAX_PDF_BYTES:
        raise HTTPException(413, "Plik za duży – maksymalny rozmiar to 50 MB")


# ── Statyczne pliki (na końcu, żeby nie zasłaniało /api/*) ─────────────────

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
