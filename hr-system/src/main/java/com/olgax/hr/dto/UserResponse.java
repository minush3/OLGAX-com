package com.olgax.hr.dto;

import com.olgax.hr.model.Role;

public record UserResponse(
    Long id,
    String username,
    String email,
    Role role,
    boolean enabled
) {}