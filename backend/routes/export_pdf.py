import asyncio
import logging
import re
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, Response, status
from services.pdf_service import generate_study_pack_pdf

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/export-pdf",
    summary="Export Study Pack as Academic PDF",
    description="Generates and streams a professional, multi-page publication-ready PDF document containing the lecture summary, chapter-wise notes, key terms definitions table, practice questions with model answers, and quiz assessment.",
    response_class=Response,
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Returns the generated Study Pack PDF file.",
        }
    },
)
async def export_study_pack_pdf(payload: Dict[str, Any]):
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Study pack data is required for PDF generation.",
        )

    title = payload.get("title") or "StudyPack"
    # Clean filename of unsafe characters
    safe_title = re.sub(r"[^a-zA-Z0-9_\-\s]", "", title).strip().replace(" ", "_") or "StudyPack"
    filename = f"{safe_title}_StudyPack.pdf"

    try:
        pdf_bytes = await asyncio.to_thread(generate_study_pack_pdf, payload)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )
    except Exception as e:
        logger.exception("Error during Study Pack PDF generation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Study Pack PDF: {str(e)}",
        )
