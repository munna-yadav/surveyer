package com.example.surveyer.Repository;

import com.example.surveyer.Entity.SurveyResponse;
import com.example.surveyer.Entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {
    List<SurveyResponse> findBySurveyOrderBySubmittedAtDesc(Survey survey);
    List<SurveyResponse> findBySurveyIdOrderBySubmittedAtDesc(Long surveyId);
    Optional<SurveyResponse> findBySurveyAndRespondentEmail(Survey survey, String respondentEmail);
    
    @Query("SELECT COUNT(sr) FROM SurveyResponse sr WHERE sr.survey = :survey")
    Long countBySurvey(@Param("survey") Survey survey);
    
    @Query("SELECT COUNT(sr) FROM SurveyResponse sr WHERE sr.survey.id = :surveyId")
    Long countBySurveyId(@Param("surveyId") Long surveyId);
    
    boolean existsBySurveyAndRespondentEmail(Survey survey, String respondentEmail);
} 