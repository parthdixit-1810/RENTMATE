package com.example.rentmate.dto;

public class RoomDTO {
    private Long id;
    private String name;
    private String description;
    private Double rentAmount;

    public RoomDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getRentAmount() { return rentAmount; }
    public void setRentAmount(Double rentAmount) { this.rentAmount = rentAmount; }
} 