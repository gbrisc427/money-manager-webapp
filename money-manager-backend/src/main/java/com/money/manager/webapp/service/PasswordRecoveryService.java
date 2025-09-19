package com.money.manager.webapp.service;

import com.money.manager.webapp.model.PasswordRecovery;
import com.money.manager.webapp.repository.PasswordRecoveryRepository;
import com.money.manager.webapp.repository.UserRepository;
import com.money.manager.webapp.model.User;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordRecoveryService {

    private final PasswordRecoveryRepository recoveryRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public PasswordRecoveryService(PasswordRecoveryRepository recoveryRepo,
                                   UserRepository userRepo,
                                   PasswordEncoder passwordEncoder) {
        this.recoveryRepo = recoveryRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }


    @Transactional
    public void requestRecovery(String email) {
        if (userRepo.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Email no registrado");
        }

        // Borro códigos anteriores
        recoveryRepo.deleteByEmail(email);

        String code = String.valueOf(new Random().nextInt(900000) + 100000); // 6 dígitos
        PasswordRecovery recovery = new PasswordRecovery(
                email,
                code,
                LocalDateTime.now().plusMinutes(10),
                3
        );

        recoveryRepo.save(recovery);

        // Aquí mandarías el correo con JavaMailSender
        System.out.println("Código enviado al correo (" + email + "): " + code);
    }

    // Paso 2: Verificar código
    public void verifyCode(String email, String code) {
        PasswordRecovery recovery = recoveryRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No hay solicitud de recuperación activa"));

        if (recovery.getExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El código ha expirado");
        }

        if (recovery.getAttemptsRemaining() <= 0) {
            throw new RuntimeException("Se han agotado los intentos, solicita un nuevo código");
        }

        if (!recovery.getCode().equals(code)) {
            recovery.setAttemptsRemaining(recovery.getAttemptsRemaining() - 1);
            recoveryRepo.save(recovery);
            throw new RuntimeException("Código incorrecto. Intentos restantes: " + recovery.getAttemptsRemaining());
        }

        recovery.setVerified(true);
        recoveryRepo.save(recovery);
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        PasswordRecovery recovery = recoveryRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No hay proceso de recuperación activo"));

        if (!recovery.isVerified()) {
            throw new RuntimeException("Primero debes verificar el código");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        recoveryRepo.deleteByEmail(email); // limpio el proceso
    }
}
