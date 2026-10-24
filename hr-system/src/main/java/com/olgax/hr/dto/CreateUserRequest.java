package com.olgax.hr.dto;

import com.olgax.hr.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
    @NotBlank
    @Size(min = 3, max = 50)
    String username,

    @NotBlank
    @Email
    @Size(max = 254)
    String email,

    @NotBlank
    @Size(min = 12, max = 72)
    String password,

    @NotNull
    Role role
) {}