package com.levelup.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;

  @Value("${app.frontend-url}")
  private String frontendUrl;

  @Value("${app.mail.from}")
  private String fromAddress;

  public void sendPasswordResetEmail(String toEmail, String token) {
    String resetLink = frontendUrl + "/reset-password?token=" + token;

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(toEmail);
    message.setFrom(fromAddress);
    message.setSubject("Reset your LevelUp password");
    message.setText(
        "Click the link below to reset your password. It expires in 15 minutes.\n\n" + resetLink);

    mailSender.send(message);
  }
}
