package com.aibi.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = "http://localhost:5173/verify-email?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Please verify your email address");
        message.setText("Click the link to verify your email: " + verificationUrl);
        mailSender.send(message);
        log.info("Verification email sent to {}", toEmail);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset Request");
        message.setText("Click the link to reset your password: " + resetUrl);
        mailSender.send(message);
        log.info("Password reset email sent to {}", toEmail);
    }

    public void sendInviteEmail(String toEmail, String token, String orgName) {
        String inviteUrl = "http://localhost:5173/accept-invite?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("You've been invited to join " + orgName);
        message.setText("Click the link to accept your invitation and set your password: " + inviteUrl);
        mailSender.send(message);
        log.info("Invite email sent to {}", toEmail);
    }
}
