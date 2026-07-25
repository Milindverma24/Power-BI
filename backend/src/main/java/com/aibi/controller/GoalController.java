package com.aibi.controller;

import com.aibi.domain.BusinessGoal;
import com.aibi.domain.DashboardWidget;
import com.aibi.domain.User;
import com.aibi.repository.BusinessGoalRepository;
import com.aibi.repository.DashboardWidgetRepository;
import com.aibi.service.GoalTrackingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
@Slf4j
public class GoalController {

    private final BusinessGoalRepository goalRepository;
    private final DashboardWidgetRepository widgetRepository;
    private final GoalTrackingService goalTrackingService;

    @Data
    public static class CreateGoalRequest {
        private String title;
        private String description;
        private UUID widgetId;
        private Double targetValue;
        private Double startValue;
        private String targetDate;
    }

    @GetMapping
    public ResponseEntity<?> getGoals(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        List<BusinessGoal> goals = goalRepository.findByOrganizationIdOrderByTargetDateAsc(currentUser.getOrganization().getId());
        
        List<Map<String, Object>> enrichedGoals = goals.stream().map(goal -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", goal.getId());
            map.put("title", goal.getTitle());
            map.put("description", goal.getDescription());
            map.put("targetValue", goal.getTargetValue());
            map.put("startValue", goal.getStartValue());
            map.put("targetDate", goal.getTargetDate());
            map.put("widgetTitle", goal.getWidget().getTitle());
            
            try {
                GoalTrackingService.GoalInsights insights = goalTrackingService.analyzeGoal(goal);
                map.put("insights", insights);
            } catch (Exception e) {
                log.warn("Failed to generate insights for goal {}", goal.getId());
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(enrichedGoals);
    }

    @PostMapping
    public ResponseEntity<?> createGoal(@RequestBody CreateGoalRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DashboardWidget widget = widgetRepository.findById(request.getWidgetId()).orElse(null);
        if (widget == null || !widget.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Widget not found or access denied.");
        }

        BusinessGoal goal = BusinessGoal.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .widget(widget)
                .targetValue(request.getTargetValue())
                .startValue(request.getStartValue())
                .targetDate(LocalDateTime.parse(request.getTargetDate()))
                .organization(currentUser.getOrganization())
                .build();

        goal = goalRepository.save(goal);
        return ResponseEntity.ok(goal);
    }
}
