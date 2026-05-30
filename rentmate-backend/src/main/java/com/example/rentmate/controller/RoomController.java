package com.example.rentmate.controller;

import com.example.rentmate.model.Room;
import com.example.rentmate.dto.RoomDTO;
import com.example.rentmate.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired
    private RoomService roomService;

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody RoomDTO roomDTO) {
        Room room = roomService.createRoom(roomDTO);
        return ResponseEntity.ok(room);
    }

    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }
} 