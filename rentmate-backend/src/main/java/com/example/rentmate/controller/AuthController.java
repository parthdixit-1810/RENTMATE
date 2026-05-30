package com.example.rentmate.controller;

import com.example.rentmate.model.User;
import com.example.rentmate.service.UserService;
import com.example.rentmate.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        User saved = userService.registerUser(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        return userService.findByEmail(email)
                .filter(user -> userService.checkPassword(password, user.getPassword()))
                .map(user -> Map.of(
                        "token", jwtUtil.generateToken(user.getEmail()),
                        "userId", user.getId()
                ))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
        }
        String token = authHeader.replace("Bearer ", "");
        String email;
        try {
            email = jwtUtil.extractEmail(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
        return userService.findByEmail(email)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }
} 