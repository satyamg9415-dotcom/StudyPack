from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from models.quiz import QuizOption


class AdaptiveQuizQuestion(BaseModel):
    id: Optional[int] = Field(None, description="Sequential question index")
    question: str = Field(
        ...,
        description="The MCQ question statement tailored to the selected difficulty level"
    )
    options: List[QuizOption] = Field(
        ...,
        min_length=4,
        max_length=4,
        description="Four distinct options A, B, C, D"
    )
    correct_option_id: Literal["A", "B", "C", "D"] = Field(
        ...,
        description="The single correct option identifier: A, B, C, or D"
    )
    explanation: str = Field(
        ...,
        description="Verified explanation justifying why the correct answer is right"
    )
    difficulty: Literal["Easy", "Medium", "Hard"] = Field(
        ...,
        description="Selected difficulty level: Easy, Medium, or Hard"
    )
    topic: str = Field(
        ...,
        description="Lecture topic being tested"
    )
    cognitive_level: Optional[str] = Field(
        None,
        description="Cognitive focus: e.g. Definition/Recall, Conceptual/Comparison, Application/Reasoning"
    )


class AdaptiveQuizResponse(BaseModel):
    difficulty: str = Field(
        ...,
        description="Selected difficulty level: Easy, Medium, or Hard"
    )
    questions: List[AdaptiveQuizQuestion] = Field(
        ...,
        description="List of generated adaptive questions"
    )
    total_questions: int = Field(
        ...,
        description="Total number of questions in this adaptive quiz"
    )


class GenerateAdaptiveQuizRequest(BaseModel):
    lecture_text: str = Field(
        ...,
        min_length=10,
        description="Extracted lecture notes to generate adaptive questions from",
        examples=["Cellular respiration involves glycolysis, Krebs cycle, and electron transport..."]
    )
    difficulty: Literal["Easy", "Medium", "Hard"] = Field(
        "Medium",
        description="Selected difficulty level: Easy (definitions & basic concepts), Medium (conceptual understanding & comparisons), Hard (application & multi-step reasoning)"
    )
    question_count: Optional[int] = Field(
        5,
        ge=1,
        le=20,
        description="Number of questions to generate (1-20)"
    )
