# Use official Java 21 JDK image
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy the jar file into the container
COPY target/contest-backend-0.1.0.jar app.jar

# Expose the port your app runs on
EXPOSE 8081

# Run the jar
ENTRYPOINT ["java","-jar","app.jar"]
