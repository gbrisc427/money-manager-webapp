package com.money.manager.webapp.service;

import com.money.manager.webapp.dto.RegisterRequest;
import com.money.manager.webapp.exception.UserAlreadyExistsException;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;




@Service
public class UserServ {

    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final EmailService emailService;

    public UserServ(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("El correo ya está registrado");
        }

        User newUser = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(newUser);
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName());

        return userRepository.save(newUser);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

}
