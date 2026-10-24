package com.olgax.hr.security;

import com.olgax.hr.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private static final long ACCESS_TOKEN_EXPIRATION_MS =
            15 * 60 * 1000L;

    private final SecretKey signingKey;

    public JwtService() {
        String secret = System.getenv("JWT_SECRET");

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable is not configured"
            );
        }

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must contain at least 32 bytes"
            );
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(
                        now.plusMillis(ACCESS_TOKEN_EXPIRATION_MS)
                ))
                .signWith(signingKey)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, User user) {
        try {
            Claims claims = extractAllClaims(token);

            return claims.getSubject().equals(user.getUsername())
                    && claims.getExpiration().after(new Date())
                    && user.isEnabled();
        } catch (io.jsonwebtoken.JwtException
                 | IllegalArgumentException exception) {
            return false;
        }
    }
}