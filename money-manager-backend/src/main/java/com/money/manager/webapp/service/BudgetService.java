package com.money.manager.webapp.service;

import com.money.manager.webapp.dto.BudgetRequest;
import com.money.manager.webapp.model.Budget;
import com.money.manager.webapp.model.Category;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.BudgetRepository;
import com.money.manager.webapp.repository.CategoryRepository;
import com.money.manager.webapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserServ userService;

    public List<BudgetRequest> getUserBudgets(String email) {
        User user = userService.findByEmail(email);
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        List<BudgetRequest> result = new ArrayList<>();

        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);

        for (Budget b : budgets) {
            BigDecimal spent = transactionRepository.getSpentInCategory(user.getId(), b.getCategory().getId(), startOfMonth, endOfMonth);
            if (spent == null) spent = BigDecimal.ZERO;

            double percentage = 0;
            if (b.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                percentage = spent.divide(b.getAmount(), 2, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue();
            }

            result.add(BudgetRequest.builder()
                    .id(b.getId())
                    .categoryId(b.getCategory().getId())
                    .categoryName(b.getCategory().getName())
                    .categoryColor(b.getCategory().getColor())
                    .limitAmount(b.getAmount())
                    .spentAmount(spent)
                    .percentage(percentage)
                    .build());
        }
        return result;
    }

    public void setBudget(String email, Long categoryId, BigDecimal amount) {
        User user = userService.findByEmail(email);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Optional<Budget> existing = budgetRepository.findByUserIdAndCategoryId(user.getId(), categoryId);

        Budget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setAmount(amount);
        } else {
            budget = Budget.builder()
                    .user(user)
                    .category(category)
                    .amount(amount)
                    .build();
        }
        budgetRepository.save(budget);
    }

    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }
}