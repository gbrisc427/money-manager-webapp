package com.money.manager.webapp.service;

import com.money.manager.webapp.dto.RegisterRequest;
import com.money.manager.webapp.exception.UserAlreadyExistsException;
import com.money.manager.webapp.model.*;
import com.money.manager.webapp.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UserServ {

    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final EmailService emailService;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public UserServ(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService, TransactionRepository transactionRepository, RecurringTransactionRepository recurringTransactionRepository, BudgetRepository budgetRepository, SavingsGoalRepository savingsGoalRepository, AccountRepository accountRepository, CategoryRepository categoryRepository, RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.transactionRepository = transactionRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.budgetRepository = budgetRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("El correo ya está registrado");
        }

        User newUser = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(newUser);
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName());

        return userRepository.save(newUser);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Transactional
    public void deleteUserAndAllData(String email) {
        User user = findByEmail(email);
        Long userId = user.getId();

        System.out.println("--- INICIANDO BORRADO TOTAL PARA USUARIO ID: " + userId + " ---");

        // PASO 0: BORRAR TOKENS DE SESIÓN (ESTO ES LO QUE SUELE FALLAR)
        try {
            // Opción robusta: buscarlos y borrarlos en bloque
            List<RefreshToken> tokens = refreshTokenRepository.findByUserId(userId);
            if (tokens != null && !tokens.isEmpty()) {
                System.out.println("Borrando " + tokens.size() + " tokens de refresco...");
                refreshTokenRepository.deleteAll(tokens);
                refreshTokenRepository.flush(); // <--- FORZAMOS EL BORRADO AHORA MISMO
            }
        } catch (Exception e) {
            System.err.println("Error borrando tokens: " + e.getMessage());
            // No lanzamos error para intentar seguir borrando lo demás
        }

        // PASO 1: Borrar Movimientos
        List<Transaction> txs = transactionRepository.findByUserId(userId);
        if (txs != null && !txs.isEmpty()) {
            transactionRepository.deleteAll(txs);
        }

        // PASO 2: Borrar Recurrentes
        List<RecurringTransaction> recurrings = recurringTransactionRepository.findByUserId(userId);
        if (recurrings != null && !recurrings.isEmpty()) {
            recurringTransactionRepository.deleteAll(recurrings);
        }

        // PASO 3: Borrar Presupuestos
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        if (budgets != null && !budgets.isEmpty()) {
            budgetRepository.deleteAll(budgets);
        }

        // PASO 4: Borrar Metas
        List<SavingsGoal> goals = savingsGoalRepository.findByUserId(userId);
        if (goals != null && !goals.isEmpty()) {
            savingsGoalRepository.deleteAll(goals);
        }

        // PASO 5: Borrar Cuentas
        List<Account> accounts = accountRepository.findByUserId(userId);
        if (accounts != null && !accounts.isEmpty()) {
            accountRepository.deleteAll(accounts);
        }

        // PASO 6: Borrar Categorías
        List<Category> categories = categoryRepository.findByUserId(userId);
        if (categories != null && !categories.isEmpty()) {
            categoryRepository.deleteAll(categories);
        }

        // PASO 7: Borrar Usuario
        System.out.println("Borrando usuario final...");
        userRepository.delete(user);
        System.out.println("--- BORRADO COMPLETADO ---");
    }

}
