package com.example.surveyer.Repository;

import com.example.surveyer.Entity.SurveyToken;
import com.example.surveyer.Entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SurveyTokenRepository extends JpaRepository<SurveyToken, Long> {
    Optional<SurveyToken> findByToken(String token);
    Optional<SurveyToken> findBySurvey(Survey survey);
    
    @Query("SELECT st FROM SurveyToken st WHERE st.token = :token AND st.isActive = true AND st.expiresAt > :now")
    Optional<SurveyToken> findValidToken(@Param("token") String token, @Param("now") LocalDateTime now);
    
    boolean existsByToken(String token);
} 