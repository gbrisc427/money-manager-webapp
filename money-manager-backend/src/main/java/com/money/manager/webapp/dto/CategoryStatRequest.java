package com.money.manager.webapp.dto;

import java.math.BigDecimal;

public class CategoryStatRequest {
    private String categoryName;
    private String color;
    private BigDecimal totalAmount;

    public CategoryStatRequest(String categoryName, String color, BigDecimal totalAmount) {
        this.categoryName = categoryName;
        this.color = color;
        this.totalAmount = totalAmount;
    }

    // Getters y Setters
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}