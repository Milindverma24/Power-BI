package com.aibi.controller;

import com.aibi.domain.User;
import com.aibi.dto.EmployeeResponse;
import com.aibi.dto.OrganizationResponse;
import com.aibi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final UserRepository userRepository;
    private final com.aibi.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.aibi.service.EmailService emailService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<OrganizationResponse> getMyOrganization(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.notFound().build();
        }
        
        OrganizationResponse response = OrganizationResponse.builder()
                .id(currentUser.getOrganization().getId())
                .name(currentUser.getOrganization().getName())
                .createdAt(currentUser.getOrganization().getCreatedAt())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeResponse>> getEmployees(@AuthenticationPrincipal User currentUser) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.ok(List.of());
        }

        // Wait, UserRepository needs a method findByOrganizationId
        // I will add it to UserRepository shortly. For now, fetch all and filter manually, 
        // or just add the method to UserRepository now.
        // I'll update UserRepository.
        
        List<User> employees = userRepository.findByOrganizationId(currentUser.getOrganization().getId());
        
        List<EmployeeResponse> response = employees.stream()
                .map(user -> EmployeeResponse.builder()
                        .id(user.getId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                        .build())
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(response);
    }

    @PostMapping("/invites")
    public ResponseEntity<?> inviteEmployee(@AuthenticationPrincipal User currentUser, @RequestBody com.aibi.dto.InviteEmployeeRequest request) {
        if (currentUser.getOrganization() == null) {
            return ResponseEntity.badRequest().body("You must be part of an organization to invite employees.");
        }
        
        // 1. Create User
        User newUser = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .role(request.getRole() != null ? com.aibi.domain.Role.valueOf(request.getRole().toUpperCase()) : com.aibi.domain.Role.VIEWER)
                .password(java.util.UUID.randomUUID().toString()) // Random password initially
                .organization(currentUser.getOrganization())
                .emailVerified(false)
                .build();
        userRepository.save(newUser);

        // 2. Generate a PasswordResetToken for the invite
        String token = java.util.UUID.randomUUID().toString();
        com.aibi.domain.PasswordResetToken resetToken = com.aibi.domain.PasswordResetToken.builder()
                .user(newUser)
                .token(token)
                .expiryDate(java.time.Instant.now().plus(7, java.time.temporal.ChronoUnit.DAYS))
                .build();
        passwordResetTokenRepository.save(resetToken);
        
        emailService.sendInviteEmail(newUser.getEmail(), token, currentUser.getOrganization().getName());

        return ResponseEntity.ok("Invite sent successfully.");
    }

    @PostMapping("/invites/accept")
    public ResponseEntity<?> acceptInvite(@RequestBody com.aibi.dto.AcceptInviteRequest request) {
        com.aibi.domain.PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired invite token"));

        if (resetToken.getExpiryDate().compareTo(java.time.Instant.now()) < 0) {
            throw new RuntimeException("Invite token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(true);
        userRepository.save(user);
        
        passwordResetTokenRepository.delete(resetToken);

        return ResponseEntity.ok("Password set successfully. You can now log in.");
    }
}
