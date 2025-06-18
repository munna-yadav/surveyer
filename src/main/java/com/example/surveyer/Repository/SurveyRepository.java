package com.example.surveyer.Repository;

import com.example.surveyer.Entity.Survey;
import com.example.surveyer.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SurveyRepository extends JpaRepository<Survey, Long> {
    List<Survey> findByCreatedByOrderByCreatedAtDesc(Users createdBy);
    List<Survey> findByIsActiveTrueOrderByCreatedAtDesc();
    List<Survey> findByIsActiveOrderByCreatedAtDesc(Boolean isActive);
    
    @Query("SELECT s FROM Survey s WHERE s.isActive = true AND s.id = :id")
    Optional<Survey> findActiveById(@Param("id") Long id);
    
    @Query("SELECT COUNT(s) FROM Survey s WHERE s.createdBy = :user")
    Long countByCreatedBy(@Param("user") Users user);
} 