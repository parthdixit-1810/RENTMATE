package com.example.rentmate.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret:rentmate_secret}")
    private String SECRET;
    private final long EXPIRATION = 1000 * 60 * 60 * 24; // 24 hours

    @PostConstruct
    public void printSecret() {
        System.out.println("JWT SECRET IN USE: " + SECRET);
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token).getBody().getSubject();
    }
} 
