package com.example.rentmate.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double rentAmount;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<Utility> utilities = new ArrayList<>();

    public Room() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getRentAmount() { return rentAmount; }
    public void setRentAmount(Double rentAmount) { this.rentAmount = rentAmount; }
} 