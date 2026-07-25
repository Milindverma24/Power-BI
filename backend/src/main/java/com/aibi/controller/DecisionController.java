package com.aibi.controller;

import com.aibi.domain.Decision;
import com.aibi.domain.DecisionStatus;
import com.aibi.domain.User;
import com.aibi.service.DecisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/decisions")
@RequiredArgsConstructor
public class DecisionController {

    private final DecisionService decisionService;

    @PostMapping
    public ResponseEntity<Decision> logDecision(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        
        Decision decision = decisionService.logDecision(
                user.getOrganization().getId(),
                user.getId(),
                request.get("title"),
                request.get("rationale"),
                request.get("expectedOutcome"),
                LocalDateTime.parse(request.get("evaluationDate"))
        );
        return ResponseEntity.ok(decision);
    }

    @GetMapping
    public ResponseEntity<List<Decision>> getDecisions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(decisionService.getDecisionsForOrganization(user.getOrganization().getId()));
    }
}
