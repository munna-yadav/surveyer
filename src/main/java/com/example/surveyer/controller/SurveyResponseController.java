package com.example.surveyer.controller;

import com.example.surveyer.DTO.AnswerDTO;
import com.example.surveyer.DTO.SurveyResponseDTO;
import com.example.surveyer.Service.SurveyResponseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/responses")
@CrossOrigin(origins = "*")
public class SurveyResponseController {
    
    @Autowired
    private SurveyResponseService surveyResponseService;
    
    @PostMapping("/submit")
    public ResponseEntity<SurveyResponseDTO> submitSurveyResponse(@RequestBody SurveyResponseDTO responseDTO) {
        try {
            SurveyResponseDTO submittedResponse = surveyResponseService.submitSurveyResponse(responseDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(submittedResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/survey/{surveyId}")
    public ResponseEntity<List<SurveyResponseDTO>> getResponsesBySurvey(@PathVariable Long surveyId, Authentication authentication) {
        try {
            String username = authentication.getName();
            List<SurveyResponseDTO> responses = surveyResponseService.getResponsesBySurvey(surveyId, username);
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{responseId}")
    public ResponseEntity<SurveyResponseDTO> getResponseById(@PathVariable Long responseId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<SurveyResponseDTO> response = surveyResponseService.getResponseById(responseId, username);
            return response.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/survey/{surveyId}/count")
    public ResponseEntity<Long> getResponseCount(@PathVariable Long surveyId) {
        Long count = surveyResponseService.getResponseCount(surveyId);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/question/{questionId}/answers")
    public ResponseEntity<List<AnswerDTO>> getAnswersByQuestion(@PathVariable Long questionId, Authentication authentication) {
        try {
            String username = authentication.getName();
            List<AnswerDTO> answers = surveyResponseService.getAnswersByQuestion(questionId, username);
            return ResponseEntity.ok(answers);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 