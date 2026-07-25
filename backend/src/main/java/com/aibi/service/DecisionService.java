package com.aibi.service;

import com.aibi.domain.Decision;
import com.aibi.domain.DecisionStatus;
import com.aibi.domain.Organization;
import com.aibi.domain.User;
import com.aibi.repository.DecisionRepository;
import com.aibi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DecisionService {

    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;

    @Transactional
    public Decision logDecision(UUID organizationId, UUID createdById, String title, String rationale, String expectedOutcome, LocalDateTime evaluationDate) {
        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Organization org = createdBy.getOrganization();
        if (org == null || !org.getId().equals(organizationId)) {
            throw new RuntimeException("Invalid organization");
        }

        Decision decision = Decision.builder()
                .organization(org)
                .title(title)
                .rationale(rationale)
                .expectedOutcome(expectedOutcome)
                .evaluationDate(evaluationDate)
                .status(DecisionStatus.PENDING_EVALUATION)
                .createdBy(createdBy)
                .build();

        return decisionRepository.save(decision);
    }

    public List<Decision> getDecisionsForOrganization(UUID organizationId) {
        return decisionRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);
    }

    @Transactional
    public Decision updateDecisionEvaluation(UUID decisionId, String actualOutcome, DecisionStatus status) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new RuntimeException("Decision not found"));
        
        decision.setActualOutcome(actualOutcome);
        decision.setStatus(status);
        return decisionRepository.save(decision);
    }
}
