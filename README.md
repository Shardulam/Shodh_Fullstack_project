# 🏆 Shodh-a-Code Contest Platform

## 🎯Overview

 Shodh-a-Code is a lightweight, real-time coding contest platform designed for educational purposes. Students can join contests using a contest ID, solve programming problems, submit their code, and see their rankings on a live leaderboard. The backend features a robust code execution engine that validates submissions against test cases in a secure, containerized environment.

## 🛠️ Tools & Technologies

### Backend
- **Java 22.0.1** / JDK 17+
- **Spring Boot 3.5.7**
- **Spring Data JPA** (Hibernate 6.6.33)
- **H2 Database** (In-memory)
- **Maven 3.6+** (Build automation)
- **Lombok 1.18.x** (Boilerplate reduction)
- **Jakarta Validation** (Input validation)

### DevOps & Containerization
- **Docker Desktop** (Code execution environment)
- **Docker Images:**
    - `openjdk:17-slim` (Java runtime)
    - `python:3.9-slim` (Python runtime)
    - `gcc:latest` (C++ compiler & runtime)

---

## 🏗️ Architecture

### System Design
```
┌─────────────┐
│   Client    │
│  (Postman)  │
└──────┬──────┘
       │ HTTP REST
       ▼
┌────────────────────────────────┐
│     Spring Boot Backend        │
│  ┌──────────────────────────┐  │
│  │   REST Controllers       │  │
│  └───────────┬──────────────┘  │
│              │                 │
│  ┌───────────▼──────────────┐  │
│  │   Service Layer          │  │
│  │  - ContestService        │  │
│  │  - SubmissionService     │  │
│  │  - CodeJudgeService (@Async)│
│  └───────────┬──────────────┘  │
│              │                 │
│  ┌───────────▼──────────────┐  │
│  │   Repository Layer       │  │
│  │  (Spring Data JPA)       │  │
│  └───────────┬──────────────┘  │
│              │                 │
│  ┌───────────▼──────────────┐  │
│  │   H2 Database (Memory)   │  │
│  └──────────────────────────┘  │
└─────────────┬──────────────────┘
              │
              ▼ ProcessBuilder
    ┌─────────────────────┐
    │   Docker Engine     │
    │  ┌───────────────┐  │
    │  │  Container 1  │  │
    │  │  (Java Code)  │  │
    │  └───────────────┘  │
    │  ┌───────────────┐  │
    │  │  Container 2  │  │
    │  │ (Python Code) │  │
    │  └───────────────┘  │
    │  ┌───────────────┐  │
    │  │  Container 2  │  │
    │  │ (Cpp Code) │  │
    │  └───────────────┘  │
    └─────────────────────┘
```
## 📁 Project Structure
```
shodh-code-backend/
├── src/main/java/com/shodh/contest/
│   ├── config/
│   │   ├── AsyncConfig.java          # Enables async execution
│   │   └── DataInitializer.java      # Seeds sample data
│   ├── controller/
│   │   ├── ContestController.java
│   │   ├── ProblemController.java
│   │   ├── SubmissionController.java
│   │   └── UserController.java
│   ├── dto/                          # Data Transfer Objects
│   ├── model/                        # JPA Entities
│   │   ├── Contest.java
│   │   ├── CodingProblem.java
│   │   ├── Submission.java
│   │   ├── TestCase.java
│   │   └── User.java
│   ├── repository/                   # Spring Data JPA
│   ├── service/
│   │   ├── CodeJudgeService.java    # Docker execution engine
│   │   ├── SubmissionService.java
│   │   └── LeaderboardService.java
│   └── ShodhCodeBackendApplication.java
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── README.md
```
## Basic Execution Flow:

There are 4 main APIs in this microservice:

### 1. `/api/contests/{contestId}`
* This API accepts contestId and returns contest details along with list of problems.
* Response includes contest name, description, start/end time, and associated problems.

### 2. `/api/users/join`
* This API accepts payload that includes contestId and username.
* Creates a new user or retrieves existing user and returns userId.
* This userId is used for submitting code solutions.

### 3. `/api/submissions`
* This API accepts payload including userId, contestId, problemId, code, and language.
* Saves the submission to database with `PENDING` status and returns submissionId.
* Triggers asynchronous code execution in Docker container.
* There is a background async job that:
    * Picks pending submissions
    * Creates temporary file with user code
    * Launches Docker container with resource limits (CPU, memory, time)
    * Runs code against all test cases
    * Captures output and compares with expected results
    * Updates submission status to `ACCEPTED`, `WRONG_ANSWER`, `RUNTIME_ERROR`, etc.
    * Cleans up temporary files and containers

### 4. `/api/submissions/{submissionId}`
* This API returns the current status and result of a submission using submissionId.
* Client polls this endpoint every 2-3 seconds to check if code execution completed.
* Returns status like `PENDING`, `RUNNING`, `ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, etc.

### 5. `/api/contests/{contestId}/leaderboard`
* This API returns the live leaderboard for a contest.
* Calculates scores based on accepted submissions and problems solved.
* Returns ranked list of participants with their scores.

---
