package com.grammitra.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync // 🔥 for future async tasks (OTP, translation, notifications)
public class GrammitraBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(GrammitraBackendApplication.class, args);
    }
}