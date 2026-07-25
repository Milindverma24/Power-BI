package com.aibi.repository;

import com.aibi.domain.Comment;
import com.aibi.domain.CommentTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByTargetIdAndTargetTypeOrderByCreatedAtDesc(UUID targetId, CommentTargetType targetType);
}
