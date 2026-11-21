from fastapi import APIRouter, File, UploadFile, HTTPException
from app.core.config import settings
from app.schemas.study_pack import HealthResponse, DocumentExtractionResult
from app.services.gemini_service import gemini_service
from app.services.document_extractor import DocumentExtractor

api_router = APIRouter()


@api_router.get("/health", response_model=HealthResponse)
def health_check():
    """Returns the backend service health and configuration status."""
    return HealthResponse(
        status="ok",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        gemini_configured=gemini_service.is_configured
    )


@api_router.post("/extract-preview", response_model=DocumentExtractionResult)
async def extract_preview(file: UploadFile = File(...)):
    """
    Accepts a lecture notes file (PDF, PPTX, TXT) and returns text extraction statistics and preview.
    Used for verifying document parsing.
    """
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        extracted_text = DocumentExtractor.extract(file.filename or "unknown", content)
        words = extracted_text.split()
        preview = extracted_text[:300] + ("..." if len(extracted_text) > 300 else "")
        return DocumentExtractionResult(
            filename=file.filename or "uploaded_file",
            file_type=(file.filename or "").split(".")[-1].lower(),
            character_count=len(extracted_text),
            word_count=len(words),
            text_preview=preview
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
