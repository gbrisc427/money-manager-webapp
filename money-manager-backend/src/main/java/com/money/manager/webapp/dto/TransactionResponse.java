package com.money.manager.webapp.dto;

import com.money.manager.webapp.model.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private String description;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDateTime date;
    private String accountName;
    private Long categoryId;
}