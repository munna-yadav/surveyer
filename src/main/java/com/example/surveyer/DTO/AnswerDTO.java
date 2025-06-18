package com.example.surveyer.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDTO {
    private Long id;
    private Long questionId;
    private String answerText;
    private List<Long> selectedOptionIds;
} 