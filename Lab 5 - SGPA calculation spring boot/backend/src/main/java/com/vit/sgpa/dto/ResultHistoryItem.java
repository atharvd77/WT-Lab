package com.vit.sgpa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultHistoryItem {
    private Long id;
    private String semesterLabel;
    private Double sgpa;
    private Integer totalCredits;
    private List<SubjectResult> subjects;
    private LocalDateTime createdAt;
}
