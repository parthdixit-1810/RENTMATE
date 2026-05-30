package com.example.rentmate.service;

import com.example.rentmate.model.Room;
import com.example.rentmate.dto.RoomDTO;
import java.util.List;

public interface RoomService {
    Room createRoom(RoomDTO roomDTO);
    List<Room> getAllRooms();
} 