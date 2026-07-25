package com.aibi.service;

import com.aibi.domain.BusinessGoal;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GoalTrackingService {

    private final ChatLanguageModel chatModel;
    private final JdbcTemplate jdbcTemplate;

    @Data
    public static class GoalInsights {
        private String estimatedCompletion;
        private String progressStatus; // "On Track", "At Risk", "Behind"
        private List<String> recommendations;
        private Double currentValue;
    }

    public GoalTrackingService(@Value("${langchain4j.ollama.chat.model.base-url}") String baseUrl,
                               @Value("${langchain4j.ollama.chat.model.model-name}") String modelName,
                               JdbcTemplate jdbcTemplate) {
        this.chatModel = OllamaChatModel.builder()
                .baseUrl(baseUrl)
                .modelName(modelName)
                .temperature(0.3)
                .build();
        this.jdbcTemplate = jdbcTemplate;
    }

    public GoalInsights analyzeGoal(BusinessGoal goal) {
        GoalInsights insights = new GoalInsights();
        insights.setCurrentValue(goal.getStartValue()); // fallback

        // Mock current value retrieval for prototype. 
        // In a real system we'd parse the widget's query to get the scalar sum.
        try {
            List<Map<String, Object>> data = jdbcTemplate.queryForList(goal.getWidget().getSqlQuery());
            if (!data.isEmpty() && !data.get(0).isEmpty()) {
                // Try to get a numeric value from the first row
                Object val = data.get(0).values().iterator().next();
                if (val instanceof Number) {
                    insights.setCurrentValue(((Number) val).doubleValue());
                } else if (val != null) {
                    insights.setCurrentValue(Double.parseDouble(val.toString()));
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch actual value for goal {}", goal.getId());
            insights.setCurrentValue(goal.getStartValue() + ((goal.getTargetValue() - goal.getStartValue()) * 0.45)); // Mock 45% progress
        }

        String prompt = String.format(
            "You are an AI Business Goal Tracker.\n" +
            "Goal: %s\n" +
            "Description: %s\n" +
            "Target Value: %f\n" +
            "Current Value: %f\n" +
            "Target Date: %s\n\n" +
            "Analyze the progress and return exactly ONE raw JSON object with the following keys:\n" +
            "1. 'estimatedCompletion': A string estimating the completion date (e.g., 'October 2026') or 'Unlikely to meet deadline'.\n" +
            "2. 'progressStatus': Exactly one of 'On Track', 'At Risk', or 'Behind'.\n" +
            "3. 'recommendations': A JSON array of 3 short, actionable text recommendations to accelerate progress.\n" +
            "Return ONLY raw JSON.",
            goal.getTitle(), goal.getDescription(), goal.getTargetValue(), insights.getCurrentValue(), goal.getTargetDate().toString()
        );

        String jsonResponse = chatModel.generate(prompt).trim();

        int start = jsonResponse.indexOf('{');
        int end = jsonResponse.lastIndexOf('}');
        if (start != -1 && end != -1) {
            jsonResponse = jsonResponse.substring(start, end + 1);
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            GoalInsights aiResult = mapper.readValue(jsonResponse, GoalInsights.class);
            insights.setEstimatedCompletion(aiResult.getEstimatedCompletion());
            insights.setProgressStatus(aiResult.getProgressStatus());
            insights.setRecommendations(aiResult.getRecommendations());
        } catch (Exception e) {
            log.error("Failed to parse AI goal insights: {}", jsonResponse, e);
            insights.setEstimatedCompletion("Unknown");
            insights.setProgressStatus("Unknown");
            insights.setRecommendations(List.of("Unable to generate recommendations."));
        }

        return insights;
    }
}
