package com.example.surveyer.Service;

import com.example.surveyer.DTO.ForgotPasswordDTO;
import com.example.surveyer.DTO.LoginDTO;
import com.example.surveyer.DTO.ResetPasswordDTO;
import com.example.surveyer.Entity.Users;
import com.example.surveyer.Repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    UsersRepository usersRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired 
    JWTService jwtService;

    @Autowired
    EmailService emailService;

    public ResponseEntity<?> register(Users user){
        if (user.getUsername() == null || user.getEmail() == null || user.getName() == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "All fields required"));
        }

        if (usersRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "User with the username exists"));
        }

        if (usersRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "User with email already registered"));
        }
        
        user.setUsername(user.getUsername().toLowerCase());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Generate email verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        user.setIsEmailVerified(false);

        Users saved = usersRepository.save(user);
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send verification email: " + e.getMessage());
        }

        // Remove sensitive data from response
        saved.setPassword(null);
        saved.setEmailVerificationToken(null);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                    "message", "User registered successfully. Please check your email to verify your account.",
                    "user", saved
                ));
    }

    public ResponseEntity<?> verifyEmail(String token) {
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Verification token is required"));
        }

        Optional<Users> userOptional = usersRepository.findByEmailVerificationToken(token);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid verification token"));
        }

        Users user = userOptional.get();
        
        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Verification token has expired"));
        }

        if (user.getIsEmailVerified()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is already verified"));
        }

        // Verify the email
        user.setIsEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        usersRepository.save(user);

        return ResponseEntity
                .ok()
                .body(Map.of("message", "Email verified successfully"));
    }

    public ResponseEntity<?> login(LoginDTO loginDTO) {
        if (loginDTO.getUsername() == null || loginDTO.getPassword() == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Username and password are required"));
        }

        Optional<Users> userOptional = usersRepository.findByUsername(loginDTO.getUsername().toLowerCase());

        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }

        Users user = userOptional.get();

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }

        // Check if email is verified
        if (!user.getIsEmailVerified()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please verify your email before logging in"));
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(false) // set true in production (HTTPS)
                .path("/")
                .maxAge(Duration.ofDays(7))
                .sameSite("Strict")
                .build();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("message", "User logged in");
        responseBody.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "name", user.getName(),
                "isEmailVerified", user.getIsEmailVerified()
        ));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(responseBody);
    }

    public ResponseEntity<?> forgotPassword(ForgotPasswordDTO forgotPasswordDTO) {
        if (forgotPasswordDTO.getEmail() == null || forgotPasswordDTO.getEmail().trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is required"));
        }

        Optional<Users> userOptional = usersRepository.findByEmail(forgotPasswordDTO.getEmail());
        
        if (userOptional.isEmpty()) {
            // Don't reveal if email exists or not for security
            return ResponseEntity
                    .ok()
                    .body(Map.of("message", "If an account with that email exists, a password reset link has been sent."));
        }

        Users user = userOptional.get();
        
        // Generate password reset token
        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1)); // 1 hour expiry
        usersRepository.save(user);

        // Send password reset email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send password reset email"));
        }

        return ResponseEntity
                .ok()
                .body(Map.of("message", "If an account with that email exists, a password reset link has been sent."));
    }

    public ResponseEntity<?> resetPassword(ResetPasswordDTO resetPasswordDTO) {
        if (resetPasswordDTO.getToken() == null || resetPasswordDTO.getNewPassword() == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Token and new password are required"));
        }

        if (resetPasswordDTO.getNewPassword().length() < 6) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Password must be at least 6 characters long"));
        }

        Optional<Users> userOptional = usersRepository.findByPasswordResetToken(resetPasswordDTO.getToken());
        
        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid reset token"));
        }

        Users user = userOptional.get();
        
        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Reset token has expired"));
        }

        // Reset the password
        user.setPassword(passwordEncoder.encode(resetPasswordDTO.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        usersRepository.save(user);

        return ResponseEntity
                .ok()
                .body(Map.of("message", "Password reset successfully"));
    }

    public ResponseEntity<?> resendVerificationEmail(ForgotPasswordDTO emailRequest) {
        if (emailRequest.getEmail() == null || emailRequest.getEmail().trim().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is required"));
        }

        Optional<Users> userOptional = usersRepository.findByEmail(emailRequest.getEmail());
        
        if (userOptional.isEmpty()) {
            // Don't reveal if email exists or not for security
            return ResponseEntity
                    .ok()
                    .body(Map.of("message", "If an account with that email exists and is not verified, a verification email has been sent."));
        }

        Users user = userOptional.get();
        
        if (user.getIsEmailVerified()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is already verified"));
        }

        // Generate new verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        usersRepository.save(user);

        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send verification email"));
        }

        return ResponseEntity
                .ok()
                .body(Map.of("message", "If an account with that email exists and is not verified, a verification email has been sent."));
    }

    public ResponseEntity<?> logout() {
        // Invalidate the cookie by setting it empty and maxAge = 0
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false) // Set to true for production (HTTPS)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Logged out successfully"));
    }
}
