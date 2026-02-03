package com.money.manager.webapp.controller;

import com.money.manager.webapp.dto.CategoryStatRequest;
import com.money.manager.webapp.dto.MonthlyStatRequest;
import com.money.manager.webapp.dto.TransactionRequest;
import com.money.manager.webapp.dto.TransactionResponse;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.UserRepository;
import com.money.manager.webapp.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.createTransaction(request, getCurrentUserId()));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions(getCurrentUserId()));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(transactionService.getTransactionsByAccount(accountId, getCurrentUserId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/categories")
    public ResponseEntity<List<CategoryStatRequest>> getCategoryStats(Authentication authentication) {
        return ResponseEntity.ok(transactionService.getExpensesByCategoryStats(authentication.getName()));
    }

    @GetMapping("/stats/monthly")
    public ResponseEntity<List<MonthlyStatRequest>> getMonthlyStats(Authentication authentication) {
        return ResponseEntity.ok(transactionService.getLast6MonthsStats(authentication.getName()));
    }
}