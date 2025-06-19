'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { surveyService } from '@/services/surveyService';
import { Survey, Question, SubmitResponseRequest } from '@/types';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Answer {
  questionId: number;
  answerText?: string;
  selectedOptionIds?: number[];
}

export default function TakeSurveyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const surveyId = Number(params.id);
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [respondentEmail, setRespondentEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.role !== 'RESPONDENT') {
      router.push('/');
      return;
    }
    
    fetchSurvey();
  }, [user, surveyId]);

  const fetchSurvey = async () => {
    try {
      const surveyData = await surveyService.getActiveSurveyById(surveyId);
      setSurvey(surveyData);
      
      // Initialize answers array
      const initialAnswers = surveyData.questions.map(q => ({
        questionId: q.id,
        answerText: '',
        selectedOptionIds: []
      }));
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError('Survey not found or is not active');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (questionId: number, updates: Partial<Answer>) => {
    setAnswers(answers.map(a => 
      a.questionId === questionId ? { ...a, ...updates } : a
    ));
  };

  const handleTextAnswer = (questionId: number, value: string) => {
    updateAnswer(questionId, { answerText: value });
  };

  const handleSingleChoice = (questionId: number, optionId: number) => {
    updateAnswer(questionId, { selectedOptionIds: [optionId] });
  };

  const handleMultipleChoice = (questionId: number, optionId: number, checked: boolean) => {
    const currentAnswer = answers.find(a => a.questionId === questionId);
    const currentOptions = currentAnswer?.selectedOptionIds || [];
    
    let newOptions: number[];
    if (checked) {
      newOptions = [...currentOptions, optionId];
    } else {
      newOptions = currentOptions.filter(id => id !== optionId);
    }
    
    updateAnswer(questionId, { selectedOptionIds: newOptions });
  };

  const validateAnswers = (): string | null => {
    if (!respondentEmail.trim()) {
      return 'Please enter your email address';
    }

    for (const question of survey!.questions) {
      const answer = answers.find(a => a.questionId === question.id);
      
      if (question.type === 'TEXT') {
        if (!answer?.answerText?.trim()) {
          return `Please answer: ${question.questionText}`;
        }
      } else if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') {
        if (!answer?.selectedOptionIds || answer.selectedOptionIds.length === 0) {
          return `Please select an option for: ${question.questionText}`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateAnswers();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const submitData: SubmitResponseRequest = {
        surveyId,
        respondentEmail,
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          answerText: answer.answerText || undefined,
          selectedOptionIds: answer.selectedOptionIds && answer.selectedOptionIds.length > 0 
            ? answer.selectedOptionIds 
            : undefined
        }))
      };

      await surveyService.submitResponse(submitData);
      setSubmitted(true);
      toast.success('Survey submitted successfully!');
    } catch (error) {
      console.error('Error submitting survey:', error);
      setError('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading survey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            className="mt-4" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thank You!
              </h2>
              <p className="text-gray-600 mb-6">
                Your response has been submitted successfully. We appreciate your participation in this survey.
              </p>
              <Button onClick={() => router.push('/respondent/surveys')}>
                Take Another Survey
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {survey && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Survey Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{survey.title}</CardTitle>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge>Active Survey</Badge>
                      <span className="text-sm text-gray-500">
                        {survey.questions.length} questions
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {survey.description && (
                <CardContent>
                  <p className="text-gray-600">{survey.description}</p>
                </CardContent>
              )}
            </Card>

            {/* Respondent Email */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={respondentEmail}
                    onChange={(e) => setRespondentEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            {survey.questions.map((question, index) => {
              const answer = answers.find(a => a.questionId === question.id);
              
              return (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span>{question.questionText}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {question.type === 'TEXT' && (
                      <Textarea
                        value={answer?.answerText || ''}
                        onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                        placeholder="Enter your answer..."
                        rows={4}
                      />
                    )}

                    {question.type === 'SINGLE_CHOICE' && (
                      <RadioGroup
                        value={answer?.selectedOptionIds?.[0]?.toString() || ''}
                        onValueChange={(value) => handleSingleChoice(question.id, Number(value))}
                      >
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={option.id.toString()} 
                              id={`option-${option.id}`} 
                            />
                            <Label 
                              htmlFor={`option-${option.id}`}
                              className="cursor-pointer"
                            >
                              {option.optionText}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-3">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`option-${option.id}`}
                              checked={answer?.selectedOptionIds?.includes(option.id) || false}
                              onCheckedChange={(checked) => 
                                handleMultipleChoice(question.id, option.id, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`option-${option.id}`}
                              className="cursor-pointer"
                            >
                              {option.optionText}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting} size="lg">
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Survey
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </main>
    </div>
  );
} 