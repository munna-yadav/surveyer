export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'CREATOR' | 'RESPONDENT';
  createdAt: string;
}

export interface Survey {
  id: number;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  createdByUsername: string;
  questions: Question[];
}

export interface Question {
  id: number;
  questionText: string;
  type: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  questionOrder: number;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  optionText: string;
}

export interface SurveyResponse {
  id: number;
  surveyId: number;
  respondentEmail: string;
  submittedAt: string;
  answers: Answer[];
}

export interface Answer {
  id: number;
  questionId: number;
  answerText?: string;
  selectedOptionIds?: number[];
}

export interface SurveyToken {
  id: number;
  token: string;
  surveyId: number;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'CREATOR' | 'RESPONDENT';
}

export interface AuthResponse {
  message: string;
  user: User;
  // Note: token is now stored as HTTP-only cookie, not returned in response
}

export interface CreateSurveyRequest {
  title: string;
  description?: string;
}

export interface CreateQuestionRequest {
  questionText: string;
  type: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  questionOrder?: number;
  options?: Array<{ optionText: string }>;
}

export interface SubmitResponseRequest {
  surveyId: number;
  respondentEmail: string;
  answers: Array<{
    questionId: number;
    answerText?: string;
    selectedOptionIds?: number[];
  }>;
} 