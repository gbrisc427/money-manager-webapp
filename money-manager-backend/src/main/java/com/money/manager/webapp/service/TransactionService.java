package com.money.manager.webapp.service;

import com.money.manager.webapp.model.*;
import com.money.manager.webapp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionService(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction, Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));
        transaction.setAccount(account);

        if (transaction.getAmount() > 0) {
            account.setBalance(account.getBalance().add(BigDecimal.valueOf(transaction.getAmount())));
            transaction.setType(TransactionType.INCOME);
        } else {
            account.setBalance(account.getBalance().subtract(BigDecimal.valueOf(transaction.getAmount())));
            transaction.setType(TransactionType.EXPENSE);
        }
        accountRepository.save(account);

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getTransactionsByAccount(Long accountId, Long userId) {
        return transactionRepository.findByAccountIdAndUserId(accountId, userId);
    }

    public void deleteTransaction(Long id, Long userId) {
        Transaction tx = transactionRepository.findById(id)
                .filter(t -> t.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada o no pertenece al usuario"));

        // Revertir balance
        Account account = tx.getAccount();
        if (tx.getType() == TransactionType.INCOME) {
            account.setBalance(account.getBalance().subtract(BigDecimal.valueOf(tx.getAmount())));
        } else {
            account.setBalance(account.getBalance().add(BigDecimal.valueOf(tx.getAmount())));
        }
        accountRepository.save(account);

        transactionRepository.delete(tx);
    }
}
