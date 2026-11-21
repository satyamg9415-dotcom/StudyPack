import logging
from fastapi import APIRouter, HTTPException, status
from google.genai import errors
from utils.config import settings
from models.gemini import GeminiPromptRequest, GeminiResponse
from services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/test-gemini",
    response_model=GeminiResponse,
    summary="Test Google Gemini API Generation",
    description="Accepts a text prompt, sends it to Google Gemini API via the official Google Gen AI Python SDK, and returns the generated content.",
)
async def test_gemini_endpoint(request: GeminiPromptRequest):
    prompt_text = request.prompt.strip()
    if not prompt_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty.",
        )

    try:
        generated_content = gemini_service.generate_text(prompt_text)
        return GeminiResponse(
            prompt=prompt_text,
            response=generated_content,
            model=settings.GEMINI_MODEL,
        )
    except ValueError as ve:
        # Key missing or unconfigured
        logger.warning(f"Configuration error in /test-gemini: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except errors.ClientError as ce:
        logger.error(f"Gemini API Client Error ({ce.code}): {ce.message}")
        status_code = (
            ce.code if ce.code in (400, 401, 403, 404, 429, 503) else status.HTTP_502_BAD_GATEWAY
        )
        raise HTTPException(
            status_code=status_code,
            detail=f"Google Gemini API error ({ce.code}): {ce.message}",
        )
    except Exception as e:
        logger.exception("Unexpected error in /test-gemini")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate response from Gemini API: {str(e)}",
        )
