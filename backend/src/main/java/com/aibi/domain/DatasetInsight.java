package com.aibi.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dataset_insights")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatasetInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_source_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private DataSource dataSource;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "suggested_kpis", columnDefinition = "TEXT")
    private String suggestedKpis;

    @Column(name = "column_metadata", columnDefinition = "TEXT")
    private String columnMetadata;

    @Column(name = "data_quality_score")
    private Integer dataQualityScore;

    @Column(name = "cleaning_recommendations", columnDefinition = "TEXT")
    private String cleaningRecommendations;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
