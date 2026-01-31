package com.money.manager.webapp.dto;

import com.money.manager.webapp.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotNull(message = "El tipo es obligatorio (INCOME/EXPENSE)")
    private TransactionType type;

    private String color;
}