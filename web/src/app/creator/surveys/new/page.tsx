'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { surveyService } from '@/services/surveyService';
import { CreateSurveyRequest, CreateQuestionRequest } from '@/types';
import { Plus, Trash2, ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionForm extends Omit<CreateQuestionRequest, 'questionOrder'> {
  id?: string;
  options: Array<{ id?: string; optionText: string }>;
}

export default function CreateSurveyPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [surveyData, setSurveyData] = useState<CreateSurveyRequest>({
    title: '',
    description: '',
  });
  
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug authentication
  React.useEffect(() => {
    console.log('CreateSurveyPage - User:', user);
    console.log('CreateSurveyPage - User in localStorage:', !!localStorage.getItem('user'));
    console.log('Note: Token is now stored as HTTP-only cookie (not accessible via JavaScript)');
    
    if (user?.role !== 'CREATOR') {
      console.log('User is not a creator, redirecting to home');
      router.push('/');
      return;
    }
  }, [user, router]);

  if (user?.role !== 'CREATOR') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">You must be a creator to access this page.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const addQuestion = () => {
    const newQuestion: QuestionForm = {
      id: `temp_${Date.now()}`,
      questionText: '',
      type: 'TEXT',
      options: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<QuestionForm>) => {
    setQuestions(questions.map((q, i) => i === index ? { ...q, ...updates } : q));
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const newOption = { id: `temp_${Date.now()}`, optionText: '' };
    updateQuestion(questionIndex, {
      options: [...questions[questionIndex].options, newOption]
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, optionText: string) => {
    const updatedOptions = questions[questionIndex].options.map((opt, i) => 
      i === optionIndex ? { ...opt, optionText } : opt
    );
    updateQuestion(questionIndex, { options: updatedOptions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedOptions = questions[questionIndex].options.filter((_, i) => i !== optionIndex);
    updateQuestion(questionIndex, { options: updatedOptions });
  };

  // Test function to debug API connectivity
  const testAPI = async () => {
    console.log('Testing API connectivity...');
    try {
      // Test getting user's surveys first
      console.log('Testing getSurveysByUser...');
      const surveys = await surveyService.getSurveysByUser();
      console.log('✓ getSurveysByUser success:', surveys);
      
      // Test creating a simple survey
      console.log('Testing createSurvey...');
      const testSurveyData = {
        title: 'Test API Survey',
        description: 'This is a test survey created by the API test function'
      };
      const survey = await surveyService.createSurvey(testSurveyData);
      console.log('✓ createSurvey success:', survey);
      
      toast.success('API test successful! Check console for details.');
    } catch (error) {
      console.error('✗ API test failed:', error);
      toast.error('API test failed. Check console for details.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!surveyData.title.trim()) {
      setError('Survey title is required');
      setLoading(false);
      return;
    }

    if (questions.length === 0) {
      setError('At least one question is required');
      setLoading(false);
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.questionText.trim()) {
        setError(`Question ${i + 1} text is required`);
        setLoading(false);
        return;
      }

      if ((question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && 
          question.options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`);
        setLoading(false);
        return;
      }

      // Validate choice question options
      if ((question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE')) {
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].optionText.trim()) {
            setError(`Question ${i + 1}, Option ${j + 1} text is required`);
            setLoading(false);
            return;
          }
        }
      }
    }

    try {
      console.log('Creating survey with data:', surveyData);
      // Create survey
      const survey = await surveyService.createSurvey(surveyData);
      console.log('Survey created successfully:', survey);
      
      // Add questions
      for (let i = 0; i < questions.length; i++) {
        const { id, ...questionData } = questions[i];
        const questionWithOrder = {
          ...questionData,
          questionOrder: i + 1,
          options: questionData.options.map(opt => ({ optionText: opt.optionText }))
        };
        console.log(`Adding question ${i + 1}:`, questionWithOrder);
        try {
          await surveyService.addQuestionToSurvey(survey.id, questionWithOrder);
          console.log(`Question ${i + 1} added successfully`);
        } catch (questionError) {
          console.error(`Error adding question ${i + 1}:`, questionError);
          throw new Error(`Failed to add question ${i + 1}: ${questionError.message || 'Unknown error'}`);
        }
      }

      toast.success('Survey created successfully!');
      router.push(`/creator/surveys/${survey.id}`);
    } catch (error) {
      console.error('Error creating survey:', error);
      let errorMessage = 'Failed to create survey. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data provided. Please check your input.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Create New Survey</h1>
          <p className="mt-2 text-gray-600">
            Build your survey by adding questions and configuring options
          </p>
          
          {/* Debug button */}
          <Button 
            type="button" 
            onClick={testAPI} 
            variant="outline" 
            size="sm"
            className="mt-2"
          >
            Test API Connection
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Survey Details */}
          <Card>
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Survey Title *</Label>
                <Input
                  id="title"
                  value={surveyData.title}
                  onChange={(e) => setSurveyData({ ...surveyData, title: e.target.value })}
                  placeholder="Enter survey title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={surveyData.description}
                  onChange={(e) => setSurveyData({ ...surveyData, description: e.target.value })}
                  placeholder="Enter survey description (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Questions</CardTitle>
                <Button type="button" onClick={addQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          <Badge variant="secondary">{question.type.replace('_', ' ')}</Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Question Text *</Label>
                        <Textarea
                          value={question.questionText}
                          onChange={(e) => updateQuestion(index, { questionText: e.target.value })}
                          placeholder="Enter your question"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value: any) => updateQuestion(index, { 
                            type: value,
                            options: value === 'TEXT' ? [] : question.options
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEXT">Text Response</SelectItem>
                            <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                            <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Options</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(index)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <Input
                                  value={option.optionText}
                                  onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(index, optionIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Survey
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
} 