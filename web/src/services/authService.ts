import api from '@/lib/api';
import { ForgotPasswordRequest, ResetPasswordRequest } from '@/types';

export const authService = {
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.get(`/api/auth/verify-email?token=${token}`);
      return {
        success: true,
        message: response.data.message || 'Email verified successfully!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed'
      };
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/auth/forgot-password', data);
      return {
        success: true,
        message: response.data.message || 'Password reset email sent successfully!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send password reset email'
      };
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/auth/reset-password', data);
      return {
        success: true,
        message: response.data.message || 'Password reset successfully!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  },

  async resendVerificationEmail(data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/auth/resend-verification', data);
      return {
        success: true,
        message: response.data.message || 'Verification email sent successfully!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send verification email'
      };
    }
  }
}; 