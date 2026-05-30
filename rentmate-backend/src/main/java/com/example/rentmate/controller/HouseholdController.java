package com.example.rentmate.controller;

import com.example.rentmate.model.Household;
import com.example.rentmate.model.User;
import com.example.rentmate.repository.HouseholdRepository;
import com.example.rentmate.repository.UserRepository;
import com.example.rentmate.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/households")
public class HouseholdController {

    @Autowired private HouseholdRepository householdRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    private User currentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        return userRepository.findByEmail(email).orElse(null);
    }

    /** Create a new household; creator becomes first member. */
    @PostMapping
    public ResponseEntity<?> create(@RequestHeader("Authorization") String auth,
                                    @RequestBody Map<String, String> body) {
        User user = currentUser(auth);
        if (user == null) return ResponseEntity.status(401).build();

        Household h = new Household();
        h.setName(body.getOrDefault("name", "My Household"));
        h.setDescription(body.get("description"));
        h.getMembers().add(user);
        Household saved = householdRepository.save(h);

        // Update user's current household
        user.setCurrentHouseholdId(saved.getId());
        userRepository.save(user);

        return ResponseEntity.ok(toSummary(saved));
    }

    /** List all households the authenticated user belongs to. */
    @GetMapping("/my")
    public ResponseEntity<?> myHouseholds(@RequestHeader("Authorization") String auth) {
        User user = currentUser(auth);
        if (user == null) return ResponseEntity.status(401).build();
        List<Household> list = householdRepository.findByMembersId(user.getId());
        return ResponseEntity.ok(list.stream().map(this::toSummary).toList());
    }

    /** Join an existing household by invite code. */
    @PostMapping("/join")
    public ResponseEntity<?> join(@RequestHeader("Authorization") String auth,
                                  @RequestBody Map<String, String> body) {
        User user = currentUser(auth);
        if (user == null) return ResponseEntity.status(401).build();

        String code = body.get("code");
        if (code == null || code.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Invite code required"));

        Optional<Household> opt = householdRepository.findByInviteCode(code.trim().toUpperCase());
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid invite code"));

        Household h = opt.get();
        boolean alreadyMember = h.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        if (!alreadyMember) {
            h.getMembers().add(user);
            householdRepository.save(h);
        }

        user.setCurrentHouseholdId(h.getId());
        userRepository.save(user);

        return ResponseEntity.ok(toSummary(h));
    }

    /** Switch the user's active household. */
    @PutMapping("/switch/{id}")
    public ResponseEntity<?> switchHousehold(@RequestHeader("Authorization") String auth,
                                             @PathVariable Long id) {
        User user = currentUser(auth);
        if (user == null) return ResponseEntity.status(401).build();

        Optional<Household> opt = householdRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        boolean isMember = opt.get().getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        if (!isMember) return ResponseEntity.status(403).body(Map.of("error", "Not a member"));

        user.setCurrentHouseholdId(id);
        userRepository.save(user);
        return ResponseEntity.ok(toSummary(opt.get()));
    }

    /** Get invite code for a household (members only). */
    @GetMapping("/{id}/invite-code")
    public ResponseEntity<?> inviteCode(@RequestHeader("Authorization") String auth,
                                        @PathVariable Long id) {
        User user = currentUser(auth);
        if (user == null) return ResponseEntity.status(401).build();

        Optional<Household> opt = householdRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        boolean isMember = opt.get().getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        if (!isMember) return ResponseEntity.status(403).body(Map.of("error", "Not a member"));

        return ResponseEntity.ok(Map.of("inviteCode", opt.get().getInviteCode()));
    }

    private Map<String, Object> toSummary(Household h) {
        return Map.of(
            "id",          h.getId(),
            "name",        h.getName() != null ? h.getName() : "",
            "description", h.getDescription() != null ? h.getDescription() : "",
            "inviteCode",  h.getInviteCode() != null ? h.getInviteCode() : "",
            "memberCount", h.getMemberCount(),
            "createdAt",   h.getCreatedAt() != null ? h.getCreatedAt().toString() : ""
        );
    }
}
