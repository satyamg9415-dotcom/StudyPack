import asyncio
import logging
from fastapi import APIRouter, HTTPException, status
from google.genai import errors
from models.summary import GenerateSummaryRequest, LectureSummaryResponse
from services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/generate-summary",
    response_model=LectureSummaryResponse,
    summary="Generate lecture notes summary using Google Gemini structured output",
    description="Synthesizes extracted lecture notes into chapter-wise summaries, explanations, and key takeaways using Gemini prompt engineering with Pydantic structured output.",
)
async def generate_summary(request: GenerateSummaryRequest):
    lecture_text = request.lecture_text.strip()
    if not lecture_text or len(lecture_text) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lecture text is too short. Please provide at least 10 characters of extracted text.",
        )

    try:
        summary_result = await asyncio.to_thread(
            gemini_service.generate_lecture_summary,
            lecture_text=lecture_text,
            subject=request.subject or "General Lecture",
            academic_level=request.academic_level or "College / Undergraduate",
            summary_length=request.summary_length or "standard",
        )
        return summary_result
    except ValueError as ve:
        logger.warning(f"Configuration or validation error in /generate-summary: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except errors.ClientError as ce:
        logger.error(f"Gemini API error during summarization: ({ce.code}) {ce.message}")
        code = ce.code if ce.code in (400, 401, 403, 404, 429, 503) else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(
            status_code=code,
            detail=f"Google Gemini API error ({ce.code}): {ce.message}",
        )
    except Exception as e:
        logger.exception("Unexpected error in /generate-summary")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate lecture summary: {str(e)}",
        )
