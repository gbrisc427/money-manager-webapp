package com.money.manager.webapp.service;

import com.money.manager.webapp.dto.CategoryStatRequest;
import com.money.manager.webapp.dto.MonthlyStatRequest;
import com.money.manager.webapp.dto.TransactionRequest;
import com.money.manager.webapp.dto.TransactionResponse;
import com.money.manager.webapp.model.Account;
import com.money.manager.webapp.model.Transaction;
import com.money.manager.webapp.model.TransactionType;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.AccountRepository;
import com.money.manager.webapp.repository.CategoryRepository;
import com.money.manager.webapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserServ userService;

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions(Long userId) {
        return transactionRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByAccount(Long accountId, Long userId) {
        return transactionRepository.findByAccountIdAndUserId(accountId, userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, Long userId) {

        Account account = accountRepository.findById(request.getAccountId())
                .filter(a -> a.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada o no pertenece al usuario"));

        boolean categoryExists = categoryRepository.existsById(request.getCategoryId());
        if (!categoryExists) {
            throw new RuntimeException("Categoría no encontrada");
        }

        Transaction transaction = Transaction.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .type(request.getType())
                .date(request.getDate() != null ? request.getDate() : LocalDateTime.now())
                .account(account)
                .categoryId(request.getCategoryId())
                .userId(userId)
                .build();

        updateAccountBalance(account, request.getAmount(), request.getType(), false);
        accountRepository.save(account);

        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToResponse(savedTransaction);
    }

    @Transactional
    public void deleteTransaction(Long id, Long userId) {
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada"));

        updateAccountBalance(transaction.getAccount(), transaction.getAmount(), transaction.getType(), true);
        accountRepository.save(transaction.getAccount());

        transactionRepository.delete(transaction);
    }

    private void updateAccountBalance(Account account, BigDecimal amount, TransactionType type, boolean isReversal) {
        BigDecimal adjustment = amount;

        if (type == TransactionType.EXPENSE) {
            adjustment = adjustment.negate();
        }

        if (isReversal) {
            adjustment = adjustment.negate();
        }

        account.setBalance(account.getBalance().add(adjustment));
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .description(t.getDescription())
                .amount(t.getAmount())
                .type(t.getType())
                .date(t.getDate())
                .accountName(t.getAccount().getName())
                .categoryId(t.getCategoryId())
                .build();
    }

    public List<CategoryStatRequest> getExpensesByCategoryStats(String email) {
        User user = userService.findByEmail(email);
        return transactionRepository.findExpensesByCategory(user.getId());
    }

    public List<MonthlyStatRequest> getLast6MonthsStats(String email) {
        User user = userService.findByEmail(email);

        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(5).withDayOfMonth(1);

        List<Transaction> transactions = transactionRepository.findTransactionsAfterDate(user.getId(), sixMonthsAgo);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        Map<String, MonthlyStatRequest> statsMap = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getDate().format(formatter),
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            double income = list.stream()
                                    .filter(t -> t.getType().toString().equals("INCOME"))
                                    .mapToDouble(t -> t.getAmount().doubleValue())
                                    .sum();

                            double expense = list.stream()
                                    .filter(t -> t.getType().toString().equals("EXPENSE"))
                                    .mapToDouble(t -> t.getAmount().doubleValue())
                                    .sum();

                            return new MonthlyStatRequest(list.get(0).getDate().format(formatter), income, expense);
                        })
                ));

        List<MonthlyStatRequest> result = new ArrayList<>();
        LocalDate current = sixMonthsAgo;
        LocalDate now = LocalDate.now().withDayOfMonth(1);

        while (!current.isAfter(now)) {
            String monthKey = current.format(formatter);
            result.add(statsMap.getOrDefault(monthKey, new MonthlyStatRequest(monthKey, 0.0, 0.0)));
            current = current.plusMonths(1);
        }

        return result;
    }
}