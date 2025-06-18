package com.example.surveyer.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponseDTO {
    private Long id;
    private Long surveyId;
    private String respondentEmail;
    private LocalDateTime submittedAt;
    private List<AnswerDTO> answers;
} 