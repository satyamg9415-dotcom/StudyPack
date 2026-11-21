import logging
from pathlib import Path
from typing import Optional, Tuple
from google import genai
from google.genai import errors, types
from utils.config import settings
from models.summary import LectureSummaryResponse
from models.key_terms import KeyTermsResponse
from models.practice_question import PracticeQuestionsResponse
from models.quiz import QuizResponse
from models.adaptive_quiz import AdaptiveQuizResponse
from models.answer_evaluation import AnswerEvaluationResponse

logger = logging.getLogger(__name__)

# Fallback constants if prompt template file is unavailable
DEFAULT_SYSTEM_PROMPT = (
    "You are an expert academic tutor who specializes in converting lengthy lecture notes "
    "into accurate, easy-to-understand study material."
)

DEFAULT_USER_TEMPLATE = """Analyze the following lecture notes:

{lecture_text}

Subject: {subject}
Academic level: {academic_level}
Summary length: {summary_length}

Instructions:
1. Identify the main topics and subtopics.
2. Summarize each topic separately.
3. Preserve important technical terminology.
4. Explain complicated concepts in simple language.
5. Include important formulas and examples if present.
6. Do not introduce unsupported facts.
7. Do not omit important information.
8. Maintain the original meaning of the notes.

Return:
- Lecture title
- Overview
- Chapter-wise summary
- Important explanations
- Key takeaways
"""

DEFAULT_KEY_TERMS_SYSTEM_PROMPT = (
    "You are an academic terminology extraction assistant. Your job is to identify "
    "important technical terms and explain them accurately using the supplied lecture notes."
)

DEFAULT_KEY_TERMS_USER_TEMPLATE = """Extract important terms from:

{lecture_text}

Subject: {subject}
Maximum terms: {term_limit}

Instructions:
1. Identify important technical terms.
2. Provide clear and concise definitions.
3. Include the context in which each term is used.
4. Avoid duplicate terms.
5. Prioritize exam-relevant concepts.
6. Do not invent definitions unsupported by the notes.

Return structured data containing:
- Term
- Definition
- Topic
- Importance (High, Medium, Low)
"""

DEFAULT_QUESTIONS_SYSTEM_PROMPT = (
    "You are an experienced university professor who creates academic practice questions "
    "based on lecture material."
)

DEFAULT_QUESTIONS_USER_TEMPLATE = """Generate practice questions using these lecture notes:

{lecture_text}

Subject: {subject}
Number of questions: {question_count}
Difficulty distribution: {difficulty_distribution}

Generate a balanced collection of:
1. Short-answer questions.
2. Conceptual questions.
3. Long-answer questions.
4. Application-based questions.

For every question provide:
- Question
- Question type
- Difficulty level
- Model answer
- Relevant topic

Rules:
- Questions must be based on the supplied lecture material.
- Avoid repetitive questions.
- Answers must be factually consistent with the notes.
- Do not invent unsupported concepts.
- Match the requested number of questions.
"""

DEFAULT_QUIZ_SYSTEM_PROMPT = (
    "You are an academic assessment designer. Generate meaningful multiple-choice "
    "questions that test understanding of the supplied study material."
)

DEFAULT_QUIZ_USER_TEMPLATE = """Create a quiz from:

{lecture_text}

Subject: {subject}
Number of questions: {number_of_questions}
Difficulty: {difficulty}

For every question generate:
- Question statement
- Four options (A, B, C, D)
- Exactly one correct answer
- Explanation of the correct answer
- Topic being tested
- Difficulty level

Rules:
1. All questions must be based on the lecture notes.
2. Avoid ambiguous questions.
3. All four options must be different.
4. Exactly one answer must be correct.
5. Explanations must justify the correct answer.
6. Do not reveal answers before submission.
"""

DEFAULT_ADAPTIVE_SYSTEM_PROMPT = (
    "You are an academic question designer who adjusts question complexity "
    "according to the selected difficulty level."
)

DEFAULT_ADAPTIVE_USER_TEMPLATE = """Generate questions from:

{lecture_text}

Selected difficulty: {difficulty}
Number of questions: {question_count}

Difficulty guidelines:

Easy:
Test definitions, basic concepts and direct understanding.

Medium:
Test conceptual understanding, comparisons and relationships.

Hard:
Test application, analysis, multi-step reasoning and connections between concepts.

Ensure:
- Questions remain relevant to the lecture notes.
- Difficulty matches the selected level.
- Avoid repeating previous questions.
- Include verified answers and explanations.

Return structured JSON.
"""

DEFAULT_EVALUATION_SYSTEM_PROMPT = (
    "You are a strict but helpful university examiner. Evaluate student answers objectively "
    "using the supplied reference answer and assessment rubric."
)

DEFAULT_EVALUATION_USER_TEMPLATE = """Question:
{question}

Reference answer:
{reference_answer}

Student answer:
{student_answer}

Evaluation rubric:
{rubric}

Evaluate the answer based on:
1. Conceptual accuracy.
2. Coverage of important points.
3. Technical terminology.
4. Explanation quality.
5. Relevance to the question.

Return:
- Score out of 10
- Criteria-wise marks
- Correct points
- Missing points
- Incorrect statements
- Suggestions for improvement
- Improved model answer

Rules:
- Do not award marks for irrelevant content.
- Do not penalize correct alternative explanations.
- Do not give full marks to incomplete answers.
- Use the reference answer as the basis for evaluation.
- Explain the scoring clearly.
"""


class GeminiService:
    """Service to interface with Google's Gemini API using the official Google Gen AI Python SDK."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.client: Optional[genai.Client] = None
        self._initialize_client()

    def _initialize_client(self):
        if not settings.is_gemini_configured:
            logger.warning(
                "Gemini API key is not configured or using default placeholder. "
                "API generation calls will require GEMINI_API_KEY."
            )
            return

        try:
            self.client = genai.Client(
                api_key=self.api_key,
                http_options={"api_version": "v1beta"},
            )
            logger.info("Initialized Google Gen AI Client successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Google Gen AI Client: {e}")
            self.client = None

    def _ensure_client_ready(self):
        if not settings.is_gemini_configured:
            raise ValueError(
                "Google Gemini API key is missing or not configured. "
                "Please set a valid GEMINI_API_KEY in backend/.env."
            )

        if not self.client:
            self._initialize_client()
            if not self.client:
                raise ValueError(
                    "Failed to initialize Google Gen AI client. "
                    "Check that GEMINI_API_KEY in backend/.env is valid."
                )

    def _load_summarizer_prompt_template(self) -> Tuple[str, str]:
        """Loads system prompt and user template from prompts/final/P01_summarizer.txt."""
        potential_paths = [
            Path(__file__).resolve().parent.parent / "prompts/final/P01_summarizer.txt",
            Path(__file__).resolve().parent.parent.parent / "prompts/final/P01_summarizer.txt",
        ]

        for p in potential_paths:
            if p.exists():
                try:
                    content = p.read_text(encoding="utf-8")
                    if "SYSTEM PROMPT:" in content and "USER PROMPT TEMPLATE:" in content:
                        parts = content.split("USER PROMPT TEMPLATE:")
                        system_part = parts[0].replace("SYSTEM PROMPT:", "").strip()
                        user_part = parts[1].strip()
                        return system_part, user_part
                except Exception as e:
                    logger.warning(f"Could not read prompt template from {p}: {e}")

        return DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_TEMPLATE

    def generate_text(self, prompt: str) -> str:
        """Sends a text prompt to Gemini API and returns the generated content."""
        self._ensure_client_ready()

        candidate_models = [self.model_name]
        for fallback in [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
        ]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None
        for model in candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except errors.ClientError as ce:
                last_error = ce
                if ce.code in (404, 503):
                    logger.warning(
                        f"Model {model} returned {ce.code}, attempting fallback model..."
                    )
                    continue
                raise
            except Exception as e:
                last_error = e
                logger.warning(f"Error invoking model {model}: {e}")
                continue

        if last_error:
            raise last_error

        raise RuntimeError("No response returned from Google Gemini API.")

    def generate_lecture_summary(
        self,
        lecture_text: str,
        subject: str = "General Lecture",
        academic_level: str = "College / Undergraduate",
        summary_length: str = "standard",
    ) -> LectureSummaryResponse:
        """
        Synthesizes extracted lecture notes into a structured study summary
        using Gemini structured output with LectureSummaryResponse Pydantic schema.
        """
        self._ensure_client_ready()

        system_prompt, user_template = self._load_summarizer_prompt_template()

        user_content = user_template.format(
            lecture_text=lecture_text,
            subject=subject,
            academic_level=academic_level,
            summary_length=summary_length,
        )

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=LectureSummaryResponse,
            system_instruction=system_prompt,
        )

        candidate_models = [self.model_name]
        for fallback in [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
        ]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None
        for model in candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=user_content,
                    config=config,
                )
                if response and response.text:
                    parsed = LectureSummaryResponse.model_validate_json(response.text)
                    return parsed
            except errors.ClientError as ce:
                last_error = ce
                if ce.code in (404, 503):
                    logger.warning(
                        f"Model {model} returned {ce.code} during summary generation, trying fallback..."
                    )
                    continue
                raise
            except Exception as e:
                last_error = e
                logger.warning(f"Error in generate_lecture_summary with {model}: {e}")
                continue

        if last_error:
            raise last_error

        raise RuntimeError("Gemini API did not return structured lecture summary data.")

    def _load_key_terms_prompt_template(self) -> Tuple[str, str]:
        """Loads system prompt and user template from prompts/final/P02_key_terms.txt."""
        potential_paths = [
            Path(__file__).resolve().parent.parent / "prompts/final/P02_key_terms.txt",
            Path(__file__).resolve().parent.parent.parent / "prompts/final/P02_key_terms.txt",
        ]

        for p in potential_paths:
            if p.exists():
                try:
                    content = p.read_text(encoding="utf-8")
                    if "SYSTEM PROMPT:" in content and "USER PROMPT TEMPLATE:" in content:
                        parts = content.split("USER PROMPT TEMPLATE:")
                        system_part = parts[0].replace("SYSTEM PROMPT:", "").strip()
                        user_part = parts[1].strip()
                        return system_part, user_part
                except Exception as e:
                    logger.warning(f"Could not read key terms prompt template from {p}: {e}")

        return DEFAULT_KEY_TERMS_SYSTEM_PROMPT, DEFAULT_KEY_TERMS_USER_TEMPLATE

    def generate_key_terms(
        self,
        lecture_text: str,
        subject: str = "General Lecture",
        term_limit: int = 15,
    ) -> KeyTermsResponse:
        """
        Extracts key academic terminology, definitions, and importance ratings
        using Gemini structured JSON output with KeyTermsResponse Pydantic schema.
        """
        self._ensure_client_ready()

        system_prompt, user_template = self._load_key_terms_prompt_template()

        user_content = user_template.format(
            lecture_text=lecture_text,
            subject=subject,
            term_limit=term_limit,
        )

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=KeyTermsResponse,
            system_instruction=system_prompt,
        )

        candidate_models = [self.model_name]
        for fallback in [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
        ]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None
        for model in candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=user_content,
                    config=config,
                )
                if response and response.text:
                    parsed = KeyTermsResponse.model_validate_json(response.text)
                    return parsed
            except errors.ClientError as ce:
                last_error = ce
                if ce.code in (404, 503):
                    logger.warning(
                        f"Model {model} returned {ce.code} during key terms generation, trying fallback..."
                    )
                    continue
                raise
            except Exception as e:
                last_error = e
                logger.warning(f"Error in generate_key_terms with {model}: {e}")
                continue

        if last_error:
            raise last_error

        raise RuntimeError("Gemini API did not return structured key terms data.")

    def _load_questions_prompt_template(self) -> Tuple[str, str]:
        """Loads system prompt and user template from prompts/final/P03_practice_questions.txt."""
        potential_paths = [
            Path(__file__).resolve().parent.parent / "prompts/final/P03_practice_questions.txt",
            Path(__file__).resolve().parent.parent.parent / "prompts/final/P03_practice_questions.txt",
        ]

        for p in potential_paths:
            if p.exists():
                try:
                    content = p.read_text(encoding="utf-8")
                    if "SYSTEM PROMPT:" in content and "USER PROMPT TEMPLATE:" in content:
                        parts = content.split("USER PROMPT TEMPLATE:")
                        system_part = parts[0].replace("SYSTEM PROMPT:", "").strip()
                        user_part = parts[1].strip()
                        return system_part, user_part
                except Exception as e:
                    logger.warning(f"Could not read questions prompt template from {p}: {e}")

        return DEFAULT_QUESTIONS_SYSTEM_PROMPT, DEFAULT_QUESTIONS_USER_TEMPLATE

    def generate_practice_questions(
        self,
        lecture_text: str,
        subject: str = "General Lecture",
        question_count: int = 6,
        difficulty_distribution: str = "Balanced (Easy, Medium, Hard)",
    ) -> PracticeQuestionsResponse:
        """
        Generates balanced academic practice questions with model answers and topics
        using Gemini structured JSON output with PracticeQuestionsResponse Pydantic schema.
        """
        self._ensure_client_ready()

        system_prompt, user_template = self._load_questions_prompt_template()

        user_content = user_template.format(
            lecture_text=lecture_text,
            subject=subject,
            question_count=question_count,
            difficulty_distribution=difficulty_distribution,
        )

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PracticeQuestionsResponse,
            system_instruction=system_prompt,
        )

        candidate_models = [self.model_name]
        for fallback in [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
        ]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None
        for model in candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=user_content,
                    config=config,
                )
                if response and response.text:
                    parsed = PracticeQuestionsResponse.model_validate_json(response.text)
                    return parsed
            except errors.ClientError as ce:
                last_error = ce
                if ce.code in (404, 503):
                    logger.warning(
                        f"Model {model} returned {ce.code} during questions generation, trying fallback..."
                    )
                    continue
                raise
            except Exception as e:
                last_error = e
                logger.warning(f"Error in generate_practice_questions with {model}: {e}")
                continue

        if last_error:
            raise last_error

        raise RuntimeError("Gemini API did not return structured practice questions data.")

    def _load_quiz_prompt_template(self) -> Tuple[str, str]:
        """Loads system prompt and user template from prompts/final/P04_quiz_generator.txt."""
        potential_paths = [
            Path(__file__).resolve().parent.parent / "prompts/final/P04_quiz_generator.txt",
            Path(__file__).resolve().parent.parent.parent / "prompts/final/P04_quiz_generator.txt",
        ]

        for p in potential_paths:
            if p.exists():
                try:
                    content = p.read_text(encoding="utf-8")
                    if "SYSTEM PROMPT:" in content and "USER PROMPT TEMPLATE:" in content:
                        parts = content.split("USER PROMPT TEMPLATE:")
                        system_part = parts[0].replace("SYSTEM PROMPT:", "").strip()
                        user_part = parts[1].strip()
                        return system_part, user_part
                except Exception as e:
                    logger.warning(f"Could not read quiz prompt template from {p}: {e}")

        return DEFAULT_QUIZ_SYSTEM_PROMPT, DEFAULT_QUIZ_USER_TEMPLATE

    def generate_quiz(
        self,
        lecture_text: str,
        subject: str = "General Lecture",
        number_of_questions: int = 5,
        difficulty: str = "Medium",
    ) -> QuizResponse:
        """
        Generates multiple-choice quiz questions with 4 options, explanations, and difficulty
        using Gemini structured JSON output with QuizResponse Pydantic schema.
        """
        self._ensure_client_ready()

        system_prompt, user_template = self._load_quiz_prompt_template()

        user_content = user_template.format(
            lecture_text=lecture_text,
            subject=subject,
            number_of_questions=number_of_questions,
            difficulty=difficulty,
        )

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=QuizResponse,
            system_instruction=system_prompt,
        )

        candidate_models = [self.model_name]
        for fallback in [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
        ]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None
        for model in candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=user_content,
                    config=config,
                )
                if response and response.text:
                    parsed = QuizResponse.model_validate_json(response.text)
                    # Ensure sequential numeric IDs for questions if not set
                    for idx, q in enumerate(parsed.questions):
                        if q.id is None:
                            q.id = idx + 1
                    return parsed
            except errors.ClientError as ce:
                last_error = ce
                if ce.code in (404, 503):
                    logger.warning(
                        f"Model {model} returned {ce.code} during quiz generation, trying fallback..."
                    )
                    continue
                raise
            except Exception as e:
                last_error = e
                logger.warning(f"Error in generate_quiz with {model}: {e}")
                continue

        if last_error:
            raise last_error

        raise RuntimeError("Gemini API did not return structured quiz data.")

    def _load_adaptive_prompt_template(self) -> Tuple[str, str]:
        """Loads system prompt and user template from prompts/final/P05_difficulty_questions.txt."""
        potential_paths = [
            Path(__file__).resolve().parent.parent / "prompts/final/P05_difficulty_questions.txt",
            Path(__file__).resolve().parent.parent.parent / "prompts/final/P05_difficulty_questions.txt",
        ]

        for p in potential_paths:
            if p.exists():
                try:
                    content = p.read_text(encoding="utf-8")
                    if "SYSTEM PROMPT:" in content and "USER PROMPT TEMPLATE:" in content:
                        parts = content.split("USER PROMPT TEMPLATE:")
                        system_part = parts[0].replace("SYSTEM PROMPT:", "").strip()
                        user_part = parts[1].strip()
                        return system_part, user_part
                except Exception as e:
                    logger.warning(f"Could not read adaptive prompt template from {p}: {e}")

        return DEFAULT_ADAPTIVE_SYSTEM_PROMPT, DEFAULT_ADAPTIVE_USER_TEMPLATE

    def generate_adaptive_quiz(
        self,
        lecture_text: str,
        difficulty: str = "Medium",
        question_count: int = 5,
    ) -> AdaptiveQuizResponse:
        """
        Generates adaptive multiple-choice questions matching selected difficulty level
        (Easy, Medium, Hard) using Gemini structured JSON output and AdaptiveQuizResponse schema.
        """
        self._ensure_client_ready()

        system_prompt, user_template = self._load_adaptive_prompt_template()

        user_content = user_template.format(
            lecture_text=lecture_text,
            difficulty=difficulty,
            question_count=question_count,
        )

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AdaptiveQuizResponse,
            system_instruction=system_prompt,
        )

        candidate_models = [self.model_name]
        for fallback in [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
        ]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None
        for model in candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=user_content,
                    config=config,
                )
                if response and response.text:
                    parsed = AdaptiveQuizResponse.model_validate_json(response.text)
                    for idx, q in enumerate(parsed.questions):
                        if q.id is None:
                            q.id = idx + 1
                    return parsed
            except errors.ClientError as ce:
                last_error = ce
                if ce.code in (404, 503):
                    logger.warning(
                        f"Model {model} returned {ce.code} during adaptive quiz generation, trying fallback..."
                    )
                    continue
                raise
            except Exception as e:
                last_error = e
                logger.warning(f"Error in generate_adaptive_quiz with {model}: {e}")
                continue

        if last_error:
            raise last_error

        raise RuntimeError("Gemini API did not return structured adaptive quiz data.")

    def _load_evaluation_prompt_template(self) -> Tuple[str, str]:
        """Loads system prompt and user template from prompts/final/P06_answer_evaluator.txt."""
        potential_paths = [
            Path(__file__).resolve().parent.parent / "prompts/final/P06_answer_evaluator.txt",
            Path(__file__).resolve().parent.parent.parent / "prompts/final/P06_answer_evaluator.txt",
        ]

        for p in potential_paths:
            if p.exists():
                try:
                    content = p.read_text(encoding="utf-8")
                    if "SYSTEM PROMPT:" in content and "USER PROMPT TEMPLATE:" in content:
                        parts = content.split("USER PROMPT TEMPLATE:")
                        system_part = parts[0].replace("SYSTEM PROMPT:", "").strip()
                        user_part = parts[1].strip()
                        return system_part, user_part
                except Exception as e:
                    logger.warning(f"Could not read answer evaluator prompt template from {p}: {e}")

        return DEFAULT_EVALUATION_SYSTEM_PROMPT, DEFAULT_EVALUATION_USER_TEMPLATE

    def evaluate_answer(
        self,
        question: str,
        reference_answer: str,
        student_answer: str,
        rubric: Optional[str] = None,
    ) -> AnswerEvaluationResponse:
        """
        Evaluates a student's answer against a reference answer and rubric using Gemini
        structured JSON output with AnswerEvaluationResponse schema.
        """
        self._ensure_client_ready()

        system_prompt, user_template = self._load_evaluation_prompt_template()

        default_rubric = (
            "Evaluate strictly against reference answer across: "
            "1. Conceptual accuracy (0-2 pts), "
            "2. Coverage of important points (0-2 pts), "
            "3. Technical terminology (0-2 pts), "
            "4. Explanation quality (0-2 pts), "
            "5. Relevance to the question (0-2 pts). Total: 10 pts."
        )
        actual_rubric = rubric.strip() if rubric and rubric.strip() else default_rubric

        user_content = user_template.format(
            question=question.strip(),
            reference_answer=reference_answer.strip(),
            student_answer=student_answer.strip(),
            rubric=actual_rubric,
        )

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AnswerEvaluationResponse,
            system_instruction=system_prompt,
        )

        candidate_models = [self.model_name]
        for fallback in [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.6-flash",
        ]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None
        for model in candidate_models:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=user_content,
                    config=config,
                )
                if response and response.text:
                    parsed = AnswerEvaluationResponse.model_validate_json(response.text)
                    if parsed.percentage is None or parsed.percentage == 0:
                        parsed.percentage = round((parsed.score / 10.0) * 100, 1)
                    return parsed
            except errors.ClientError as ce:
                last_error = ce
                if ce.code in (404, 503):
                    logger.warning(
                        f"Model {model} returned {ce.code} during answer evaluation, trying fallback..."
                    )
                    continue
                raise
            except Exception as e:
                last_error = e
                logger.warning(f"Error in evaluate_answer with {model}: {e}")
                continue

        if last_error:
            raise last_error

        raise RuntimeError("Gemini API did not return structured answer evaluation data.")


gemini_service = GeminiService()
