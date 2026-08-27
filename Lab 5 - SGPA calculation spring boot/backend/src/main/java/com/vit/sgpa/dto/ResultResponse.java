package com.vit.sgpa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultResponse {
    private List<SubjectResult> subjects;
    private Double sgpa;
    private Integer totalCredits;
}
