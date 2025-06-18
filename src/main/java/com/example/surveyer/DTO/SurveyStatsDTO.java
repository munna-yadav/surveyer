package com.example.surveyer.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyStatsDTO {
    private Long surveyId;
    private String surveyTitle;
    private Long totalResponses;
    private Long totalQuestions;
    private Boolean isActive;
} 