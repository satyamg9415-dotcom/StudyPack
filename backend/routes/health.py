from fastapi import APIRouter
from utils.config import settings
from models.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    """
    Health-check endpoint.
    Returns backend service status and whether the Gemini API key is configured.
    """
    return HealthResponse(
        status="ok",
        app=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        gemini_configured=settings.is_gemini_configured,
    )
