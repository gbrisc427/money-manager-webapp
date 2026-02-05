package com.money.manager.webapp.repository;

import com.money.manager.webapp.model.RefreshToken;
import com.money.manager.webapp.model.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user);
    @Modifying
    @Transactional
    int deleteByUser(User user);

    List<RefreshToken> findByUserId(Long userId);
}