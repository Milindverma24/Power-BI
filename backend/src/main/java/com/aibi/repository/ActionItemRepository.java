package com.aibi.repository;

import com.aibi.domain.ActionItem;
import com.aibi.domain.ActionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActionItemRepository extends JpaRepository<ActionItem, UUID> {
    List<ActionItem> findByAssignedToIdOrderByCreatedAtDesc(UUID userId);
    List<ActionItem> findByTargetIdAndStatus(UUID targetId, ActionStatus status);
}
