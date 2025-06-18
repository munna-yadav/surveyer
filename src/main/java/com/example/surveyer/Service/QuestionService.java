package com.example.surveyer.Service;

import com.example.surveyer.DTO.QuestionDTO;
import com.example.surveyer.DTO.QuestionOptionDTO;
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
public class QuestionService {
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private QuestionOptionRepository questionOptionRepository;
    
    @Autowired
    private SurveyRepository surveyRepository;
    
    @Autowired
    private UsersRepository usersRepository;
    
    public QuestionDTO addQuestionToSurvey(Long surveyId, QuestionDTO questionDTO, String username) {
        Optional<Survey> survey = surveyRepository.findById(surveyId);
        if (survey.isEmpty()) {
            throw new RuntimeException("Survey not found");
        }
        
        if (!survey.get().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to add questions to this survey");
        }
        
        Question question = new Question();
        question.setSurvey(survey.get());
        question.setQuestionText(questionDTO.getQuestionText());
        question.setType(questionDTO.getType());
        
        // Set question order
        Long questionCount = questionRepository.countBySurvey(survey.get());
        question.setQuestionOrder(questionDTO.getQuestionOrder() != null ? 
                questionDTO.getQuestionOrder() : questionCount.intValue() + 1);
        
        Question savedQuestion = questionRepository.save(question);
        
        // Add options if provided
        if (questionDTO.getOptions() != null && !questionDTO.getOptions().isEmpty()) {
            for (QuestionOptionDTO optionDTO : questionDTO.getOptions()) {
                QuestionOption option = new QuestionOption();
                option.setQuestion(savedQuestion);
                option.setOptionText(optionDTO.getOptionText());
                questionOptionRepository.save(option);
            }
        }
        
        return convertToDTO(savedQuestion);
    }
    
    public QuestionDTO updateQuestion(Long questionId, QuestionDTO questionDTO, String username) {
        Optional<Question> existingQuestion = questionRepository.findById(questionId);
        if (existingQuestion.isEmpty()) {
            throw new RuntimeException("Question not found");
        }
        
        Question question = existingQuestion.get();
        if (!question.getSurvey().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to update this question");
        }
        
        question.setQuestionText(questionDTO.getQuestionText());
        question.setType(questionDTO.getType());
        if (questionDTO.getQuestionOrder() != null) {
            question.setQuestionOrder(questionDTO.getQuestionOrder());
        }
        
        Question savedQuestion = questionRepository.save(question);
        
        // Update options
        if (questionDTO.getOptions() != null) {
            // Remove existing options
            questionOptionRepository.deleteByQuestion(question);
            
            // Add new options
            for (QuestionOptionDTO optionDTO : questionDTO.getOptions()) {
                QuestionOption option = new QuestionOption();
                option.setQuestion(savedQuestion);
                option.setOptionText(optionDTO.getOptionText());
                questionOptionRepository.save(option);
            }
        }
        
        return convertToDTO(savedQuestion);
    }
    
    public void deleteQuestion(Long questionId, String username) {
        Optional<Question> existingQuestion = questionRepository.findById(questionId);
        if (existingQuestion.isEmpty()) {
            throw new RuntimeException("Question not found");
        }
        
        Question question = existingQuestion.get();
        if (!question.getSurvey().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this question");
        }
        
        questionRepository.delete(question);
    }
    
    public List<QuestionDTO> getQuestionsBySurvey(Long surveyId) {
        return questionRepository.findBySurveyIdOrderByQuestionOrderAsc(surveyId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public QuestionOptionDTO addOptionToQuestion(Long questionId, QuestionOptionDTO optionDTO, String username) {
        Optional<Question> question = questionRepository.findById(questionId);
        if (question.isEmpty()) {
            throw new RuntimeException("Question not found");
        }
        
        if (!question.get().getSurvey().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to add options to this question");
        }
        
        QuestionOption option = new QuestionOption();
        option.setQuestion(question.get());
        option.setOptionText(optionDTO.getOptionText());
        
        QuestionOption savedOption = questionOptionRepository.save(option);
        return convertOptionToDTO(savedOption);
    }
    
    private QuestionDTO convertToDTO(Question question) {
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