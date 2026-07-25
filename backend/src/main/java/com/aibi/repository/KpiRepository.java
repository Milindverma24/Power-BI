package com.aibi.repository;

import com.aibi.domain.KpiDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KpiRepository extends JpaRepository<KpiDefinition, UUID> {
    List<KpiDefinition> findByOrganizationId(UUID organizationId);
}
