package com.aibi.service;

import com.aibi.domain.DataSource;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
@Slf4j
public class AiSqlService {

    private final JdbcTemplate jdbcTemplate;
    private final ChatLanguageModel chatModel;
    private final PredictiveAnalyticsService predictiveAnalyticsService;

    public AiSqlService(JdbcTemplate jdbcTemplate, 
                        @Value("${langchain4j.gemini.chat.model.api-key}") String apiKey,
                        @Value("${langchain4j.gemini.chat.model.model-name:gemini-1.5-flash}") String modelName,
                        PredictiveAnalyticsService predictiveAnalyticsService) {
        this.jdbcTemplate = jdbcTemplate;
        this.predictiveAnalyticsService = predictiveAnalyticsService;
        this.chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .temperature(0.0) // Low temperature for factual SQL generation
                .build();
    }

    public Object chatWithData(DataSource dataSource, String userMessage) {
        String tableName = "ds_" + dataSource.getId().toString().replace("-", "_");

        try {
            List<Map<String, Object>> schemaRows = jdbcTemplate.queryForList("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ?", tableName);
            String schema = schemaRows.toString();

            String prompt = "You are a data analyst AI. The user asks: '" + userMessage + "'.\n" +
                "The data is in a PostgreSQL table named '" + tableName + "' with the following schema: " + schema + "\n" +
                "Generate a PostgreSQL query to answer the user's question.\n" +
                "Return EXACTLY a raw JSON object with these keys:\n" +
                "- \"sqlQuery\": The SQL query as a string. Ensure any aliases used are strictly lowercase.\n" +
                "- \"answer\": A short natural language answer/explanation.\n" +
                "- \"chartConfig\": VERY IMPORTANT: If the user asks for a chart/graph, OR if the query returns aggregated data (like sums/counts grouped by a category) that can be visualized, you MUST provide this object with \"type\" (must be \"bar\", \"line\", or \"pie\"), \"xAxisKey\" (the exact lowercase column name for the x-axis), and \"yAxisKey\" (the exact lowercase column name for the y-axis). Otherwise, set it to null.\n" +
                "Do not include any markdown formatting like ```json.";

            String jsonResponse = chatModel.generate(prompt).trim();
            log.info("LLM Response: {}", jsonResponse);
            
            int start = jsonResponse.indexOf('{');
            int end = jsonResponse.lastIndexOf('}');
            if (start != -1 && end != -1) {
                jsonResponse = jsonResponse.substring(start, end + 1);
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResponse);
            String sqlQuery = root.get("sqlQuery").asText();
            String answer = root.get("answer").asText();

            log.info("Executing SQL: {}", sqlQuery);
            List<Map<String, Object>> data = jdbcTemplate.queryForList(sqlQuery);
            log.info("Query returned {} rows", data.size());

            Map<String, Object> response = new HashMap<>();
            response.put("answer", answer);
            response.put("sqlQuery", sqlQuery);
            response.put("data", data);

            if (root.has("chartConfig") && !root.get("chartConfig").isNull()) {
                log.info("Chart config found in LLM response");
                response.put("chartConfig", mapper.convertValue(root.get("chartConfig"), Map.class));
            } else {
                log.info("No chart config found in LLM response");
            }

            return response;
        } catch (Exception e) {
            log.error("AI chat error", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("answer", "I'm sorry, I encountered an error answering your question. Please try rephrasing it.");
            errorResponse.put("sqlQuery", "N/A");
            errorResponse.put("data", List.of());
            return errorResponse;
        }
    }
}
