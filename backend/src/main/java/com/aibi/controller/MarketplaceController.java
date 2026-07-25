package com.aibi.controller;

import com.aibi.domain.MarketplacePrompt;
import com.aibi.domain.User;
import com.aibi.repository.MarketplacePromptRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplacePromptRepository marketplaceRepository;

    @Data
    public static class CreatePromptRequest {
        private String title;
        private String description;
        private String promptText;
        private String category;
    }

    @GetMapping("/prompts")
    public ResponseEntity<List<MarketplacePrompt>> getPrompts(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(marketplaceRepository.findByCategoryOrderByUpvotesDesc(category));
        }
        return ResponseEntity.ok(marketplaceRepository.findAllByOrderByUpvotesDesc());
    }

    @PostMapping("/prompts")
    public ResponseEntity<?> sharePrompt(@RequestBody CreatePromptRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        MarketplacePrompt prompt = MarketplacePrompt.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .promptText(request.getPromptText())
                .category(request.getCategory())
                .authorName(currentUser.getFirstName() + " " + currentUser.getLastName())
                .upvotes(0)
                .build();

        return ResponseEntity.ok(marketplaceRepository.save(prompt));
    }

    @PostMapping("/prompts/{id}/upvote")
    public ResponseEntity<?> upvotePrompt(@PathVariable UUID id) {
        MarketplacePrompt prompt = marketplaceRepository.findById(id).orElse(null);
        if (prompt == null) {
            return ResponseEntity.notFound().build();
        }
        prompt.setUpvotes(prompt.getUpvotes() + 1);
        return ResponseEntity.ok(marketplaceRepository.save(prompt));
    }
}
