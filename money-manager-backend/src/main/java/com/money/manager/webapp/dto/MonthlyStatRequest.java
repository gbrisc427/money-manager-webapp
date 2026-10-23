package com.money.manager.webapp.dto;

public class MonthlyStatRequest {
    private String month; // Ej: "2024-01"
    private Double income;
    private Double expense;

    public MonthlyStatRequest(String month, Double income, Double expense) {
        this.month = month;
        this.income = income;
        this.expense = expense;
    }

    // Getters
    public String getMonth() { return month; }
    public Double getIncome() { return income; }
    public Double getExpense() { return expense; }
}