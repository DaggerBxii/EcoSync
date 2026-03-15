package com.ecosync.service;

import com.ecosync.model.SensorReading;
import com.ecosync.repository.SensorReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing historical training data and providing analytics
 */
@Service
public class TrainingDataService {

    @Autowired
    private SensorReadingRepository sensorReadingRepository;

    /**
     * Get historical readings for ML model training
     */
    public List<SensorReading> getTrainingData(LocalDateTime startDate, LocalDateTime endDate) {
        return sensorReadingRepository.findReadingsForTraining(startDate, endDate);
    }

    /**
     * Get last N days of data for training
     */
    public List<SensorReading> getLastNDaysOfData(int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);
        return getTrainingData(startDate, endDate);
    }

    /**
     * Get average power consumption by hour of day
     */
    public Map<Integer, Double> getAveragePowerByHour() {
        List<Object[]> results = sensorReadingRepository.getAverageWattageByHour();
        Map<Integer, Double> hourlyAverages = new HashMap<>();
        for (Object[] result : results) {
            Integer hour = ((Number) result[0]).intValue();
            Double avgWattage = (Double) result[1];
            hourlyAverages.put(hour, avgWattage);
        }
        return hourlyAverages;
    }

    /**
     * Get power statistics for a specific time range
     */
    public Map<String, Object> getPowerStatistics(LocalDateTime start, LocalDateTime end) {
        List<SensorReading> readings = getTrainingData(start, end);
        
        if (readings.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Double> wattages = readings.stream()
                .map(SensorReading::getCurrentWattage)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("count", readings.size());
        stats.put("min", Collections.min(wattages));
        stats.put("max", Collections.max(wattages));
        stats.put("avg", wattages.stream().mapToDouble(Double::doubleValue).average().orElse(0));
        stats.put("total_kwh", wattages.stream().mapToDouble(Double::doubleValue).sum() / 1000);
        
        // Calculate efficiency stats
        List<Double> efficiencyScores = readings.stream()
                .filter(r -> r.getEfficiencyScore() != null)
                .map(SensorReading::getEfficiencyScore)
                .collect(Collectors.toList());
        
        if (!efficiencyScores.isEmpty()) {
            stats.put("avg_efficiency", efficiencyScores.stream()
                    .mapToDouble(Double::doubleValue).average().orElse(0));
        }

        // Count anomalies
        long anomalyCount = readings.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIntegrityAlert()))
                .count();
        stats.put("anomaly_count", anomalyCount);
        stats.put("anomaly_rate", (double) anomalyCount / readings.size() * 100);

        return stats;
    }

    /**
     * Get typical occupancy patterns by hour
     */
    public Map<Integer, Integer> getTypicalOccupancyByHour() {
        List<SensorReading> lastWeek = getLastNDaysOfData(7);
        
        Map<Integer, List<Integer>> occupancyByHour = new HashMap<>();
        for (int i = 0; i < 24; i++) {
            occupancyByHour.put(i, new ArrayList<>());
        }
        
        for (SensorReading reading : lastWeek) {
            int hour = reading.getTimestamp().getHour();
            occupancyByHour.get(hour).add(reading.getOccupancyCount());
        }
        
        Map<Integer, Integer> typicalOccupancy = new HashMap<>();
        for (Map.Entry<Integer, List<Integer>> entry : occupancyByHour.entrySet()) {
            List<Integer> values = entry.getValue();
            if (!values.isEmpty()) {
                // Use median as typical value
                Collections.sort(values);
                int median = values.get(values.size() / 2);
                typicalOccupancy.put(entry.getKey(), median);
            }
        }
        
        return typicalOccupancy;
    }

    /**
     * Get peak usage hours
     */
    public List<Integer> getPeakUsageHours() {
        Map<Integer, Double> hourlyAverages = getAveragePowerByHour();
        
        return hourlyAverages.entrySet().stream()
                .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Get off-peak usage hours (lowest consumption)
     */
    public List<Integer> getOffPeakUsageHours() {
        Map<Integer, Double> hourlyAverages = getAveragePowerByHour();
        
        return hourlyAverages.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Get daily energy consumption summary
     */
    public List<Map<String, Object>> getDailyConsumptionSummary(int days) {
        List<Map<String, Object>> dailySummaries = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime dayStart = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime dayEnd = dayStart.plusDays(1);
            
            Map<String, Object> stats = getPowerStatistics(dayStart, dayEnd);
            if (!stats.isEmpty()) {
                stats.put("date", dayStart.toLocalDate().toString());
                dailySummaries.add(stats);
            }
        }
        
        return dailySummaries;
    }

    /**
     * Clean up old readings (keep only last N days)
     */
    public int cleanupOldReadings(int keepDays) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(keepDays);
        List<SensorReading> allReadings = sensorReadingRepository.findAll();
        
        int deleted = 0;
        for (SensorReading reading : allReadings) {
            if (reading.getTimestamp().isBefore(cutoff)) {
                sensorReadingRepository.delete(reading);
                deleted++;
            }
        }
        
        return deleted;
    }

    /**
     * Get data quality metrics
     */
    public Map<String, Object> getDataQualityMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        long totalReadings = sensorReadingRepository.count();
        metrics.put("total_readings", totalReadings);
        
        if (totalReadings == 0) {
            metrics.put("quality_score", 0);
            return metrics;
        }
        
        // Check for missing fields
        List<SensorReading> allReadings = sensorReadingRepository.findAll();
        
        long readingsWithTemp = allReadings.stream()
                .filter(r -> r.getExternalTemp() != null)
                .count();
        
        long readingsWithEfficiency = allReadings.stream()
                .filter(r -> r.getEfficiencyScore() != null)
                .count();
        
        metrics.put("readings_with_temperature", readingsWithTemp);
        metrics.put("temperature_coverage_pct", (double) readingsWithTemp / totalReadings * 100);
        
        metrics.put("readings_with_efficiency", readingsWithEfficiency);
        metrics.put("efficiency_coverage_pct", (double) readingsWithEfficiency / totalReadings * 100);
        
        // Overall quality score (0-100)
        double qualityScore = ((double) readingsWithTemp / totalReadings * 50) +
                             ((double) readingsWithEfficiency / totalReadings * 50);
        metrics.put("quality_score", Math.round(qualityScore * 100) / 100.0);
        
        return metrics;
    }
}
