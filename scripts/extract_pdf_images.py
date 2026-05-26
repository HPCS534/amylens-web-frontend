#!/usr/bin/env python3
"""
Extract images and render pages from a PDF using PyMuPDF (fitz).
Usage: python extract_pdf_images.py "Software Design Description.pdf" output_dir
"""
import sys
import os
import fitz

if len(sys.argv) < 3:
    print("Usage: python extract_pdf_images.py <pdf-path> <out-dir>")
    sys.exit(2)

pdf_path = sys.argv[1]
out_dir = sys.argv[2]

os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Opened {pdf_path}, pages={doc.page_count}")

# Render each page to PNG
for i, page in enumerate(doc, start=1):
    pix = page.get_pixmap(matrix=fitz.Matrix(2,2))
    out_png = os.path.join(out_dir, f"page_{i:03d}.png")
    pix.save(out_png)
    print(f"Wrote page image: {out_png}")

# Extract embedded images
img_idx = 0
for i in range(len(doc)):
    page = doc[i]
    images = page.get_images(full=True)
    for img in images:
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image.get("ext", "png")
        out_path = os.path.join(out_dir, f"extracted_p{i+1}_img{xref}.{image_ext}")
        with open(out_path, "wb") as f:
            f.write(image_bytes)
        img_idx += 1
        print(f"Extracted image: {out_path}")

print(f"Done. Rendered pages: {doc.page_count}, extracted images: {img_idx}")
