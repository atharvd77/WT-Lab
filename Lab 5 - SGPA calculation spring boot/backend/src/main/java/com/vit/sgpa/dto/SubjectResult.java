package com.vit.sgpa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResult {
    private String name;
    private Double credits;
    private Double mse;
    private Double ese;
    private Double finalMarks;
    private String grade;
    private Integer gradePoint;
}
