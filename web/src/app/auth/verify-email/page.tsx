'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      setError('Invalid or missing verification token');
      setLoading(false);
    } else {
      setToken(urlToken);
      verifyEmail(urlToken);
    }
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const result = await authService.verifyEmail(verificationToken);
      if (result.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Email verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Surveyer</h1>
            <p className="mt-2 text-gray-600">Verifying your email...</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Email Verification</span>
              </CardTitle>
              <CardDescription>
                Please wait while we verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-4 text-gray-600">
                Verifying your email address...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Surveyer</h1>
            <p className="mt-2 text-gray-600">Email Verified Successfully!</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Email Verified</span>
              </CardTitle>
              <CardDescription>
                Your email address has been successfully verified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Great! Your email address has been verified successfully. 
                  You can now log in to your account and start using Surveyer.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/auth/login">
                    Go to Login
                  </Link>
                </Button>
                
                <p className="text-center text-sm text-gray-600">
                  You will be automatically redirected to the login page in a few seconds.
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
          <p className="mt-2 text-gray-600">Email Verification Failed</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Verification Failed</span>
            </CardTitle>
            <CardDescription>
              There was an issue verifying your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || 'The verification link is invalid or has expired. Please request a new verification email.'}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If you're having trouble with email verification, you can:
              </p>
              
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/register">
                    <Mail className="h-4 w-4 mr-2" />
                    Request New Verification Email
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/login">
                    Try to Login
                  </Link>
                </Button>
                
                <Button asChild className="w-full">
                  <Link href="/auth/register">
                    Create New Account
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 