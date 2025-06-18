package com.example.surveyer.Repository;

import com.example.surveyer.Entity.Answer;
import com.example.surveyer.Entity.SurveyResponse;
import com.example.surveyer.Entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findBySurveyResponse(SurveyResponse surveyResponse);
    List<Answer> findByQuestion(Question question);
    
    @Query("SELECT a FROM Answer a WHERE a.surveyResponse.survey.id = :surveyId")
    List<Answer> findBySurveyId(@Param("surveyId") Long surveyId);
    
    @Query("SELECT a FROM Answer a WHERE a.question.id = :questionId")
    List<Answer> findByQuestionId(@Param("questionId") Long questionId);
} 