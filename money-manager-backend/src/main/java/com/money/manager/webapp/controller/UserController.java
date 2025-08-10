package com.money.manager.webapp.controller;

import com.money.manager.webapp.component.JwtUtils;
import com.money.manager.webapp.dto.LoginRequest;
import com.money.manager.webapp.dto.RegisterRequest;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.UserRepository;
import com.money.manager.webapp.service.UserServ;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserServ userService;
    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public UserController(UserServ userService, AuthenticationManager authManager, JwtUtils jwtUtils,
                          UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public User register(@RequestBody  @Valid RegisterRequest request) {
        return userService.registerUser(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
            User user = userRepository.findByEmail(req.getEmail()).get();
            String token = jwtUtils.generateToken((UserDetails) auth.getPrincipal(), user.getId());
            Map<String,Object> body = Map.of(
                    "token", token,
                    "user", Map.of("id", user.getId(), "fullName", user.getFullName(), "email", user.getEmail())
            );
            return ResponseEntity.ok(body);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error","Credenciales inválidas"));
        }
    }

}