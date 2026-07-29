package com.aibi.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AiUnderstandingService {

    private final ChatLanguageModel chatModel;

    public AiUnderstandingService(@Value("${langchain4j.gemini.chat.model.api-key}") String apiKey,
                                  @Value("${langchain4j.gemini.chat.model.model-name:gemini-1.5-flash}") String modelName) {
        // We configure the Gemini model
        this.chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .temperature(0.3)
                .build();
    }

    public String generateBusinessContext(Map<String, Object> dataProfile) {
        String prompt = """
                You are an expert AI Data Analyst. I will provide you with the schema and first 3 rows of a newly uploaded dataset.
                Your job is to understand what this dataset is about in a business context.
                
                Please output your analysis in this exact format:
                
                SUMMARY:
                [Write a 2-3 sentence summary of what this data represents. E.g., 'This dataset contains e-commerce sales records...']
                
                SUGGESTED KPIs:
                - [KPI 1: Description]
                - [KPI 2: Description]
                - [KPI 3: Description]
                
                QUALITY SCORE:
                [A number from 0 to 100 representing the data quality based on missing values, outliers, etc.]
                
                CLEANING RECOMMENDATIONS:
                - [Recommendation 1]
                - [Recommendation 2]
                
                Here is the data profile:
                """ + dataProfile.toString();

        return chatModel.generate(prompt);
    }
}
