package com.example.rentmate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "split_audit_log")
public class SplitAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** RENT | UTILITY | HOUSEHOLD */
    private String entityType;

    private Long entityId;

    /** SPLIT_CHANGED | MARKED_PAID | BILL_ADDED | RENT_SET */
    private String action;

    @Column(length = 1000)
    private String description;

    private Long userId;
    private String userEmail;

    @Column(length = 500)
    private String oldValue;

    @Column(length = 500)
    private String newValue;

    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }

    public SplitAuditLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }

    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
