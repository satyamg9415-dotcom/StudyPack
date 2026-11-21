from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"
    app: str = "StudyPack AI Backend"
    version: str = "1.0.0"
    environment: str
    gemini_configured: bool
