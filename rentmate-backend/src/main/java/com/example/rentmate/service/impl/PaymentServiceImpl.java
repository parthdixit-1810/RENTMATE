package com.example.rentmate.service.impl;

import com.example.rentmate.dto.PaymentDTO;
import com.example.rentmate.model.Payment;
import com.example.rentmate.model.User;
import com.example.rentmate.model.Utility;
import com.example.rentmate.repository.PaymentRepository;
import com.example.rentmate.repository.UserRepository;
import com.example.rentmate.repository.UtilityRepository;
import com.example.rentmate.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import java.io.FileOutputStream;
import java.io.File;

@Service
public class PaymentServiceImpl implements PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UtilityRepository utilityRepository;
    @Autowired
    private JavaMailSender mailSender;

    @Override
    public Payment createPayment(PaymentDTO paymentDTO) {
        Payment payment = new Payment();
        payment.setAmount(paymentDTO.getAmount());
        payment.setDate(LocalDateTime.now());
        payment.setMethod(paymentDTO.getMethod());
        payment.setStatus(paymentDTO.getStatus());
        payment.setTransactionId(paymentDTO.getTransactionId());
        payment.setPaymentType(paymentDTO.getPaymentType());
        payment.setNotes(paymentDTO.getNotes());
        if (paymentDTO.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(paymentDTO.getUserId());
            userOpt.ifPresent(payment::setUser);
        }
        if (paymentDTO.getUtilityId() != null) {
            Optional<Utility> utilityOpt = utilityRepository.findById(paymentDTO.getUtilityId());
            utilityOpt.ifPresent(payment::setUtility);
        }
        Payment saved = paymentRepository.save(payment);
        sendReceiptEmail(saved.getId());
        return saved;
    }

    @Override
    public List<Payment> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    @Override
    public List<Payment> getPaymentsByUtility(Long utilityId) {
        return paymentRepository.findByUtilityId(utilityId);
    }

    @Override
    public List<Payment> getPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(status);
    }

    @Override
    public void sendReceiptEmail(Long paymentId) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            try {
                // Generate PDF
                String fileName = "receipt_" + payment.getId() + ".pdf";
                String filePath = System.getProperty("user.dir") + File.separator + fileName;
                Document document = new Document();
                PdfWriter.getInstance(document, new FileOutputStream(filePath));
                document.open();
                document.add(new Paragraph("RentMate Payment Receipt", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18)));
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Payment ID: " + payment.getId()));
                document.add(new Paragraph("Date: " + payment.getDate()));
                document.add(new Paragraph("Amount: Rs. " + payment.getAmount()));
                document.add(new Paragraph("Method: " + payment.getMethod()));
                document.add(new Paragraph("Status: " + payment.getStatus()));
                document.add(new Paragraph("Transaction ID: " + payment.getTransactionId()));
                if (payment.getUser() != null) {
                    document.add(new Paragraph("Paid By: " + payment.getUser().getEmail()));
                }
                if (payment.getUtility() != null) {
                    document.add(new Paragraph("Utility: " + payment.getUtility().getName()));
                }
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Thank you for using RentMate!"));
                document.close();

                // Send email with PDF attachment
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                helper.setTo(payment.getUser() != null ? payment.getUser().getEmail() : "parth2012dixit@gmail.com");
                helper.setSubject("RentMate Payment Receipt");
                helper.setText("Please find your payment receipt attached. Thank you for using RentMate!");
                helper.addAttachment(fileName, new File(filePath));
                mailSender.send(message);

                payment.setReceiptSent(true);
                payment.setReceiptUrl(filePath);
                paymentRepository.save(payment);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void resendReceipt(Long paymentId) {
        sendReceiptEmail(paymentId);
    }
} 