package com.example.surveyer.controller;

import com.example.surveyer.DTO.UserDTO;
import com.example.surveyer.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        Optional<UserDTO> user = userService.getCurrentUser(username);
        
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 