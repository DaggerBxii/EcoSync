package com.ecosync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EcoSyncApplication {
    public static void main(String[] args) {
        SpringApplication.run(EcoSyncApplication.class, args);
    }
}
