'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Users, FileText, TrendingUp, Calendar } from 'lucide-react'
import { surveyService } from '@/services/surveyService'

export default function AnalyticsPage() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    averageCompletionRate: 0,
    recentActivity: []
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const surveysData = await surveyService.getMySurveys()
        setSurveys(surveysData)
        
        // Calculate analytics
        const totalSurveys = surveysData.length
        const totalResponses = surveysData.reduce((sum, survey) => sum + (survey.responseCount || 0), 0)
        const avgCompletion = surveysData.length > 0 
          ? surveysData.reduce((sum, survey) => sum + (survey.completionRate || 0), 0) / surveysData.length 
          : 0

        setAnalytics({
          totalSurveys,
          totalResponses,
          averageCompletionRate: Math.round(avgCompletion),
          recentActivity: surveysData.slice(0, 5).map(survey => ({
            id: survey.id,
            title: survey.title,
            responses: survey.responseCount || 0,
            status: survey.status,
            createdAt: survey.createdAt
          }))
        })
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your survey performance and engagement metrics.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your survey performance and engagement metrics.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSurveys}</div>
            <p className="text-xs text-muted-foreground">
              All time surveys created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              Across all surveys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {surveys.filter(s => {
                const created = new Date(s.createdAt)
                const thisMonth = new Date()
                return created.getMonth() === thisMonth.getMonth() && 
                       created.getFullYear() === thisMonth.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Surveys created this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="surveys">Survey Performance</TabsTrigger>
          <TabsTrigger value="responses">Response Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest survey activities and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.responses} responses
                        </p>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(activity.status)}>
                        {activity.status || 'Draft'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activity found. Create your first survey to get started!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Key metrics and trends for your surveys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Active Surveys</span>
                    <span className="font-medium">
                      {surveys.filter(s => s.status === 'ACTIVE').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Draft Surveys</span>
                    <span className="font-medium">
                      {surveys.filter(s => s.status === 'DRAFT').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed Surveys</span>
                    <span className="font-medium">
                      {surveys.filter(s => s.status === 'COMPLETED').length}
                    </span>
                  </div>
                </div>
                
                {analytics.totalSurveys === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Create surveys to see performance insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Survey Performance</CardTitle>
              <CardDescription>
                Detailed performance metrics for each survey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {surveys.length > 0 ? (
                <div className="space-y-4">
                  {surveys.map((survey) => (
                    <div key={survey.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{survey.title}</h3>
                        <Badge variant="secondary" className={getStatusColor(survey.status)}>
                          {survey.status || 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {survey.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{survey.responseCount || 0} responses</span>
                        <span>•</span>
                        <span>Created {new Date(survey.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No surveys found. Create your first survey to get started!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Analytics</CardTitle>
              <CardDescription>
                Analyze response patterns and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Response analytics coming soon
                </p>
                <p className="text-xs text-muted-foreground">
                  We're working on detailed response analytics and insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 