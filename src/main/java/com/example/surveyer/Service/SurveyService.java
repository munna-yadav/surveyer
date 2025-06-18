package com.example.surveyer.Service;

import com.example.surveyer.DTO.*;
import com.example.surveyer.Entity.*;
import com.example.surveyer.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SurveyService {
    
    @Autowired
    private SurveyRepository surveyRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private QuestionOptionRepository questionOptionRepository;
    
    @Autowired
    private UsersRepository usersRepository;
    
    public List<SurveyDTO> getAllSurveys() {
        return surveyRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<SurveyDTO> getSurveysByUser(String username) {
        Optional<Users> user = usersRepository.findByUsername(username);
        if (user.isPresent()) {
            return surveyRepository.findByCreatedByOrderByCreatedAtDesc(user.get())
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
        return List.of();
    }
    
    public Optional<SurveyDTO> getSurveyById(Long id) {
        return surveyRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    public Optional<SurveyDTO> getActiveSurveyById(Long id) {
        return surveyRepository.findActiveById(id)
                .map(this::convertToDTO);
    }
    
    public SurveyDTO createSurvey(SurveyDTO surveyDTO, String username) {
        Optional<Users> user = usersRepository.findByUsername(username);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        Survey survey = new Survey();
        survey.setTitle(surveyDTO.getTitle());
        survey.setDescription(surveyDTO.getDescription());
        survey.setCreatedBy(user.get());
        survey.setIsActive(true);
        
        Survey savedSurvey = surveyRepository.save(survey);
        return convertToDTO(savedSurvey);
    }
    
    public SurveyDTO updateSurvey(Long id, SurveyDTO surveyDTO, String username) {
        Optional<Survey> existingSurvey = surveyRepository.findById(id);
        if (existingSurvey.isEmpty()) {
            throw new RuntimeException("Survey not found");
        }
        
        Survey survey = existingSurvey.get();
        if (!survey.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to update this survey");
        }
        
        survey.setTitle(surveyDTO.getTitle());
        survey.setDescription(surveyDTO.getDescription());
        if (surveyDTO.getIsActive() != null) {
            survey.setIsActive(surveyDTO.getIsActive());
        }
        
        Survey savedSurvey = surveyRepository.save(survey);
        return convertToDTO(savedSurvey);
    }
    
    public void deleteSurvey(Long id, String username) {
        Optional<Survey> existingSurvey = surveyRepository.findById(id);
        if (existingSurvey.isEmpty()) {
            throw new RuntimeException("Survey not found");
        }
        
        Survey survey = existingSurvey.get();
        if (!survey.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this survey");
        }
        
        // Soft delete by setting isActive to false
        survey.setIsActive(false);
        surveyRepository.save(survey);
    }
    
    public SurveyDTO publishSurvey(Long id, String username) {
        Optional<Survey> existingSurvey = surveyRepository.findById(id);
        if (existingSurvey.isEmpty()) {
            throw new RuntimeException("Survey not found");
        }
        
        Survey survey = existingSurvey.get();
        if (!survey.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to publish this survey");
        }
        
        // Validate survey has at least one question
        Long questionCount = questionRepository.countBySurvey(survey);
        if (questionCount == 0) {
            throw new RuntimeException("Cannot publish survey without questions");
        }
        
        survey.setIsActive(true);
        Survey savedSurvey = surveyRepository.save(survey);
        return convertToDTO(savedSurvey);
    }
    
    public Long getSurveyCount(String username) {
        Optional<Users> user = usersRepository.findByUsername(username);
        if (user.isPresent()) {
            return surveyRepository.countByCreatedBy(user.get());
        }
        return 0L;
    }
    
    private SurveyDTO convertToDTO(Survey survey) {
        SurveyDTO dto = new SurveyDTO();
        dto.setId(survey.getId());
        dto.setTitle(survey.getTitle());
        dto.setDescription(survey.getDescription());
        dto.setIsActive(survey.getIsActive());
        dto.setCreatedAt(survey.getCreatedAt());
        dto.setCreatedByUsername(survey.getCreatedBy().getUsername());
        
        // Load questions
        List<Question> questions = questionRepository.findBySurveyOrderByQuestionOrderAsc(survey);
        dto.setQuestions(questions.stream().map(this::convertQuestionToDTO).collect(Collectors.toList()));
        
        return dto;
    }
    
    private QuestionDTO convertQuestionToDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setType(question.getType());
        dto.setQuestionOrder(question.getQuestionOrder());
        
        // Load options
        List<QuestionOption> options = questionOptionRepository.findByQuestion(question);
        dto.setOptions(options.stream().map(this::convertOptionToDTO).collect(Collectors.toList()));
        
        return dto;
    }
    
    private QuestionOptionDTO convertOptionToDTO(QuestionOption option) {
        QuestionOptionDTO dto = new QuestionOptionDTO();
        dto.setId(option.getId());
        dto.setOptionText(option.getOptionText());
        return dto;
    }
} 