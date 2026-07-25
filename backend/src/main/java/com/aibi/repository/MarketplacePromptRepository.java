package com.aibi.repository;

import com.aibi.domain.MarketplacePrompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarketplacePromptRepository extends JpaRepository<MarketplacePrompt, UUID> {
    List<MarketplacePrompt> findAllByOrderByUpvotesDesc();
    List<MarketplacePrompt> findByCategoryOrderByUpvotesDesc(String category);
}
