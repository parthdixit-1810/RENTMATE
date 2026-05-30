package com.example.rentmate.repository;

import com.example.rentmate.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
} 