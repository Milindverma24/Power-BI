package com.aibi.controller;

import com.aibi.domain.ActionItem;
import com.aibi.domain.ActionStatus;
import com.aibi.domain.Comment;
import com.aibi.domain.CommentTargetType;
import com.aibi.domain.User;
import com.aibi.service.CollaborationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collaboration")
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationService collaborationService;

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
}
