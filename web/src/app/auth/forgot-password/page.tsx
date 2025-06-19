'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.forgotPassword({ email });
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Surveyer</h1>
            <p className="mt-2 text-gray-600">Password Reset Email Sent</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Check Your Email</span>
              </CardTitle>
              <CardDescription>
                We've sent you a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  If an account with the email <strong>{email}</strong> exists, 
                  we've sent you a password reset link. Please check your inbox 
                  and follow the instructions to reset your password.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder. The email may take a few minutes to arrive.
                </p>
                
                <Button 
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="w-full"
                >
                  Try Different Email
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Back to Login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Surveyer</h1>
          <p className="mt-2 text-gray-600">Reset your password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Forgot Password</span>
            </CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email address"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 