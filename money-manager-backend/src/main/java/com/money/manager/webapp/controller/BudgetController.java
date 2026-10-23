package com.money.manager.webapp.controller;

import com.money.manager.webapp.dto.BudgetRequest;
import com.money.manager.webapp.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetRequest>> getBudgets(Authentication auth) {
        return ResponseEntity.ok(budgetService.getUserBudgets(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<?> setBudget(@RequestBody Map<String, Object> payload, Authentication auth) {
        Long categoryId = Long.valueOf(payload.get("categoryId").toString());
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());

        budgetService.setBudget(auth.getName(), categoryId, amount);
        return ResponseEntity.ok(Map.of("message", "Presupuesto guardado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok(Map.of("message", "Presupuesto eliminado"));
    }
}