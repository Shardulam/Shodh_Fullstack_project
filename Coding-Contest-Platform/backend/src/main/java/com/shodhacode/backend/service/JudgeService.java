package com.shodhacode.backend.service;

import com.shodhacode.backend.model.*;
import com.shodhacode.backend.repo.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

@Service
public class JudgeService {

    private final SubmissionRepository submissionRepository;
    private ExecutorService executor;
    private final RestTemplate restTemplate = new RestTemplate();

    // Judge0 API URL (self-hosted or public CE)
    private static final String JUDGE0_BASE_URL = "https://ce.judge0.com";
 // replace if self-hosted
    private final String RAPIDAPI_KEY = ""; // optional if using RapidAPI

    @Autowired
    public JudgeService(SubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    @PostConstruct
    public void init() {
        this.executor = Executors.newFixedThreadPool(4);
    }

    public Submission submitForJudging(Submission submission) {
        submission.setStatus(SubmissionStatus.PENDING);
        Submission saved = submissionRepository.save(submission);
        Long id = saved.getId();
        executor.submit(() -> processSubmission(id));
        return saved;
    }

    private void processSubmission(Long submissionId) {
        Optional<Submission> maybe = submissionRepository.findById(submissionId);
        if (maybe.isEmpty()) return;

        Submission submission = maybe.get();
        submission.setStatus(SubmissionStatus.RUNNING);
        submissionRepository.save(submission);

        Problem problem = submission.getProblem();
        if (problem == null) {
            submission.setStatus(SubmissionStatus.ERROR);
            submission.setResultMessage("Problem not found");
            submission.setFinishedAt(Instant.now());
            submissionRepository.save(submission);
            return;
        }

        List<TestCase> testCases = problem.getTestCases();
        boolean allPassed = true;
        StringBuilder resultLog = new StringBuilder();

        for (int i = 0; i < testCases.size(); i++) {
            TestCase tc = testCases.get(i);

            try {
            	int languageId = mapLanguageToJudge0Id(submission.getLanguage());
            	String output = runOnJudge0(submission.getCode(), submission.getLanguage(), tc.getInputData());



                resultLog.append("TC #").append(i + 1).append(" output:\n").append(output).append("\n");

                if (!normalize(output).equals(normalize(tc.getExpectedOutput()))) {
                    allPassed = false;
                    submission.setStatus(SubmissionStatus.WRONG_ANSWER);
                    submission.setResultMessage("Wrong answer on testcase " + (i + 1) + "\n" + resultLog.toString());
                    submission.setFinishedAt(Instant.now());
                    submissionRepository.save(submission);
                    return;
                }
            } catch (TimeoutException e) {
                submission.setStatus(SubmissionStatus.TIMED_OUT);
                submission.setResultMessage("Timed out during execution");
                submission.setFinishedAt(Instant.now());
                submissionRepository.save(submission);
                return;
            } catch (Exception e) {
                submission.setStatus(SubmissionStatus.ERROR);
                submission.setResultMessage("Execution error: " + e.getMessage());
                submission.setFinishedAt(Instant.now());
                submissionRepository.save(submission);
                return;
            }
        }

        if (allPassed) {
            submission.setStatus(SubmissionStatus.ACCEPTED);
            submission.setResultMessage("All tests passed\n" + resultLog.toString());
            submission.setFinishedAt(Instant.now());
            submissionRepository.save(submission);
        }
    }

    /**
     * Runs code on Judge0 API and returns stdout/stderr/compile errors
     */
    private String runOnJudge0(String sourceCode, String language, String input) throws Exception {
        // Map language to Judge0 ID
        int languageId = switch (language.toLowerCase()) {
            case "java" -> 62; // ✅ Correct Java ID for Judge0 CE
            case "python", "python3" -> 71;
            case "cpp", "c++" -> 54;
            case "c" -> 50;
            default -> 62;
        };

        // ✅ Encode in Base64
        String encodedSource = Base64.getEncoder().encodeToString(sourceCode.getBytes(StandardCharsets.UTF_8));
        String encodedInput = Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));

        // ✅ Build request body
        Map<String, Object> body = new HashMap<>();
        body.put("source_code", encodedSource);
        body.put("language_id", languageId);
        body.put("stdin", encodedInput);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        // ✅ Correct URL
        String url = "https://ce.judge0.com/submissions?base64_encoded=true&wait=true";

        // ✅ Run request in executor (15 sec timeout)
        Future<String> future = executor.submit(() -> {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getBody() == null)
                return "Error: Empty response from Judge0";

            Map<String, Object> result = response.getBody();

            // ✅ Decode Base64 fields safely
            String stdout = decodeBase64((String) result.get("stdout"));
            String stderr = decodeBase64((String) result.get("stderr"));
            String compileOutput = decodeBase64((String) result.get("compile_output"));

            if (!compileOutput.isEmpty()) return "Compilation Error:\n" + compileOutput;
            if (!stderr.isEmpty()) return "Runtime Error:\n" + stderr;
            return stdout.isEmpty() ? "No output" : stdout.trim();
        });

        return future.get(15, TimeUnit.SECONDS);
    }

    private String decodeBase64(String encoded) {
        if (encoded == null || encoded.isEmpty()) return "";
        try {
            return new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            return encoded; // fallback if not base64
        }
    }




    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().replaceAll("\r\n", "\n");
    }
    
    private int mapLanguageToJudge0Id(String language) {
        if (language == null) return 52; // default Java
        return switch (language.toLowerCase()) {
            case "java" -> 52;
            case "python" -> 71;
            case "c++", "cpp" -> 54;
            case "c" -> 50;
            // add more languages if needed
            default -> 52; // fallback to Java
        };
    }

}
