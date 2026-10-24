package com.olgax.hr.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String username,
        String role
) {
}