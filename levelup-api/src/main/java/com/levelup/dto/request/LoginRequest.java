package com.levelup.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @Email(message = "Should be a valid email address")
    @NotBlank(message = "Email address is required")
    private String email;
    @NotBlank(message = "Password is required")
    private String password;
}
