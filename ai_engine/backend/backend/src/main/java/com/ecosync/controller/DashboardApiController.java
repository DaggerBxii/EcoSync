package com.ecosync.controller;

import com.ecosync.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST API Controller for EcoSync Dashboard
 * Provides endpoints for weather, pricing, recommendations, and analytics
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Dashboard API", description = "Endpoints for the EcoSync dashboard")
public class DashboardApiController {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private InsightGeneratorService insightGeneratorService;

    @Autowired
    private PredictiveAnalyticsService predictiveAnalyticsService;

    @Autowired
    private TrainingDataService trainingDataService;

    @Autowired
    private OptimizationEngineService optimizationEngineService;

    /**
     * Get current weather data
     */
    @GetMapping("/weather")
    @Operation(summary = "Get current weather data")
    public Map<String, Object> getWeather() {
        return weatherService.getWeatherSummary();
    }

    /**
     * Get current electricity pricing
     */
    @GetMapping("/pricing")
    @Operation(summary = "Get current electricity pricing")
    public Map<String, Object> getPricing() {
        return pricingService.getPricingSummary();
    }

    /**
     * Get AI recommendations
     */
    @GetMapping("/recommendations")
    @Operation(summary = "Get AI-generated recommendations")
    public List<Map<String, Object>> getRecommendations() {
        List<InsightGeneratorService.Recommendation> recommendations =
                insightGeneratorService.generateRecommendations();

        return recommendations.stream()
                .map(InsightGeneratorService.Recommendation::toMap)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get power forecast for next 24 hours
     */
    @GetMapping("/forecast")
    @Operation(summary = "Get 24-hour power demand forecast")
    public Map<String, Object> getForecast() {
        return predictiveAnalyticsService.getPeakDemandForecast();
    }

    /**
     * Get daily summary
     */
    @GetMapping("/summary/daily")
    @Operation(summary = "Get daily summary report")
    public Map<String, Object> getDailySummary() {
        return insightGeneratorService.generateDailySummary();
    }

    /**
     * Get weekly comparison
     */
    @GetMapping("/summary/weekly")
    @Operation(summary = "Get week-over-week comparison")
    public Map<String, Object> getWeeklyComparison() {
        return insightGeneratorService.generateWeeklyComparison();
    }

    /**
     * Get training data statistics
     */
    @GetMapping("/stats")
    @Operation(summary = "Get historical data statistics")
    public Map<String, Object> getStatistics(
            @RequestParam(required = false) Integer days) {
        
        int numDays = days != null ? days : 7;
        return trainingDataService.getPowerStatistics(
            java.time.LocalDateTime.now().minusDays(numDays),
            java.time.LocalDateTime.now()
        );
    }

    /**
     * Get data quality metrics
     */
    @GetMapping("/data-quality")
    @Operation(summary = "Get data quality metrics")
    public Map<String, Object> getDataQuality() {
        return trainingDataService.getDataQualityMetrics();
    }

    /**
     * Get optimization recommendation
     */
    @GetMapping("/optimization")
    @Operation(summary = "Get RL-based optimization recommendation")
    public Map<String, Object> getOptimizationRecommendation(
            @RequestParam int occupancy,
            @RequestParam double currentWattage,
            @RequestParam double baselineWattage) {
        
        return optimizationEngineService.getRecommendation(occupancy, currentWattage, baselineWattage);
    }

    /**
     * Get model accuracy statistics
     */
    @GetMapping("/ml/accuracy")
    @Operation(summary = "Get ML model accuracy metrics")
    public Map<String, Object> getModelAccuracy() {
        return predictiveAnalyticsService.getModelAccuracy();
    }

    /**
     * Get adaptive baseline statistics
     */
    @GetMapping("/ml/baselines")
    @Operation(summary = "Get adaptive baseline patterns")
    public Map<String, Object> getBaselineStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("pattern_statistics", trainingDataService.getAveragePowerByHour());
        stats.put("typical_occupancy", trainingDataService.getTypicalOccupancyByHour());
        stats.put("peak_hours", trainingDataService.getPeakUsageHours());
        stats.put("off_peak_hours", trainingDataService.getOffPeakUsageHours());
        return stats;
    }

    /**
     * Get hourly prices for today
     */
    @GetMapping("/pricing/hourly")
    @Operation(summary = "Get hourly electricity prices for today")
    public Map<Integer, Double> getHourlyPrices() {
        return pricingService.getHourlyPricesForToday();
    }

    /**
     * Calculate load shifting savings
     */
    @GetMapping("/pricing/savings")
    @Operation(summary = "Calculate potential savings from load shifting")
    public Map<String, Object> calculateSavings(
            @RequestParam double wattage,
            @RequestParam int durationHours,
            @RequestParam int fromHour,
            @RequestParam int toHour) {
        
        return pricingService.calculateLoadShiftingSavings(
            wattage, durationHours, fromHour, toHour);
    }
}
