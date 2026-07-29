package com.aibi.service;

import com.aibi.domain.DashboardWidget;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ChartExplanationService {

    private final ChatLanguageModel chatModel;
    private final JdbcTemplate jdbcTemplate;

    @Data
    public static class ExplainabilityReport {
        private String summary;
        private String sqlQuery;
        private int confidenceScore;
        private List<String> assumptions;
    }

    public ChartExplanationService(@Value("${langchain4j.gemini.chat.model.api-key}") String apiKey,
                                   @Value("${langchain4j.gemini.chat.model.model-name:gemini-1.5-flash}") String modelName,
                                   JdbcTemplate jdbcTemplate) {
        this.chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .temperature(0.2) // Low temperature for factual explanation
                .build();
        this.jdbcTemplate = jdbcTemplate;
    }

    public ExplainabilityReport explainChart(DashboardWidget widget) {
        ExplainabilityReport report = new ExplainabilityReport();
        report.setSqlQuery(widget.getSqlQuery());

        List<Map<String, Object>> sampleData = null;
        try {
            // Fetch data to provide context to the AI
            List<Map<String, Object>> allData = jdbcTemplate.queryForList(widget.getSqlQuery());
            // Limit to top 10 rows for context
            sampleData = allData.size() > 10 ? allData.subList(0, 10) : allData;
        } catch (Exception e) {
            log.error("Failed to execute SQL for explanation", e);
        }

        String prompt = String.format(
            "You are an expert Data Analyst AI.\n" +
            "The user clicked on a chart titled '%s'.\n" +
            "The SQL Query used to generate this chart is:\n%s\n" +
            "Here is a sample of the data returned:\n%s\n\n" +
            "Please analyze this chart and return exactly ONE raw JSON object with the following keys:\n" +
            "1. 'summary': A natural language paragraph explaining what the chart shows, highlighting any obvious trends or outliers.\n" +
            "2. 'confidenceScore': An integer from 0 to 100 dynamically representing your confidence in the data's reliability (consider the data structure, naming conventions, and presence of nulls).\n" +
            "3. 'assumptions': A JSON array of strings listing assumptions you or the SQL query makes (e.g., 'Assumes currency is in USD', 'Assumes empty values mean 0', 'Assumes data is up to date').\n" +
            "Return ONLY the raw JSON object. Do not include markdown formatting.",
            widget.getTitle(),
            widget.getSqlQuery(),
            sampleData != null ? sampleData.toString() : "Error loading data"
        );

        String jsonResponse = chatModel.generate(prompt).trim();

        // Extract JSON robustly
        int start = jsonResponse.indexOf('{');
        int end = jsonResponse.lastIndexOf('}');
        if (start != -1 && end != -1) {
            jsonResponse = jsonResponse.substring(start, end + 1);
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ExplainabilityReport aiResult = mapper.readValue(jsonResponse, ExplainabilityReport.class);
            report.setSummary(aiResult.getSummary());
            report.setConfidenceScore(aiResult.getConfidenceScore());
            report.setAssumptions(aiResult.getAssumptions());
        } catch (Exception e) {
            log.error("Failed to parse AI explanation JSON: {}", jsonResponse, e);
            report.setSummary("Failed to generate AI explanation.");
            report.setConfidenceScore(0);
            report.setAssumptions(List.of("Generation failed."));
        }

        return report;
    }
}
