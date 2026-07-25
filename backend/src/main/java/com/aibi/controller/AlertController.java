package com.aibi.controller;

import com.aibi.domain.DataSource;
import com.aibi.domain.User;
import com.aibi.repository.AnomalyAlertRepository;
import com.aibi.repository.DataSourceRepository;
import com.aibi.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AnomalyAlertRepository alertRepository;
    private final AlertService alertService;
    private final DataSourceRepository dataSourceRepository;

    @GetMapping
    public ResponseEntity<?> getAlerts(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(alertRepository.findByOrganizationIdOrderByCreatedAtDesc(currentUser.getOrganization().getId()));
    }

    @PostMapping("/scan/{dataSourceId}")
    public ResponseEntity<?> triggerScan(@PathVariable UUID dataSourceId, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DataSource dataSource = dataSourceRepository.findById(dataSourceId).orElse(null);
        if (dataSource == null || !dataSource.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Data source not found or access denied.");
        }

        // Trigger scan
        alertService.scanForAnomalies(dataSource);
        
        return ResponseEntity.ok("Scan triggered successfully");
    }
}
