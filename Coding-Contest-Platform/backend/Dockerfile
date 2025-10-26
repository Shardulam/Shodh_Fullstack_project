# Use official Java 17 JDK image (matches project's target java.version)
### Multi-stage Dockerfile
### 1) Build stage: use an official Maven image to build the project (produces the jar)
### 2) Runtime stage: copy the built jar into a smaller JRE image

# ---- Build stage ----
FROM maven:3.9-jdk-17 AS builder
WORKDIR /workspace

# Copy only the files required for a build and run Maven (this leverages Docker layer caching)
COPY pom.xml .
COPY src ./src

# Package the application (skip tests to make builds faster; remove -DskipTests in CI if you want test run)
RUN mvn -B package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the jar produced by the build stage into the runtime image
COPY --from=builder /workspace/target/contest-backend-0.1.0.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java","-jar","app.jar"]
