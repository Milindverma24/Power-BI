package com.aibi.scheduler;

import com.aibi.domain.Decision;
import com.aibi.domain.DecisionStatus;
import com.aibi.repository.DecisionRepository;
import com.aibi.service.DecisionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DecisionEvaluatorScheduler {

    private final DecisionRepository decisionRepository;
    private final DecisionService decisionService;
    // private final AiUnderstandingService aiService; 

    // Run every day at 1 AM
    @Scheduled(cron = "0 0 1 * * ?")
    public void evaluatePendingDecisions() {
        log.info("Starting scheduled evaluation of business decisions...");
        List<Decision> pendingDecisions = decisionRepository.findPendingEvaluations();

        for (Decision decision : pendingDecisions) {
            try {
                log.info("Evaluating decision: {}", decision.getTitle());
                
                // In a full implementation, we would query the AI Service here.
                // e.g. String evaluation = aiService.evaluateDecisionOutcome(decision.getExpectedOutcome(), getCurrentMetrics(decision.getOrganization().getId()));
                
                // For now, simulating the AI's response
                String simulatedOutcome = "AI Evaluation: The expected outcome of '" + decision.getExpectedOutcome() + 
                                          "' has been partially met based on current KPI trajectories.";
                
                DecisionStatus newStatus = DecisionStatus.SUCCESS; // Or FAILED based on AI logic
                
                decisionService.updateDecisionEvaluation(decision.getId(), simulatedOutcome, newStatus);
                log.info("Successfully evaluated decision: {}", decision.getId());
            } catch (Exception e) {
                log.error("Failed to evaluate decision: {}", decision.getId(), e);
            }
        }
    }
}
