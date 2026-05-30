package com.example.rentmate.service.impl;

import com.example.rentmate.model.Room;
import com.example.rentmate.dto.RoomDTO;
import com.example.rentmate.repository.RoomRepository;
import com.example.rentmate.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RoomServiceImpl implements RoomService {
    @Autowired
    private RoomRepository roomRepository;

    @Override
    public Room createRoom(RoomDTO roomDTO) {
        Room room = new Room();
        room.setName(roomDTO.getName());
        if (roomDTO.getDescription() != null) room.setDescription(roomDTO.getDescription());
        if (roomDTO.getRentAmount() != null) room.setRentAmount(roomDTO.getRentAmount());
        return roomRepository.save(room);
    }

    @Override
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
} 