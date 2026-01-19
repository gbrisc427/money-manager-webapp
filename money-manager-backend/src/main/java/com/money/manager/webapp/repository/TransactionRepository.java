package com.money.manager.webapp.repository;


import com.money.manager.webapp.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByAccountIdAndUserId(Long accountId, Long userId);
    List<Transaction> findByCategoryId(Long categoryId);
}
