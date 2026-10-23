package com.money.manager.webapp.controller;

import com.money.manager.webapp.dto.CategoryStatRequest;
import com.money.manager.webapp.dto.MonthlyStatRequest;
import com.money.manager.webapp.dto.TransactionRequest;
import com.money.manager.webapp.dto.TransactionResponse;
import com.money.manager.webapp.model.Account;
import com.money.manager.webapp.model.Category;
import com.money.manager.webapp.model.RecurringTransaction;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.AccountRepository;
import com.money.manager.webapp.repository.CategoryRepository;
import com.money.manager.webapp.repository.UserRepository;
import com.money.manager.webapp.service.RecurringTransactionService;
import com.money.manager.webapp.service.TransactionService;
import com.money.manager.webapp.service.UserServ;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    @Autowired
    private RecurringTransactionService recurringService;
    private final UserRepository userRepository;
    private final UserServ userService;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;

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

    @PostMapping("/recurring")
    public ResponseEntity<?> createRecurring(@RequestBody @Valid TransactionRequest req, Authentication auth) {
        User user = userService.findByEmail(auth.getName());

        Account account = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        RecurringTransaction rec = RecurringTransaction.builder()
                .description(req.getDescription())
                .amount(req.getAmount())
                .type(req.getType())
                .account(account)
                .category(category)
                .userId(user.getId())
                .startDate(LocalDate.now())
                .nextPaymentDate(LocalDate.now())
                .active(true)
                .build();

        recurringService.create(rec);

        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Transacción recurrente creada"));
    }

    @GetMapping("/recurring")
    public ResponseEntity<List<RecurringTransaction>> getMyRecurringTransactions(Authentication auth) {
        User user = userService.findByEmail(auth.getName());
        return ResponseEntity.ok(recurringService.getAllByUser(user.getId()));
    }

    @DeleteMapping("/recurring/{id}")
    public ResponseEntity<?> cancelRecurring(@PathVariable Long id) {
        recurringService.cancel(id);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Recurrencia cancelada"));
    }
}