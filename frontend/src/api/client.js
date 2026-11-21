import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadDocumentPreview = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/extract-preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const testGeminiPrompt = async (prompt) => {
  const response = await apiClient.post('/test-gemini', { prompt });
  return response.data;
};

export const generateSummary = async ({
  lecture_text,
  subject = 'General Lecture',
  academic_level = 'College / Undergraduate',
  summary_length = 'standard',
}) => {
  const response = await apiClient.post('/generate-summary', {
    lecture_text,
    subject,
    academic_level,
    summary_length,
  });
  return response.data;
};

export const generateKeyTerms = async ({
  lecture_text,
  subject = 'General Lecture',
  term_limit = 15,
}) => {
  const response = await apiClient.post('/generate-key-terms', {
    lecture_text,
    subject,
    term_limit,
  });
  return response.data;
};

export const generateQuestions = async ({
  lecture_text,
  subject = 'General Lecture',
  question_count = 6,
  difficulty_distribution = 'Balanced (Easy, Medium, Hard)',
}) => {
  const response = await apiClient.post('/generate-questions', {
    lecture_text,
    subject,
    question_count,
    difficulty_distribution,
  });
  return response.data;
};

export const generateQuiz = async ({
  lecture_text,
  subject = 'General Lecture',
  number_of_questions = 5,
  difficulty = 'Medium',
}) => {
  const response = await apiClient.post('/generate-quiz', {
    lecture_text,
    subject,
    number_of_questions,
    difficulty,
  });
  return response.data;
};

export const generateAdaptiveQuiz = async ({
  lecture_text,
  difficulty = 'Medium',
  question_count = 5,
}) => {
  const response = await apiClient.post('/generate-adaptive-quiz', {
    lecture_text,
    difficulty,
    question_count,
  });
  return response.data;
};

export const evaluateAnswer = async ({
  question,
  reference_answer,
  student_answer,
  rubric,
}) => {
  const response = await apiClient.post('/evaluate-answer', {
    question,
    reference_answer,
    student_answer,
    rubric,
  });
  return response.data;
};

export const exportStudyPackPdf = async (studyPack) => {
  const response = await apiClient.post('/export-pdf', studyPack, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle =
    (studyPack.title || 'StudyPack')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_') || 'StudyPack';
  link.setAttribute('download', `${safeTitle}_StudyPack.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return true;
};
