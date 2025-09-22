package com.money.manager.webapp.controller;

import com.money.manager.webapp.model.Account;
import com.money.manager.webapp.security.CustomUserDetails;
import com.money.manager.webapp.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((CustomUserDetails) auth.getPrincipal()).getId();
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        account.setUserId(getCurrentUserId());
        return ResponseEntity.ok(accountService.createAccount(account));
    }

    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(accountService.getAllAccounts(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccount(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return accountService.getAccount(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable Long id,
                                                 @RequestBody Account account) {
        Long userId = getCurrentUserId();
        account.setId(id);
        return ResponseEntity.ok(accountService.updateAccount(account, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        accountService.deleteAccount(id, userId);
        return ResponseEntity.noContent().build();
    }
}
