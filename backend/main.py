from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.config import settings
from routes import api_router

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="StudyPack AI Backend API — Transforms lengthy lecture notes into structured study packs with Google Gemini API.",
)

# Cross-Origin Resource Sharing (CORS) Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular routers:
# 1. /api (Requirements: GET /api/health and POST /api/test-gemini)
# 2. /api/v1 (Existing frontend client compatibility)
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "StudyPack AI Backend is running.",
        "docs": "/docs",
        "health": "/api/health",
        "test_gemini": "/api/test-gemini",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
