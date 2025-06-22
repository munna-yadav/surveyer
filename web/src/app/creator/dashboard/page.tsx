'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { surveyService } from '@/services/surveyService';
import { Survey } from '@/types';
import { 
  Plus, 
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  FileText,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'CREATOR') {
      router.push('/');
      return;
    }
    
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const surveysData = await surveyService.getSurveysByUser();
      setSurveys(surveysData);
      
      // Get response counts for all surveys
      let totalResponses = 0;
      for (const survey of surveysData) {
        try {
          const count = await surveyService.getResponseCount(survey.id);
          totalResponses += count;
        } catch (error) {
          // If error getting response count, continue with other surveys
          console.warn(`Could not get response count for survey ${survey.id}`);
        }
      }
      setResponseCount(totalResponses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeSurveys = surveys.filter(s => s.isActive);
  const draftSurveys = surveys.filter(s => !s.isActive);
  const totalQuestions = surveys.reduce((acc, survey) => acc + survey.questions.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your surveys and response analytics
          </p>
        </div>
        <Link href="/creator/surveys/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Survey</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Surveys
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveys.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeSurveys.length} active, {draftSurveys.length} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Responses
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all surveys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              {totalQuestions > 0 ? (totalQuestions / surveys.length).toFixed(1) : 0} avg per survey
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSurveys.length > 0 ? Math.round((responseCount / activeSurveys.length) * 100) / 100 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Responses per active survey
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Surveys */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Surveys</CardTitle>
              <Link href="/creator/surveys">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {surveys.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No surveys yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first survey to get started
                </p>
                <Link href="/creator/surveys/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Survey
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {surveys.slice(0, 5).map((survey) => (
                  <div key={survey.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">{survey.title}</h4>
                        <Badge variant={survey.isActive ? 'default' : 'secondary'} className="text-xs">
                          {survey.isActive ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-1 space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {survey.questions.length} questions
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/creator/surveys/${survey.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/creator/surveys/${survey.id}/responses`}>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/creator/surveys/new">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <Plus className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <h4 className="font-medium text-blue-900">Create New Survey</h4>
                    <p className="text-sm text-blue-700">Start building your next survey</p>
                  </div>
                </div>
              </Link>

              <Link href="/creator/surveys">
                <div className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <FileText className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <h4 className="font-medium text-green-900">Manage Surveys</h4>
                    <p className="text-sm text-green-700">Edit and organize your surveys</p>
                  </div>
                </div>
              </Link>

              <Link href="/creator/analytics">
                <div className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                  <BarChart3 className="h-8 w-8 text-purple-600 mr-4" />
                  <div>
                    <h4 className="font-medium text-purple-900">Analytics</h4>
                    <p className="text-sm text-purple-700">View detailed analytics and insights</p>
                  </div>
                </div>
              </Link>

              {draftSurveys.length > 0 && (
                <div className="flex items-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="h-8 w-8 text-orange-600 mr-4" />
                  <div>
                    <h4 className="font-medium text-orange-900">Draft Surveys</h4>
                    <p className="text-sm text-orange-700">{draftSurveys.length} surveys ready to publish</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 