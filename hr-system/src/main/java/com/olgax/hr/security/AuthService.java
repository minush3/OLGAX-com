package com.olgax.hr.security;

import com.olgax.hr.dto.LoginRequest;
import com.olgax.hr.dto.LoginResponse;
import com.olgax.hr.model.User;
import com.olgax.hr.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByUsername(request.username().trim())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid username or password"
                        )
                );

        if (!user.isEnabled()
                || !passwordEncoder.matches(
                        request.password(),
                        user.getPasswordHash())) {
            throw new BadCredentialsException(
                    "Invalid username or password"
            );
        }

        String accessToken = jwtService.generateAccessToken(user);

        return new LoginResponse(
                accessToken,
                "Bearer",
                900,
                user.getId(),
                user.getUsername(),
                user.getRole().name()
        );
    }
}