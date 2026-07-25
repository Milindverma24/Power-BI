package com.aibi.controller;

import com.aibi.domain.DashboardWidget;
import com.aibi.domain.User;
import com.aibi.repository.DashboardWidgetRepository;
import com.aibi.service.ChartExplanationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/explain")
@RequiredArgsConstructor
@Slf4j
public class ChartExplanationController {

    private final ChartExplanationService chartExplanationService;
    private final DashboardWidgetRepository widgetRepository;

    @GetMapping("/{widgetId}")
    public ResponseEntity<?> explainChart(@PathVariable UUID widgetId, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DashboardWidget widget = widgetRepository.findById(widgetId).orElse(null);
        if (widget == null || !widget.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Widget not found or access denied.");
        }

        try {
            ChartExplanationService.ExplainabilityReport report = chartExplanationService.explainChart(widget);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Failed to explain chart", e);
            return ResponseEntity.internalServerError().body("Failed to explain chart");
        }
    }
}
