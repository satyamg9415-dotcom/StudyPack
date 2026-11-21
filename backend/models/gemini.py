from pydantic import BaseModel, Field


class GeminiPromptRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=1,
        description="Text prompt to send to Google Gemini API",
        examples=["Summarize the role of ATP in cellular respiration in 2 sentences."],
    )


class GeminiResponse(BaseModel):
    prompt: str
    response: str
    model: str
