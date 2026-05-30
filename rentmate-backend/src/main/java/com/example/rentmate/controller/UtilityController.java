package com.example.rentmate.controller;

import com.example.rentmate.model.Utility;
import com.example.rentmate.dto.UtilityDTO;
import com.example.rentmate.service.UtilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/utilities")
public class UtilityController {
    @Autowired
    private UtilityService utilityService;

    @PostMapping("/room/{roomId}")
    public ResponseEntity<Utility> addUtility(@PathVariable Long roomId, @RequestBody UtilityDTO utilityDTO) {
        Utility utility = utilityService.addUtilityToRoom(roomId, utilityDTO);
        return ResponseEntity.ok(utility);
    }

    @GetMapping("/room/{roomId}")
    public List<Utility> getAllUtilities(@PathVariable Long roomId) {
        return utilityService.getUtilitiesForRoom(roomId);
    }

    @GetMapping("/room/{roomId}/unpaid")
    public List<Utility> getUnpaid(@PathVariable Long roomId) {
        return utilityService.getUnpaidUtilities(roomId);
    }

    @GetMapping
    public List<Utility> getAllUtilities() {
        return utilityService.getAllUtilities();
    }

    @PatchMapping("/{utilityId}/mark-paid")
    public Utility markAsPaid(@PathVariable Long utilityId) {
        return utilityService.markUtilityAsPaid(utilityId);
    }
} 