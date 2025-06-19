package com.example.surveyer.DTO;

import lombok.Data;

@Data
public class ResetPasswordDTO {
    private String token;
    private String newPassword;
} 