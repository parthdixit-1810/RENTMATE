package com.example.rentmate.service;

import com.example.rentmate.model.Utility;
import com.example.rentmate.dto.UtilityDTO;
import java.util.List;

public interface UtilityService {
    Utility addUtilityToRoom(Long roomId, UtilityDTO utilityDTO);
    List<Utility> getUtilitiesForRoom(Long roomId);
    List<Utility> getUnpaidUtilities(Long roomId);
    Utility markUtilityAsPaid(Long utilityId);
    List<Utility> getAllUtilities();
} 