import asyncio
import logging
from fastapi import APIRouter, HTTPException, status
from google.genai import errors
from models.quiz import GenerateQuizRequest, QuizResponse
from models.adaptive_quiz import GenerateAdaptiveQuizRequest, AdaptiveQuizResponse
from services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/generate-quiz",
    response_model=QuizResponse,
    summary="Generate interactive multiple-choice quiz using Gemini structured JSON output",
    description="Generates academic multiple-choice questions with 4 distinct options (A, B, C, D), exactly one correct answer, explanations, and topic tagging using prompt engineering with Pydantic structured output.",
)
async def generate_quiz(request: GenerateQuizRequest):
    lecture_text = request.lecture_text.strip()
    if not lecture_text or len(lecture_text) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lecture text is too short. Please provide at least 10 characters of lecture content.",
        )

    try:
        quiz_result = await asyncio.to_thread(
            gemini_service.generate_quiz,
            lecture_text=lecture_text,
            subject=request.subject or "General Lecture",
            number_of_questions=request.number_of_questions or 5,
            difficulty=request.difficulty or "Medium",
        )
        return quiz_result
    except ValueError as ve:
        logger.warning(f"Configuration or validation error in /generate-quiz: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except errors.ClientError as ce:
        logger.error(f"Gemini API error during quiz generation: ({ce.code}) {ce.message}")
        code = ce.code if ce.code in (400, 401, 403, 404, 429, 503) else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(
            status_code=code,
            detail=f"Google Gemini API error ({ce.code}): {ce.message}",
        )
    except Exception as e:
        logger.exception("Unexpected error in /generate-quiz")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}",
        )


@router.post(
    "/generate-adaptive-quiz",
    response_model=AdaptiveQuizResponse,
    summary="Generate adaptive difficulty-based quiz questions (Easy, Medium, Hard)",
    description="Generates questions strictly aligned to Easy (definitions/basic concepts), Medium (understanding/comparisons), or Hard (application/multi-step reasoning) based on prompt P05_difficulty_questions.",
)
async def generate_adaptive_quiz(request: GenerateAdaptiveQuizRequest):
    lecture_text = request.lecture_text.strip()
    if not lecture_text or len(lecture_text) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lecture text is too short. Please provide at least 10 characters of lecture content.",
        )

    try:
        adaptive_result = await asyncio.to_thread(
            gemini_service.generate_adaptive_quiz,
            lecture_text=lecture_text,
            difficulty=request.difficulty or "Medium",
            question_count=request.question_count or 5,
        )
        return adaptive_result
    except ValueError as ve:
        logger.warning(f"Configuration or validation error in /generate-adaptive-quiz: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except errors.ClientError as ce:
        logger.error(f"Gemini API error during adaptive quiz generation: ({ce.code}) {ce.message}")
        code = ce.code if ce.code in (400, 401, 403, 404, 429, 503) else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(
            status_code=code,
            detail=f"Google Gemini API error ({ce.code}): {ce.message}",
        )
    except Exception as e:
        logger.exception("Unexpected error in /generate-adaptive-quiz")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate adaptive quiz: {str(e)}",
        )
