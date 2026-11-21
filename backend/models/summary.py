from typing import List, Optional
from pydantic import BaseModel, Field


class ChapterSummary(BaseModel):
    chapter_title: str = Field(
        ...,
        description="Clear title of the topic or subtopic section"
    )
    summary_points: List[str] = Field(
        ...,
        description="List of comprehensive bullet points summarizing the concepts"
    )
    takeaway: str = Field(
        ...,
        description="A concise key takeaway sentence synthesizing the chapter's main point"
    )


class LectureSummaryResponse(BaseModel):
    lecture_title: str = Field(
        ...,
        description="Accurate and engaging title of the lecture notes"
    )
    overview: str = Field(
        ...,
        description="Executive summary and high-level synthesis of the entire lecture"
    )
    chapters: List[ChapterSummary] = Field(
        ...,
        description="Chapter-wise breakdown of all identified topics and subtopics"
    )
    important_explanations: List[str] = Field(
        ...,
        description="Detailed explanations of complicated concepts, methodologies, and formulas in simple language"
    )
    key_takeaways: List[str] = Field(
        ...,
        description="List of essential core takeaways and conclusions across the lecture"
    )


class GenerateSummaryRequest(BaseModel):
    lecture_text: str = Field(
        ...,
        min_length=10,
        description="Extracted lecture text to analyze and summarize",
        examples=["Cellular respiration consists of glycolysis, citric acid cycle, and oxidative phosphorylation..."]
    )
    subject: Optional[str] = Field("General Lecture", description="Subject or academic course name")
    academic_level: Optional[str] = Field("College / Undergraduate", description="Target academic difficulty level")
    summary_length: Optional[str] = Field("standard", description="Summary depth: concise, standard, or in-depth")
