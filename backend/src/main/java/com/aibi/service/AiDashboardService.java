package com.aibi.service;

import com.aibi.domain.DataSource;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiDashboardService {

    private final ChatLanguageModel chatModel;

    public AiDashboardService(@Value("${langchain4j.gemini.chat.model.api-key}") String apiKey,
                              @Value("${langchain4j.gemini.chat.model.model-name:gemini-1.5-flash}") String modelName) {
        this.chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .temperature(0.2) // Slight creativity for varied chart generation
                .build();
    }

    public List<Map<String, Object>> generateDashboardWidgets(DataSource dataSource, String themePrompt) {
        // MOCKED to prevent high system load from local LLM
        String tableName = "ds_" + dataSource.getId().toString().replace("-", "_");
        List<Map<String, Object>> mockWidgets = new ArrayList<>();
        
        mockWidgets.add(Map.of(
            "title", "Total Revenue by Country",
            "sqlQuery", "SELECT country, SUM(CAST(REGEXP_REPLACE(revenue, '[^0-9.]', '', 'g') AS NUMERIC)) as revenue FROM " + tableName + " GROUP BY country",
            "chartConfig", Map.of("type", "bar", "xAxisKey", "country", "yAxisKey", "revenue")
        ));
        
        mockWidgets.add(Map.of(
            "title", "Monthly Revenue Trend",
            "sqlQuery", "SELECT TO_CHAR(CAST(date AS DATE), 'YYYY-MM') as month, SUM(CAST(REGEXP_REPLACE(revenue, '[^0-9.]', '', 'g') AS NUMERIC)) as revenue FROM " + tableName + " GROUP BY month ORDER BY month",
            "chartConfig", Map.of("type", "line", "xAxisKey", "month", "yAxisKey", "revenue")
        ));
        
        mockWidgets.add(Map.of(
            "title", "Units Sold by Category",
            "sqlQuery", "SELECT product_category, SUM(CAST(units_sold AS NUMERIC)) as units_sold FROM " + tableName + " GROUP BY product_category ORDER BY units_sold DESC",
            "chartConfig", Map.of("type", "bar", "xAxisKey", "product_category", "yAxisKey", "units_sold")
        ));
        
        mockWidgets.add(Map.of(
            "title", "Monthly Units Trend",
            "sqlQuery", "SELECT TO_CHAR(CAST(date AS DATE), 'YYYY-MM') as month, SUM(CAST(units_sold AS NUMERIC)) as units_sold FROM " + tableName + " GROUP BY month ORDER BY month",
            "chartConfig", Map.of("type", "line", "xAxisKey", "month", "yAxisKey", "units_sold")
        ));
        
        return mockWidgets;
    }

    public Map<String, Object> recommendNextWidget(DataSource dataSource, List<String> currentWidgetTitles) {
        // MOCKED to prevent high system load from local LLM
        String tableName = "ds_" + dataSource.getId().toString().replace("-", "_");
        
        return Map.of(
            "title", "Profit Margin by Category",
            "sqlQuery", "SELECT product_category, AVG(CAST(REGEXP_REPLACE(profit_margin, '[^0-9.-]', '', 'g') AS NUMERIC)) as profit_margin FROM " + tableName + " GROUP BY product_category",
            "chartConfig", Map.of("type", "bar", "xAxisKey", "product_category", "yAxisKey", "profit_margin")
        );
    }
}
