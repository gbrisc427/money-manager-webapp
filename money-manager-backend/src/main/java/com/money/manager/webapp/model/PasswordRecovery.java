package com.money.manager.webapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_recovery")
public class PasswordRecovery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String code;

    private LocalDateTime expiration;

    private int attemptsRemaining;

    private boolean verified;

    public PasswordRecovery() {}

    public PasswordRecovery(String email, String code, LocalDateTime expiration, int attemptsRemaining) {
        this.email = email;
        this.code = code;
        this.expiration = expiration;
        this.attemptsRemaining = attemptsRemaining;
        this.verified = false;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getCode() {
        return code;
    }

    public LocalDateTime getExpiration() {
        return expiration;
    }

    public int getAttemptsRemaining() {
        return attemptsRemaining;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public void setAttemptsRemaining(int attemptsRemaining) {
        this.attemptsRemaining = attemptsRemaining;
    }

    public void setExpiration(LocalDateTime expiration) {
        this.expiration = expiration;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
