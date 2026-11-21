import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from models.document import DocumentUploadResponse, DocumentExtractionResult
from services.document_service import document_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    summary="Upload lecture notes and extract structured text",
    description="Accepts PDF, PPTX, or TXT files up to 25MB. Validates file extension, MIME type, and size; extracts text preserving paragraphs, pages, and slides; returns extracted content and metadata.",
)
async def upload_document(file: UploadFile = File(...)):
    """
    POST /api/upload
    Requirement:
    - Supported formats: PDF, PPTX, TXT
    - Validate extensions and MIME types
    - Set reasonable maximum upload size (25MB)
    - Extract text from PDF using PyMuPDF
    - Extract text from PPTX using python-pptx
    - Read text files using UTF-8
    - Preserve paragraph and slide boundaries
    - Detect empty documents and unsupported files
    - Return filename, file_type, total_characters, extracted_text, upload_status
    """
    filename = file.filename or "unknown_file"
    content_type = file.content_type

    try:
        content = await file.read()
        result = document_service.process_document(
            filename=filename,
            file_bytes=content,
            content_type=content_type,
        )
        return result
    except ValueError as ve:
        err_msg = str(ve)
        logger.warning(f"Validation error in /upload for {filename}: {err_msg}")
        # Specific status code mapping
        if "exceeds maximum allowed limit" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=err_msg,
            )
        elif "Unsupported file format" in err_msg or "MIME type" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=err_msg,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=err_msg,
            )
    except Exception as e:
        logger.exception(f"Unexpected error processing {filename}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document '{filename}': {str(e)}",
        )


@router.post(
    "/extract-preview",
    response_model=DocumentExtractionResult,
    summary="Legacy text preview extraction (compatibility)",
)
async def extract_preview(file: UploadFile = File(...)):
    filename = file.filename or "unknown_file"
    try:
        content = await file.read()
        res = document_service.process_document(filename, content, file.content_type)
        preview = res.extracted_text[:300] + ("..." if len(res.extracted_text) > 300 else "")
        return DocumentExtractionResult(
            filename=res.filename,
            file_type=res.file_type,
            character_count=res.total_characters,
            word_count=res.word_count,
            text_preview=preview,
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
