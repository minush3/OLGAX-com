package com.olgax.hr.service;

import com.olgax.hr.dto.CreateUserRequest;
import com.olgax.hr.dto.UpdateUserRequest;
import com.olgax.hr.dto.UserResponse;
import com.olgax.hr.model.User;
import com.olgax.hr.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String username = request.username().trim();
        String email = request.email().trim();

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Username is already taken"
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already registered"
            );
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(
            passwordEncoder.encode(request.password())
        );
        user.setRole(request.role());
        user.setEnabled(true);

        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public UserResponse updateUser(
            Long id,
            UpdateUserRequest request) {

        User user = findUser(id);

        String username = request.username().trim();
        String email = request.email().trim();

        userRepository.findByUsername(username)
            .filter(existing -> !existing.getId().equals(id))
            .ifPresent(existing -> {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username is already taken"
                );
            });

        userRepository.findByEmail(email)
            .filter(existing -> !existing.getId().equals(id))
            .ifPresent(existing -> {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
                );
            });

        user.setUsername(username);
        user.setEmail(email);

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse setUserEnabled(Long id, boolean enabled) {
        User user = findUser(id);
        user.setEnabled(enabled);

        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User not found"
            ));

        return toResponse(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User not found"
            ));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.isEnabled()
        );
    }
}