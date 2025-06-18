package com.example.surveyer.Service;

import com.example.surveyer.DTO.*;
import com.example.surveyer.Entity.*;
import com.example.surveyer.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SurveyResponseService {
    
    @Autowired
    private SurveyResponseRepository surveyResponseRepository;
    
    @Autowired
    private AnswerRepository answerRepository;
    
    @Autowired
    private SurveyRepository surveyRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    public SurveyResponseDTO submitSurveyResponse(SurveyResponseDTO responseDTO) {
        Optional<Survey> survey = surveyRepository.findActiveById(responseDTO.getSurveyId());
        if (survey.isEmpty()) {
            throw new RuntimeException("Survey not found or inactive");
        }
        
        // Check if response already exists for this email
        if (surveyResponseRepository.existsBySurveyAndRespondentEmail(survey.get(), responseDTO.getRespondentEmail())) {
            throw new RuntimeException("Response already submitted for this email");
        }
        
        SurveyResponse surveyResponse = new SurveyResponse();
        surveyResponse.setSurvey(survey.get());
        surveyResponse.setRespondentEmail(responseDTO.getRespondentEmail());
        
        SurveyResponse savedResponse = surveyResponseRepository.save(surveyResponse);
        
        // Save answers
        if (responseDTO.getAnswers() != null) {
            for (AnswerDTO answerDTO : responseDTO.getAnswers()) {
                Optional<Question> question = questionRepository.findById(answerDTO.getQuestionId());
                if (question.isPresent()) {
                    Answer answer = new Answer();
                    answer.setSurveyResponse(savedResponse);
                    answer.setQuestion(question.get());
                    answer.setAnswerText(answerDTO.getAnswerText());
                    
                    // Handle multiple choice selections
                    if (answerDTO.getSelectedOptionIds() != null && !answerDTO.getSelectedOptionIds().isEmpty()) {
                        String selectedOptions = answerDTO.getSelectedOptionIds().stream()
                                .map(String::valueOf)
                                .collect(Collectors.joining(","));
                        answer.setSelectedOptions(selectedOptions);
                    }
                    
                    answerRepository.save(answer);
                }
            }
        }
        
        return convertToDTO(savedResponse);
    }
    
    public List<SurveyResponseDTO> getResponsesBySurvey(Long surveyId, String username) {
        Optional<Survey> survey = surveyRepository.findById(surveyId);
        if (survey.isEmpty()) {
            throw new RuntimeException("Survey not found");
        }
        
        if (!survey.get().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to view responses for this survey");
        }
        
        return surveyResponseRepository.findBySurveyIdOrderBySubmittedAtDesc(surveyId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<SurveyResponseDTO> getResponseById(Long responseId, String username) {
        Optional<SurveyResponse> response = surveyResponseRepository.findById(responseId);
        if (response.isEmpty()) {
            return Optional.empty();
        }
        
        if (!response.get().getSurvey().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to view this response");
        }
        
        return Optional.of(convertToDTO(response.get()));
    }
    
    public Long getResponseCount(Long surveyId) {
        return surveyResponseRepository.countBySurveyId(surveyId);
    }
    
    public List<AnswerDTO> getAnswersByQuestion(Long questionId, String username) {
        Optional<Question> question = questionRepository.findById(questionId);
        if (question.isEmpty()) {
            throw new RuntimeException("Question not found");
        }
        
        if (!question.get().getSurvey().getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to view answers for this question");
        }
        
        return answerRepository.findByQuestionId(questionId)
                .stream()
                .map(this::convertAnswerToDTO)
                .collect(Collectors.toList());
    }
    
    private SurveyResponseDTO convertToDTO(SurveyResponse surveyResponse) {
        SurveyResponseDTO dto = new SurveyResponseDTO();
        dto.setId(surveyResponse.getId());
        dto.setSurveyId(surveyResponse.getSurvey().getId());
        dto.setRespondentEmail(surveyResponse.getRespondentEmail());
        dto.setSubmittedAt(surveyResponse.getSubmittedAt());
        
        // Load answers
        List<Answer> answers = answerRepository.findBySurveyResponse(surveyResponse);
        dto.setAnswers(answers.stream().map(this::convertAnswerToDTO).collect(Collectors.toList()));
        
        return dto;
    }
    
    private AnswerDTO convertAnswerToDTO(Answer answer) {
        AnswerDTO dto = new AnswerDTO();
        dto.setId(answer.getId());
        dto.setQuestionId(answer.getQuestion().getId());
        dto.setAnswerText(answer.getAnswerText());
        
        // Parse selected options
        if (answer.getSelectedOptions() != null && !answer.getSelectedOptions().isEmpty()) {
            List<Long> selectedIds = Arrays.stream(answer.getSelectedOptions().split(","))
                    .map(Long::valueOf)
                    .collect(Collectors.toList());
            dto.setSelectedOptionIds(selectedIds);
        }
        
        return dto;
    }
}