package com.example.rentmate.repository;

import com.example.rentmate.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
    List<Payment> findByUtilityId(Long utilityId);
    List<Payment> findByStatus(String status);
} 