package com.aibi.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.aibi.domain.Organization;
import com.aibi.domain.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;
    
    private String type; // e.g., Monthly, Quarterly, Forecast, Weekly
    
    private LocalDateTime reportDate;
    
    private boolean aiGenerated;
    
    private boolean scheduled;
    
    private String scheduleDetails; // e.g., "Every Monday, 8:00 AM"
    
    @Column(columnDefinition = "TEXT")
    private String executiveNarrative;
    
    @Column(columnDefinition = "TEXT")
    private String contentsJson; // JSON array of report sections/pages

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
