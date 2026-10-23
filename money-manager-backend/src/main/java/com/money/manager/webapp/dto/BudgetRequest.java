package com.money.manager.webapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BudgetRequest {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private double percentage;
}