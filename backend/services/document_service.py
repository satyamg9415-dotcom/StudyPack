import io
import re
from typing import Tuple, Optional
from pathlib import Path

import pymupdf

from pptx import Presentation
from utils.config import settings
from models.document import DocumentUploadResponse


class DocumentService:
    """
    Robust document parsing service for StudyPack AI.
    Handles PDF (PyMuPDF), PPTX (python-pptx), and TXT (UTF-8).
    Preserves paragraph and slide boundaries, validates MIME types & extensions,
    and enforces maximum upload sizes.
    """

    ALLOWED_EXTENSIONS = {".pdf", ".pptx", ".txt"}

    ALLOWED_MIME_TYPES = {
        # PDF
        "application/pdf",
        "application/x-pdf",
        # PPTX
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-powerpoint",
        # TXT
        "text/plain",
        "text/x-plain",
        "text/markdown",
        # Generic octet-stream (sent by some browser-OS combinations for binary files)
        "application/octet-stream",
    }

    @staticmethod
    def extract_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
        """
        Extract text from PDF using PyMuPDF (fitz).
        Preserves paragraph and page boundaries.
        """
        # Validate PDF magic header
        if not file_bytes.startswith(b"%PDF"):
            raise ValueError("Invalid PDF file: Missing standard %PDF file header signature.")

        text_pages = []
        try:
            with pymupdf.open(stream=file_bytes, filetype="pdf") as doc:
                if doc.is_encrypted:
                    raise ValueError("PDF document is encrypted or password-protected and cannot be parsed.")

                page_count = len(doc)
                if page_count == 0:
                    raise ValueError("PDF document contains 0 pages.")

                for page_num in range(page_count):
                    page = doc[page_num]
                    # Extract blocks to preserve natural paragraph structure
                    blocks = page.get_text("blocks")
                    paragraphs = []
                    for b in blocks:
                        # b[4] is the text content, b[6] is block type (0 = text)
                        if len(b) > 6 and b[6] == 0:
                            cleaned = b[4].strip()
                            if cleaned:
                                paragraphs.append(cleaned)
                        elif len(b) > 4:
                            cleaned = str(b[4]).strip()
                            if cleaned:
                                paragraphs.append(cleaned)

                    page_content = "\n\n".join(paragraphs).strip()
                    if page_content:
                        text_pages.append(
                            f"--- Page {page_num + 1} of {page_count} ---\n\n{page_content}"
                        )
        except Exception as e:
            if isinstance(e, ValueError):
                raise
            raise ValueError(f"Failed to parse PDF document with PyMuPDF: {str(e)}")

        full_text = "\n\n".join(text_pages).strip()
        return full_text, page_count

    @staticmethod
    def extract_from_pptx(file_bytes: bytes) -> Tuple[str, int]:
        """
        Extract text from PowerPoint presentations using python-pptx.
        Preserves slide boundaries, shape paragraphs, notes, and tables.
        """
        # Validate ZIP/PPTX magic header (PK\x03\x04)
        if not file_bytes.startswith(b"PK\x03\x04"):
            raise ValueError("Invalid PPTX file: Missing standard Office OpenXML ZIP signature.")

        slide_texts = []
        try:
            prs = Presentation(io.BytesIO(file_bytes))
            slide_count = len(prs.slides)
            if slide_count == 0:
                raise ValueError("Presentation contains 0 slides.")

            for slide_idx, slide in enumerate(prs.slides):
                slide_parts = []

                # 1. Extract all text frames and tables in shapes
                for shape in slide.shapes:
                    if shape.has_text_frame:
                        shape_paragraphs = []
                        for paragraph in shape.text_frame.paragraphs:
                            line = paragraph.text.strip()
                            if line:
                                shape_paragraphs.append(line)
                        if shape_paragraphs:
                            slide_parts.append("\n".join(shape_paragraphs))

                    elif shape.has_table:
                        table_rows = []
                        for row in shape.table.rows:
                            row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                            if row_cells:
                                table_rows.append(" | ".join(row_cells))
                        if table_rows:
                            slide_parts.append("\n".join(table_rows))

                # 2. Extract speaker notes if present
                if slide.has_notes_slide:
                    notes_frame = slide.notes_slide.notes_text_frame
                    if notes_frame:
                        notes_text = notes_frame.text.strip()
                        if notes_text:
                            slide_parts.append(f"[Speaker Notes: {notes_text}]")

                content = "\n\n".join(slide_parts).strip()
                if content:
                    slide_texts.append(
                        f"--- Slide {slide_idx + 1} of {slide_count} ---\n\n{content}"
                    )
        except Exception as e:
            if isinstance(e, ValueError):
                raise
            raise ValueError(f"Failed to parse PPTX presentation: {str(e)}")

        full_text = "\n\n".join(slide_texts).strip()
        return full_text, slide_count

    @staticmethod
    def extract_from_txt(file_bytes: bytes) -> Tuple[str, int]:
        """
        Read text files using strict UTF-8 (supporting UTF-8 with BOM).
        Detects binary files and preserves paragraph boundaries.
        """
        # Check for binary NUL bytes in the first 1024 bytes
        if b"\x00" in file_bytes[:1024]:
            raise ValueError("File appears to be a binary file, not a UTF-8 text document.")

        try:
            # Try utf-8-sig first to transparently handle byte order mark
            raw_text = file_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            try:
                raw_text = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                raise ValueError(
                    "Text document is not valid UTF-8. "
                    "Please save your notes document using UTF-8 encoding."
                )

        # Normalize line endings
        normalized = raw_text.replace("\r\n", "\n").replace("\r", "\n")

        # Split into paragraphs preserved by blank lines
        raw_paragraphs = [p.strip() for p in re.split(r"\n{2,}", normalized) if p.strip()]
        full_text = "\n\n".join(raw_paragraphs).strip()
        paragraph_count = len(raw_paragraphs) or 1

        return full_text, paragraph_count

    @classmethod
    def process_document(
        cls,
        filename: str,
        file_bytes: bytes,
        content_type: Optional[str] = None,
    ) -> DocumentUploadResponse:
        """
        Complete validation, extraction, and metadata pipeline.
        Enforces maximum upload size, validates extensions & MIME types,
        detects empty content, and preserves paragraph/slide boundaries.
        """
        # 1. Size Validation
        file_size = len(file_bytes)
        if file_size == 0:
            raise ValueError("Uploaded file is empty (0 bytes).")

        if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
            raise ValueError(
                f"File size ({file_size / (1024 * 1024):.1f} MB) exceeds maximum allowed "
                f"limit of {settings.MAX_UPLOAD_SIZE_MB} MB."
            )

        # 2. Extension Validation
        path = Path(filename)
        ext = path.suffix.lower()
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file format: '{ext or 'unknown'}'. "
                f"StudyPack AI supports: {', '.join(sorted(cls.ALLOWED_EXTENSIONS))}."
            )

        # 3. MIME Type Validation (if provided)
        if content_type:
            normalized_mime = content_type.split(";")[0].strip().lower()
            if normalized_mime and normalized_mime not in cls.ALLOWED_MIME_TYPES:
                # Also verify if extension matches despite unusual MIME
                if ext == ".txt" and not normalized_mime.startswith("text/"):
                    raise ValueError(
                        f"MIME type '{normalized_mime}' does not match expected text/plain."
                    )
                elif ext == ".pdf" and "pdf" not in normalized_mime and normalized_mime != "application/octet-stream":
                    raise ValueError(
                        f"MIME type '{normalized_mime}' does not match expected application/pdf."
                    )

        # 4. Format-Specific Text Extraction
        page_or_slide_count: Optional[int] = None
        clean_ext = ext.lstrip(".")

        if ext == ".pdf":
            extracted_text, page_or_slide_count = cls.extract_from_pdf(file_bytes)
        elif ext == ".pptx":
            extracted_text, page_or_slide_count = cls.extract_from_pptx(file_bytes)
        elif ext == ".txt":
            extracted_text, page_or_slide_count = cls.extract_from_txt(file_bytes)
        else:
            raise ValueError(f"No extractor implemented for {ext}")

        # 5. Empty Content Check
        if not extracted_text or not extracted_text.strip():
            raise ValueError(
                f"The document '{filename}' contains no readable text. "
                "Scanned image-only PDFs or empty presentations cannot be processed."
            )

        # 6. Metadata Calculation
        total_chars = len(extracted_text)
        words = extracted_text.split()
        word_count = len(words)

        return DocumentUploadResponse(
            filename=filename,
            file_type=clean_ext,
            total_characters=total_chars,
            extracted_text=extracted_text,
            upload_status="success",
            word_count=word_count,
            file_size_bytes=file_size,
            page_count=page_or_slide_count,
        )


document_service = DocumentService()
