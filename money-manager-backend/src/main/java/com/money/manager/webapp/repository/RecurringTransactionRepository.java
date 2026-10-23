package com.money.manager.webapp.repository;

import com.money.manager.webapp.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {

    List<RecurringTransaction> findByUserId(Long userId);

    @Query("SELECT r FROM RecurringTransaction r WHERE r.active = true AND r.nextPaymentDate <= :today")
    List<RecurringTransaction> findDueTransactions(@Param("today") LocalDate today);
}