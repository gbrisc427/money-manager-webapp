package com.money.manager.webapp.controller;

import com.money.manager.webapp.model.SavingsGoal;
import com.money.manager.webapp.service.SavingsGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService service;

    @GetMapping
    public ResponseEntity<List<SavingsGoal>> getGoals(Authentication auth) {
        return ResponseEntity.ok(service.getUserGoals(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<SavingsGoal> createGoal(@RequestBody SavingsGoal goal, Authentication auth) {
        return ResponseEntity.ok(service.createGoal(auth.getName(), goal));
    }

    @PutMapping("/{id}/add")
    public ResponseEntity<?> addFunds(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        service.addFunds(id, amount);
        return ResponseEntity.ok(Map.of("message", "Fondos añadidos"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id) {
        service.deleteGoal(id);
        return ResponseEntity.ok(Map.of("message", "Meta eliminada"));
    }
}