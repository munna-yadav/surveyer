'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApiConnection = async () => {
    try {
      addResult('Testing API connection...');
      const response = await fetch('http://localhost:8080/api/test', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        addResult('✅ API connection successful');
      } else {
        addResult(`❌ API connection failed: ${response.status}`);
      }
    } catch (error) {
      addResult(`❌ API connection error: ${error}`);
    }
  };

  const testLogin = async () => {
    try {
      addResult(`Testing login for user: ${credentials.username}`);
      const response = await api.post('/api/auth/login', credentials);
      addResult('✅ Login successful');
      addResult(`Token received: ${response.data.token ? 'Yes' : 'No'}`);
      addResult(`User data: ${JSON.stringify(response.data.user)}`);
    } catch (error: any) {
      addResult(`❌ Login failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const testTokenStorage = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    addResult(`Token in localStorage: ${token ? 'Yes' : 'No'}`);
    addResult(`User in localStorage: ${user ? 'Yes' : 'No'}`);
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        addResult(`User data: ${JSON.stringify(parsedUser)}`);
      } catch (e) {
        addResult(`❌ Error parsing user data: ${e}`);
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addResult('Storage cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={testApiConnection}>Test API Connection</Button>
              <Button onClick={testLogin} disabled={!credentials.username || !credentials.password}>
                Test Login
              </Button>
              <Button onClick={testTokenStorage} variant="outline">
                Check Storage
              </Button>
              <Button onClick={clearStorage} variant="outline">
                Clear Storage
              </Button>
              <Button onClick={clearResults} variant="destructive">
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">No tests run yet...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 