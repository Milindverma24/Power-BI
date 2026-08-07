package com.aibi.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "marketplace_prompts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplacePrompt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, length = 1000)
    private String promptText;

    @Column(nullable = false)
    private String category; // e.g., "Sales", "Marketing", "HR"

    @Column(nullable = false)
    private String authorName; // The user who shared it

    @Column(nullable = false)
    @Builder.Default
    private Integer upvotes = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
