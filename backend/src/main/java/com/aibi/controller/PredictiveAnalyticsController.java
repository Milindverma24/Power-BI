package com.aibi.controller;

import com.aibi.domain.DashboardWidget;
import com.aibi.domain.User;
import com.aibi.repository.DashboardWidgetRepository;
import com.aibi.service.PredictiveAnalyticsService;
import lombok.Data;
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
@RequestMapping("/api/v1/predict")
@RequiredArgsConstructor
@Slf4j
public class PredictiveAnalyticsController {

    private final PredictiveAnalyticsService predictiveAnalyticsService;
    private final DashboardWidgetRepository widgetRepository;
    private final JdbcTemplate jdbcTemplate;

    @Data
    public static class PredictRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("xAxisKey")
        private String xAxisKey;
        @com.fasterxml.jackson.annotation.JsonProperty("yAxisKey")
        private String yAxisKey;
    }

    @Data
    public static class SimulateRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("yAxisKey")
        private String yAxisKey;
        private String instruction;
    }

    @PostMapping("/forecast/{widgetId}")
    public ResponseEntity<?> generateForecast(@PathVariable UUID widgetId, 
                                              @RequestBody PredictRequest request, 
                                              @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DashboardWidget widget = widgetRepository.findById(widgetId).orElse(null);
        if (widget == null || !widget.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Widget not found or access denied.");
        }

        try {
            List<Map<String, Object>> data = jdbcTemplate.queryForList(widget.getSqlQuery());
            // Need to make it mutable
            List<Map<String, Object>> mutableData = new java.util.ArrayList<>();
            for (Map<String, Object> row : data) {
                mutableData.add(new java.util.HashMap<>(row));
            }
            
            List<Map<String, Object>> forecast = predictiveAnalyticsService.generateForecast(mutableData, request.getXAxisKey(), request.getYAxisKey());
            mutableData.addAll(forecast);
            
            return ResponseEntity.ok(mutableData);
        } catch (Exception e) {
            log.error("Failed to generate forecast", e);
            return ResponseEntity.internalServerError().body("Failed to generate forecast");
        }
    }

    @PostMapping("/simulate/{widgetId}")
    public ResponseEntity<?> simulateScenario(@PathVariable UUID widgetId, 
                                              @RequestBody SimulateRequest request, 
                                              @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DashboardWidget widget = widgetRepository.findById(widgetId).orElse(null);
        if (widget == null || !widget.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Widget not found or access denied.");
        }

        try {
            List<Map<String, Object>> data = jdbcTemplate.queryForList(widget.getSqlQuery());
            List<Map<String, Object>> mutableData = new java.util.ArrayList<>();
            for (Map<String, Object> row : data) {
                mutableData.add(new java.util.HashMap<>(row));
            }
            
            // Re-generate forecast first so simulation applies to everything
            String xAxisKey = "date"; // Default fallback
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode config = mapper.readTree(widget.getChartConfig());
                if (config.has("xAxisKey")) xAxisKey = config.get("xAxisKey").asText();
            } catch (Exception e) {}
            
            List<Map<String, Object>> forecast = predictiveAnalyticsService.generateForecast(mutableData, xAxisKey, request.getYAxisKey());
            mutableData.addAll(forecast);
            
            predictiveAnalyticsService.simulateScenario(mutableData, request.getYAxisKey(), request.getInstruction());
            return ResponseEntity.ok(mutableData);
        } catch (Exception e) {
            log.error("Failed to simulate scenario", e);
            return ResponseEntity.internalServerError().body("Failed to simulate scenario");
        }
    }
}
