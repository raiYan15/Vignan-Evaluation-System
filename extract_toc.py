#!/usr/bin/env python3
"""
Extract Table of Contents from PDF document
"""

import os
import sys

try:
    import pdfplumber
except ImportError:
    print("Installing pdfplumber...")
    os.system(f"{sys.executable} -m pip install -q pdfplumber")
    import pdfplumber

pdf_path = r"Frontend\Images\Smarter Evaluation for the Next Generation of Education..pdf"

if not os.path.exists(pdf_path):
    print(f"Error: PDF not found at {pdf_path}")
    sys.exit(1)

print("=" * 70)
print("EXTRACTING TABLE OF CONTENTS FROM PDF")
print("=" * 70)

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"\nTotal pages in PDF: {len(pdf.pages)}\n")
        
        # Extract text from first few pages (typically where TOC is)
        toc_text = ""
        for page_num in range(min(5, len(pdf.pages))):
            page = pdf.pages[page_num]
            text = page.extract_text()
            toc_text += f"\n--- PAGE {page_num + 1} ---\n{text}\n"
        
        print(toc_text)
        
        # Also try to extract via metadata if available
        print("\n" + "=" * 70)
        print("PDF METADATA")
        print("=" * 70)
        print(f"Title: {pdf.metadata.get('Title', 'N/A')}")
        print(f"Author: {pdf.metadata.get('Author', 'N/A')}")
        print(f"Subject: {pdf.metadata.get('Subject', 'N/A')}")
        
except Exception as e:
    print(f"Error reading PDF: {e}")
    sys.exit(1)

print("\n✓ TOC extraction complete!")
