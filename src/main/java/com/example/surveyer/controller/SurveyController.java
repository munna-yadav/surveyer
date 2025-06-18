package com.example.surveyer.controller;

import com.example.surveyer.DTO.SurveyDTO;
import com.example.surveyer.Service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/surveys")
@CrossOrigin(origins = "*")
public class SurveyController {
    
    @Autowired
    private SurveyService surveyService;
    
    @GetMapping
    public ResponseEntity<List<SurveyDTO>> getAllSurveys() {
        List<SurveyDTO> surveys = surveyService.getAllSurveys();
        return ResponseEntity.ok(surveys);
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<SurveyDTO>> getMySurveys(Authentication authentication) {
        String username = authentication.getName();
        List<SurveyDTO> surveys = surveyService.getSurveysByUser(username);
        return ResponseEntity.ok(surveys);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SurveyDTO> getSurveyById(@PathVariable Long id) {
        Optional<SurveyDTO> survey = surveyService.getSurveyById(id);
        return survey.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/public")
    public ResponseEntity<SurveyDTO> getActiveSurveyById(@PathVariable Long id) {
        Optional<SurveyDTO> survey = surveyService.getActiveSurveyById(id);
        return survey.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<SurveyDTO> createSurvey(@RequestBody SurveyDTO surveyDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            SurveyDTO createdSurvey = surveyService.createSurvey(surveyDTO, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSurvey);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SurveyDTO> updateSurvey(@PathVariable Long id, @RequestBody SurveyDTO surveyDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            SurveyDTO updatedSurvey = surveyService.updateSurvey(id, surveyDTO, username);
            return ResponseEntity.ok(updatedSurvey);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSurvey(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            surveyService.deleteSurvey(id, username);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/publish")
    public ResponseEntity<SurveyDTO> publishSurvey(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            SurveyDTO publishedSurvey = surveyService.publishSurvey(id, username);
            return ResponseEntity.ok(publishedSurvey);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<Long> getSurveyCount(Authentication authentication) {
        String username = authentication.getName();
        Long count = surveyService.getSurveyCount(username);
        return ResponseEntity.ok(count);
    }
} 