from typing import List, Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"
    app_name: str
    version: str
    environment: str
    gemini_configured: bool


class DocumentExtractionResult(BaseModel):
    filename: str
    file_type: str
    character_count: int
    word_count: int
    text_preview: str


class KeywordDefinition(BaseModel):
    term: str
    definition: str
    context: Optional[str] = None


class PracticeQuestion(BaseModel):
    question: str
    answer: str
    explanation: Optional[str] = None


class QuizOption(BaseModel):
    id: str
    text: str


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[QuizOption]
    correct_option_id: str
    explanation: str


class ChapterSummary(BaseModel):
    chapter_title: str
    summary_points: List[str]
    takeaway: str


class StudyPack(BaseModel):
    title: str
    overview: str
    chapters: List[ChapterSummary] = []
    keywords: List[KeywordDefinition] = []
    practice_questions: List[PracticeQuestion] = []
    quiz: List[QuizQuestion] = []


class StudyPackGenerateRequest(BaseModel):
    raw_text: Optional[str] = None
    title: Optional[str] = "Untitled Study Pack"
