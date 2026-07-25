package com.aibi.service;

import com.aibi.domain.DataSource;
import com.aibi.domain.KpiDefinition;
import com.aibi.repository.KpiRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class KpiService {

    private final KpiRepository kpiRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ChatLanguageModel chatModel;

    public KpiService(KpiRepository kpiRepository,
                      JdbcTemplate jdbcTemplate,
                      @Value("${langchain4j.ollama.chat.model.base-url}") String baseUrl,
                      @Value("${langchain4j.ollama.chat.model.model-name}") String modelName) {
        this.kpiRepository = kpiRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.chatModel = OllamaChatModel.builder()
                .baseUrl(baseUrl)
                .modelName(modelName)
                .temperature(0.0)
                .build();
    }

    public KpiDefinition createKpi(KpiDefinition kpiDefinition) {
        DataSource dataSource = kpiDefinition.getDataSource();
        String tableName = "ds_" + dataSource.getId().toString().replace("-", "_");
        String columnMetadata = dataSource.getInsight().getColumnMetadata();

        // 1. Generate SQL
        String sqlPrompt = String.format(
            "You are an expert PostgreSQL data analyst. " +
            "I have a table named '%s' with the following columns: %s\n" +
            "Write a valid PostgreSQL SELECT query to answer this user KPI definition: \"%s\"\n" +
            "IMPORTANT RULES:\n" +
            "- Return ONLY the raw SQL query. Do not include markdown formatting, backticks, or any explanations.\n" +
            "- Do not end with a semicolon.\n" +
            "- NEVER use DROP, DELETE, UPDATE, or INSERT.\n" +
            "- You MUST include the FROM clause (FROM %s).\n" +
            "- The query MUST return exactly ONE row and ONE column of type NUMERIC.\n" +
            "- ALL columns in this table are stored as TEXT. If you perform mathematical operations (SUM, AVG, etc.), you MUST explicitly cast to NUMERIC. Because the data might contain commas or currency symbols, ALWAYS use REGEXP_REPLACE before casting, like this: SUM(CAST(REGEXP_REPLACE(revenue, '[^0-9.]', '', 'g') AS NUMERIC)).",
            tableName, columnMetadata, kpiDefinition.getNlQuery(), tableName
        );

        String sqlQuery = chatModel.generate(sqlPrompt).trim();
        
        if (sqlQuery.startsWith("```sql")) {
            sqlQuery = sqlQuery.replace("```sql", "").replace("```", "").trim();
        } else if (sqlQuery.startsWith("```")) {
            sqlQuery = sqlQuery.replace("```", "").trim();
        }
        
        kpiDefinition.setSqlQuery(sqlQuery);
        
        // Evaluate immediately
        return evaluateKpi(kpiDefinition);
    }

    public KpiDefinition evaluateKpi(KpiDefinition kpi) {
        if (kpi.getSqlQuery() == null || kpi.getSqlQuery().isEmpty()) {
            return kpi; // Cannot evaluate without SQL
        }

        try {
            // Fetch actual value
            BigDecimal actualValue = jdbcTemplate.queryForObject(kpi.getSqlQuery(), BigDecimal.class);
            if (actualValue == null) {
                actualValue = BigDecimal.ZERO;
            }
            kpi.setActualValue(actualValue);

            // Ask AI for health status and explanation
            String evalPrompt = String.format(
                "You are an expert business analyst KPI health monitor. " +
                "The user's KPI is: \"%s\" (Definition: %s)\n" +
                "The target value is: %s\n" +
                "The actual calculated value is: %s\n" +
                "Evaluate the health of this KPI based on the target vs actual values. Infer whether higher is better (e.g. Revenue) or lower is better (e.g. Churn, Defects) based on the KPI name.\n" +
                "Determine if the status is GREEN (Good), YELLOW (Warning/Close), or RED (Bad/Needs Attention).\n" +
                "Return ONLY a raw JSON object with two keys:\n" +
                "1. \"status\": either \"GREEN\", \"YELLOW\", or \"RED\".\n" +
                "2. \"explanation\": A 1-2 sentence human-friendly explanation of why the KPI is at this status based on the numbers.\n" +
                "Do NOT output markdown blocks, just raw JSON.",
                kpi.getName(), kpi.getNlQuery(), kpi.getTargetValue().toString(), actualValue.toString()
            );

            String jsonResponse = chatModel.generate(evalPrompt).trim();
            int start = jsonResponse.indexOf('{');
            int end = jsonResponse.lastIndexOf('}');
            if (start != -1 && end != -1) {
                jsonResponse = jsonResponse.substring(start, end + 1);
            }

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, String> aiEval = mapper.readValue(jsonResponse, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
            
            kpi.setHealthStatus(aiEval.getOrDefault("status", "YELLOW"));
            kpi.setAiExplanation(aiEval.getOrDefault("explanation", "Could not determine status."));
            kpi.setLastEvaluatedAt(LocalDateTime.now());
            
        } catch (Exception e) {
            log.error("Failed to evaluate KPI: {}", kpi.getName(), e);
            kpi.setHealthStatus("RED");
            kpi.setAiExplanation("Error evaluating KPI: " + e.getMessage());
            kpi.setLastEvaluatedAt(LocalDateTime.now());
        }

        return kpiRepository.save(kpi);
    }

    public List<KpiDefinition> getAllKpis(UUID organizationId) {
        return kpiRepository.findByOrganizationId(organizationId);
    }
}
