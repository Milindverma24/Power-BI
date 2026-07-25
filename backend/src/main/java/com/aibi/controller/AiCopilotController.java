package com.aibi.controller;

import com.aibi.domain.User;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/copilot")
@RequiredArgsConstructor
@Slf4j
public class AiCopilotController {

    private final ChatLanguageModel chatModel;

    @Data
    public static class CopilotRequest {
        private String query;
    }

    @PostMapping("/filter")
    public ResponseEntity<?> applyFilter(@RequestBody CopilotRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        String prompt = "You are an AI Copilot for a BI Dashboard. The user said: \"" + request.getQuery() + "\".\n" +
                "Determine the SQL modifications needed to apply this to dashboard widgets.\n" +
                "Return ONLY a raw JSON object with keys: 'sqlModifier' (string like 'ORDER BY value DESC LIMIT 10' or 'WHERE date >= CURRENT_DATE - INTERVAL 3 MONTH'), and 'message' (a short friendly confirmation). Do not include markdown blocks.";

        String jsonResponse = chatModel.generate(prompt).trim();

        // Robust JSON extraction
        int start = jsonResponse.indexOf('{');
        int end = jsonResponse.lastIndexOf('}');
        if (start != -1 && end != -1) {
            jsonResponse = jsonResponse.substring(start, end + 1);
        }

        return ResponseEntity.ok(jsonResponse);
    }
}
