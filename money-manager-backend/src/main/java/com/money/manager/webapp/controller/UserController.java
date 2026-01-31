package com.money.manager.webapp.controller;

import com.money.manager.webapp.component.JwtUtils;
import com.money.manager.webapp.dto.LoginRequest;
import com.money.manager.webapp.dto.RegisterRequest;
import com.money.manager.webapp.dto.UserProfileRequest;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.UserRepository;
import com.money.manager.webapp.security.TokenBlacklistService;
import com.money.manager.webapp.service.RefreshTokenService;
import com.money.manager.webapp.service.UserProfileService;
import com.money.manager.webapp.service.UserServ;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
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
    private RefreshTokenService refreshTokenService;

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
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request) {
        userService.registerUser(request);
        return ResponseEntity.ok().body(Collections.singletonMap("message", "Usuario registrado correctamente"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        UserDetails ud = (UserDetails) authentication.getPrincipal();
        User user = userService.findByEmail(ud.getUsername());

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", jwtUtils.generateToken(ud))
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(15 * 60)
                .build();

        com.money.manager.webapp.model.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Collections.singletonMap("message", "Login exitoso"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String refreshTokenStr = null;
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshTokenStr = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshTokenStr == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Refresh Token necesario"));
        }

        return refreshTokenService.findByToken(refreshTokenStr)
                .map(refreshTokenService::verifyExpiration)
                .map(com.money.manager.webapp.model.RefreshToken::getUser)
                .map(user -> {
                    String newAccessToken = jwtUtils.generateToken(user.getEmail());
                    // CONFIGURACIÓN SIMPLIFICADA
                    ResponseCookie newAccessCookie = ResponseCookie.from("accessToken", newAccessToken)
                            .httpOnly(true)
                            .path("/")
                            .maxAge(15 * 60)
                            .build();

                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, newAccessCookie.toString())
                            .body(Collections.singletonMap("message", "Token renovado"));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token no válido"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .path("/")
                .secure(false)
                .maxAge(0)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/")
                .secure(false)
                .maxAge(0)
                .build();

        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    String tokenVal = cookie.getValue();
                    refreshTokenService.findByToken(tokenVal)
                            .ifPresent(token -> refreshTokenService.deleteByUserId(token.getUser().getId()));
                    break;
                }
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Collections.singletonMap("message", "Logout exitoso"));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileRequest> getProfile(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(userProfileService.getProfile(authentication.getName()));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileRequest> updateName(Authentication authentication, @RequestParam String name) {
        return ResponseEntity.ok(userProfileService.updateName(authentication.getName(), name));
    }

    @PatchMapping("/profile/name")
    public ResponseEntity<?> updateUserName(Authentication authentication, @RequestBody Map<String, String> request) {
        String newName = request.get("newName");
        userProfileService.updateName(authentication.getName(), newName);
        return ResponseEntity.ok(Map.of("message", "Nombre actualizado", "name", newName));
    }
}