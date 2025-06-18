package com.example.surveyer.Repository;

import com.example.surveyer.Entity.QuestionOption;
import com.example.surveyer.Entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    List<QuestionOption> findByQuestion(Question question);
    List<QuestionOption> findByQuestionId(Long questionId);
    void deleteByQuestion(Question question);
} 