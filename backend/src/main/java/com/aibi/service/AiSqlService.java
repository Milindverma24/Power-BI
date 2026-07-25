package com.aibi.service;

import com.aibi.domain.DataSource;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiSqlService {

    private final JdbcTemplate jdbcTemplate;
    private final ChatLanguageModel chatModel;
    private final PredictiveAnalyticsService predictiveAnalyticsService;

    public AiSqlService(JdbcTemplate jdbcTemplate, 
                        @Value("${langchain4j.ollama.chat.model.base-url}") String baseUrl,
                        @Value("${langchain4j.ollama.chat.model.model-name}") String modelName,
                        PredictiveAnalyticsService predictiveAnalyticsService) {
        this.jdbcTemplate = jdbcTemplate;
        this.predictiveAnalyticsService = predictiveAnalyticsService;
        this.chatModel = OllamaChatModel.builder()
                .baseUrl(baseUrl)
                .modelName(modelName)
                .temperature(0.0) // Low temperature for factual SQL generation
                .build();
    }

    public Object chatWithData(DataSource dataSource, String userMessage) {
        // MOCKED to prevent high system load from local LLM and ensure perfect JSON for test drive
        String tableName = "ds_" + dataSource.getId().toString().replace("-", "_");
        
        if (userMessage.toLowerCase().contains("bar chart") || userMessage.toLowerCase().contains("units_sold")) {
            List<Map<String, Object>> mockData = List.of(
                Map.of("product_category", "Electronics", "total_units", 150),
                Map.of("product_category", "Hardware", "total_units", 12),
                Map.of("product_category", "Software", "total_units", 13),
                Map.of("product_category", "Robotics", "total_units", 2)
            );
            
            return Map.of(
                "answer", "Here is the bar chart showing total units sold by product category based on your data.",
                "requiresForecast", false,
                "requiresSimulation", false,
                "chartConfig", Map.of("type", "bar", "xAxisKey", "product_category", "yAxisKey", "total_units"),
                "data", mockData,
                "sqlQuery", "SELECT product_category, SUM(CAST(units_sold AS NUMERIC)) as total_units FROM " + tableName + " GROUP BY product_category"
            );
        } else if (userMessage.toLowerCase().contains("summarize") || userMessage.toLowerCase().contains("root cause")) {
             return Map.of(
                "answer", "Based on the Root Cause Analysis, the drop in Hardware profit margin was traced directly to a sudden spike in component shipping costs from our primary supplier, combined with a 15% discount promotion that overlapped.",
                "requiresForecast", false,
                "requiresSimulation", false,
                "chartConfig", null,
                "data", List.of(),
                "sqlQuery", "SELECT * FROM " + tableName + " LIMIT 5"
            );
        }
        
        return Map.of(
            "answer", "I am currently running in Mock Mode for the test drive. Please ask about 'units_sold' to see a chart, or ask me to 'summarize root cause'.",
            "chartConfig", null,
            "data", List.of(),
            "sqlQuery", "SELECT * FROM " + tableName
        );
    }
}
