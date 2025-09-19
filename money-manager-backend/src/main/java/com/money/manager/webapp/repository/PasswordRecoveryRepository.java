package com.money.manager.webapp.repository;


import com.money.manager.webapp.model.PasswordRecovery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordRecoveryRepository extends JpaRepository<PasswordRecovery, Long> {
    Optional<PasswordRecovery> findByEmail(String email);
    void deleteByEmail(String email);
}