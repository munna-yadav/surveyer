package com.example.surveyer.controller;

import com.example.surveyer.DTO.LoginDTO;
import com.example.surveyer.Entity.Users;
import com.example.surveyer.Service.AuthService;
import com.example.surveyer.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthService authService;
    @Autowired
    EmailService   emailService;

    @PostMapping("/register")
    public ResponseEntity<?> Register(@RequestBody Users user){
        return authService.register(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> Login(@RequestBody LoginDTO dto){
        return authService.login(dto);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> Logout(){
        return authService.logout();
    }

    @PostMapping("/send-email")
    public void sendEmail(){
        String email = "mail.munna50@gmail.com";
        String token = "fkdfjlkdsjf;alkjfa ";
        emailService.sendVerificationEmail(email,token);
    }
}
