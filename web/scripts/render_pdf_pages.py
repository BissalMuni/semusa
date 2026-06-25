"""
재정학 PDF 각 페이지를 PNG로 렌더링 (LLM이 직접 읽어 교정하기 위함)
출력: web/data/pdf_pages/YYYY_pNN.png
사용: python render_pdf_pages.py [YYYY ...]
"""
import sys
from pathlib import Path
import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parents[2]  # semusa/
PDF_DIR = ROOT / "재정학"
OUT_DIR = ROOT / "web" / "data" / "pdf_pages"
ZOOM = 2.4

def render(year: int):
    pdf = PDF_DIR / f"{year}_재정학.pdf"
    doc = fitz.open(pdf)
    for i, page in enumerate(doc, 1):
        pix = page.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM))
        out = OUT_DIR / f"{year}_p{i:02d}.png"
        pix.save(out)
        print(f"  {out.name}  {pix.width}x{pix.height}")
    doc.close()

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    years = [int(a) for a in sys.argv[1:]] or [2022, 2023, 2024, 2025, 2026]
    for y in years:
        print(f"== {y} ==")
        render(y)

if __name__ == "__main__":
    main()
