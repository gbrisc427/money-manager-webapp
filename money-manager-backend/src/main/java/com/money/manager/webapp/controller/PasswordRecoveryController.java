package com.money.manager.webapp.controller;


import com.money.manager.webapp.dto.ResetPasswordRequest;
import com.money.manager.webapp.service.PasswordRecoveryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/recover")
public class PasswordRecoveryController {

    private final PasswordRecoveryService recoveryService;

    public PasswordRecoveryController(PasswordRecoveryService recoveryService) {
        this.recoveryService = recoveryService;
    }

    @PostMapping("/request")
    public ResponseEntity<String> requestRecovery(@RequestParam String email) {
        recoveryService.requestRecovery(email);
        return ResponseEntity.ok("Código enviado al correo");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyCode(@RequestParam String email, @RequestParam String code) {
        recoveryService.verifyCode(email, code);
        return ResponseEntity.ok("Código verificado correctamente");
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        recoveryService.resetPassword(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok("Contraseña restablecida correctamente");
    }
}
