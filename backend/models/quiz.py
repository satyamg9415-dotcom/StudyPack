from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class QuizOption(BaseModel):
    id: Literal["A", "B", "C", "D"] = Field(
        ...,
        description="Option identifier: A, B, C, or D"
    )
    text: str = Field(
        ...,
        description="Text of the option statement"
    )


class QuizQuestion(BaseModel):
    id: Optional[int] = Field(
        None,
        description="Sequential question index"
    )
    question: str = Field(
        ...,
        description="Clear, unambiguous multiple-choice question statement"
    )
    options: List[QuizOption] = Field(
        ...,
        min_length=4,
        max_length=4,
        description="Exactly four distinct answer options (A, B, C, D)"
    )
    correct_option_id: Literal["A", "B", "C", "D"] = Field(
        ...,
        description="The identifier of the single correct option: A, B, C, or D"
    )
    explanation: str = Field(
        ...,
        description="Detailed explanation justifying why the correct answer is right"
    )
    topic: str = Field(
        ...,
        description="Academic topic or concept being tested"
    )
    difficulty: str = Field(
        "Medium",
        description="Difficulty level of the question: Easy, Medium, or Hard"
    )


class QuizResponse(BaseModel):
    title: Optional[str] = Field(
        None,
        description="Title of the generated quiz"
    )
    questions: List[QuizQuestion] = Field(
        ...,
        description="List of multiple-choice questions"
    )
    total_questions: int = Field(
        ...,
        description="Total number of questions in the quiz"
    )


class GenerateQuizRequest(BaseModel):
    lecture_text: str = Field(
        ...,
        min_length=10,
        description="Extracted lecture notes to create a quiz from",
        examples=["Cellular respiration occurs in eukaryotic cells..."]
    )
    subject: Optional[str] = Field(
        "General Lecture",
        description="Subject or course name"
    )
    number_of_questions: Optional[int] = Field(
        5,
        ge=1,
        le=20,
        description="Number of quiz questions to generate (1-20)"
    )
    difficulty: Optional[str] = Field(
        "Medium",
        description="Target difficulty level: Easy, Medium, or Hard"
    )
