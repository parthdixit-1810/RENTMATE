package com.example.rentmate.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "households")
public class Household {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(unique = true, nullable = false)
    private String inviteCode;

    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "household_members",
        joinColumns = @JoinColumn(name = "household_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private List<User> members = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.inviteCode == null) {
            this.inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }

    public Household() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<User> getMembers() { return members; }
    public void setMembers(List<User> members) { this.members = members; }

    public int getMemberCount() { return members != null ? members.size() : 0; }
}
