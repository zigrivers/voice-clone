"""PDF text extraction using PyMuPDF."""

from pathlib import Path

import fitz  # PyMuPDF


async def extract_text_from_pdf(source: Path | bytes) -> str:
    """Extract text content from a PDF file.

    Args:
        source: Either a Path to a PDF file or raw bytes of PDF content.

    Returns:
        Extracted text content from all pages.
    """
    if isinstance(source, Path):
        doc = fitz.open(source)
    else:
        doc = fitz.open(stream=source, filetype="pdf")

    text_parts = []
    try:
        for page in doc:
            text = page.get_text()
            if text.strip():
                text_parts.append(text)
    finally:
        doc.close()

    return "\n\n".join(text_parts)
