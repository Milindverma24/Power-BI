package com.aibi.service;

import com.aibi.domain.ActionItem;
import com.aibi.domain.ActionStatus;
import com.aibi.domain.Comment;
import com.aibi.domain.CommentTargetType;
import com.aibi.domain.User;
import com.aibi.repository.ActionItemRepository;
import com.aibi.repository.CommentRepository;
import com.aibi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final CommentRepository commentRepository;
    private final ActionItemRepository actionItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public Comment addComment(UUID authorId, CommentTargetType targetType, UUID targetId, String content) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .author(author)
                .targetType(targetType)
                .targetId(targetId)
                .content(content)
                .build();

        comment = commentRepository.save(comment);

        // Parse @mentions
        parseMentionsAndNotify(content, author);

        return comment;
    }

    public List<Comment> getComments(UUID targetId, CommentTargetType targetType) {
        return commentRepository.findByTargetIdAndTargetTypeOrderByCreatedAtDesc(targetId, targetType);
    }

    @Transactional
    public ActionItem createActionItem(String title, UUID assignedToId, UUID assignedById, CommentTargetType targetType, UUID targetId) {
        User assignedTo = assignedToId != null ? userRepository.findById(assignedToId).orElse(null) : null;
        User assignedBy = assignedById != null ? userRepository.findById(assignedById).orElse(null) : null;

        ActionItem actionItem = ActionItem.builder()
                .title(title)
                .assignedTo(assignedTo)
                .assignedBy(assignedBy)
                .targetType(targetType)
                .targetId(targetId)
                .status(ActionStatus.PENDING)
                .build();

        return actionItemRepository.save(actionItem);
    }

    public List<ActionItem> getUserActionItems(UUID userId) {
        return actionItemRepository.findByAssignedToIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public ActionItem updateActionItemStatus(UUID actionItemId, ActionStatus status) {
        ActionItem item = actionItemRepository.findById(actionItemId)
                .orElseThrow(() -> new RuntimeException("Action Item not found"));
        item.setStatus(status);
        return actionItemRepository.save(item);
    }

    private void parseMentionsAndNotify(String content, User author) {
        // Find @username in content
        Pattern pattern = Pattern.compile("@(\\w+)");
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            String mentionedName = matcher.group(1);
            // In a real scenario, we'd lookup user by username or handle.
            // For now, this is a stub for WebSocket notification logic.
            // websocketService.sendNotification(mentionedUser.getId(), "You were mentioned by " + author.getFirstName());
        }
    }
}
