package com.example.rentmate.dto;

import java.time.LocalDateTime;

public class PaymentDTO {
    private Long id;
    private Double amount;
    private LocalDateTime date;
    private String method;
    private String status;
    private String transactionId;
    private String paymentType;
    private Boolean receiptSent;
    private String receiptUrl;
    private String notes;
    private Long userId;
    private Long utilityId;

    public PaymentDTO() {}

    // Getters and setters for all fields
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }
    public Boolean getReceiptSent() { return receiptSent; }
    public void setReceiptSent(Boolean receiptSent) { this.receiptSent = receiptSent; }
    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getUtilityId() { return utilityId; }
    public void setUtilityId(Long utilityId) { this.utilityId = utilityId; }
} 