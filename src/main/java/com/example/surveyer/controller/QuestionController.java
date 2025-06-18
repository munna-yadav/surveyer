package com.example.surveyer.controller;

import com.example.surveyer.DTO.QuestionDTO;
import com.example.surveyer.DTO.QuestionOptionDTO;
import com.example.surveyer.Service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {
    
    @Autowired
    private QuestionService questionService;
    
    @PostMapping("/survey/{surveyId}")
    public ResponseEntity<QuestionDTO> addQuestionToSurvey(@PathVariable Long surveyId, @RequestBody QuestionDTO questionDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            QuestionDTO createdQuestion = questionService.addQuestionToSurvey(surveyId, questionDTO, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdQuestion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{questionId}")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable Long questionId, @RequestBody QuestionDTO questionDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            QuestionDTO updatedQuestion = questionService.updateQuestion(questionId, questionDTO, username);
            return ResponseEntity.ok(updatedQuestion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId, Authentication authentication) {
        try {
            String username = authentication.getName();
            questionService.deleteQuestion(questionId, username);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{questionId}/options")
    public ResponseEntity<QuestionOptionDTO> addOptionToQuestion(@PathVariable Long questionId, @RequestBody QuestionOptionDTO optionDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            QuestionOptionDTO createdOption = questionService.addOptionToQuestion(questionId, optionDTO, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOption);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/survey/{surveyId}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsBySurvey(@PathVariable Long surveyId) {
        List<QuestionDTO> questions = questionService.getQuestionsBySurvey(surveyId);
        return ResponseEntity.ok(questions);
    }
} 