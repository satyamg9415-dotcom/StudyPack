import io
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from pptx import Presentation


class DocumentExtractor:
    """Service to extract text content from PDF, PPTX, and TXT files."""

    @staticmethod
    def extract_from_pdf(file_bytes: bytes) -> str:
        """Extract text from PDF bytes using PyMuPDF (fitz)."""
        text_parts = []
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_text = page.get_text()
                if page_text.strip():
                    text_parts.append(f"--- Page {page_num + 1} ---\n{page_text}")
        return "\n\n".join(text_parts)

    @staticmethod
    def extract_from_pptx(file_bytes: bytes) -> str:
        """Extract text from PowerPoint presentations using python-pptx."""
        prs = Presentation(io.BytesIO(file_bytes))
        text_parts = []
        for slide_idx, slide in enumerate(prs.slides):
            slide_texts = []
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for paragraph in shape.text_frame.paragraphs:
                        text = paragraph.text.strip()
                        if text:
                            slide_texts.append(text)
            if slide_texts:
                text_parts.append(f"--- Slide {slide_idx + 1} ---\n" + "\n".join(slide_texts))
        return "\n\n".join(text_parts)

    @staticmethod
    def extract_from_txt(file_bytes: bytes) -> str:
        """Extract text from plain text file bytes."""
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1", errors="replace")

    @classmethod
    def extract(cls, filename: str, file_bytes: bytes) -> str:
        """Dispatches extraction based on file extension."""
        lower_name = filename.lower()
        if lower_name.endswith(".pdf"):
            return cls.extract_from_pdf(file_bytes)
        elif lower_name.endswith((".pptx", ".ppt")):
            return cls.extract_from_pptx(file_bytes)
        elif lower_name.endswith(".txt"):
            return cls.extract_from_txt(file_bytes)
        else:
            raise ValueError(
                f"Unsupported file format: '{filename}'. "
                "StudyPack AI supports .pdf, .pptx, and .txt files."
            )
