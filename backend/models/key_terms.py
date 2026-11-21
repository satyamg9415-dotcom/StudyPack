from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class KeyTermItem(BaseModel):
    term: str = Field(
        ...,
        description="The technical term, key phrase, or concept name"
    )
    definition: str = Field(
        ...,
        description="Clear, accurate, and concise academic definition based on the notes"
    )
    topic: str = Field(
        ...,
        description="The subtopic, chapter, or conceptual area this term relates to"
    )
    importance: Literal["High", "Medium", "Low"] = Field(
        ...,
        description="Importance for exam preparation: High, Medium, or Low"
    )
    context: Optional[str] = Field(
        None,
        description="The specific context or significance of how the term is used in the notes"
    )


class KeyTermsResponse(BaseModel):
    terms: List[KeyTermItem] = Field(
        ...,
        description="List of extracted academic terms and concepts"
    )
    total_terms: int = Field(
        ...,
        description="Total number of terms extracted"
    )


class GenerateKeyTermsRequest(BaseModel):
    lecture_text: str = Field(
        ...,
        min_length=10,
        description="Extracted lecture text to analyze",
        examples=["Photosynthesis occurs in chloroplasts. Chlorophyll absorbs light energy..."]
    )
    subject: Optional[str] = Field(
        "General Lecture",
        description="Subject or course name"
    )
    term_limit: Optional[int] = Field(
        15,
        ge=1,
        le=50,
        description="Maximum number of key terms to extract (1-50)"
    )
