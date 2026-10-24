# ==============================================================================
# Multi-stage Dockerfile for Spring Boot Application (hr-system)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build stage with OpenJDK 21 & Gradle wrapper
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app

# Copy Gradle wrapper and configuration files first for layer caching
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle settings.gradle ./

# Fix Windows CRLF line endings on gradlew and make it executable
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Copy application source code
COPY src ./src

# Build production executable JAR (skipping unit tests during Docker image build)
# And copy the non-plain runnable jar as app.jar
RUN ./gradlew bootJar --no-daemon -x test && \
    cp $(find build/libs -name "*.jar" ! -name "*-plain.jar" | head -n 1) /app/app.jar

# ------------------------------------------------------------------------------
# Stage 2: Lightweight runtime stage with OpenJDK 21 JRE
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app

# Security best practice: Run as a non-privileged user
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copy built JAR from builder stage
COPY --from=builder --chown=spring:spring /app/app.jar /app/app.jar

# Expose Spring Boot server port
EXPOSE 8080

# Configure JVM flags and launch application
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
