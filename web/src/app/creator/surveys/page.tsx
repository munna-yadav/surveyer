'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { surveyService } from '@/services/surveyService';
import { Survey } from '@/types';
import { Plus, MoreHorizontal, Eye, Settings, BarChart3, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreatorSurveysPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'CREATOR') {
      router.push('/');
      return;
    }
    
    fetchSurveys();
  }, [user]);

  const fetchSurveys = async () => {
    try {
      const surveysData = await surveyService.getSurveysByUser();
      setSurveys(surveysData);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setError('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishSurvey = async (surveyId: number) => {
    try {
      await surveyService.publishSurvey(surveyId);
      await fetchSurveys(); // Refresh the list
      toast.success('Survey published successfully');
    } catch (error) {
      console.error('Error publishing survey:', error);
      toast.error('Failed to publish survey');
    }
  };

  const handleDeleteSurvey = async (surveyId: number) => {
    if (!confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      return;
    }

    try {
      await surveyService.deleteSurvey(surveyId);
      await fetchSurveys(); // Refresh the list
      toast.success('Survey deleted successfully');
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error('Failed to delete survey');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading surveys...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Surveys</h1>
              <p className="mt-2 text-gray-600">
                Manage your surveys, track responses, and analyze results
              </p>
            </div>
            <Link href="/creator/surveys/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Survey</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Surveys
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{surveys.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Surveys
                </CardTitle>
                <Eye className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {surveys.filter(s => s.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Questions
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {surveys.reduce((acc, survey) => acc + survey.questions.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surveys Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            {surveys.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No surveys created yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first survey to start collecting responses
                </p>
                <Link href="/creator/surveys/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Survey
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveys.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{survey.title}</div>
                          {survey.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {survey.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={survey.isActive ? 'default' : 'secondary'}>
                          {survey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {survey.questions.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/creator/surveys/${survey.id}`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Manage
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/creator/surveys/${survey.id}/responses`}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                View Responses
                              </Link>
                            </DropdownMenuItem>
                            {!survey.isActive && (
                              <DropdownMenuItem 
                                onClick={() => handlePublishSurvey(survey.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Publish Survey
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSurvey(survey.id)}
                              className="text-red-600"
                            >
                              <span className="mr-2">🗑️</span>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 