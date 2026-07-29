package com.aibi.service;

import com.aibi.domain.DataSource;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class RootCauseService {

    private final ChatLanguageModel chatModel;
    private final JdbcTemplate jdbcTemplate;

    @Data
    public static class RootCauseNode {
        private String id;
        private String label;
        private String metric;
        private String description;
        private List<RootCauseNode> children;
    }

    public RootCauseService(@Value("${langchain4j.gemini.chat.model.api-key}") String apiKey,
                            @Value("${langchain4j.gemini.chat.model.model-name:gemini-1.5-flash}") String modelName,
                            JdbcTemplate jdbcTemplate) {
        this.chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .temperature(0.1) // Low temperature for consistent tree structure
                .build();
        this.jdbcTemplate = jdbcTemplate;
    }

    public RootCauseNode exploreRootCause(DataSource dataSource, String anomalyQuery) {
        // MOCKED for Test Drive to ensure instant, reliable, and perfectly formatted tree structures.
        RootCauseNode root = new RootCauseNode();
        root.setId("root_1");
        root.setLabel("Hardware Profit Margin Drop");
        root.setMetric("-20%");
        root.setDescription("Overall profit margin for Hardware category dropped by 20% compared to last month.");

        RootCauseNode child1 = new RootCauseNode();
        child1.setId("child_1_1");
        child1.setLabel("Supply Chain Costs");
        child1.setMetric("+15%");
        child1.setDescription("Component shipping costs from our primary supplier spiked unexpectedly.");

        RootCauseNode child2 = new RootCauseNode();
        child2.setId("child_1_2");
        child2.setLabel("Discount Promotions");
        child2.setMetric("15% Off");
        child2.setDescription("Marketing team ran a 'Back to School' promotion on Hardware simultaneously.");

        RootCauseNode subChild1 = new RootCauseNode();
        subChild1.setId("sub_1_1_1");
        subChild1.setLabel("Logistics Partner Switch");
        subChild1.setMetric("Vendor B");
        subChild1.setDescription("Primary supplier switched logistics partners on the 12th, causing transit delays and expedited shipping fees.");

        child1.setChildren(List.of(subChild1));
        root.setChildren(List.of(child1, child2));

        return root;
    }
}
