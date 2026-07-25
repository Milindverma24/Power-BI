package com.aibi.controller;

import com.aibi.domain.DashboardWidget;
import com.aibi.domain.User;
import com.aibi.repository.DashboardWidgetRepository;
import com.aibi.service.BenchmarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/benchmarks")
@RequiredArgsConstructor
@Slf4j
public class BenchmarkController {

    private final DashboardWidgetRepository widgetRepository;
    private final JdbcTemplate jdbcTemplate;
    private final BenchmarkService benchmarkService;

    @GetMapping("/widget/{id}")
    public ResponseEntity<?> getBenchmarkForWidget(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        DashboardWidget widget = widgetRepository.findById(id).orElse(null);
        if (widget == null || !widget.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Widget not found or access denied.");
        }

        try {
            // Get actual data first
            List<Map<String, Object>> actualData = jdbcTemplate.queryForList(widget.getSqlQuery());
            
            // Generate benchmark data via AI
            List<Map<String, Object>> benchmarkData = benchmarkService.generateBenchmarkData(widget, actualData);
            
            return ResponseEntity.ok(benchmarkData);
        } catch (Exception e) {
            log.error("Failed to generate benchmark data for widget {}", id, e);
            return ResponseEntity.internalServerError().body("Failed to generate benchmark data");
        }
    }
}
