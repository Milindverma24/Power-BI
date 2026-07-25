package com.aibi.repository;

import com.aibi.domain.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, UUID> {
    List<Decision> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
    
    // For finding decisions that need AI evaluation today or in the past
    @org.springframework.data.jpa.repository.Query("SELECT d FROM Decision d WHERE d.status = 'PENDING_EVALUATION' AND d.evaluationDate <= CURRENT_TIMESTAMP")
    List<Decision> findPendingEvaluations();
}
