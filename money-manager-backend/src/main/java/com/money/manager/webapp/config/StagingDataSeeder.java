package com.money.manager.webapp.config;

import com.money.manager.webapp.model.Account;
import com.money.manager.webapp.model.Budget;
import com.money.manager.webapp.model.Category;
import com.money.manager.webapp.model.RecurringTransaction;
import com.money.manager.webapp.model.SavingsGoal;
import com.money.manager.webapp.model.Transaction;
import com.money.manager.webapp.model.TransactionType;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.repository.AccountRepository;
import com.money.manager.webapp.repository.BudgetRepository;
import com.money.manager.webapp.repository.CategoryRepository;
import com.money.manager.webapp.repository.RecurringTransactionRepository;
import com.money.manager.webapp.repository.SavingsGoalRepository;
import com.money.manager.webapp.repository.TransactionRepository;
import com.money.manager.webapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeder automatico e idempotente para el despliegue en la nube (prod / staging).
 * Garantiza que el usuario de demostracion (demo@moneymanager.com) exista en el esquema
 * public de Supabase sin afectar ni sobrescribir usuarios reales registrados.
 */
@Component
@Profile({"prod", "staging"})
public class StagingDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StagingDataSeeder.class);
    private static final String DEMO_EMAIL = "demo@moneymanager.com";
    private static final String DEMO_PASSWORD_RAW = "DemoPassword123!";

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final PasswordEncoder passwordEncoder;

    public StagingDataSeeder(
            UserRepository userRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository,
            RecurringTransactionRepository recurringTransactionRepository,
            BudgetRepository budgetRepository,
            SavingsGoalRepository savingsGoalRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.budgetRepository = budgetRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail(DEMO_EMAIL)) {
            log.info("[StagingDataSeeder] El usuario de prueba ({}) ya existe en Supabase Staging. Se omite la carga inicial.", DEMO_EMAIL);
            return;
        }

        log.info("[StagingDataSeeder] Inicializando poblado de datos de prueba para Preproduccion (staging)...");

        // 1. Crear usuario de prueba para QA / Homologacion
        User demoUser = User.builder()
                .fullName("Usuario Demo Preproduccion")
                .email(DEMO_EMAIL)
                .password(passwordEncoder.encode(DEMO_PASSWORD_RAW))
                .build();
        demoUser = userRepository.save(demoUser);
        Long userId = demoUser.getId();

        // 2. Crear las 4 cuentas financieras
        Account mainBank = createAccount("Banco Principal", "Banco", new BigDecimal("3450.00"), userId);
        Account creditCard = createAccount("Tarjeta de Credito", "Tarjeta", new BigDecimal("-280.50"), userId);
        Account savingsPiggy = createAccount("Hucha de Ahorro", "Ahorro", new BigDecimal("1200.00"), userId);
        Account cashWallet = createAccount("Efectivo Cartera", "Efectivo", new BigDecimal("85.00"), userId);
        accountRepository.saveAll(List.of(mainBank, creditCard, savingsPiggy, cashWallet));

        // 3. Crear catalogo de categorias de Gasto e Ingreso
        Category catVivienda = createCategory("Vivienda", TransactionType.EXPENSE, "#ef4444", userId);
        Category catAlimentacion = createCategory("Alimentacion", TransactionType.EXPENSE, "#f97316", userId);
        Category catTransporte = createCategory("Transporte", TransactionType.EXPENSE, "#3b82f6", userId);
        Category catOcio = createCategory("Ocio", TransactionType.EXPENSE, "#8b5cf6", userId);
        Category catSalud = createCategory("Salud", TransactionType.EXPENSE, "#10b981", userId);

        Category catNomina = createCategory("Nomina", TransactionType.INCOME, "#10b981", userId);
        Category catInversiones = createCategory("Inversiones", TransactionType.INCOME, "#06b6d4", userId);
        Category catSegundaMano = createCategory("Venta Segunda Mano", TransactionType.INCOME, "#84cc16", userId);

        categoryRepository.saveAll(List.of(
                catVivienda, catAlimentacion, catTransporte, catOcio, catSalud,
                catNomina, catInversiones, catSegundaMano
        ));

        // 4. Crear historico de transacciones de los ultimos 6 meses para poblar BarChart y PieChart
        LocalDateTime now = LocalDateTime.now();
        for (int monthsAgo = 5; monthsAgo >= 1; monthsAgo--) {
            LocalDateTime monthBase = now.minusMonths(monthsAgo).withDayOfMonth(5).withHour(10).withMinute(0);

            transactionRepository.saveAll(List.of(
                    buildTx("Nomina Mensual", new BigDecimal("2400.00"), TransactionType.INCOME, monthBase, mainBank, catNomina.getId(), userId),
                    buildTx("Dividendos Cartera Indexada", new BigDecimal("120.00"), TransactionType.INCOME, monthBase.plusDays(3), savingsPiggy, catInversiones.getId(), userId),
                    buildTx("Alquiler y Comunidad", new BigDecimal("850.00"), TransactionType.EXPENSE, monthBase.plusDays(1), mainBank, catVivienda.getId(), userId),
                    buildTx("Compra Supermercado Mensual", new BigDecimal("310.50"), TransactionType.EXPENSE, monthBase.plusDays(6), mainBank, catAlimentacion.getId(), userId),
                    buildTx("Combustible y Transporte", new BigDecimal("95.00"), TransactionType.EXPENSE, monthBase.plusDays(10), creditCard, catTransporte.getId(), userId),
                    buildTx("Cena y Cine Fin de Semana", new BigDecimal("115.00"), TransactionType.EXPENSE, monthBase.plusDays(14), creditCard, catOcio.getId(), userId),
                    buildTx("Farmacia y Revision", new BigDecimal("45.00"), TransactionType.EXPENSE, monthBase.plusDays(18), cashWallet, catSalud.getId(), userId)
            ));
        }

        // Movimientos del mes en curso calibrados para probar los 3 umbrales de alerta de Presupuestos
        LocalDateTime currentMonthStart = now.withDayOfMonth(1).withHour(9).withMinute(30);
        transactionRepository.saveAll(List.of(
                buildTx("Nomina Mes Actual", new BigDecimal("2450.00"), TransactionType.INCOME, currentMonthStart, mainBank, catNomina.getId(), userId),
                buildTx("Venta Monitor Usado", new BigDecimal("90.00"), TransactionType.INCOME, currentMonthStart.plusDays(1), cashWallet, catSegundaMano.getId(), userId),
                // Vivienda: 850 / 1000 = 85% (Alerta Amarilla >= 75%)
                buildTx("Alquiler Mensual", new BigDecimal("850.00"), TransactionType.EXPENSE, currentMonthStart.plusDays(1), mainBank, catVivienda.getId(), userId),
                // Alimentacion: 180 / 400 = 45% (Rango Verde < 75%)
                buildTx("Supermercado Semanal", new BigDecimal("180.00"), TransactionType.EXPENSE, currentMonthStart.plusDays(2), mainBank, catAlimentacion.getId(), userId),
                // Ocio: 220 / 200 = 110% (Alerta Roja Excedida >= 100%)
                buildTx("Entradas Concierto y Escapada", new BigDecimal("220.00"), TransactionType.EXPENSE, currentMonthStart.plusDays(3), creditCard, catOcio.getId(), userId),
                buildTx("Abono Transporte Mensual", new BigDecimal("54.00"), TransactionType.EXPENSE, currentMonthStart.plusDays(2), cashWallet, catTransporte.getId(), userId)
        ));

        // 5. Crear 2 suscripciones / transacciones recurrentes activas
        LocalDate firstOfCurrentMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate nextMonthPayment = firstOfCurrentMonth.plusMonths(1);

        RecurringTransaction gymSub = RecurringTransaction.builder()
                .description("Suscripcion Gimnasio")
                .amount(new BigDecimal("39.90"))
                .type(TransactionType.EXPENSE)
                .startDate(firstOfCurrentMonth.minusMonths(3))
                .nextPaymentDate(nextMonthPayment)
                .active(true)
                .account(mainBank)
                .category(catSalud)
                .userId(userId)
                .build();

        RecurringTransaction streamingSub = RecurringTransaction.builder()
                .description("Plataforma Streaming 4K")
                .amount(new BigDecimal("15.99"))
                .type(TransactionType.EXPENSE)
                .startDate(firstOfCurrentMonth.minusMonths(6))
                .nextPaymentDate(nextMonthPayment)
                .active(true)
                .account(creditCard)
                .category(catOcio)
                .userId(userId)
                .build();

        recurringTransactionRepository.saveAll(List.of(gymSub, streamingSub));

        // 6. Crear 3 presupuestos mensuales (Verde 45%, Amarillo 85%, Rojo 110%)
        Budget budgetAlimentacion = Budget.builder()
                .user(demoUser)
                .category(catAlimentacion)
                .amount(new BigDecimal("400.00"))
                .build();

        Budget budgetVivienda = Budget.builder()
                .user(demoUser)
                .category(catVivienda)
                .amount(new BigDecimal("1000.00"))
                .build();

        Budget budgetOcio = Budget.builder()
                .user(demoUser)
                .category(catOcio)
                .amount(new BigDecimal("200.00"))
                .build();

        budgetRepository.saveAll(List.of(budgetAlimentacion, budgetVivienda, budgetOcio));

        // 7. Crear 2 metas de ahorro en progreso (60% y 25%)
        SavingsGoal emergencyGoal = SavingsGoal.builder()
                .name("Fondo de Emergencia")
                .targetAmount(new BigDecimal("5000.00"))
                .currentAmount(new BigDecimal("3000.00"))
                .deadline(LocalDate.now().plusMonths(8))
                .color("#10b981")
                .user(demoUser)
                .build();

        SavingsGoal vacationGoal = SavingsGoal.builder()
                .name("Viaje Vacaciones")
                .targetAmount(new BigDecimal("2000.00"))
                .currentAmount(new BigDecimal("500.00"))
                .deadline(LocalDate.now().plusMonths(5))
                .color("#3b82f6")
                .user(demoUser)
                .build();

        savingsGoalRepository.saveAll(List.of(emergencyGoal, vacationGoal));

        log.info("[StagingDataSeeder] Seeder de Preproduccion completado con exito. Usuario QA: {} | Clave: {}", DEMO_EMAIL, DEMO_PASSWORD_RAW);
    }

    private Account createAccount(String name, String type, BigDecimal balance, Long userId) {
        Account acc = new Account();
        acc.setName(name);
        acc.setType(type);
        acc.setBalance(balance);
        acc.setUserId(userId);
        return acc;
    }

    private Category createCategory(String name, TransactionType type, String color, Long userId) {
        return Category.builder()
                .name(name)
                .type(type)
                .color(color)
                .userId(userId)
                .build();
    }

    private Transaction buildTx(
            String description,
            BigDecimal amount,
            TransactionType type,
            LocalDateTime date,
            Account account,
            Long categoryId,
            Long userId
    ) {
        return Transaction.builder()
                .description(description)
                .amount(amount)
                .type(type)
                .date(date)
                .account(account)
                .categoryId(categoryId)
                .userId(userId)
                .build();
    }
}
