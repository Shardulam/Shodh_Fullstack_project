package com.shodhacode.backend.web;

import com.shodhacode.backend.model.Contest;
import com.shodhacode.backend.model.Submission;
import com.shodhacode.backend.repo.ContestRepository;
import com.shodhacode.backend.repo.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contests")
public class ContestController {
    @Autowired
    private ContestRepository contestRepository;
    @Autowired
    private SubmissionRepository submissionRepository;

    @GetMapping("/{contestId}")
    public ResponseEntity<Contest> getContest(@PathVariable Long contestId) {
        return contestRepository.findById(contestId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{contestId}/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> leaderboard(@PathVariable Long contestId) {
        // simple leaderboard: number of accepted submissions per user
        List<Submission> subs = submissionRepository.findAll();
        Map<String, Long> acceptedCount = subs.stream()
                .filter(s -> s.getContest() != null && Objects.equals(s.getContest().getId(), contestId))
                .filter(s -> s.getStatus() != null && s.getStatus().name().equals("ACCEPTED"))
                .collect(Collectors.groupingBy(Submission::getUsername, Collectors.counting()));

        List<Map<String, Object>> board = acceptedCount.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("username", e.getKey());
                    m.put("score", e.getValue());
                    return m;
                })
                .sorted((a, b) -> Long.compare(((Long) b.get("score")), ((Long) a.get("score"))))
                .collect(Collectors.toList());

        return ResponseEntity.ok(board);
    }
}
