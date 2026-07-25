package com.aibi.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = "http://localhost:5173/verify-email?token=" + token;
        log.info("=========================================================");
        log.info("MOCK EMAIL SENT TO: {}", toEmail);
        log.info("Subject: Please verify your email address");
        log.info("Body: Click the link to verify your email: {}", verificationUrl);
        log.info("=========================================================");
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        log.info("=========================================================");
        log.info("MOCK EMAIL SENT TO: {}", toEmail);
        log.info("Subject: Password Reset Request");
        log.info("Body: Click the link to reset your password: {}", resetUrl);
        log.info("=========================================================");
    }
}
