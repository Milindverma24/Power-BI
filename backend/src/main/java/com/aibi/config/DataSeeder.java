package com.aibi.config;

import com.aibi.domain.Organization;
import com.aibi.domain.Role;
import com.aibi.domain.User;
import com.aibi.repository.OrganizationRepository;
import com.aibi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            Organization org = Organization.builder()
                    .name("Default Organization")
                    .build();
            organizationRepository.save(org);

            User user = User.builder()
                    .email("jatinverma1234567890@gmail.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("Jatin")
                    .lastName("Verma")
                    .role(Role.ORG_ADMIN)
                    .organization(org)
                    .emailVerified(true)
                    .build();
            userRepository.save(user);
        }
    }
}
