from typing import List, Optional
from pydantic import BaseModel, Field


class PracticeQuestionItem(BaseModel):
    question: str = Field(
        ...,
        description="The practice question text"
    )
    question_type: str = Field(
        ...,
        description="Type of question: Short-answer, Conceptual, Long-answer, or Application-based"
    )
    difficulty: str = Field(
        ...,
        description="Difficulty level: Easy, Medium, or Hard"
    )
    model_answer: str = Field(
        ...,
        description="Clear, accurate model answer strictly consistent with the lecture material"
    )
    relevant_topic: str = Field(
        ...,
        description="Relevant topic, module, or concept from the lecture notes"
    )
    explanation: Optional[str] = Field(
        None,
        description="Supplementary explanation, grading rationale, or key context"
    )


class PracticeQuestionsResponse(BaseModel):
    questions: List[PracticeQuestionItem] = Field(
        ...,
        description="List of academic practice questions"
    )
    total_questions: int = Field(
        ...,
        description="Total number of questions generated"
    )


class GenerateQuestionsRequest(BaseModel):
    lecture_text: str = Field(
        ...,
        min_length=10,
        description="Extracted lecture notes to generate practice questions from",
        examples=["Cellular respiration involves glycolysis, the citric acid cycle, and oxidative phosphorylation..."]
    )
    subject: Optional[str] = Field(
        "General Lecture",
        description="Subject or academic course name"
    )
    question_count: Optional[int] = Field(
        6,
        ge=1,
        le=20,
        description="Number of questions to generate (1-20)"
    )
    difficulty_distribution: Optional[str] = Field(
        "Balanced (Easy, Medium, Hard)",
        description="Target difficulty distribution: Balanced, Easy, Medium, or Hard"
    )
