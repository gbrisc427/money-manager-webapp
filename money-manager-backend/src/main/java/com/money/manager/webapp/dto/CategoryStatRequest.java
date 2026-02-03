package com.money.manager.webapp.dto;

public class CategoryStatRequest {
    private String categoryName;
    private String color;
    private Double totalAmount;

    public CategoryStatRequest(String categoryName, String color, Double totalAmount) {
        this.categoryName = categoryName;
        this.color = color;
        this.totalAmount = totalAmount;
    }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
}