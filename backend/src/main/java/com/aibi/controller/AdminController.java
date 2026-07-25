package com.aibi.controller;

import com.aibi.domain.Role;
import com.aibi.domain.User;
import com.aibi.repository.OrganizationRepository;
import com.aibi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).body("Access denied. Super Admin only.");
        }

        long totalUsers = userRepository.count();
        long totalOrganizations = organizationRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalOrganizations", totalOrganizations);
        stats.put("activeSubscriptions", totalOrganizations); // mock
        stats.put("apiUsageThisMonth", 45023); // mock

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).body("Access denied. Super Admin only.");
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/organizations")
    public ResponseEntity<?> getAllOrganizations(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).body("Access denied. Super Admin only.");
        }
        return ResponseEntity.ok(organizationRepository.findAll());
    }
}
