package com.example.surveyer.controller;

import com.example.surveyer.DTO.ForgotPasswordDTO;
import com.example.surveyer.DTO.LoginDTO;
import com.example.surveyer.DTO.ResetPasswordDTO;
import com.example.surveyer.Entity.Users;
import com.example.surveyer.Service.AuthService;
import com.example.surveyer.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthService authService;
    @Autowired
    EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> Register(@RequestBody Users user){
        return authService.register(user);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        return authService.verifyEmail(token);
    }

    @PostMapping("/login")
    public ResponseEntity<?> Login(@RequestBody LoginDTO dto){
        return authService.login(dto);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordDTO forgotPasswordDTO) {
        return authService.forgotPassword(forgotPasswordDTO);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO resetPasswordDTO) {
        return authService.resetPassword(resetPasswordDTO);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody ForgotPasswordDTO emailRequest) {
        return authService.resendVerificationEmail(emailRequest);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> Logout(){
        return authService.logout();
    }
}
