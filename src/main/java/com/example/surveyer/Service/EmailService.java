package com.example.surveyer.Service;


import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Value("${RESEND_API_KEY}")
    String api;

    public void sendVerificationEmail(String email, String token) {
        Resend resend = new Resend("re_63pGb6yh_26WWPj6rYs84CR3EyC3A5ET8");
        String verificationUrl = "http://localhost:3000/auth/verify-email?token=" + token;
        
        String htmlContent = buildVerificationEmailHtml(verificationUrl);
        
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("asknow@devmunna.xyz")
                .to(email)
                .subject("Verify Your Email Address")
                .html(htmlContent)
                .build();

        try {
            CreateEmailResponse data = resend.emails().send(params);
            System.out.println("Verification email sent with ID: " + data.getId());
        } catch (ResendException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendPasswordResetEmail(String email, String token) {
        Resend resend = new Resend("re_63pGb6yh_26WWPj6rYs84CR3EyC3A5ET8");
        String resetUrl = "http://localhost:3000/auth/reset-password?token=" + token;
        
        String htmlContent = buildPasswordResetEmailHtml(resetUrl);
        
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("asknow@devmunna.xyz")
                .to(email)
                .subject("Reset Your Password")
                .html(htmlContent)
                .build();

        try {
            CreateEmailResponse data = resend.emails().send(params);
            System.out.println("Password reset email sent with ID: " + data.getId());
        } catch (ResendException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    private String buildVerificationEmailHtml(String verificationUrl) {
        return "<html>" +
            "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background-color: #f8f9fa; padding: 30px; border-radius: 10px;\">" +
                    "<h1 style=\"color: #333; text-align: center;\">Email Verification</h1>" +
                    "<p style=\"color: #666; font-size: 16px; line-height: 1.5;\">" +
                        "Thank you for registering with Surveyer! Please click the button below to verify your email address." +
                    "</p>" +
                    "<div style=\"text-align: center; margin: 30px 0;\">" +
                        "<a href=\"" + verificationUrl + "\" " +
                           "style=\"background-color: #007bff; color: white; padding: 12px 30px; " +
                                  "text-decoration: none; border-radius: 5px; display: inline-block; " +
                                  "font-weight: bold;\">" +
                            "Verify Email Address" +
                        "</a>" +
                    "</div>" +
                    "<p style=\"color: #999; font-size: 14px;\">" +
                        "If the button doesn't work, you can copy and paste this link in your browser:<br>" +
                        "<a href=\"" + verificationUrl + "\">" + verificationUrl + "</a>" +
                    "</p>" +
                    "<p style=\"color: #999; font-size: 12px; margin-top: 30px;\">" +
                        "This verification link will expire in 24 hours. If you didn't create an account with Surveyer, " +
                        "please ignore this email." +
                    "</p>" +
                "</div>" +
            "</body>" +
            "</html>";
    }

    private String buildPasswordResetEmailHtml(String resetUrl) {
        return "<html>" +
            "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background-color: #f8f9fa; padding: 30px; border-radius: 10px;\">" +
                    "<h1 style=\"color: #333; text-align: center;\">Password Reset</h1>" +
                    "<p style=\"color: #666; font-size: 16px; line-height: 1.5;\">" +
                        "We received a request to reset your password for your Surveyer account. " +
                        "Click the button below to reset your password." +
                    "</p>" +
                    "<div style=\"text-align: center; margin: 30px 0;\">" +
                        "<a href=\"" + resetUrl + "\" " +
                           "style=\"background-color: #dc3545; color: white; padding: 12px 30px; " +
                                  "text-decoration: none; border-radius: 5px; display: inline-block; " +
                                  "font-weight: bold;\">" +
                            "Reset Password" +
                        "</a>" +
                    "</div>" +
                    "<p style=\"color: #999; font-size: 14px;\">" +
                        "If the button doesn't work, you can copy and paste this link in your browser:<br>" +
                        "<a href=\"" + resetUrl + "\">" + resetUrl + "</a>" +
                    "</p>" +
                    "<p style=\"color: #999; font-size: 12px; margin-top: 30px;\">" +
                        "This password reset link will expire in 1 hour. If you didn't request a password reset, " +
                        "please ignore this email and your password will remain unchanged." +
                    "</p>" +
                "</div>" +
            "</body>" +
            "</html>";
    }
}
