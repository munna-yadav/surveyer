package com.example.surveyer.Repository;

import com.example.surveyer.Entity.Question;
import com.example.surveyer.Entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findBySurveyOrderByQuestionOrderAsc(Survey survey);
    List<Question> findBySurveyIdOrderByQuestionOrderAsc(Long surveyId);
    
    @Query("SELECT q FROM Question q WHERE q.survey.id = :surveyId ORDER BY q.questionOrder ASC")
    List<Question> findBySurveyIdOrderByOrder(@Param("surveyId") Long surveyId);
    
    @Query("SELECT COUNT(q) FROM Question q WHERE q.survey = :survey")
    Long countBySurvey(@Param("survey") Survey survey);
} 