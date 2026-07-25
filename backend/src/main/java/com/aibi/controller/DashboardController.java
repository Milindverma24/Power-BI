package com.aibi.controller;

import com.aibi.domain.DashboardWidget;
import com.aibi.domain.DataSource;
import com.aibi.domain.User;
import com.aibi.repository.DashboardWidgetRepository;
import com.aibi.repository.DataSourceRepository;
import com.aibi.service.AiDashboardService;
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
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardWidgetRepository widgetRepository;
    private final DataSourceRepository dataSourceRepository;
    private final JdbcTemplate jdbcTemplate;
    private final AiDashboardService aiDashboardService;

    @Data
    public static class CreateWidgetRequest {
        private UUID dataSourceId;
        private String title;
        private String sqlQuery;
        private Map<String, Object> chartConfig;
    }

    @PostMapping("/widgets")
    public ResponseEntity<?> createWidget(@RequestBody CreateWidgetRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DataSource dataSource = dataSourceRepository.findById(request.getDataSourceId()).orElse(null);
        if (dataSource == null || !dataSource.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Data source not found or access denied.");
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String chartConfigStr = mapper.writeValueAsString(request.getChartConfig());

            DashboardWidget widget = DashboardWidget.builder()
                    .organization(currentUser.getOrganization())
                    .dataSource(dataSource)
                    .title(request.getTitle())
                    .sqlQuery(request.getSqlQuery())
                    .chartConfig(chartConfigStr)
                    .build();

            return ResponseEntity.ok(widgetRepository.save(widget));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to save widget: " + e.getMessage());
        }
    }

    @GetMapping("/widgets")
    public ResponseEntity<?> getWidgets(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(widgetRepository.findByOrganizationIdOrderByCreatedAtDesc(currentUser.getOrganization().getId()));
    }

    @GetMapping("/widgets/{id}/data")
    public ResponseEntity<?> getWidgetData(@PathVariable UUID id, 
                                           @RequestParam(required = false) String timestamp,
                                           @AuthenticationPrincipal User currentUser) {
        DashboardWidget widget = widgetRepository.findById(id).orElse(null);
        if (widget == null || !widget.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Widget not found or access denied.");
        }

        try {
            String sql = widget.getSqlQuery();
            // Basic Time Travel implementation for prototype:
            // Injecting a date filter. We assume the table has an 'order_date' or 'created_at' column.
            if (timestamp != null && !timestamp.isEmpty()) {
                // Determine if query has WHERE clause
                if (sql.toLowerCase().contains("where")) {
                    sql = sql.replaceFirst("(?i)where", "WHERE created_at <= '" + timestamp + "' AND ");
                } else if (sql.toLowerCase().contains("group by")) {
                    sql = sql.replaceFirst("(?i)group by", "WHERE created_at <= '" + timestamp + "' GROUP BY ");
                } else {
                    sql = sql + " WHERE created_at <= '" + timestamp + "'";
                }
            }

            // Re-run the saved SQL query directly
            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to execute widget SQL: {}", widget.getSqlQuery(), e);
            // Fallback for prototype if schema doesn't have created_at
            try {
                List<Map<String, Object>> fallbackData = jdbcTemplate.queryForList(widget.getSqlQuery());
                return ResponseEntity.ok(fallbackData);
            } catch (Exception ex) {
                return ResponseEntity.internalServerError().body("Failed to load widget data.");
            }
        }
    }

    @PostMapping("/generate/{dataSourceId}")
    public ResponseEntity<?> generateDashboard(@PathVariable UUID dataSourceId, 
                                               @RequestBody(required = false) Map<String, String> body, 
                                               @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DataSource dataSource = dataSourceRepository.findById(dataSourceId).orElse(null);
        if (dataSource == null || !dataSource.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Data source not found or access denied.");
        }

        String themePrompt = (body != null && body.containsKey("theme")) ? body.get("theme") : "Create a comprehensive executive summary dashboard";

        try {
            List<Map<String, Object>> widgetConfigs = aiDashboardService.generateDashboardWidgets(dataSource, themePrompt);
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<DashboardWidget> savedWidgets = new java.util.ArrayList<>();

            for (Map<String, Object> config : widgetConfigs) {
                String title = (String) config.get("title");
                String sqlQuery = (String) config.get("sqlQuery");
                Map<String, Object> chartConfig = (Map<String, Object>) config.get("chartConfig");
                String chartConfigStr = mapper.writeValueAsString(chartConfig);

                DashboardWidget widget = DashboardWidget.builder()
                        .organization(currentUser.getOrganization())
                        .dataSource(dataSource)
                        .title(title)
                        .sqlQuery(sqlQuery)
                        .chartConfig(chartConfigStr)
                        .build();
                savedWidgets.add(widgetRepository.save(widget));
            }
            
            return ResponseEntity.ok(savedWidgets);
        } catch (Exception e) {
            log.error("Failed to generate dashboard", e);
            return ResponseEntity.internalServerError().body("Failed to generate dashboard: " + e.getMessage());
        }
    }

    @PostMapping("/recommend/{dataSourceId}")
    public ResponseEntity<?> recommendWidget(@PathVariable UUID dataSourceId, 
                                             @RequestBody List<String> currentWidgetTitles, 
                                             @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DataSource dataSource = dataSourceRepository.findById(dataSourceId).orElse(null);
        if (dataSource == null || !dataSource.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Data source not found or access denied.");
        }

        try {
            Map<String, Object> recommendedConfig = aiDashboardService.recommendNextWidget(dataSource, currentWidgetTitles);
            if (recommendedConfig == null) {
                return ResponseEntity.internalServerError().body("AI failed to recommend a widget.");
            }
            return ResponseEntity.ok(recommendedConfig);
        } catch (Exception e) {
            log.error("Failed to get recommendation", e);
            return ResponseEntity.internalServerError().body("Failed to get recommendation: " + e.getMessage());
        }
    }

    @DeleteMapping("/widgets/{id}")
    public ResponseEntity<?> deleteWidget(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }
        
        DashboardWidget widget = widgetRepository.findById(id).orElse(null);
        if (widget == null || !widget.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Widget not found or access denied.");
        }
        
        try {
            widgetRepository.delete(widget);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to delete widget", e);
            return ResponseEntity.internalServerError().body("Failed to delete widget: " + e.getMessage());
        }
    }
}
