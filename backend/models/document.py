from typing import Optional
from pydantic import BaseModel, Field


class DocumentUploadResponse(BaseModel):
    filename: str = Field(..., description="Original name of the uploaded document")
    file_type: str = Field(..., description="Detected file extension/type (pdf, pptx, txt)")
    total_characters: int = Field(..., description="Total count of extracted characters")
    extracted_text: str = Field(..., description="Full extracted text preserving paragraphs and boundaries")
    upload_status: str = Field("success", description="Status of the upload and extraction process")
    word_count: int = Field(..., description="Total count of extracted words")
    file_size_bytes: int = Field(..., description="Size of the uploaded document in bytes")
    page_count: Optional[int] = Field(None, description="Number of pages or slides if applicable")


class DocumentExtractionResult(BaseModel):
    filename: str
    file_type: str
    character_count: int
    word_count: int
    text_preview: str
