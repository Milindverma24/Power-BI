package com.aibi.repository;

import com.aibi.domain.DataSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DataSourceRepository extends JpaRepository<DataSource, UUID> {
    List<DataSource> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
