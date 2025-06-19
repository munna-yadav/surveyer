'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { surveyService } from '@/services/surveyService';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testData, setTestData] = useState({
    title: 'Test Survey',
    description: 'Test Description'
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testBackendConnection = async () => {
    addLog('Testing backend connection...');
    try {
      const response = await fetch('http://localhost:8080/actuator/health');
      if (response.ok) {
        addLog('✓ Backend is accessible');
      } else {
        addLog(`✗ Backend returned status: ${response.status}`);
      }
    } catch (error) {
      addLog(`✗ Backend connection failed: ${error.message}`);
    }
  };

  const testAuthToken = () => {
    const user = localStorage.getItem('user');
    addLog(`User exists in localStorage: ${!!user}`);
    addLog('Note: Token is now stored as HTTP-only cookie (not accessible via JavaScript)');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        addLog(`User role: ${userData.role}`);
        addLog(`Username: ${userData.username}`);
        addLog(`User ID: ${userData.id}`);
      } catch (e) {
        addLog('Error parsing user data');
      }
    }
    
    // Test if cookies are being sent by making a simple authenticated request
    addLog('Testing authenticated request to check cookie...');
    testAuthenticatedRequest();
  };

  const testAuthenticatedRequest = async () => {
    try {
      const response = await api.get('/api/surveys/my');
      addLog('✓ Authenticated request successful - cookie is working');
      addLog(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      addLog(`✗ Authenticated request failed: ${error.message}`);
      if (error.response) {
        addLog(`Response status: ${error.response.status}`);
        addLog(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  };

  const testSurveyCreation = async () => {
    addLog('Testing survey creation...');
    try {
      const survey = await surveyService.createSurvey(testData);
      addLog(`✓ Survey created successfully: ID ${survey.id}`);
      addLog(`Survey data: ${JSON.stringify(survey, null, 2)}`);
    } catch (error) {
      addLog(`✗ Survey creation failed: ${error.message}`);
      if (error.response) {
        addLog(`Response status: ${error.response.status}`);
        addLog(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  };

  const testQuestionCreation = async () => {
    addLog('Testing question creation (requires survey ID)...');
    const surveyId = prompt('Enter survey ID to test question creation:');
    if (!surveyId) return;

    const questionData = {
      questionText: 'Test Question',
      type: 'TEXT',
      questionOrder: 1,
      options: []
    };

    try {
      const question = await surveyService.addQuestionToSurvey(Number(surveyId), questionData);
      addLog(`✓ Question created successfully: ID ${question.id}`);
      addLog(`Question data: ${JSON.stringify(question, null, 2)}`);
    } catch (error) {
      addLog(`✗ Question creation failed: ${error.message}`);
      if (error.response) {
        addLog(`Response status: ${error.response.status}`);
        addLog(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  };

  const testDirectAPI = async () => {
    addLog('Testing direct API call...');
    try {
      const response = await api.post('/api/surveys', testData);
      addLog(`✓ Direct API call successful: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      addLog(`✗ Direct API call failed: ${error.message}`);
      if (error.response) {
        addLog(`Response status: ${error.response.status}`);
        addLog(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
        addLog(`Request headers: ${JSON.stringify(error.config?.headers, null, 2)}`);
      }
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Survey Creation Debug</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Survey Title</Label>
              <Input
                value={testData.title}
                onChange={(e) => setTestData({...testData, title: e.target.value})}
              />
            </div>
            <div>
              <Label>Survey Description</Label>
              <Textarea
                value={testData.description}
                onChange={(e) => setTestData({...testData, description: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={testBackendConnection}>Test Backend Connection</Button>
              <Button onClick={testAuthToken}>Check Auth & Test Cookie</Button>
              <Button onClick={testAuthenticatedRequest}>Test Auth Request</Button>
              <Button onClick={testSurveyCreation}>Test Survey Creation</Button>
              <Button onClick={testQuestionCreation}>Test Question Creation</Button>
              <Button onClick={testDirectAPI}>Test Direct API</Button>
              <Button onClick={clearLogs} variant="outline">Clear Logs</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-600">No logs yet. Run some tests above.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 