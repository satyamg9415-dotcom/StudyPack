# StudyPack AI 🎓🤖

StudyPack AI is an end-to-end, AI-powered academic learning companion that converts unstructured college lecture notes (PDF, PPTX, TXT) into comprehensive, structured study packs. Powered by Google Gemini with strict structured JSON output and prompt engineering, StudyPack AI delivers chapter-by-chapter summaries, key terminology glossaries, multi-tier practice questions, interactive self-scoring quizzes with adaptive difficulty, rubric-driven answer evaluations, and professional publication-grade PDF exports.

---

## 🌟 Key Features

1. **Multi-Format Document Ingestion & Text Extraction**:
   - **PDF**: Fast, accurate layout-aware extraction using PyMuPDF (`fitz`).
   - **PPTX**: Slide-by-slide hierarchical shape and note extraction using `python-pptx`.
   - **TXT**: Resilient UTF-8 text parser with paragraph boundary normalization.
   - Comprehensive validation for empty documents (0-byte rejection) and unsupported extensions.

2. **Advanced Prompt Engineering with Google Gemini**:
   - **P01 — Lecture Notes Summarizer**: Generates chapter-by-chapter breakdowns, main topics, subtopics, important explanations, and key takeaways adhering to user-selected academic depth.
   - **P02 — Key Terms Extraction**: Extracts technical definitions, contextual usage, and exam-relevance tiers (High, Medium, Low) displayed in expandable UI cards.
   - **P03 — Practice Question Generator**: Balanced question generation (short-answer, conceptual, long-answer, application-based) with expandable model answers.
   - **P04 — AI Quiz Generator**: Creates 4-option multiple-choice quizzes with single correct keys and explanatory rationales.
   - **P05 — Adaptive Difficulty Quiz**: Calibrates cognitive complexity based on student choice (Easy, Medium, Hard) using Bloom's Taxonomy principles.
   - **P06 — University Examiner Answer Evaluator**: Scores student free-response answers on a 10-point scale across 5 criteria (Conceptual Accuracy, Points Coverage, Terminology, Explanation Quality, Relevance) with constructive feedback and improved model answers.

3. **Interactive Frontend Experience (React + Tailwind CSS)**:
   - Dynamic tabbed navigation: **Overview & Summary**, **Key Terms**, **Practice Questions & Evaluation**, and **Interactive Quiz Engine**.
   - Session persistence: switching tabs preserves extracted text, generated study packs, and quiz state.
   - Dual-schema compatibility for quiz evaluation (`correct_option_id` & `correct_answer`).
   - In-depth Answer Scorecard with visual progress bars, grade badges, correct/missing points, and misconception warnings.

4. **Publication-Quality Study Pack PDF Export**:
   - Built with ReportLab using a custom academic palette (Slate, Indigo, Emerald).
   - Dynamic page numbering via two-pass `NumberedCanvas` ("Page X of Y").
   - Includes document metadata, executive overview, chapter summaries, key terms glossary table, practice questions, and quiz performance summary.

5. **Security & Performance**:
   - Gemini API keys are strictly confined to the backend `.env` and never leaked or exposed to the client.
   - Asynchronous execution: CPU/network-bound Gemini and ReportLab calls run in background thread pools (`asyncio.to_thread`), preventing event loop blocking.

---

## 🏗️ System Architecture

```text
StudyPack AI/
├── backend/
│   ├── main.py                      # FastAPI entry point, CORS middleware, global exception handlers
│   ├── routes/
│   │   ├── health.py                # GET /api/health (safe status & Gemini readiness check)
│   │   ├── documents.py             # POST /api/upload (PDF, PPTX, TXT validation & extraction)
│   │   ├── summary.py               # POST /api/generate-summary (Prompt P01)
│   │   ├── key_terms.py             # POST /api/generate-key-terms (Prompt P02)
│   │   ├── practice_questions.py    # POST /api/generate-questions (Prompt P03)
│   │   ├── quiz.py                  # POST /api/generate-quiz & /api/generate-adaptive-quiz (P04 & P05)
│   │   ├── evaluation.py            # POST /api/evaluate-answer (Prompt P06)
│   │   └── export_pdf.py            # POST /api/export-pdf (ReportLab streaming PDF export)
│   ├── services/
│   │   ├── gemini_service.py        # Official Google GenAI SDK client, fallback models, schema validation
│   │   ├── document_service.py      # PyMuPDF, python-pptx, and UTF-8 TXT extraction engine
│   │   └── pdf_service.py           # Multi-page ReportLab PDF generation with running headers/footers
│   ├── models/
│   │   └── schemas.py               # Pydantic v2 validation models for all requests & responses
│   ├── .env                         # Backend environment variables & secrets (never committed)
│   ├── .env.example                 # Template for environment configuration
│   └── requirements.txt             # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js            # Axios client with timeout, error interceptors, and blob streaming
│   │   ├── context/
│   │   │   └── StudyPackContext.jsx # Global study session state management
│   │   ├── components/
│   │   │   ├── upload/              # FileUploader drag-and-drop & lecture preview
│   │   │   ├── study-pack/          # OverviewTab, KeyTermsTab, PracticeTab
│   │   │   ├── quiz/                # QuizEngine, QuizCard, ScoreSummary
│   │   │   └── practice/            # AnswerScorecard evaluation visualizer
│   │   ├── pages/                   # StudyPackPage, UploadPage, Dashboard
│   │   └── App.jsx                  # Main router and navigation layout
│   └── package.json                 # Frontend dependencies (React 19, Tailwind CSS, Lucide)
│
├── prompts/
│   └── final/                       # Dedicated, versioned Gemini prompt templates
│       ├── P01_summarizer.txt
│       ├── P02_key_terms.txt
│       ├── P03_practice_questions.txt
│       ├── P04_quiz_generator.txt
│       ├── P05_difficulty_questions.txt
│       └── P06_answer_evaluator.txt
│
├── sample_lectures/                 # Verified test lecture notes (.pdf, .pptx, .txt)
├── test_quality_scenarios.py        # Automated test suite covering all 13 quality scenarios
└── README.md
```

---

## 📋 Module Status Table

Every module has been rigorously verified through unit and integration testing.

| Module Name | Functionality | Status | Known Issues |
|---|---|---|---|
| **Document Ingestion & Parsing** | Extraction of raw text and metadata from PDF (`pymupdf`), PPTX (`python-pptx`), and TXT. Validates MIME types, rejects 0-byte/empty files and unsupported extensions. | **Working** | None. Tested with multi-page PDFs, slide decks, and plain text files. |
| **P01: Lecture Summarizer** | Generates title, high-level overview, chapter-wise summaries, deep explanations, and key takeaways using structured Pydantic schemas. | **Working** | None. Automatically breaks down both short and lengthy (>30k chars) notes. |
| **P02: Key Terms Extraction** | Identifies technical terms, clear definitions, contextual usage, and importance levels (High/Medium/Low). Displayed in expandable cards. | **Working** | None. Fully validated against structured JSON schema. |
| **P03: Practice Question Generator** | Balanced mix of short-answer, conceptual, long-answer, and application questions with verified reference answers. | **Working** | None. Model answers are collapsible in the UI to facilitate active recall. |
| **P04: AI Quiz Generator** | Generates 4-option MCQs with single correct key and rationale. | **Working** | None. |
| **P05: Adaptive Difficulty Quiz** | Adjusts cognitive difficulty (Easy: definitions; Medium: concepts & relationships; Hard: multi-step reasoning & application). | **Working** | None. Seamlessly integrated into the interactive Quiz Engine. |
| **P06: Answer Evaluator** | Strict university examiner rubric assessing free-form student answers on a 10-point scale across 5 criteria. Highlights misconceptions and suggests improved answers. | **Working** | None. Real-time evaluation with interactive scorecards. |
| **Interactive Quiz Engine** | Step-by-step quiz navigation, progress bar, real-time option selection, final score calculation, and review mode. | **Working** | None. Robustly handles both `correct_option_id` and legacy `correct_answer` fields. |
| **PDF Export Engine** | ReportLab generation of formatted study packs including running headers/footers, overview, chapters, glossary, questions, and quiz scores. | **Working** | None. Generated PDFs conform to PDF-1.4 standard and stream as file downloads. |
| **Frontend State & Navigation** | Tabbed workspace preserving state across navigation, loading spinners for background tasks, and error alerts. | **Working** | None. Built with React 19 and Tailwind CSS. |
| **API Security & Key Isolation** | Isolates Google Gemini API key to backend runtime environment. Health check never leaks credentials. | **Working** | None. Verified by automated security test. |

---

## ⚙️ Installation & Configuration

### Prerequisites
- **Python**: 3.10+ (Recommended: Python 3.11)
- **Node.js**: 18.0+ (Recommended: Node.js 20+)
- **Google Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/studypack-ai.git
cd studypack-ai
```

---

### Step 2: Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate       # On macOS/Linux
   # or: venv\Scripts\activate   # On Windows
   ```

3. **Install Python dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```bash
   cp .env.example .env
   ```
   Open `backend/.env` and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   HOST=127.0.0.1
   PORT=8000
   ENVIRONMENT=development
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```
   > ⚠️ **Important**: Never commit your `.env` file to version control. The `.gitignore` file already excludes `backend/.env`.

---

### Step 3: Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Ensure `frontend/.env` points to the FastAPI backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

---

## 🚀 Execution & Running the App

### Option A: Running Backend and Frontend Concurrently

**Terminal 1 (Backend)**:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🧪 Comprehensive Quality Testing (13 Test Scenarios)

The project includes an automated end-to-end quality assurance script (`test_quality_scenarios.py`) validating all 13 critical edge cases and workflows:

1. **Valid PDF Upload**: Extracts text and metadata via PyMuPDF.
2. **Valid PPTX Upload**: Extracts slides and speaker notes via python-pptx.
3. **Valid TXT Upload**: Ingests UTF-8 plain text notes.
4. **Empty Document Rejection**: Verifies 0-byte files return HTTP 400.
5. **Unsupported Format Rejection**: Verifies non-supported extensions (e.g. `.py`, `.exe`) return HTTP 415.
6. **Very Long Lecture Notes**: Synthesizes notes exceeding 30,000 characters without truncation or timeouts.
7. **Short Lecture Notes Rejection**: Validates that sub-threshold input returns appropriate client error status (HTTP 400/422).
8. **Gemini API Error Handling**: Verifies graceful error messages and non-crashing behavior on invalid prompts.
9. **API Key Security**: Validates that the `/api/health` endpoint and error responses never expose secrets or credentials.
10. **Quiz Generation**: Confirms generated MCQs have 4 distinct options, exactly one correct key, and an explanation.
11. **Quiz Scoring Algorithm**: Tests scoring logic against dual schema properties (`correct_option_id` and `correct_answer`).
12. **AI Answer Evaluation**: Tests 10-point rubric evaluation against student answers with 5 breakdown criteria.
13. **Study Pack PDF Export**: Validates streaming binary `%PDF` generation and valid headers.

### Running the Quality Test Suite
With the backend server running on `127.0.0.1:8000`:
```bash
python test_quality_scenarios.py
```

Expected output:
```text
============================================================
 COMPLETE QUALITY CHECK SUMMARY (13/13 SCENARIOS)
============================================================
 ✓ 1_valid_pdf: PASS
 ✓ 2_valid_pptx: PASS
 ✓ 3_valid_txt: PASS
 ✓ 4_empty_document: PASS
 ✓ 5_unsupported_format: PASS
 ✓ 6_very_long_notes: PASS
 ✓ 7_short_notes: PASS
 ✓ 8_api_failure: PASS
 ✓ 9_invalid_or_missing_key: PASS
 ✓ 10_quiz_generation: PASS
 ✓ 11_quiz_scoring: PASS
 ✓ 12_answer_evaluation: PASS
 ✓ 13_pdf_download: PASS

ALL 13 QUALITY CHECK SCENARIOS PASSED CONVINCINGLY! 🏆
```

---

## 🔒 Security Best Practices

- **Zero Client-Side Key Exposure**: The Gemini API key is accessed exclusively by the backend service through `os.getenv("GEMINI_API_KEY")`.
- **CORS Restricted**: Backend CORS middleware only allows specified local development origins (`http://localhost:5173`).
- **File Upload Guardrails**: File sizes are capped at 25MB, and file extensions are strictly whitelisted (`.pdf`, `.pptx`, `.txt`).
- **Structured Outputs**: All Gemini interactions utilize Pydantic response models to prevent hallucinated structures and prompt injection spillover.

---

## 📄 License
This project is open-source under the MIT License.
