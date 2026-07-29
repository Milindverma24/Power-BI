package com.aibi.service;

import com.aibi.domain.DashboardWidget;
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
public class BenchmarkService {

    private final ChatLanguageModel chatModel;

    public BenchmarkService(@Value("${langchain4j.gemini.chat.model.api-key}") String apiKey,
                            @Value("${langchain4j.gemini.chat.model.model-name:gemini-1.5-flash}") String modelName) {
        this.chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .temperature(0.2) // Low temperature for consistent mock data
                .build();
    }

    public List<Map<String, Object>> generateBenchmarkData(DashboardWidget widget, List<Map<String, Object>> actualData) {
        if (actualData == null || actualData.isEmpty()) return new ArrayList<>();

        // Get the keys from the first row of data
        Map<String, Object> firstRow = actualData.get(0);
        String keys = String.join(", ", firstRow.keySet());

        String prompt = String.format(
            "You are an AI generating synthetic 'Industry Benchmark' data for a BI Dashboard prototype.\n" +
            "The user's chart is titled: '%s'.\n" +
            "The data structure has keys: [%s].\n" +
            "The user's actual data is:\n%s\n\n" +
            "Generate a parallel dataset representing the 'Industry Average' for this metric. Keep the exact same structure (same keys and length) as the actual data, but modify the numeric values to represent a reasonable industry baseline (e.g., slightly higher or lower).\n" +
            "Return EXACTLY a JSON array of objects. Do not wrap in markdown or include any other text.",
            widget.getTitle(), keys, actualData.toString()
        );

        String jsonResponse = chatModel.generate(prompt).trim();
        
        int start = jsonResponse.indexOf('[');
        int end = jsonResponse.lastIndexOf(']');
        if (start != -1 && end != -1) {
            jsonResponse = jsonResponse.substring(start, end + 1);
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(jsonResponse, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            log.error("Failed to parse benchmark JSON: {}", jsonResponse, e);
            return new ArrayList<>();
        }
    }
}
