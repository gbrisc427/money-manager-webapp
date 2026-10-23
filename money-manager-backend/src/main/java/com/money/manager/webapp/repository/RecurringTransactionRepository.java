package com.money.manager.webapp.repository;

import com.money.manager.webapp.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {

    List<RecurringTransaction> findByUserId(Long userId);

    @Query("SELECT r FROM RecurringTransaction r WHERE r.active = true AND r.nextPaymentDate <= :today")
    List<RecurringTransaction> findDueTransactions(@Param("today") LocalDate today);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE recurring_transactions SET amount = ROUND(amount * :rate, 2), currency = :currency WHERE account_id = :accountId", nativeQuery = true)
    void convertRecurringByAccountId(@Param("accountId") Long accountId,
                                     @Param("rate") BigDecimal rate,
                                     @Param("currency") String currency);
}
