package com.example.rentmate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private LocalDateTime date;
    private String method; // e.g., UPI, card, cash
    private String status; // e.g., SUCCESS, FAILED, PENDING
    private String transactionId;
    private String paymentType; // RENT, UTILITY, DEPOSIT, etc.
    private Boolean receiptSent = false;
    private String receiptUrl;
    private String notes;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "utility_id")
    private Utility utility;

    public Payment() {}

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

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Utility getUtility() { return utility; }
    public void setUtility(Utility utility) { this.utility = utility; }
} 