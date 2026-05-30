package com.example.rentmate.controller;

import com.example.rentmate.model.SplitAuditLog;
import com.example.rentmate.model.User;
import com.example.rentmate.repository.AuditLogRepository;
import com.example.rentmate.repository.UserRepository;
import com.example.rentmate.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    private User currentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) { return null; }
    }

    /** Get all audit log entries, optionally filtered by entityType (RENT, UTILITY). */
    @GetMapping
    public ResponseEntity<List<SplitAuditLog>> getAll(
            @RequestHeader("Authorization") String auth,
            @RequestParam(required = false) String type) {
        if (currentUser(auth) == null) return ResponseEntity.status(401).build();
        List<SplitAuditLog> logs = (type != null && !type.isBlank())
            ? auditLogRepository.findByEntityTypeOrderByTimestampDesc(type.toUpperCase())
            : auditLogRepository.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(logs);
    }

    /** Record a new audit log entry from the frontend. */
    @PostMapping
    public ResponseEntity<SplitAuditLog> create(
            @RequestHeader("Authorization") String auth,
            @RequestBody Map<String, Object> body) {
        User user = currentUser(auth);

        SplitAuditLog log = new SplitAuditLog();
        log.setEntityType(str(body, "entityType"));
        log.setEntityId(body.get("entityId") instanceof Number n ? n.longValue() : null);
        log.setAction(str(body, "action"));
        log.setDescription(str(body, "description"));
        log.setOldValue(str(body, "oldValue"));
        log.setNewValue(str(body, "newValue"));

        if (user != null) {
            log.setUserId(user.getId());
            log.setUserEmail(user.getEmail());
        } else {
            // Guest or missing JWT — still record but without user context
            log.setUserEmail(str(body, "userEmail"));
        }

        return ResponseEntity.ok(auditLogRepository.save(log));
    }

    private String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : null;
    }
}
