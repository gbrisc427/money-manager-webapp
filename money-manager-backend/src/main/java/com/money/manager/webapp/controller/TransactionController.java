package com.money.manager.webapp.controller;

import com.money.manager.webapp.model.Transaction;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.UserRepository;
import com.money.manager.webapp.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    public TransactionController(TransactionService transactionService, UserRepository userRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        userRepository.findByEmail(auth.getName());
        Optional<User> user = Optional.empty();
        if (userRepository.existsByEmail(auth.getName())){
            user = userRepository.findByEmail(auth.getName());
        }
        return user.map(User::getId).orElse(null);
    }


    @PostMapping("/new")
    public ResponseEntity<Transaction> createIncome(@RequestParam Long accountId,
                                                    @RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionService.createTransaction(transaction, accountId));
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.getAllTransactions(getCurrentUserId());
    }

    @GetMapping("/account/{accountId}")
    public List<Transaction> getTransactionsByAccount(@PathVariable Long accountId) {
        return transactionService.getTransactionsByAccount(accountId, getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id, getCurrentUserId());
    }
}
