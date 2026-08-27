package com.vit.sgpa.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vit.sgpa.dto.*;
import com.vit.sgpa.entity.Result;
import com.vit.sgpa.entity.User;
import com.vit.sgpa.exception.ApiException;
import com.vit.sgpa.repository.ResultRepository;
import com.vit.sgpa.repository.UserRepository;
import com.vit.sgpa.util.GradeCalculator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResultService {

    private final GradeCalculator gradeCalculator;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ResultService(GradeCalculator gradeCalculator, ResultRepository resultRepository, UserRepository userRepository) {
        this.gradeCalculator = gradeCalculator;
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
    }

    public ResultResponse calculate(CalculateRequest request) {
        return gradeCalculator.calculateResult(request.getSubjects());
    }

    public SaveResultResponse save(Long userId, CalculateRequest request) {
        ResultResponse computed = gradeCalculator.calculateResult(request.getSubjects());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.NOT_FOUND));

        Result result = new Result();
        result.setUser(user);
        result.setSemesterLabel(request.getSemesterLabel());
        result.setSgpa(BigDecimal.valueOf(computed.getSgpa()));
        result.setTotalCredits(computed.getTotalCredits());

        try {
            result.setSubjectsJson(objectMapper.writeValueAsString(computed.getSubjects()));
        } catch (Exception e) {
            throw new ApiException("Failed to serialize subjects.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Result saved = resultRepository.save(result);

        return new SaveResultResponse(
                "Result saved successfully.",
                saved.getId(),
                computed.getSubjects(),
                computed.getSgpa(),
                computed.getTotalCredits()
        );
    }

    public List<ResultHistoryItem> history(Long userId) {
        List<Result> results = resultRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return results.stream().map(r -> {
            List<SubjectResult> subjects;
            try {
                subjects = objectMapper.readValue(r.getSubjectsJson(), new TypeReference<List<SubjectResult>>() {});
            } catch (Exception e) {
                subjects = List.of();
            }

            return new ResultHistoryItem(
                    r.getId(),
                    r.getSemesterLabel(),
                    r.getSgpa().doubleValue(),
                    r.getTotalCredits(),
                    subjects,
                    r.getCreatedAt()
            );
        }).collect(Collectors.toList());
    }
}
