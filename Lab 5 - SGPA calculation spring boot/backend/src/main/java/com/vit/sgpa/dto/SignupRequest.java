package com.vit.sgpa.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "A valid email address is required")
    private String email;

    // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
        message = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character"
    )
    private String password;

    private String regNo;
}
