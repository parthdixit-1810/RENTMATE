package com.example.rentmate.repository;

import com.example.rentmate.model.Household;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HouseholdRepository extends JpaRepository<Household, Long> {
    Optional<Household> findByInviteCode(String inviteCode);
    List<Household> findByMembersId(Long userId);
}
