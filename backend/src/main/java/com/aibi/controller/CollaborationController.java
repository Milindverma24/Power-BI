package com.aibi.controller;

import com.aibi.domain.*;
import com.aibi.repository.DashboardVersionRepository;
import com.aibi.repository.DecisionRepository;
import com.aibi.service.CollaborationService;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collaboration")
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationService collaborationService;
    private final DashboardVersionRepository versionRepository;
    private final DecisionRepository decisionRepository;
    private final ChatLanguageModel chatLanguageModel;

    @PostMapping("/comments")
    public ResponseEntity<Comment> addComment(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        
        Comment comment = collaborationService.addComment(
                user.getId(),
                CommentTargetType.valueOf(request.get("targetType")),
                UUID.fromString(request.get("targetId")),
                request.get("content")
        );
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/comments/{targetType}/{targetId}")
    public ResponseEntity<List<Comment>> getComments(
            @PathVariable CommentTargetType targetType,
            @PathVariable UUID targetId) {
        return ResponseEntity.ok(collaborationService.getComments(targetId, targetType));
    }

    @PostMapping("/actions")
    public ResponseEntity<ActionItem> createActionItem(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        
        UUID assignedTo = request.containsKey("assignedTo") ? UUID.fromString(request.get("assignedTo")) : null;
        UUID targetId = request.containsKey("targetId") ? UUID.fromString(request.get("targetId")) : null;
        CommentTargetType targetType = request.containsKey("targetType") ? CommentTargetType.valueOf(request.get("targetType")) : null;

        ActionItem action = collaborationService.createActionItem(
                request.get("title"),
                assignedTo,
                user.getId(),
                targetType,
                targetId
        );
        return ResponseEntity.ok(action);
    }

    @GetMapping("/actions")
    public ResponseEntity<List<ActionItem>> getMyActions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(collaborationService.getUserActionItems(user.getId()));
    }

    @PatchMapping("/actions/{actionId}/status")
    public ResponseEntity<ActionItem> updateActionStatus(
            @PathVariable UUID actionId,
            @RequestBody Map<String, String> request) {
        
        ActionStatus status = ActionStatus.valueOf(request.get("status"));
        return ResponseEntity.ok(collaborationService.updateActionItemStatus(actionId, status));
    }

    @GetMapping("/versions")
    public ResponseEntity<List<DashboardVersion>> getVersions(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) return ResponseEntity.badRequest().build();
        List<DashboardVersion> versions = versionRepository.findAll().stream()
            .filter(v -> v.getDashboard() != null && v.getDashboard().getOrganization().getId().equals(currentUser.getOrganization().getId()))
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .toList();
        return ResponseEntity.ok(versions);
    }

    @GetMapping("/decisions")
    public ResponseEntity<List<Decision>> getDecisions(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) return ResponseEntity.badRequest().build();
        List<Decision> decisions = decisionRepository.findByOrganizationIdOrderByCreatedAtDesc(currentUser.getOrganization().getId());
        return ResponseEntity.ok(decisions);
    }

    @PostMapping("/decisions")
    public ResponseEntity<Decision> logDecision(@AuthenticationPrincipal User currentUser, @RequestBody Decision decision) {
        if (currentUser.getOrganization() == null) return ResponseEntity.badRequest().build();
        
        decision.setOrganization(currentUser.getOrganization());
        decision.setCreatedBy(currentUser);
        decision.setEvaluationDate(LocalDateTime.now().plusDays(14)); 
        
        if (decision.getStatus() == null) {
            decision.setStatus(DecisionStatus.PENDING_EVALUATION);
        }

        try {
            String prompt = "You are a business AI evaluating a decision. Decision: " + decision.getRationale() + ". Provide a very short (2-5 words) estimated outcome (e.g. '+12% Lead Velocity').";
            String estimatedOutcome = chatLanguageModel.generate(prompt);
            decision.setExpectedOutcome(estimatedOutcome);
        } catch (Exception e) {
            decision.setExpectedOutcome("Pending AI measurement");
        }

        return ResponseEntity.ok(decisionRepository.save(decision));
    }
}
