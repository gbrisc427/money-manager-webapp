package com.money.manager.webapp.controller;

import com.money.manager.webapp.component.JwtUtils;
import com.money.manager.webapp.dto.AuthResponse;
import com.money.manager.webapp.dto.LoginRequest;
import com.money.manager.webapp.dto.RegisterRequest;
import com.money.manager.webapp.dto.UserProfileRequest;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.UserRepository;
import com.money.manager.webapp.security.TokenBlacklistService;
import com.money.manager.webapp.service.UserProfileService;
import com.money.manager.webapp.service.UserServ;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final UserProfileService userProfileService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;


    @Autowired
    public UserController(UserServ userService, AuthenticationManager authManager, JwtUtils jwtUtils,
                          UserRepository userRepository, PasswordEncoder passwordEncoder, UserProfileService userProfileService) {
        this.userService = userService;
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userProfileService = userProfileService;
    }

    @PostMapping("/register")
    public  ResponseEntity<?>  register(@RequestBody  @Valid RegisterRequest request) {
        userService.registerUser(request);
        return ResponseEntity.ok().body("Usuario registrado correctamente");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        UserDetails ud = (UserDetails) authentication.getPrincipal();
        String token = jwtUtils.generateToken(ud);
        return ResponseEntity.ok(new AuthResponse(token, jwtUtils.getJwtExpirationMs()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtUtils.validateToken(token)) {
                long expiry = jwtUtils.getJwtExpirationMs();
                tokenBlacklistService.isTokenBlacklisted(token);
                return ResponseEntity.ok("Logout exitoso. Token invalidado.");
            }
            return ResponseEntity.badRequest().body("Token inválido.");
        }
        return ResponseEntity.badRequest().body("No se encontró token en la petición.");
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileRequest> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build(); // JWT inválido o ausente
        }
        String email = authentication.getName();
        return ResponseEntity.ok(userProfileService.getProfile(email));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileRequest> updateName(Authentication authentication, @RequestParam String name) {
        String email = authentication.getName();
        return ResponseEntity.ok(userProfileService.updateName(email, name));
    }

    @PatchMapping("/profile/name")
    public ResponseEntity<?> updateUserName(Authentication authentication, @RequestBody Map<String, String> request) {
        String email = authentication.getName();
        String newName = request.get("newName"); // campo en el JSON
        userProfileService.updateName(email, newName);
        return ResponseEntity.ok(Map.of(
                "message", "Nombre actualizado correctamente",
                "name", newName
        ));
    }

}