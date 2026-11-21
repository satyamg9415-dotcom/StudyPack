import asyncio
import logging
from fastapi import APIRouter, HTTPException, status
from google.genai import errors
from models.answer_evaluation import EvaluateAnswerRequest, AnswerEvaluationResponse
from services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/evaluate-answer",
    response_model=AnswerEvaluationResponse,
    summary="Evaluate student answer with AI university examiner scorecard",
    description=(
        "Evaluates a student's answer against a reference answer and assessment rubric "
        "using Google Gemini structured output. Returns score out of 10, criteria-wise marks, "
        "correct and missing points, incorrect statements, improvement suggestions, and an improved model answer."
    ),
)
async def evaluate_answer(request: EvaluateAnswerRequest):
    question = request.question.strip()
    reference_answer = request.reference_answer.strip()
    student_answer = request.student_answer.strip()

    if not question or len(question) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is required and must contain at least 3 characters.",
        )

    if not reference_answer or len(reference_answer) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reference answer is required to objectively evaluate student responses.",
        )

    if not student_answer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student answer cannot be empty. Please enter your answer for evaluation.",
        )

    try:
        evaluation = await asyncio.to_thread(
            gemini_service.evaluate_answer,
            question=question,
            reference_answer=reference_answer,
            student_answer=student_answer,
            rubric=request.rubric,
        )
        return evaluation
    except ValueError as ve:
        logger.warning(f"Configuration or validation error in /evaluate-answer: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except errors.ClientError as ce:
        logger.error(f"Gemini API error during answer evaluation: ({ce.code}) {ce.message}")
        code = ce.code if ce.code in (400, 401, 403, 404, 429, 503) else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(
            status_code=code,
            detail=f"Google Gemini API error ({ce.code}): {ce.message}",
        )
    except Exception as e:
        logger.exception("Unexpected error in /evaluate-answer")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate answer: {str(e)}",
        )
