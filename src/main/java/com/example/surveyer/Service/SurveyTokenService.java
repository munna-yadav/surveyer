package com.example.surveyer.Service;

import com.example.surveyer.DTO.SurveyDTO;
import com.example.surveyer.DTO.SurveyResponseDTO;
import com.example.surveyer.Entity.Survey;
import com.example.surveyer.Entity.SurveyToken;
import com.example.surveyer.Repository.SurveyTokenRepository;
import com.example.surveyer.Repository.SurveyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class SurveyTokenService {
    
    @Autowired
    private SurveyTokenRepository surveyTokenRepository;
    
    @Autowired
    private SurveyRepository surveyRepository;
    
    @Autowired
    private SurveyService surveyService;
    
    @Autowired
    private SurveyResponseService surveyResponseService;
    
    public String generateTokenForSurvey(Long surveyId, String username) {
        Optional<Survey> survey = surveyRepository.findById(surveyId);
        if (survey.isEmpty()) {
            throw new RuntimeException("Survey not found");
        }
        
        if (!survey.get().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to generate token for this survey");
        }
        
        if (!survey.get().getIsActive()) {
            throw new RuntimeException("Cannot generate token for inactive survey");
        }
        
        // Check if token already exists for this survey
        Optional<SurveyToken> existingToken = surveyTokenRepository.findBySurvey(survey.get());
        if (existingToken.isPresent() && existingToken.get().getIsActive() && 
            existingToken.get().getExpiresAt().isAfter(LocalDateTime.now())) {
            return existingToken.get().getToken();
        }
        
        // Generate new token
        String token;
        do {
            token = UUID.randomUUID().toString().replace("-", "");
        } while (surveyTokenRepository.existsByToken(token));
        
        SurveyToken surveyToken = new SurveyToken();
        surveyToken.setToken(token);
        surveyToken.setSurvey(survey.get());
        surveyToken.setIsActive(true);
        
        surveyTokenRepository.save(surveyToken);
        return token;
    }
    
    public Optional<SurveyDTO> getPublicSurvey(String token) {
        Optional<SurveyToken> surveyToken = surveyTokenRepository.findValidToken(token, LocalDateTime.now());
        if (surveyToken.isEmpty()) {
            return Optional.empty();
        }
        
        return surveyService.getActiveSurveyById(surveyToken.get().getSurvey().getId());
    }
    
    public SurveyResponseDTO submitPublicSurveyResponse(String token, SurveyResponseDTO responseDTO) {
        Optional<SurveyToken> surveyToken = surveyTokenRepository.findValidToken(token, LocalDateTime.now());
        if (surveyToken.isEmpty()) {
            throw new RuntimeException("Invalid or expired survey token");
        }
        
        // Set the survey ID from the token
        responseDTO.setSurveyId(surveyToken.get().getSurvey().getId());
        
        return surveyResponseService.submitSurveyResponse(responseDTO);
    }
    
    public void deactivateToken(String token, String username) {
        Optional<SurveyToken> surveyToken = surveyTokenRepository.findByToken(token);
        if (surveyToken.isEmpty()) {
            throw new RuntimeException("Token not found");
        }
        
        if (!surveyToken.get().getSurvey().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to deactivate this token");
        }
        
        SurveyToken tokenEntity = surveyToken.get();
        tokenEntity.setIsActive(false);
        surveyTokenRepository.save(tokenEntity);
    }
} 