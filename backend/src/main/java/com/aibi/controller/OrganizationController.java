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

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final UserRepository userRepository;

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
}
