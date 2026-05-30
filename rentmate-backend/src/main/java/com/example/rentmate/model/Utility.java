package com.example.rentmate.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Utility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private UtilityStatus status;

    private LocalDate dueDate;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    public Utility() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public UtilityStatus getStatus() { return status; }
    public void setStatus(UtilityStatus status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }
} 