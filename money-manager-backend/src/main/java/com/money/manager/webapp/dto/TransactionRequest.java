package com.money.manager.webapp.dto;

import com.money.manager.webapp.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @NotNull(message = "El tipo de transacción es obligatorio")
    private TransactionType type;

    private LocalDate date;

    @NotNull(message = "La cuenta es obligatoria")
    private Long accountId;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoryId;
}