package com.money.manager.webapp.service;


import com.money.manager.webapp.model.Account;
import com.money.manager.webapp.repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Account createAccount(Account account) {
        return accountRepository.save(account);
    }

    public Optional<Account> getAccount(Long id, Long userId) {
        return accountRepository.findById(id)
                .filter(account -> account.getUserId().equals(userId));
    }

    public List<Account> getAllAccounts(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    public Account updateAccount(Account account, Long userId) {
        return accountRepository.findById(account.getId())
                .filter(a -> a.getUserId().equals(userId))
                .map(a -> {
                    a.setName(account.getName());
                    a.setType(account.getType());
                    a.setBalance(account.getBalance());
                    return accountRepository.save(a);
                })
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada o no pertenece al usuario"));
    }

    public void deleteAccount(Long id, Long userId) {
        accountRepository.findById(id)
                .filter(a -> a.getUserId().equals(userId))
                .ifPresentOrElse(accountRepository::delete,
                        () -> { throw new RuntimeException("Cuenta no encontrada o no pertenece al usuario"); });
    }
}
