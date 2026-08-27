package com.vit.sgpa.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CalculateRequest {

    private String semesterLabel = "Semester";

    @NotEmpty(message = "At least one subject is required")
    @Valid
    private List<SubjectRequest> subjects;
}
