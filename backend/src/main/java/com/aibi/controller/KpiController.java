package com.aibi.controller;

import com.aibi.domain.DataSource;
import com.aibi.domain.KpiDefinition;
import com.aibi.domain.User;
import com.aibi.repository.DataSourceRepository;
import com.aibi.service.KpiService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/kpi")
@RequiredArgsConstructor
@Slf4j
public class KpiController {

    private final KpiService kpiService;
    private final DataSourceRepository dataSourceRepository;

    @Data
    public static class CreateKpiRequest {
        private UUID dataSourceId;
        private String name;
        private BigDecimal targetValue;
        private String nlQuery;
    }

    @PostMapping
    public ResponseEntity<?> createKpi(@RequestBody CreateKpiRequest request, @AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("No organization assigned");
        }

        DataSource dataSource = dataSourceRepository.findById(request.getDataSourceId()).orElse(null);
        if (dataSource == null || !dataSource.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            return ResponseEntity.status(403).body("Data source not found or access denied.");
        }

        try {
            KpiDefinition kpiDefinition = KpiDefinition.builder()
                    .organization(currentUser.getOrganization())
                    .dataSource(dataSource)
                    .name(request.getName())
                    .targetValue(request.getTargetValue())
                    .nlQuery(request.getNlQuery())
                    .build();

            KpiDefinition createdKpi = kpiService.createKpi(kpiDefinition);
            return ResponseEntity.ok(createdKpi);
        } catch (Exception e) {
            log.error("Failed to create KPI", e);
            return ResponseEntity.internalServerError().body("Failed to create KPI: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getKpis(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(kpiService.getAllKpis(currentUser.getOrganization().getId()));
    }
}
