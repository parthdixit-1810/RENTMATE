package com.example.rentmate.service;

import com.example.rentmate.dto.PaymentDTO;
import com.example.rentmate.model.Payment;
import java.util.List;

public interface PaymentService {
    Payment createPayment(PaymentDTO paymentDTO);
    List<Payment> getPaymentsByUser(Long userId);
    List<Payment> getPaymentsByUtility(Long utilityId);
    List<Payment> getPaymentsByStatus(String status);
    void sendReceiptEmail(Long paymentId);
    void resendReceipt(Long paymentId);
} 