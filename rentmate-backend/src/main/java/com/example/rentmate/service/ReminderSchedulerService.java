package com.example.rentmate.service;

import com.example.rentmate.model.Utility;
import com.example.rentmate.model.UtilityStatus;
import com.example.rentmate.model.User;
import com.example.rentmate.repository.UtilityRepository;
import com.example.rentmate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class ReminderSchedulerService {

    @Autowired
    private UtilityRepository utilityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Runs daily at 9:00 AM. Finds all unpaid utilities due within the next 3 days
     * and sends a reminder email to every registered user.
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendDueDateReminders() {
        LocalDate today = LocalDate.now();
        LocalDate threeDaysLater = today.plusDays(3);

        List<Utility> upcoming = utilityRepository.findByDueDateBetweenAndStatusNot(
            today, threeDaysLater, UtilityStatus.PAID
        );

        if (upcoming.isEmpty()) return;

        List<User> users = userRepository.findAll();
        if (users.isEmpty()) return;

        String subject = "RentMate: Upcoming Utility Bills Reminder";
        String body = buildReminderBody(upcoming);

        for (User user : users) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
                helper.setTo(user.getEmail());
                helper.setSubject(subject);
                helper.setText(body, true);
                mailSender.send(message);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private String buildReminderBody(List<Utility> utilities) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        StringBuilder rows = new StringBuilder();
        for (Utility u : utilities) {
            String dueDateStr = u.getDueDate() != null ? u.getDueDate().format(fmt) : "N/A";
            String roomName = u.getRoom() != null ? u.getRoom().getName() : "—";
            rows.append(String.format(
                "<tr><td style='padding:8px 12px;border-bottom:1px solid #eaeff5;'>%s</td>" +
                "<td style='padding:8px 12px;border-bottom:1px solid #eaeff5;'>%s</td>" +
                "<td style='padding:8px 12px;border-bottom:1px solid #eaeff5;font-weight:600;color:#1a237e;'>&#8377;%.0f</td>" +
                "<td style='padding:8px 12px;border-bottom:1px solid #eaeff5;color:#e53935;'>%s</td></tr>",
                u.getName(), roomName, u.getAmount() != null ? u.getAmount() : 0, dueDateStr
            ));
        }
        return "<html><body style='font-family:sans-serif;color:#222;'>" +
            "<div style='max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eaeff5;padding:32px;'>" +
            "<div style='text-align:center;margin-bottom:24px;'>" +
            "<svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>" +
            "<rect width='40' height='40' rx='10' fill='#1a237e'/>" +
            "<path d='M6 21h28M10 21V30h20V21' stroke='#fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>" +
            "<path d='M5 21L20 9l15 12' stroke='#fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>" +
            "<rect x='16' y='22' width='8' height='8' rx='1' stroke='#c5cae9' stroke-width='1.5'/>" +
            "</svg>" +
            "<h2 style='margin:12px 0 4px;color:#1a237e;'>RentMate Reminder</h2>" +
            "<p style='color:#666;margin:0;'>The following bills are due within the next 3 days.</p></div>" +
            "<table style='width:100%;border-collapse:collapse;font-size:14px;'>" +
            "<thead><tr style='background:#f8fafc;'>" +
            "<th style='padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888;'>Bill</th>" +
            "<th style='padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888;'>Room</th>" +
            "<th style='padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888;'>Amount</th>" +
            "<th style='padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888;'>Due Date</th>" +
            "</tr></thead><tbody>" + rows +
            "</tbody></table>" +
            "<p style='margin:24px 0 0;font-size:13px;color:#888;text-align:center;'>Log in to <a href='http://localhost:5173' style='color:#1a237e;'>RentMate</a> to pay your bills.</p>" +
            "</div></body></html>";
    }
}
