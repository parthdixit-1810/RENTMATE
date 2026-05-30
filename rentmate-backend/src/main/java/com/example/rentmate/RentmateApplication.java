package com.example.rentmate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RentmateApplication {
    public static void main(String[] args) {
        SpringApplication.run(RentmateApplication.class, args);
    }
} 