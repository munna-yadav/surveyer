'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { surveyService } from '@/services/surveyService';
import { Survey, Question, CreateQuestionRequest } from '@/types';
import { 
  ArrowLeft, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Play, 
  Pause,
  BarChart3,
  Users,
  Calendar,
  Save
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface QuestionForm extends CreateQuestionRequest {
  options: Array<{ optionText: string }>;
}

export default function SurveyManagePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const surveyId = Number(params.id);
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: ''
  });
  
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    questionText: '',
    type: 'TEXT' as const,
    questionOrder: 1,
    options: []
  });

  useEffect(() => {
    if (user?.role !== 'CREATOR') {
      router.push('/');
      return;
    }
    
    fetchSurvey();
  }, [user, surveyId]);

  const fetchSurvey = async () => {
    try {
      const surveyData = await surveyService.getSurveyById(surveyId);
      setSurvey(surveyData);
      setSurveyForm({
        title: surveyData.title,
        description: surveyData.description || ''
      });
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError('Survey not found');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSurvey = async () => {
    try {
      await surveyService.updateSurvey(surveyId, surveyForm);
      await fetchSurvey();
      setEditingSurvey(false);
      toast.success('Survey updated successfully');
    } catch (error) {
      console.error('Error updating survey:', error);
      toast.error('Failed to update survey');
    }
  };

  const handlePublishSurvey = async () => {
    setPublishLoading(true);
    try {
      await surveyService.publishSurvey(surveyId);
      await fetchSurvey();
      toast.success('Survey published successfully');
    } catch (error) {
      console.error('Error publishing survey:', error);
      toast.error('Failed to publish survey');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      await surveyService.addQuestionToSurvey(surveyId, {
        ...questionForm,
        questionOrder: (survey?.questions.length || 0) + 1
      });
      await fetchSurvey();
      setShowAddQuestion(false);
      resetQuestionForm();
      toast.success('Question added successfully');
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await surveyService.deleteQuestion(questionId);
      await fetchSurvey();
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      questionText: '',
      type: 'TEXT',
      questionOrder: 1,
      options: []
    });
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { optionText: '' }]
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = questionForm.options.map((opt, i) => 
      i === index ? { optionText: value } : opt
    );
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const removeOption = (index: number) => {
    setQuestionForm({
      ...questionForm,
      options: questionForm.options.filter((_, i) => i !== index)
    });
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!survey) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Surveys
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant={survey.isActive ? 'default' : 'secondary'}>
                  {survey.isActive ? 'Active' : 'Draft'}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {survey.questions.length} questions
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {new Date(survey.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/creator/surveys/${survey.id}/responses`}>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Responses
                </Button>
              </Link>
              {!survey.isActive && (
                <Button 
                  onClick={handlePublishSurvey}
                  disabled={publishLoading || survey.questions.length === 0}
                >
                  {publishLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Publish Survey
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Survey Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Survey Details</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSurvey(!editingSurvey)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editingSurvey ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingSurvey ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={surveyForm.title}
                    onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={surveyForm.description}
                    onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button onClick={handleUpdateSurvey}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="font-medium">{survey.title}</h3>
                {survey.description && (
                  <p className="text-gray-600 mt-1">{survey.description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Questions ({survey.questions.length})</CardTitle>
              <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>
                      Create a new question for your survey
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={questionForm.questionText}
                        onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                        placeholder="Enter your question"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Question Type</Label>
                      <Select
                        value={questionForm.type}
                        onValueChange={(value: any) => setQuestionForm({ 
                          ...questionForm, 
                          type: value,
                          options: value === 'TEXT' ? [] : questionForm.options
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
                    {(questionForm.type === 'SINGLE_CHOICE' || questionForm.type === 'MULTIPLE_CHOICE') && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label>Options</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addOption}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {questionForm.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={option.optionText}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddQuestion(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddQuestion}>
                        Add Question
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {survey.questions.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-600 mb-4">Add questions to get started with your survey</p>
                <Button onClick={() => setShowAddQuestion(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {survey.questions
                  .sort((a, b) => a.questionOrder - b.questionOrder)
                  .map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge variant="secondary">{question.type.replace('_', ' ')}</Badge>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteQuestion(question.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium mb-3">{question.questionText}</h4>
                      {question.options.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 mb-2">Options:</p>
                          {question.options.map((option, optIndex) => (
                            <div key={option.id} className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-400">{optIndex + 1}.</span>
                              <span>{option.optionText}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 