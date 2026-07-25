package com.aibi.service;

import com.aibi.domain.AnomalyAlert;
import com.aibi.domain.DataSource;
import com.aibi.repository.AnomalyAlertRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class AlertService {

    private final AnomalyAlertRepository alertRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ChatLanguageModel chatModel;

    public AlertService(AnomalyAlertRepository alertRepository,
                        JdbcTemplate jdbcTemplate,
                        @Value("${langchain4j.ollama.chat.model.base-url}") String baseUrl,
                        @Value("${langchain4j.ollama.chat.model.model-name}") String modelName) {
        this.alertRepository = alertRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.chatModel = OllamaChatModel.builder()
                .baseUrl(baseUrl)
                .modelName(modelName)
                .temperature(0.2) // Slight temperature for creative root causes
                .build();
    }

    public void scanForAnomalies(DataSource dataSource) {
        String tableName = "ds_" + dataSource.getId().toString().replace("-", "_");
        
        try {
            // Fetch recent data (limit 100 for token safety)
            String sql = "SELECT * FROM " + tableName + " LIMIT 100";
            List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String jsonData = mapper.writeValueAsString(data);

            String prompt = String.format(
                "You are an expert Business Analyst. " +
                "Analyze the following dataset for any sudden anomalies, spikes, drops, or unusual patterns.\n" +
                "Dataset: %s\n\n" +
                "If you find any unusual events (e.g., a massive spike in revenue, a sudden drop in sales, or an abnormal profit margin on a specific date), " +
                "return them as a JSON list of objects with the following keys:\n" +
                "1. 'title' (e.g., 'Revenue dropped 18%%')\n" +
                "2. 'description' (Detailed explanation and possible causes like 'Holiday Season' or 'Inventory Shortage' based on your reasoning)\n" +
                "3. 'severity' (HIGH, MEDIUM, LOW)\n" +
                "4. 'anomalyDate' (The date or identifier when the anomaly occurred)\n" +
                "If no anomalies are found, return an empty array [].\n" +
                "Return ONLY the raw JSON array. Do not include any markdown blocks or backticks.",
                jsonData
            );

            String jsonResponse = chatModel.generate(prompt).trim();
            if (jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.replace("```json", "").replace("```", "").trim();
            } else if (jsonResponse.startsWith("```")) {
                jsonResponse = jsonResponse.replace("```", "").trim();
            }

            List<Map<String, String>> anomalies = mapper.readValue(jsonResponse, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, String>>>() {});
            
            for (Map<String, String> anomaly : anomalies) {
                AnomalyAlert alert = AnomalyAlert.builder()
                        .organization(dataSource.getOrganization())
                        .dataSource(dataSource)
                        .title(anomaly.get("title"))
                        .description(anomaly.get("description"))
                        .severity(anomaly.get("severity"))
                        .anomalyDate(anomaly.get("anomalyDate"))
                        .build();
                alertRepository.save(alert);
            }
            
            log.info("Anomaly scan completed for dataset {}. Found {} anomalies.", dataSource.getName(), anomalies.size());
            
        } catch (Exception e) {
            log.error("Failed to scan for anomalies on dataset: {}", dataSource.getName(), e);
        }
    }
}
