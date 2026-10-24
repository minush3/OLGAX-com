
package com.olgax.hr.security;

import com.olgax.hr.model.Role;
import com.olgax.hr.model.User;
import com.olgax.hr.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminSetup implements ApplicationRunner {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AdminSetup(
            UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String username = System.getenv("INITIAL_ADMIN_USERNAME");
        String email = System.getenv("INITIAL_ADMIN_EMAIL");
        String password = System.getenv("INITIAL_ADMIN_PASSWORD");

        // If an admin already exists, do not create another one.
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }

        if (isBlank(username) || isBlank(email) || isBlank(password)) {
            throw new IllegalStateException(
                    "Initial admin is missing. Configure INITIAL_ADMIN_USERNAME, "
                    + "INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD."
            );
        }

        if (password.length() < 12) {
            throw new IllegalStateException(
                    "INITIAL_ADMIN_PASSWORD must be at least 12 characters long."
            );
        }

        if (userRepository.existsByUsername(username)
                || userRepository.existsByEmail(email)) {
            throw new IllegalStateException(
                    "The initial admin username or email is already registered."
            );
        }

        User admin = new User();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
