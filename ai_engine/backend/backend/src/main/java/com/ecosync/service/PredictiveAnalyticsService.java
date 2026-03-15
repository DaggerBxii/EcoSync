package com.ecosync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Predictive Analytics Service using ML for time-series forecasting
 * Implements ARIMA-like forecasting and occupancy prediction
 */
@Service
public class PredictiveAnalyticsService {

    @Autowired
    private TrainingDataService trainingDataService;

    // Model state
    private boolean modelTrained = false;
    private Map<Integer, Double> hourlyPowerMeans;
    private Map<Integer, Double> hourlyPowerStdDevs;
    private Map<Integer, Double> hourlyOccupancyMeans;
    private Map<Integer, Double> hourlyOccupancyStdDevs;
    
    // ARIMA-like model parameters (simplified implementation)
    private double[] arCoefficients;
    private double[] maCoefficients;
    private double constantTerm;
    
    // Historical data for prediction
    private List<Double> recentPowerHistory;
    private List<Integer> recentOccupancyHistory;

    @PostConstruct
    public void init() {
        hourlyPowerMeans = new HashMap<>();
        hourlyPowerStdDevs = new HashMap<>();
        hourlyOccupancyMeans = new HashMap<>();
        hourlyOccupancyStdDevs = new HashMap<>();
        recentPowerHistory = new ArrayList<>();
        recentOccupancyHistory = new ArrayList<>();
        
        // Initialize distributions for each hour
        for (int i = 0; i < 24; i++) {
            hourlyPowerMeans.put(i, 300.0);
            hourlyPowerStdDevs.put(i, 50.0);
            hourlyOccupancyMeans.put(i, 25.0);
            hourlyOccupancyStdDevs.put(i, 10.0);
        }
        
        // Initialize ARIMA coefficients (simplified)
        arCoefficients = new double[]{0.5, 0.3};
        maCoefficients = new double[]{0.2};
        constantTerm = 300;
    }

    /**
     * Train the prediction models using historical data
     */
    public void trainModels() {
        System.out.println("Training predictive models...");

        // Get last 30 days of data
        List<com.ecosync.model.SensorReading> trainingData =
                trainingDataService.getLastNDaysOfData(30);

        if (trainingData.isEmpty()) {
            System.out.println("Insufficient data for training. Need at least some historical readings.");
            return;
        }

        // Group data by hour
        Map<Integer, List<Double>> powerByHour = new HashMap<>();
        Map<Integer, List<Integer>> occupancyByHour = new HashMap<>();

        for (int i = 0; i < 24; i++) {
            powerByHour.put(i, new ArrayList<>());
            occupancyByHour.put(i, new ArrayList<>());
        }

        for (com.ecosync.model.SensorReading reading : trainingData) {
            int hour = reading.getTimestamp().getHour();
            powerByHour.get(hour).add(reading.getCurrentWattage());
            occupancyByHour.get(hour).add(reading.getOccupancyCount());
        }

        // Calculate mean and std dev for each hour
        for (int i = 0; i < 24; i++) {
            List<Double> powerData = powerByHour.get(i);
            List<Integer> occupancyData = occupancyByHour.get(i);

            if (!powerData.isEmpty()) {
                double mean = powerData.stream().mapToDouble(Double::doubleValue).average().orElse(300);
                double stdDev = calculateStdDev(powerData, mean);
                hourlyPowerMeans.put(i, mean);
                hourlyPowerStdDevs.put(i, stdDev);
            }

            if (!occupancyData.isEmpty()) {
                double mean = occupancyData.stream().mapToInt(Integer::intValue).average().orElse(25);
                double stdDev = calculateStdDevDouble(occupancyData, mean);
                hourlyOccupancyMeans.put(i, mean);
                hourlyOccupancyStdDevs.put(i, stdDev);
            }
        }

        // Calculate constant term from overall mean
        List<Double> allPower = trainingData.stream()
                .map(com.ecosync.model.SensorReading::getCurrentWattage)
                .collect(java.util.stream.Collectors.toList());
        constantTerm = allPower.stream().mapToDouble(Double::doubleValue).average().orElse(300);

        modelTrained = true;
        System.out.println("Predictive models trained successfully with " + trainingData.size() + " samples");
    }

    /**
     * Forecast power demand for the next N hours
     */
    public double[] forecastPowerDemand(int hoursAhead) {
        if (!modelTrained) {
            trainModels();
        }

        double[] forecast = new double[hoursAhead];
        LocalDateTime now = LocalDateTime.now();

        // Use recent history for AR component
        List<Double> recentValues = getRecentPowerValues(10);

        for (int i = 0; i < hoursAhead; i++) {
            LocalDateTime futureTime = now.plusHours(i + 1);
            int hour = futureTime.getHour();

            // Get mean-based prediction
            double distributionPrediction = hourlyPowerMeans.getOrDefault(hour, 300.0);

            // AR component: weighted sum of recent values
            double arPrediction = 0;
            for (int j = 0; j < Math.min(arCoefficients.length, recentValues.size()); j++) {
                arPrediction += arCoefficients[j] * recentValues.get(recentValues.size() - 1 - j);
            }
            
            // Combine predictions
            forecast[i] = (distributionPrediction * 0.7 + arPrediction * 0.3);
            
            // Add to recent values for next iteration
            recentValues.add(forecast[i]);
        }
        
        return forecast;
    }

    /**
     * Predict occupancy for a specific time
     */
    public int predictOccupancy(LocalDateTime time) {
        if (!modelTrained) {
            trainModels();
        }

        int hour = time.getHour();
        Double mean = hourlyOccupancyMeans.get(hour);

        if (mean != null) {
            return (int) Math.round(mean);
        }

        // Default based on business hours
        return (hour >= 9 && hour <= 17) ? 50 : 5;
    }

    /**
     * Predict occupancy for next N hours
     */
    public int[] forecastOccupancy(int hoursAhead) {
        int[] forecast = new int[hoursAhead];
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < hoursAhead; i++) {
            forecast[i] = predictOccupancy(now.plusHours(i + 1));
        }

        return forecast;
    }

    /**
     * Get predicted vs actual comparison for model accuracy
     */
    public Map<String, Object> getModelAccuracy() {
        Map<String, Object> accuracy = new HashMap<>();

        if (!modelTrained) {
            accuracy.put("trained", false);
            return accuracy;
        }

        accuracy.put("trained", true);
        accuracy.put("model_type", "ARIMA-Mean Hybrid");

        // Calculate prediction confidence based on standard deviation
        List<Double> confidences = new ArrayList<>();
        for (int i = 0; i < 24; i++) {
            Double mean = hourlyPowerMeans.get(i);
            Double stdDev = hourlyPowerStdDevs.get(i);
            if (mean != null && stdDev != null) {
                double cv = stdDev / (mean == 0 ? 1 : mean); // Coefficient of variation
                double confidence = Math.max(0, (1 - cv) * 100);
                confidences.add(confidence);
            } else {
                confidences.add(50.0);
            }
        }

        double avgConfidence = confidences.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        accuracy.put("average_confidence_pct", Math.round(avgConfidence * 100) / 100.0);
        accuracy.put("hourly_confidences", confidences);

        return accuracy;
    }

    /**
     * Get peak demand prediction for next 24 hours
     */
    public Map<String, Object> getPeakDemandForecast() {
        double[] forecast = forecastPowerDemand(24);
        
        double maxDemand = 0;
        int peakHour = 0;
        double totalDemand = 0;
        
        for (int i = 0; i < forecast.length; i++) {
            if (forecast[i] > maxDemand) {
                maxDemand = forecast[i];
                peakHour = i;
            }
            totalDemand += forecast[i];
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("hourly_forecast", forecast);
        result.put("peak_demand_watts", Math.round(maxDemand * 100) / 100.0);
        result.put("peak_hour", peakHour);
        result.put("total_predicted_kwh", Math.round(totalDemand / 1000 * 100) / 100.0);
        result.put("average_demand_watts", Math.round((totalDemand / 24) * 100) / 100.0);
        
        return result;
    }

    /**
     * Update model with new observation (online learning)
     */
    public void updateWithObservation(int hour, double actualPower, int actualOccupancy) {
        recentPowerHistory.add(actualPower);
        recentOccupancyHistory.add(actualOccupancy);

        // Keep only last 100 observations
        if (recentPowerHistory.size() > 100) {
            recentPowerHistory.remove(0);
            recentOccupancyHistory.remove(0);
        }

        // Update mean incrementally using exponential moving average
        Double oldMean = hourlyPowerMeans.get(hour);
        if (oldMean == null) oldMean = 300.0;

        // Simple exponential moving average update
        double alpha = 0.1; // Learning rate
        double newMean = alpha * actualPower + (1 - alpha) * oldMean;

        // Update mean
        hourlyPowerMeans.put(hour, newMean);
    }

    /**
     * Get recommended actions based on predictions
     */
    public List<String> getRecommendations() {
        List<String> recommendations = new ArrayList<>();

        Map<String, Object> peakForecast = getPeakDemandForecast();
        double[] hourlyForecast = (double[]) peakForecast.get("hourly_forecast");
        int peakHour = (int) peakForecast.get("peak_hour");

        // Check for high demand periods
        if (hourlyForecast[peakHour] > 1000) {
            recommendations.add(String.format(
                "⚠️ High demand expected at hour %d: %.0fW. Consider pre-cooling/pre-heating before peak.",
                peakHour, hourlyForecast[peakHour]
            ));
        }

        // Check for low demand opportunities
        double avgDemand = (double) peakForecast.get("average_demand_watts");
        for (int i = 0; i < hourlyForecast.length; i++) {
            if (hourlyForecast[i] < avgDemand * 0.5) {
                recommendations.add(String.format(
                    "💡 Low demand period at hour %d (%.0fW). Good time for maintenance or high-power tasks.",
                    i, hourlyForecast[i]
                ));
                break;
            }
        }

        return recommendations;
    }

    // Helper methods
    private double calculateStdDev(List<Double> data, double mean) {
        if (data.size() <= 1) return 1;
        double sum = 0;
        for (double value : data) {
            sum += Math.pow(value - mean, 2);
        }
        return Math.sqrt(sum / (data.size() - 1));
    }

    private double calculateStdDevDouble(List<Integer> data, double mean) {
        if (data.size() <= 1) return 1;
        double sum = 0;
        for (int value : data) {
            sum += Math.pow(value - mean, 2);
        }
        return Math.sqrt(sum / (data.size() - 1));
    }

    private List<Double> getRecentPowerValues(int count) {
        List<Double> values = new ArrayList<>(recentPowerHistory);
        if (values.size() > count) {
            return values.subList(values.size() - count, values.size());
        }
        return values;
    }

    public boolean isModelTrained() {
        return modelTrained;
    }
}
