package com.example.rentmate.controller;

import com.example.rentmate.dto.PaymentDTO;
import com.example.rentmate.model.Payment;
import com.example.rentmate.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentDTO paymentDTO) {
        Payment payment = paymentService.createPayment(paymentDTO);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/user/{userId}")
    public List<Payment> getPaymentsByUser(@PathVariable Long userId) {
        return paymentService.getPaymentsByUser(userId);
    }

    @GetMapping("/utility/{utilityId}")
    public List<Payment> getPaymentsByUtility(@PathVariable Long utilityId) {
        return paymentService.getPaymentsByUtility(utilityId);
    }

    @GetMapping("/status/{status}")
    public List<Payment> getPaymentsByStatus(@PathVariable String status) {
        return paymentService.getPaymentsByStatus(status);
    }

    @PostMapping("/{paymentId}/send-receipt")
    public ResponseEntity<?> sendReceipt(@PathVariable Long paymentId) {
        paymentService.sendReceiptEmail(paymentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{paymentId}/resend-receipt")
    public ResponseEntity<?> resendReceipt(@PathVariable Long paymentId) {
        paymentService.resendReceipt(paymentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test-email")
    public ResponseEntity<?> sendTestEmail() {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("parth2012dixit@gmail.com");
        message.setSubject("RentMate SMTP Test");
        message.setText("This is a test email from RentMate backend. If you received this, SMTP is working!");
        mailSender.send(message);
        return ResponseEntity.ok("Test email sent to parth2012dixit@gmail.com");
    }
} 