import asyncio
import logging
from fastapi import APIRouter, HTTPException, status
from google.genai import errors
from models.key_terms import GenerateKeyTermsRequest, KeyTermsResponse
from services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/generate-key-terms",
    response_model=KeyTermsResponse,
    summary="Extract important technical terms using Gemini structured JSON output",
    description="Extracts key technical terminology, definitions, conceptual topics, and importance levels (High, Medium, Low) using prompt engineering with Pydantic structured output.",
)
async def generate_key_terms(request: GenerateKeyTermsRequest):
    lecture_text = request.lecture_text.strip()
    if not lecture_text or len(lecture_text) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lecture text is too short. Please provide at least 10 characters of lecture content.",
        )

    try:
        key_terms_result = await asyncio.to_thread(
            gemini_service.generate_key_terms,
            lecture_text=lecture_text,
            subject=request.subject or "General Lecture",
            term_limit=request.term_limit or 15,
        )
        return key_terms_result
    except ValueError as ve:
        logger.warning(f"Configuration or validation error in /generate-key-terms: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except errors.ClientError as ce:
        logger.error(f"Gemini API error during key terms extraction: ({ce.code}) {ce.message}")
        code = ce.code if ce.code in (400, 401, 403, 404, 429, 503) else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(
            status_code=code,
            detail=f"Google Gemini API error ({ce.code}): {ce.message}",
        )
    except Exception as e:
        logger.exception("Unexpected error in /generate-key-terms")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract key terms: {str(e)}",
        )
