import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Service to interface with Google's Gemini API."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        if not self.is_configured:
            logger.info("Gemini API key is not yet set. Placeholder configuration active.")
            return

        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            logger.info("Initialized Google GenAI Client successfully.")
        except ImportError:
            try:
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=self.api_key)
                self.client = legacy_genai.GenerativeModel(settings.GEMINI_MODEL)
                logger.info("Initialized legacy Google GenerativeAI Client successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key != "your_gemini_api_key_here")


gemini_service = GeminiService()
