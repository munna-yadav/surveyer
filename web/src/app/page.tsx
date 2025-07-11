'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { surveyService } from '@/services/surveyService';
import { Survey } from '@/types';
import { Plus, FileText, Users, BarChart3, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('HomePage useEffect - loading:', loading, 'user:', !!user);
    
    // Only redirect to login if we're not loading and definitely have no user
    if (!loading && !user) {
      console.log('Redirecting to login - no user found');
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching surveys for role:', user.role);
      fetchSurveys();
    }
  }, [user]);

  const fetchSurveys = async () => {
    setLoadingSurveys(true);
    try {
      let surveysData: Survey[];
      if (user?.role === 'CREATOR') {
        console.log('Fetching surveys for creator');
        surveysData = await surveyService.getSurveysByUser();
      } else {
        console.log('Fetching all surveys for respondent');
        surveysData = await surveyService.getAllSurveys();
      }
      console.log('Surveys fetched successfully:', surveysData.length);
      setSurveys(surveysData);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      // Don't logout user just because survey fetch failed
      // This could be a temporary server issue
    } finally {
      setLoadingSurveys(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          {user.role === 'CREATOR' 
            ? 'Manage your surveys and analyze responses'
            : 'Discover and participate in available surveys'
          }
        </p>
      </div>

      {/* Role-specific Quick Actions */}
      {user.role === 'CREATOR' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/creator/surveys/new')}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Create Survey</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create a new survey and start collecting responses
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/creator/surveys')}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">My Surveys</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View and manage all your surveys
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/creator/analytics')}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View survey responses and analytics
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Surveys Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            {user.role === 'CREATOR' ? 'Your Recent Surveys' : 'Available Surveys'}
          </h2>
          {user.role === 'CREATOR' && (
            <Link href="/creator/surveys/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Survey</span>
              </Button>
            </Link>
          )}
        </div>

        {loadingSurveys ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading surveys...</p>
          </div>
        ) : surveys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {user.role === 'CREATOR' ? 'No surveys created yet' : 'No surveys available'}
              </h3>
              <p className="text-muted-foreground">
                {user.role === 'CREATOR' 
                  ? 'Create your first survey to get started'
                  : 'Check back later for new surveys'
                }
              </p>
              {user.role === 'CREATOR' && (
                <Link href="/creator/surveys/new">
                  <Button className="mt-4">
                    Create Your First Survey
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.slice(0, 6).map((survey) => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{survey.title}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={survey.isActive ? 'default' : 'secondary'}>
                          {survey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {user.role === 'CREATOR' && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{survey.questions.length} questions</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {survey.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="space-x-2">
                      {user.role === 'CREATOR' ? (
                        <>
                          <Link href={`/creator/surveys/${survey.id}`}>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </Link>
                          <Link href={`/creator/surveys/${survey.id}/responses`}>
                            <Button size="sm">
                              Responses
                            </Button>
                          </Link>
                        </>
                      ) : (
                        survey.isActive && (
                          <Link href={`/respondent/surveys/${survey.id}/take`}>
                            <Button size="sm">
                              Take Survey
                            </Button>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Show link to view all surveys if there are more than 6 */}
        {surveys.length > 6 && (
          <div className="text-center">
            <Link href={user.role === 'CREATOR' ? '/creator/surveys' : '/surveys'}>
              <Button variant="outline">
                View All Surveys ({surveys.length})
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
