package com.example.rentmate.repository;

import com.example.rentmate.model.Utility;
import com.example.rentmate.model.UtilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UtilityRepository extends JpaRepository<Utility, Long> {
    List<Utility> findByRoomId(Long roomId);
    List<Utility> findByRoomIdAndStatus(Long roomId, UtilityStatus status);
    List<Utility> findByDueDateBetweenAndStatusNot(java.time.LocalDate from, java.time.LocalDate to, UtilityStatus status);
} 