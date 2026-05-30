package com.example.rentmate.repository;

import com.example.rentmate.model.SplitAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<SplitAuditLog, Long> {
    List<SplitAuditLog> findByEntityTypeOrderByTimestampDesc(String entityType);
    List<SplitAuditLog> findAllByOrderByTimestampDesc();
}
