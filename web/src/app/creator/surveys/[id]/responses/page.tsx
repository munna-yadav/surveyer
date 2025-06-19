'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { surveyService } from '@/services/surveyService';
import { Survey, SurveyResponse } from '@/types';
import { 
  ArrowLeft, 
  Eye, 
  BarChart3,
  Users,
  Calendar,
  Download,
  FileText,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function SurveyResponsesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const surveyId = Number(params.id);
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);

  useEffect(() => {
    if (user?.role !== 'CREATOR') {
      router.push('/');
      return;
    }
    
    fetchData();
  }, [user, surveyId]);

  const fetchData = async () => {
    try {
      const [surveyData, responsesData] = await Promise.all([
        surveyService.getSurveyById(surveyId),
        surveyService.getResponsesBySurvey(surveyId)
      ]);
      
      setSurvey(surveyData);
      setResponses(responsesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load survey data');
    } finally {
      setLoading(false);
    }
  };

  const viewResponse = (response: SurveyResponse) => {
    setSelectedResponse(response);
    setShowResponseDialog(true);
  };

  const exportResponses = () => {
    if (!survey || responses.length === 0) return;
    
    // Create CSV content
    const headers = ['Respondent Email', 'Submitted At', ...survey.questions.map(q => q.questionText)];
    const rows = responses.map(response => {
      const row = [response.respondentEmail, new Date(response.submittedAt).toLocaleString()];
      
      survey.questions.forEach(question => {
        const answer = response.answers.find(a => a.questionId === question.id);
        if (answer) {
          if (answer.answerText) {
            row.push(answer.answerText);
          } else if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
            const selectedTexts = answer.selectedOptionIds.map(optionId => {
              const option = question.options.find(opt => opt.id === optionId);
              return option ? option.optionText : '';
            }).filter(Boolean);
            row.push(selectedTexts.join(', '));
          } else {
            row.push('');
          }
        } else {
          row.push('');
        }
      });
      
      return row;
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${survey.title}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading responses...</p>
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
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Survey
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Survey Responses</h1>
              <div className="flex items-center mt-2 space-x-4">
                <h2 className="text-lg text-gray-600">{survey.title}</h2>
                <Badge variant={survey.isActive ? 'default' : 'secondary'}>
                  {survey.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/creator/surveys/${survey.id}`}>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Survey
                </Button>
              </Link>
              {responses.length > 0 && (
                <Button onClick={exportResponses}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Responses
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Questions
                </CardTitle>
                <Eye className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{survey.questions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completion Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {responses.length > 0 ? '100%' : '0%'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Latest Response
                </CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {responses.length > 0 
                  ? new Date(Math.max(...responses.map(r => new Date(r.submittedAt).getTime()))).toLocaleDateString()
                  : 'No responses'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Response Details ({responses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No responses yet
                </h3>
                <p className="text-gray-600">
                  Once people start taking your survey, their responses will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Answers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>
                        <div className="font-medium">{response.respondentEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(response.submittedAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <FileText className="h-4 w-4 mr-1" />
                          {response.answers.length} answers
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => viewResponse(response)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Response Detail Dialog */}
        <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Response Details</DialogTitle>
              <DialogDescription>
                {selectedResponse && (
                  <>
                    Response from {selectedResponse.respondentEmail} • 
                    Submitted on {new Date(selectedResponse.submittedAt).toLocaleString()}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {selectedResponse && (
              <div className="space-y-6">
                {survey.questions
                  .sort((a, b) => a.questionOrder - b.questionOrder)
                  .map((question, index) => {
                  const answer = selectedResponse.answers.find(a => a.questionId === question.id);
                  
                  return (
                    <Card key={question.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge variant="secondary">{question.type.replace('_', ' ')}</Badge>
                        </div>
                        <h4 className="font-medium">{question.questionText}</h4>
                      </CardHeader>
                      <CardContent>
                        {answer ? (
                          <div>
                            {answer.answerText && (
                              <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm text-gray-700">{answer.answerText}</p>
                              </div>
                            )}
                            {answer.selectedOptionIds && answer.selectedOptionIds.length > 0 && (
                              <div className="space-y-2">
                                {answer.selectedOptionIds.map(optionId => {
                                  const option = question.options.find(opt => opt.id === optionId);
                                  return option ? (
                                    <div key={optionId} className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                      <span className="text-sm">{option.optionText}</span>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No answer provided</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
} 