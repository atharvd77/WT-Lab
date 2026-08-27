package com.vit.sgpa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveResultResponse {
    private String message;
    private Long resultId;
    private List<SubjectResult> subjects;
    private Double sgpa;
    private Integer totalCredits;
}
