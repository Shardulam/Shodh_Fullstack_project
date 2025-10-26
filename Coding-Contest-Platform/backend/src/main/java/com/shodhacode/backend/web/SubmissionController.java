package com.shodhacode.backend.web;

import com.shodhacode.backend.model.*;
import com.shodhacode.backend.repo.ContestRepository;
import com.shodhacode.backend.repo.ProblemRepository;
import com.shodhacode.backend.repo.SubmissionRepository;
import com.shodhacode.backend.repo.UserRepository;
import com.shodhacode.backend.service.JudgeService;
import com.shodhacode.backend.web.dto.SubmissionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private ContestRepository contestRepository;
    @Autowired
    private ProblemRepository problemRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JudgeService judgeService;

    @PostMapping
    public ResponseEntity<?> createSubmission(@RequestBody SubmissionRequest req) {
        try {
            if (req == null)
                return ResponseEntity.badRequest().body("Missing request body");
            if (req.getContestId() == null)
                return ResponseEntity.badRequest().body("contestId is required");
            if (req.getProblemId() == null)
                return ResponseEntity.badRequest().body("problemId is required");
            if (req.getUsername() == null || req.getUsername().isBlank())
                return ResponseEntity.badRequest().body("username is required");
            if (req.getCode() == null || req.getCode().isBlank())
                return ResponseEntity.badRequest().body("code is required");

            Optional<Contest> contest = contestRepository.findById(req.getContestId());
            if (contest.isEmpty())
                return ResponseEntity.badRequest().body("Contest not found");
            Optional<Problem> problem = problemRepository.findById(req.getProblemId());
            if (problem.isEmpty())
                return ResponseEntity.badRequest().body("Problem not found");

            User user = userRepository.findByUsername(req.getUsername())
                    .orElseGet(() -> userRepository.save(new User(req.getUsername())));

            Submission s = new Submission();
            s.setContest(contest.get());
            s.setProblem(problem.get());
            s.setUsername(user.getUsername());
            s.setCode(req.getCode());
            s.setLanguage(req.getLanguage());

            Submission saved = submissionRepository.save(s);
            // submit to judge async
            judgeService.submitForJudging(saved);

            return ResponseEntity.ok().body(saved.getId());
        } catch (Exception ex) {
            // log stack trace to stderr for debugging
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + ex.getMessage());
        }
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<?> getSubmission(@PathVariable Long submissionId) {
        return submissionRepository.findById(submissionId).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
