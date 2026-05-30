package com.example.rentmate.dto;

import java.time.LocalDate;

public class UtilityDTO {
    private String name;
    private Double amount;
    private String status;
    private LocalDate dueDate;

    public UtilityDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
} 