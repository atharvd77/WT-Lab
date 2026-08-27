package com.vit.sgpa.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubjectRequest {

    @NotBlank(message = "Subject name is required")
    private String name;

    @NotNull(message = "Credits are required")
    @DecimalMin(value = "0.5", message = "Credits must be at least 0.5")
    @DecimalMax(value = "20", message = "Credits must be at most 20")
    private Double credits;

    @NotNull(message = "MSE marks are required")
    @DecimalMin(value = "0", message = "MSE marks must be between 0 and 100")
    @DecimalMax(value = "100", message = "MSE marks must be between 0 and 100")
    private Double mse;

    @NotNull(message = "ESE marks are required")
    @DecimalMin(value = "0", message = "ESE marks must be between 0 and 100")
    @DecimalMax(value = "100", message = "ESE marks must be between 0 and 100")
    private Double ese;
}
