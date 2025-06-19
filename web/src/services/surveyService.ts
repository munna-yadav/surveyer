import api from '@/lib/api';
import { Survey, CreateSurveyRequest, CreateQuestionRequest, Question, SurveyResponse, SubmitResponseRequest, SurveyToken } from '@/types';

export const surveyService = {
  // Survey CRUD operations
  async getAllSurveys(): Promise<Survey[]> {
    try {
      const response = await api.get('/api/surveys');
      return response.data;
    } catch (error) {
      console.error('getAllSurveys error:', error);
      throw error;
    }
  },

  async getSurveysByUser(): Promise<Survey[]> {
    try {
      const response = await api.get('/api/surveys/my');
      return response.data;
    } catch (error) {
      console.error('getSurveysByUser error:', error);
      throw error;
    }
  },

  async getSurveyById(id: number): Promise<Survey> {
    try {
      const response = await api.get(`/api/surveys/${id}`);
      return response.data;
    } catch (error) {
      console.error('getSurveyById error:', error);
      throw error;
    }
  },

  async getActiveSurveyById(id: number): Promise<Survey> {
    try {
      const response = await api.get(`/api/surveys/${id}/public`);
      return response.data;
    } catch (error) {
      console.error('getActiveSurveyById error:', error);
      throw error;
    }
  },

  async createSurvey(data: CreateSurveyRequest): Promise<Survey> {
    try {
      console.log('Creating survey with data:', data);
      const response = await api.post('/api/surveys', data);
      console.log('Survey creation response:', response);
      return response.data;
    } catch (error) {
      console.error('createSurvey error:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      console.error('Error config:', error.config);
      throw error;
    }
  },

  async updateSurvey(id: number, data: Partial<CreateSurveyRequest>): Promise<Survey> {
    try {
      const response = await api.put(`/api/surveys/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('updateSurvey error:', error);
      throw error;
    }
  },

  async deleteSurvey(id: number): Promise<void> {
    try {
      await api.delete(`/api/surveys/${id}`);
    } catch (error) {
      console.error('deleteSurvey error:', error);
      throw error;
    }
  },

  async publishSurvey(id: number): Promise<Survey> {
    try {
      const response = await api.post(`/api/surveys/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error('publishSurvey error:', error);
      throw error;
    }
  },

  async getSurveyCount(): Promise<number> {
    try {
      const response = await api.get('/api/surveys/count');
      return response.data;
    } catch (error) {
      console.error('getSurveyCount error:', error);
      throw error;
    }
  },

  // Question operations
  async addQuestionToSurvey(surveyId: number, data: CreateQuestionRequest): Promise<Question> {
    try {
      console.log(`Adding question to survey ${surveyId}:`, data);
      const response = await api.post(`/api/questions/survey/${surveyId}`, data);
      console.log('Question creation response:', response);
      return response.data;
    } catch (error) {
      console.error('addQuestionToSurvey error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  async updateQuestion(questionId: number, data: CreateQuestionRequest): Promise<Question> {
    const response = await api.put(`/api/questions/${questionId}`, data);
    return response.data;
  },

  async deleteQuestion(questionId: number): Promise<void> {
    await api.delete(`/api/questions/${questionId}`);
  },

  async getQuestionsBySurvey(surveyId: number): Promise<Question[]> {
    const response = await api.get(`/api/questions/survey/${surveyId}`);
    return response.data;
  },

  async addOptionToQuestion(questionId: number, optionData: { optionText: string }): Promise<any> {
    const response = await api.post(`/api/questions/${questionId}/options`, optionData);
    return response.data;
  },

  // Survey responses
  async submitResponse(data: SubmitResponseRequest & { surveyId: number }): Promise<SurveyResponse> {
    const response = await api.post('/api/responses/submit', data);
    return response.data;
  },

  async getResponsesBySurvey(surveyId: number): Promise<SurveyResponse[]> {
    const response = await api.get(`/api/responses/survey/${surveyId}`);
    return response.data;
  },

  async getResponseById(responseId: number): Promise<SurveyResponse> {
    const response = await api.get(`/api/responses/${responseId}`);
    return response.data;
  },

  async getResponseCount(surveyId: number): Promise<number> {
    const response = await api.get(`/api/responses/survey/${surveyId}/count`);
    return response.data;
  },

  async getAnswersByQuestion(questionId: number): Promise<any[]> {
    const response = await api.get(`/api/responses/question/${questionId}/answers`);
    return response.data;
  },

  // User operations
  async getCurrentUser(): Promise<any> {
    const response = await api.get('/api/user/me');
    return response.data;
  },

  // Survey tokens (for public surveys) - these endpoints don't exist in backend yet
  async generateSurveyToken(surveyId: number): Promise<SurveyToken> {
    const response = await api.post(`/api/survey-tokens/survey/${surveyId}`);
    return response.data;
  },

  async getSurveyByToken(token: string): Promise<Survey> {
    const response = await api.get(`/api/survey-tokens/${token}/survey`);
    return response.data;
  },

  async submitResponseByToken(token: string, data: Omit<SubmitResponseRequest, 'surveyId'>): Promise<SurveyResponse> {
    const response = await api.post(`/api/survey-tokens/${token}/respond`, data);
    return response.data;
  },
}; 