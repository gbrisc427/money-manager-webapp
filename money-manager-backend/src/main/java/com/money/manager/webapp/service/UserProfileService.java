package com.money.manager.webapp.service;


import com.money.manager.webapp.dto.UserProfileRequest;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class UserProfileService {

    private final UserRepository userRepository;

    public UserProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileRequest getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return new UserProfileRequest(user.getFullName(), user.getEmail());
    }

    @Transactional
    public UserProfileRequest updateName(String email, String newName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setFullName(newName);
        userRepository.save(user);
        return new UserProfileRequest(user.getFullName(), user.getEmail());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
