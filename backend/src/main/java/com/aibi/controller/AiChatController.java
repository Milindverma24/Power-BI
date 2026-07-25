package com.aibi.controller;

import com.aibi.domain.User;
import com.aibi.dto.ChatRequest;
import com.aibi.repository.DataSourceRepository;
import com.aibi.service.AiSqlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiSqlService aiSqlService;
    private final DataSourceRepository dataSourceRepository;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("User is not assigned to an organization.");
        }

        // Verify the user's organization owns the requested dataset
        var dataSource = dataSourceRepository.findById(request.getDataSourceId()).orElse(null);
        if (dataSource == null || !dataSource.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("You do not have permission to access this dataset.");
        }

        try {
            Object response = aiSqlService.chatWithData(dataSource, request.getMessage());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Chat failed: " + e.getMessage());
        }
    }
}
