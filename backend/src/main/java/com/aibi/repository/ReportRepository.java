package com.aibi.repository;

import com.aibi.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByOrganizationIdAndScheduledTrue(UUID organizationId);
    List<Report> findByOrganizationIdAndScheduledFalseOrderByReportDateDesc(UUID organizationId);
}
