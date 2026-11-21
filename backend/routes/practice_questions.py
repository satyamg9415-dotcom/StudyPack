import asyncio
import logging
from fastapi import APIRouter, HTTPException, status
from google.genai import errors
from models.practice_question import GenerateQuestionsRequest, PracticeQuestionsResponse
from services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/generate-questions",
    response_model=PracticeQuestionsResponse,
    summary="Generate practice questions using Gemini structured JSON output",
    description="Generates a balanced collection of short-answer, conceptual, long-answer, and application-based questions with model answers and topics using prompt engineering with Pydantic structured output.",
)
async def generate_questions(request: GenerateQuestionsRequest):
    lecture_text = request.lecture_text.strip()
    if not lecture_text or len(lecture_text) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lecture text is too short. Please provide at least 10 characters of lecture content.",
        )

    try:
        questions_result = await asyncio.to_thread(
            gemini_service.generate_practice_questions,
            lecture_text=lecture_text,
            subject=request.subject or "General Lecture",
            question_count=request.question_count or 6,
            difficulty_distribution=request.difficulty_distribution or "Balanced (Easy, Medium, Hard)",
        )
        return questions_result
    except ValueError as ve:
        logger.warning(f"Configuration or validation error in /generate-questions: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except errors.ClientError as ce:
        logger.error(f"Gemini API error during practice question generation: ({ce.code}) {ce.message}")
        code = ce.code if ce.code in (400, 401, 403, 404, 429, 503) else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(
            status_code=code,
            detail=f"Google Gemini API error ({ce.code}): {ce.message}",
        )
    except Exception as e:
        logger.exception("Unexpected error in /generate-questions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate practice questions: {str(e)}",
        )
