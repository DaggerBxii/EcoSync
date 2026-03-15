package com.ecosync.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class SensorSimulator {
    private final Random random = new Random();

    public Map<String, Object> generateData() {
        Map<String, Object> data = new HashMap<>();
        int hour = java.time.LocalDateTime.now().getHour();
        int baseOcc = (hour >= 9 && hour <= 17) ? 50 : 5;

        data.put("occupancy_count", baseOcc + random.nextInt(10));
        data.put("current_wattage", 300.0 + (random.nextDouble() * 200));
        data.put("external_temp", 20.0 + (random.nextDouble() * 5));

        return data;
    }
}
