package com.ecosync.service;

import com.ecosync.model.SensorReading;
import com.ecosync.repository.SensorReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AiEngineService {

    // Stores power history for each hour (0-23) to learn baselines
    private final Map<Integer, List<Double>> powerHistory = new HashMap<>();
    private final double MAX_EFFICIENCY_SCORE = 100.0;

    @Autowired
    private SensorReadingRepository sensorReadingRepository;

    public AiEngineService() {
        // Initialize history lists
        for (int i = 0; i < 24; i++) {
            powerHistory.put(i, new ArrayList<>());
        }
    }

    /**
     * Process sensor data through AI engine and persist to database
     */
    public Map<String, Object> processCycle(int currentOcc, double currentWattage) {
        return processCycle(currentOcc, currentWattage, null);
    }

    /**
     * Process sensor data through AI engine with optional external temperature
     */
    public Map<String, Object> processCycle(int currentOcc, double currentWattage, Double externalTemp) {
        LocalDateTime now = LocalDateTime.now();
        int hour = now.getHour();
        List<Double> history = powerHistory.get(hour);

        // 1. LEARNING PHASE: Add current wattage to history (Limit to last 50 readings)
        history.add(currentWattage);
        if (history.size() > 50) history.remove(0);

        // 2. AI ANALYSIS: Calculate Baseline & Standard Deviation
        double baseline = getMean(history);
        double stdDev = getStandardDeviation(history, baseline);

        // 3. ANOMALY DETECTION (Z-Score Method)
        // If current wattage is > 2 standard deviations away, it's an anomaly
        boolean isAnomaly = false;
        if (history.size() > 5) { // Need enough data to be sure
            double zScore = Math.abs(currentWattage - baseline) / (stdDev == 0 ? 1 : stdDev);
            if (zScore > 2.0) isAnomaly = true;
        }

        // 4. EFFICIENCY SCORING
        // Ideal: 50W per person. Lower is better.
        double idealWattage = currentOcc * 50.0;
        double efficiencyScore = Math.min(MAX_EFFICIENCY_SCORE, (idealWattage / (currentWattage == 0 ? 1 : currentWattage)) * 100);
        if (currentOcc == 0 && currentWattage > 100) efficiencyScore = 0; // Vampire load penalty

        // 5. DECISION LOGIC
        String status = "Optimized";
        String insight = "Power consumption within normal baseline.";
        double scaleLevel = 1.0;

        if (isAnomaly) {
            status = "Critical Alert";
            insight = "⚠️ POWER ANOMALY: Usage deviates significantly from learned baseline.";
            scaleLevel = 0.5; // Throttle power if unsafe
        } else if (efficiencyScore < 50) {
            status = "Inefficient";
            insight = "High power draw per occupant. Scaling down non-essentials.";
            scaleLevel = 0.7;
        }

        // 6. BUILD RESPONSE
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", now.toString());
        response.put("system_status", status);
        response.put("scale_level", Math.round(scaleLevel * 100.0) / 100.0);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("current_usage", Math.round(currentWattage * 100.0) / 100.0);
        metrics.put("baseline_usage", Math.round(baseline * 100.0) / 100.0);
        metrics.put("occupancy", currentOcc);
        metrics.put("efficiency_score", Math.round(efficiencyScore * 100.0) / 100.0);

        response.put("metrics", metrics);
        response.put("ai_insight", insight);
        response.put("integrity_alert", isAnomaly);

        // 7. PERSIST TO DATABASE
        saveSensorReading(now, currentOcc, currentWattage, externalTemp, baseline, 
                          efficiencyScore, isAnomaly, status, scaleLevel, insight);

        return response;
    }

    /**
     * Save sensor reading to database for historical analysis
     */
    private void saveSensorReading(LocalDateTime timestamp, int occupancyCount, double currentWattage,
                                   Double externalTemp, double baseline, double efficiencyScore,
                                   boolean integrityAlert, String systemStatus, 
                                   double scaleLevel, String aiInsight) {
        try {
            SensorReading reading = new SensorReading();
            reading.setTimestamp(timestamp);
            reading.setOccupancyCount(occupancyCount);
            reading.setCurrentWattage(currentWattage);
            reading.setExternalTemp(externalTemp);
            reading.setBaselineUsage(baseline);
            reading.setEfficiencyScore(efficiencyScore);
            reading.setIntegrityAlert(integrityAlert);
            reading.setSystemStatus(systemStatus);
            reading.setScaleLevel(scaleLevel);
            reading.setAiInsight(aiInsight);
            
            sensorReadingRepository.save(reading);
        } catch (Exception e) {
            // Log error but don't fail the main processing
            System.err.println("Failed to save sensor reading: " + e.getMessage());
        }
    }

    /**
     * Load historical data from database to warm-start the AI
     */
    public void loadHistoricalData() {
        try {
            List<SensorReading> recentReadings = sensorReadingRepository.findTop50ByOrderByTimestampDesc();
            for (SensorReading reading : recentReadings) {
                int hour = reading.getTimestamp().getHour();
                List<Double> history = powerHistory.get(hour);
                if (history != null) {
                    history.add(reading.getCurrentWattage());
                }
            }
            System.out.println("Loaded " + recentReadings.size() + " historical readings for AI warm-start");
        } catch (Exception e) {
            System.err.println("Failed to load historical data: " + e.getMessage());
        }
    }

    // Helper: Calculate Mean
    private double getMean(List<Double> data) {
        if (data.isEmpty()) return 0;
        return data.stream().mapToDouble(Double::doubleValue).average().orElse(0);
    }

    // Helper: Calculate Standard Deviation
    private double getStandardDeviation(List<Double> data, double mean) {
        if (data.size() <= 1) return 0;
        double sum = 0;
        for (double x : data) {
            sum += Math.pow(x - mean, 2);
        }
        return Math.sqrt(sum / (data.size() - 1));
    }
}
