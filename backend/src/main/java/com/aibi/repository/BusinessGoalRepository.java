package com.aibi.repository;

import com.aibi.domain.BusinessGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessGoalRepository extends JpaRepository<BusinessGoal, UUID> {
    List<BusinessGoal> findByOrganizationIdOrderByTargetDateAsc(UUID organizationId);
}
