package com.money.manager.webapp.service;

import com.money.manager.webapp.model.SavingsGoal;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.SavingsGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository repository;
    private final UserServ userService;

    public List<SavingsGoal> getUserGoals(String email) {
        User user = userService.findByEmail(email);
        return repository.findByUserId(user.getId());
    }

    public SavingsGoal createGoal(String email, SavingsGoal goal) {
        User user = userService.findByEmail(email);
        goal.setUser(user);
        if (goal.getCurrentAmount() == null) {
            goal.setCurrentAmount(BigDecimal.ZERO);
        }
        return repository.save(goal);
    }

    public void addFunds(Long goalId, BigDecimal amount) {
        SavingsGoal goal = repository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Meta no encontrada"));

        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
        repository.save(goal);
    }

    public void deleteGoal(Long id) {
        repository.deleteById(id);
    }
}