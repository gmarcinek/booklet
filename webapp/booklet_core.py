"""
booklet_core.py – rdzeń algorytmu impozycji broszurowej, operuje w pamięci (BytesIO).
Zaadaptowane z booklet.py do użycia jako moduł webowy.
"""
import io

from pypdf import PdfReader, PdfWriter, PageObject, Transformation

# ── Stałe ──────────────────────────────────────────────────────────────────
A4_W, A4_H = 595.28, 841.89
A5_W, A5_H = 420.94, 595.28

ALLOWED_SIZES = [4, 8, 12, 16, 20, 24, 28, 32]

MAX_PDF_BYTES = 50 * 1024 * 1024  # 50 MB


# ── Detekcja rozmiaru strony ────────────────────────────────────────────────

def detect_page_size(page) -> tuple[str, float, float]:
    w = float(page.mediabox.width)
    h = float(page.mediabox.height)
    if w > h:
        w, h = h, w
    if abs(w - A5_W) < 20 and abs(h - A5_H) < 20:
        return "A5", A5_W, A5_H
    if abs(w - A4_W) < 20 and abs(h - A4_H) < 20:
        return "A4", A4_W, A4_H
    return f"custom ({w:.0f}×{h:.0f}pt)", w, h


# ── Podział na broszury ─────────────────────────────────────────────────────

def optimize_tail(remaining: int) -> list[int]:
    if remaining <= 0:
        return []
    if remaining in ALLOWED_SIZES:
        return [remaining]
    best_pair: list[int] = []
    best_diff = 1000
    for s1 in ALLOWED_SIZES:
        for s2 in ALLOWED_SIZES:
            if s1 + s2 == remaining:
                diff = abs(s1 - s2)
                if diff < best_diff:
                    best_diff = diff
                    best_pair = sorted([s1, s2], reverse=True)
    if best_pair:
        return best_pair
    for s1 in ALLOWED_SIZES:
        for s2 in ALLOWED_SIZES:
            for s3 in ALLOWED_SIZES:
                if s1 + s2 + s3 == remaining:
                    return sorted([s1, s2, s3], reverse=True)
    return []


def design_split(total: int, base: int) -> tuple[list[int], int]:
    if total <= max(ALLOWED_SIZES):
        if total in ALLOWED_SIZES:
            return [total], 0
        for s in ALLOWED_SIZES:
            if s >= total:
                return [s], s - total
        padding = (4 - total % 4) % 4
        return [total + padding], padding

    full_chunks = total // base
    remainder = total % base

    if remainder == 0:
        return [base] * full_chunks, 0

    best_plan: list[int] = []
    best_score = 10000

    for reduce in range(6):
        n_full = full_chunks - reduce
        if n_full < 0:
            continue
        tail = total - n_full * base
        if tail <= 0:
            continue
        tail_plan = optimize_tail(tail)
        if tail_plan:
            plan = [base] * n_full + tail_plan
            if len(plan) < best_score:
                best_score = len(plan)
                best_plan = plan

    if best_plan:
        return best_plan, 0

    padding = (4 - total % 4) % 4
    padded = total + padding
    fc = padded // base
    rem = padded % base
    if rem == 0:
        return [base] * fc, padding
    return [base] * fc + [rem], padding


# ── Impozycja ───────────────────────────────────────────────────────────────

def booklet_page_order(n: int) -> list[tuple[int, int]]:
    assert n % 4 == 0
    pairs = []
    for sheet in range(n // 4):
        pairs.append((n - 1 - 2 * sheet, 2 * sheet))
        pairs.append((2 * sheet + 1, n - 2 - 2 * sheet))
    return pairs


def compose_2up_page(
    left_page, right_page,
    out_w: float, out_h: float,
    half_w: float, scale: float,
    rotate_180: bool = False,
) -> PageObject:
    new_page = PageObject.create_blank_page(width=out_w, height=out_h)
    if not rotate_180:
        if left_page is not None:
            new_page.merge_transformed_page(left_page, Transformation().scale(scale, scale))
        if right_page is not None:
            new_page.merge_transformed_page(
                right_page,
                Transformation().translate(float(half_w), 0).scale(scale, scale),
            )
    else:
        if right_page is not None:
            new_page.merge_transformed_page(
                right_page,
                Transformation().scale(-scale, -scale).translate(float(half_w), float(out_h)),
            )
        if left_page is not None:
            new_page.merge_transformed_page(
                left_page,
                Transformation().scale(-scale, -scale).translate(float(out_w), float(out_h)),
            )
    return new_page


def impose_booklet(pages, out_w, out_h, half_w, scale, flip_long=False) -> list[PageObject]:
    n = len(pages)
    order = booklet_page_order(n)
    output = []
    for i, (li, ri) in enumerate(order):
        rotate = flip_long and (i % 2 == 1)
        output.append(compose_2up_page(pages[li], pages[ri], out_w, out_h, half_w, scale, rotate))
    return output


# ── Publiczne API ───────────────────────────────────────────────────────────

def get_pdf_info(pdf_bytes: bytes) -> dict:
    """Zwraca podstawowe informacje o PDF bez przetwarzania."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    total = len(reader.pages)
    size_name, pw, ph = detect_page_size(reader.pages[0])
    return {
        "total_pages": total,
        "size_name": size_name,
        "page_w": round(pw, 1),
        "page_h": round(ph, 1),
    }


def process_booklet(
    pdf_bytes: bytes,
    divide: int = 16,
    separator: bool = True,
    flip: str = "short",
) -> tuple[bytes, dict]:
    """
    Przetwarza PDF w pamięci.
    Zwraca (bytes wynikowego PDF, słownik z informacjami).
    """
    flip_long = flip == "long"
    reader = PdfReader(io.BytesIO(pdf_bytes))
    total_real = len(reader.pages)
    size_name, page_w, page_h = detect_page_size(reader.pages[0])

    chunks, padding = design_split(total_real, divide)

    if size_name == "A5":
        scale = 1.0
        out_w, out_h = A5_W * 2, A5_H
    elif size_name == "A4":
        scale = A5_W / A4_W
        out_w, out_h = A5_W * 2, A5_H
    else:
        scale_w = (A4_H / 2) / page_w
        scale_h = A4_W / page_h
        scale = min(scale_w, scale_h)
        out_w, out_h = A4_H, A4_W

    half_w = out_w / 2
    writer = PdfWriter()
    page_cursor = 0
    booklets_info = []

    for ci, chunk_size in enumerate(chunks):
        booklet_pages = []
        for j in range(chunk_size):
            idx = page_cursor + j
            booklet_pages.append(reader.pages[idx] if idx < total_real else None)
        page_cursor += chunk_size

        real_in_chunk = min(chunk_size, max(0, total_real - (page_cursor - chunk_size)))
        pad_in_chunk = chunk_size - real_in_chunk

        for page in impose_booklet(booklet_pages, out_w, out_h, half_w, scale, flip_long):
            writer.add_page(page)

        booklets_info.append({
            "num": ci + 1,
            "real_pages": real_in_chunk,
            "pad_pages": pad_in_chunk,
            "total_pages": chunk_size,
            "sheets": chunk_size // 4,
        })

        if separator and ci < len(chunks) - 1:
            for _ in range(2):
                writer.add_page(PageObject.create_blank_page(width=out_w, height=out_h))

    buf = io.BytesIO()
    writer.write(buf)
    result_bytes = buf.getvalue()

    total_out = len(writer.pages)
    return result_bytes, {
        "input_pages": total_real,
        "size_name": size_name,
        "chunks": chunks,
        "padding": padding,
        "output_pages": total_out,
        "output_sheets": total_out // 2,
        "output_size_kb": len(result_bytes) // 1024,
        "booklets": booklets_info,
        "flip": flip,
        "separator": separator,
    }
