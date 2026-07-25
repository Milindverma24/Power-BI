package com.aibi.repository;

import com.aibi.domain.DashboardVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DashboardVersionRepository extends JpaRepository<DashboardVersion, UUID> {
    List<DashboardVersion> findByDashboardIdOrderByVersionNumberDesc(UUID dashboardId);
}
