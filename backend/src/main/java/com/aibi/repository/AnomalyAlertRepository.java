package com.aibi.repository;

import com.aibi.domain.AnomalyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnomalyAlertRepository extends JpaRepository<AnomalyAlert, UUID> {
    List<AnomalyAlert> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
