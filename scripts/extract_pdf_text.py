import sys
import fitz  # PyMuPDF

def extract_text(pdf_path, out_path):
    doc = fitz.open(pdf_path)
    with open(out_path, 'w', encoding='utf-8') as f:
        for i, page in enumerate(doc, start=1):
            f.write(f"=== PAGE {i:03d} ===\n")
            text = page.get_text()
            f.write(text)
            f.write('\n\n')
    print(f"Wrote text for {len(doc)} pages to {out_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: python extract_pdf_text.py <input.pdf> <output.txt>')
        sys.exit(1)
    extract_text(sys.argv[1], sys.argv[2])
