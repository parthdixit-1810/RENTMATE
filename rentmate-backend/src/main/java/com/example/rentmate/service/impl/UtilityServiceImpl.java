package com.example.rentmate.service.impl;

import com.example.rentmate.model.Utility;
import com.example.rentmate.model.UtilityStatus;
import com.example.rentmate.model.Room;
import com.example.rentmate.dto.UtilityDTO;
import com.example.rentmate.repository.UtilityRepository;
import com.example.rentmate.repository.RoomRepository;
import com.example.rentmate.service.UtilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UtilityServiceImpl implements UtilityService {
    @Autowired
    private UtilityRepository utilityRepository;
    @Autowired
    private RoomRepository roomRepository;

    @Override
    public Utility addUtilityToRoom(Long roomId, UtilityDTO utilityDTO) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (roomOpt.isEmpty()) throw new RuntimeException("Room not found");
        Room room = roomOpt.get();
        Utility utility = new Utility();
        utility.setName(utilityDTO.getName());
        utility.setAmount(utilityDTO.getAmount());
        utility.setStatus(UtilityStatus.valueOf(utilityDTO.getStatus()));
        utility.setDueDate(utilityDTO.getDueDate());
        utility.setRoom(room);
        return utilityRepository.save(utility);
    }

    @Override
    public List<Utility> getUtilitiesForRoom(Long roomId) {
        return utilityRepository.findByRoomId(roomId);
    }

    @Override
    public List<Utility> getUnpaidUtilities(Long roomId) {
        return utilityRepository.findByRoomIdAndStatus(roomId, UtilityStatus.UNPAID);
    }

    @Override
    public List<Utility> getAllUtilities() {
        return utilityRepository.findAll();
    }

    @Override
    public Utility markUtilityAsPaid(Long utilityId) {
        Optional<Utility> utilityOpt = utilityRepository.findById(utilityId);
        if (utilityOpt.isEmpty()) throw new RuntimeException("Utility not found");
        Utility utility = utilityOpt.get();
        utility.setStatus(UtilityStatus.PAID);
        return utilityRepository.save(utility);
    }
} 