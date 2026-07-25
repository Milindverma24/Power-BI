package com.aibi.controller;

import com.aibi.domain.DataSource;
import com.aibi.domain.User;
import com.aibi.repository.DataSourceRepository;
import com.aibi.service.RootCauseService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/root-cause")
@RequiredArgsConstructor
@Slf4j
public class RootCauseController {

    private final RootCauseService rootCauseService;
    private final DataSourceRepository dataSourceRepository;

    @Data
    public static class RootCauseRequest {
        private String query;
    }

    @PostMapping("/explore/{dataSourceId}")
    public ResponseEntity<?> exploreRootCause(@PathVariable UUID dataSourceId, 
                                              @RequestBody RootCauseRequest request, 
                                              @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DataSource dataSource = dataSourceRepository.findById(dataSourceId).orElse(null);
        if (dataSource == null || !dataSource.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Data source not found or access denied.");
        }

        try {
            RootCauseService.RootCauseNode tree = rootCauseService.exploreRootCause(dataSource, request.getQuery());
            return ResponseEntity.ok(tree);
        } catch (Exception e) {
            log.error("Failed to generate root cause tree", e);
            return ResponseEntity.internalServerError().body("Failed to generate root cause tree");
        }
    }
}
