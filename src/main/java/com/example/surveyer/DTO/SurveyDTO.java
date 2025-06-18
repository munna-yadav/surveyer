package com.example.surveyer.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyDTO {
    private Long id;
    private String title;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String createdByUsername;
    private List<QuestionDTO> questions;
} 