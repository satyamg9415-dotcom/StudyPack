"""API route modules package."""
from fastapi import APIRouter
from routes.health import router as health_router
from routes.gemini import router as gemini_router
from routes.documents import router as documents_router
from routes.summary import router as summary_router
from routes.key_terms import router as key_terms_router
from routes.practice_questions import router as practice_questions_router
from routes.quiz import router as quiz_router
from routes.evaluation import router as evaluation_router
from routes.export_pdf import router as export_pdf_router

api_router = APIRouter()

# Register modular sub-routers
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(gemini_router, tags=["Gemini AI"])
api_router.include_router(documents_router, tags=["Documents"])
api_router.include_router(summary_router, tags=["Summarizer"])
api_router.include_router(key_terms_router, tags=["Key Terms"])
api_router.include_router(practice_questions_router, tags=["Practice Questions"])
api_router.include_router(quiz_router, tags=["Quiz Generator"])
api_router.include_router(evaluation_router, tags=["Answer Evaluation"])
api_router.include_router(export_pdf_router, tags=["Export PDF"])
