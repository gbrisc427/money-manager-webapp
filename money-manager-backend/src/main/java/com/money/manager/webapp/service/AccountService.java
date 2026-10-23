package com.money.manager.webapp.service;

import com.money.manager.webapp.model.Account;
import com.money.manager.webapp.repository.AccountRepository;
import com.money.manager.webapp.repository.RecurringTransactionRepository;
import com.money.manager.webapp.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final ExchangeRateService exchangeRateService;

    public AccountService(AccountRepository accountRepository,
                          TransactionRepository transactionRepository,
                          RecurringTransactionRepository recurringTransactionRepository,
                          ExchangeRateService exchangeRateService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.exchangeRateService = exchangeRateService;
    }

    public Account createAccount(Account account) {
        account.setCurrency(exchangeRateService.normalizeCurrency(account.getCurrency()));
        return accountRepository.save(account);
    }

    public Optional<Account> getAccount(Long id, Long userId) {
        return accountRepository.findById(id)
                .filter(account -> account.getUserId().equals(userId));
    }

    public List<Account> getAllAccounts(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    @Transactional
    public Account updateAccount(Account account, Long userId) {
        return accountRepository.findById(account.getId())
                .filter(a -> a.getUserId().equals(userId))
                .map(a -> {
                    String oldCurrency = exchangeRateService.normalizeCurrency(a.getCurrency());
                    String newCurrency = exchangeRateService.normalizeCurrency(
                            account.getCurrency() != null ? account.getCurrency() : oldCurrency
                    );

                    a.setName(account.getName());
                    a.setType(account.getType());

                    if (!oldCurrency.equals(newCurrency)) {
                        BigDecimal rate = exchangeRateService.getExchangeRate(oldCurrency, newCurrency);
                        BigDecimal convertedBalance = a.getBalance()
                                .multiply(rate)
                                .setScale(2, RoundingMode.HALF_UP);
                        a.setBalance(convertedBalance);
                        a.setCurrency(newCurrency);

                        Account saved = accountRepository.save(a);
                        transactionRepository.convertTransactionsByAccountId(saved.getId(), rate, newCurrency);
                        recurringTransactionRepository.convertRecurringByAccountId(saved.getId(), rate, newCurrency);
                        return saved;
                    } else {
                        if (account.getBalance() != null) {
                            a.setBalance(account.getBalance());
                        }
                        a.setCurrency(oldCurrency);
                        return accountRepository.save(a);
                    }
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
