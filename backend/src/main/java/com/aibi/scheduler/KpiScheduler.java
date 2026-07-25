package com.aibi.scheduler;

import com.aibi.domain.KpiDefinition;
import com.aibi.repository.KpiRepository;
import com.aibi.service.KpiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class KpiScheduler {

    private final KpiRepository kpiRepository;
    private final KpiService kpiService;

    // Run every hour. For demonstration, we could use a shorter interval like every 5 minutes: "0 0/5 * * * *"
    // For this prototype, let's run it every 5 minutes.
    @Scheduled(cron = "0 0/5 * * * *")
    public void evaluateAllKpis() {
        log.info("Starting scheduled KPI evaluation job...");
        List<KpiDefinition> kpis = kpiRepository.findAll();
        for (KpiDefinition kpi : kpis) {
            try {
                kpiService.evaluateKpi(kpi);
                log.info("Successfully evaluated KPI: {}", kpi.getName());
            } catch (Exception e) {
                log.error("Error evaluating KPI: {}", kpi.getName(), e);
            }
        }
        log.info("Completed scheduled KPI evaluation job.");
    }
}
