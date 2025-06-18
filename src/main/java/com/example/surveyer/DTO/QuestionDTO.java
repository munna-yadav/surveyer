package com.example.surveyer.DTO;

import com.example.surveyer.Enum.QuestionType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private Long id;
    private String questionText;
    private QuestionType type;
    private Integer questionOrder;
    private List<QuestionOptionDTO> options;
} 