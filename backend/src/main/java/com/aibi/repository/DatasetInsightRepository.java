package com.aibi.repository;

import com.aibi.domain.DatasetInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DatasetInsightRepository extends JpaRepository<DatasetInsight, UUID> {
}
