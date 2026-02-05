package com.money.manager.webapp.service;

import com.money.manager.webapp.dto.TransactionRequest;
import com.money.manager.webapp.model.RecurringTransaction;
import com.money.manager.webapp.repository.RecurringTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepo;
    private final TransactionService transactionService;

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void processRecurringTransactions() {
        LocalDate today = LocalDate.now();
        System.out.println("⏰ [Scheduler] Buscando recurrentes pendientes para: " + today);

        List<RecurringTransaction> dueTransactions = recurringRepo.findDueTransactions(today);

        for (RecurringTransaction rec : dueTransactions) {
            executeTransaction(rec);
        }
    }

    @Transactional
    public RecurringTransaction create(RecurringTransaction rec) {
        RecurringTransaction saved = recurringRepo.save(rec);

        if (!saved.getNextPaymentDate().isAfter(LocalDate.now())) {
            System.out.println("⚡ Ejecutando recurrencia inicial inmediata: " + saved.getDescription());
            executeTransaction(saved);
        }

        return saved;
    }

    private void executeTransaction(RecurringTransaction rec) {
        try {

            TransactionRequest request = new TransactionRequest();
            request.setDescription(rec.getDescription() + " (Recurrente)");
            request.setAmount(rec.getAmount());
            request.setType(rec.getType());
            request.setAccountId(rec.getAccount().getId());
            request.setCategoryId(rec.getCategory().getId());
            request.setDate(rec.getNextPaymentDate());

            transactionService.createTransaction(request, rec.getUserId());

            rec.setNextPaymentDate(rec.getNextPaymentDate().plusMonths(1));
            recurringRepo.save(rec);

            System.out.println("✅ Recurrencia procesada: " + rec.getDescription() + ". Próxima: " + rec.getNextPaymentDate());

        } catch (Exception e) {
            System.err.println("❌ Error procesando recurrente ID " + rec.getId() + ": " + e.getMessage());
        }
    }

    public List<RecurringTransaction> getAllByUser(Long userId) {
        return recurringRepo.findByUserId(userId);
    }

    @Transactional
    public void cancel(Long id) {
        RecurringTransaction rec = recurringRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurrencia no encontrada"));
        rec.setActive(false);
        recurringRepo.save(rec);
    }
}