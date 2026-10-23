package com.money.manager.webapp.repository;


import com.money.manager.webapp.dto.CategoryStatRequest;
import com.money.manager.webapp.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByAccountIdAndUserId(Long accountId, Long userId);
    List<Transaction> findByCategoryId(Long categoryId);

    @Query("SELECT new com.money.manager.webapp.dto.CategoryStatRequest(t.category.name, t.category.color, SUM(t.amount)) " +
            "FROM Transaction t " +
            "WHERE t.userId = :userId AND t.type = 'EXPENSE' " +
            "GROUP BY t.category.name, t.category.color")
    List<CategoryStatRequest> findExpensesByCategory(@Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.date >= :startDate")
    List<Transaction> findTransactionsAfterDate(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
            "WHERE t.userId = :userId " +
            "AND t.categoryId = :categoryId " +
            "AND t.type = 'EXPENSE' " +
            "AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal getSpentInCategory(@Param("userId") Long userId,
                                  @Param("categoryId") Long categoryId,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);

}
