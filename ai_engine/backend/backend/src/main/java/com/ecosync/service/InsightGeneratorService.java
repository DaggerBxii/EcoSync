package com.ecosync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Insight Generator Service for Explainable AI (XAI)
 * Generates human-readable explanations and actionable recommendations
 */
@Service
public class InsightGeneratorService {

    @Autowired
    private TrainingDataService trainingDataService;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private WeatherService weatherService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");

    /**
     * Generate detailed insight from AI decision
     */
    public String generateInsight(Map<String, Object> aiDecision) {
        String baseInsight = (String) aiDecision.getOrDefault("ai_insight", "");
        
        Map<String, Object> metrics = (Map<String, Object>) aiDecision.get("metrics");
        if (metrics == null) {
            return baseInsight;
        }

        double currentUsage = getDoubleValue(metrics, "current_usage");
        double baselineUsage = getDoubleValue(metrics, "baseline_usage");
        int occupancy = getIntValue(metrics, "occupancy");
        double efficiencyScore = getDoubleValue(metrics, "efficiency_score");
        boolean isAnomaly = (Boolean) aiDecision.getOrDefault("integrity_alert", false);
        String status = (String) aiDecision.getOrDefault("system_status", "");

        StringBuilder insight = new StringBuilder();
        
        // Primary status
        if (isAnomaly) {
            insight.append(generateAnomalyInsight(currentUsage, baselineUsage, occupancy));
        } else if (efficiencyScore < 50) {
            insight.append(generateInefficiencyInsight(currentUsage, baselineUsage, occupancy, efficiencyScore));
        } else if (efficiencyScore > 80) {
            insight.append(generateEfficientInsight(currentUsage, occupancy, efficiencyScore));
        } else {
            insight.append(generateNormalInsight(currentUsage, baselineUsage, efficiencyScore));
        }

        // Add context
        insight.append(" ");
        insight.append(generateContextualAdvice(status, occupancy));

        return insight.toString();
    }

    /**
     * Generate insight for anomaly situations
     */
    private String generateAnomalyInsight(double currentUsage, double baselineUsage, int occupancy) {
        double deviation = ((currentUsage - baselineUsage) / baselineUsage) * 100;
        
        String severity = Math.abs(deviation) > 50 ? "SEVERE" : (Math.abs(deviation) > 30 ? "MODERATE" : "MINOR");
        
        return String.format(
            "⚠️ %s ANOMALY: Power usage (%.0fW) is %.0f%% %s baseline (%.0fW). " +
            "Possible causes: equipment malfunction, unusual occupancy pattern, or weather impact.",
            severity,
            currentUsage,
            Math.abs(deviation),
            deviation > 0 ? "above" : "below",
            baselineUsage
        );
    }

    /**
     * Generate insight for inefficient operation
     */
    private String generateInefficiencyInsight(double currentUsage, double baselineUsage, 
                                                int occupancy, double efficiencyScore) {
        double powerPerPerson = occupancy > 0 ? currentUsage / occupancy : currentUsage;
        
        return String.format(
            "⚡ INEFFICIENT: Power draw per occupant (%.0fW) exceeds optimal range. " +
            "Efficiency score: %.0f%%. Consider scaling down non-essential systems.",
            powerPerPerson,
            efficiencyScore
        );
    }

    /**
     * Generate insight for efficient operation
     */
    private String generateEfficientInsight(double currentUsage, int occupancy, double efficiencyScore) {
        return String.format(
            "✅ OPTIMAL: Energy usage is efficient (%.0f%% score). " +
            "Current load of %.0fW for %d occupants is within expected parameters.",
            efficiencyScore,
            currentUsage,
            occupancy
        );
    }

    /**
     * Generate insight for normal operation
     */
    private String generateNormalInsight(double currentUsage, double baselineUsage, double efficiencyScore) {
        return String.format(
            "📊 NORMAL: Power consumption (%.0fW) is within %.0f%% of baseline (%.0fW). " +
            "Efficiency: %.0f%%.",
            currentUsage,
            baselineUsage > 0 ? (currentUsage / baselineUsage * 100) : 100,
            baselineUsage,
            efficiencyScore
        );
    }

    /**
     * Generate contextual advice based on status and occupancy
     */
    private String generateContextualAdvice(String status, int occupancy) {
        List<String> advice = new ArrayList<>();
        
        if ("Critical Alert".equals(status)) {
            advice.add("Immediate investigation recommended.");
        } else if ("Inefficient".equals(status)) {
            if (occupancy < 20) {
                advice.add("Low occupancy detected - consider zone-based power reduction.");
            } else {
                advice.add("Review HVAC scheduling for optimization opportunities.");
            }
        } else if ("Optimized".equals(status)) {
            advice.add("Continue current operating parameters.");
        }
        
        return advice.isEmpty() ? "" : " " + advice.get(0);
    }

    /**
     * Generate actionable recommendations based on historical data
     */
    public List<Recommendation> generateRecommendations() {
        List<Recommendation> recommendations = new ArrayList<>();
        
        // Get historical statistics
        Map<String, Object> stats = trainingDataService.getPowerStatistics(
            LocalDateTime.now().minusDays(7),
            LocalDateTime.now()
        );
        
        if (!stats.isEmpty()) {
            // Check for high anomaly rate
            double anomalyRate = getDoubleValue(stats, "anomaly_rate");
            if (anomalyRate > 5) {
                recommendations.add(new Recommendation(
                    Recommendation.Priority.HIGH,
                    "High Anomaly Rate",
                    String.format("Anomaly rate is %.1f%% this week. Schedule equipment inspection.", anomalyRate),
                    "maintenance"
                ));
            }
            
            // Check efficiency
            double avgEfficiency = getDoubleValue(stats, "avg_efficiency");
            if (avgEfficiency < 60) {
                recommendations.add(new Recommendation(
                    Recommendation.Priority.HIGH,
                    "Low Average Efficiency",
                    String.format("Average efficiency is %.0f%%. Target: 80%%+. Review power allocation policies.", avgEfficiency),
                    "optimization"
                ));
            }
        }
        
        // Weather-based recommendations
        Map<String, Object> weatherRecs = weatherService.getWeatherRecommendations();
        @SuppressWarnings("unchecked")
        List<String> weatherTips = (List<String>) weatherRecs.get("tips");
        if (weatherTips != null) {
            for (String tip : weatherTips) {
                recommendations.add(new Recommendation(
                    Recommendation.Priority.MEDIUM,
                    "Weather Advisory",
                    tip,
                    "weather"
                ));
            }
        }
        
        // Pricing-based recommendations
        List<PricingService.TimeWindow> lowCostWindows = pricingService.getLowCostWindows();
        if (!lowCostWindows.isEmpty() && lowCostWindows.get(0).avgPrice < pricingService.getCurrentPricePerKwh() * 0.8) {
            PricingService.TimeWindow bestWindow = lowCostWindows.get(0);
            recommendations.add(new Recommendation(
                Recommendation.Priority.MEDIUM,
                "Cost Savings Opportunity",
                String.format("Schedule high-power tasks between %s for %.1f%% savings.",
                    bestWindow.toMap().get("time_range"),
                    (1 - bestWindow.avgPrice / pricingService.getCurrentPricePerKwh()) * 100),
                "pricing"
            ));
        }
        
        // Sort by priority
        recommendations.sort(Comparator.comparing(r -> r.priority));
        
        return recommendations;
    }

    /**
     * Generate explanation for why a specific decision was made
     */
    public Map<String, Object> explainDecision(Map<String, Object> aiDecision) {
        Map<String, Object> explanation = new HashMap<>();
        
        Map<String, Object> metrics = (Map<String, Object>) aiDecision.get("metrics");
        if (metrics == null) {
            return explanation;
        }
        
        double currentUsage = getDoubleValue(metrics, "current_usage");
        double baselineUsage = getDoubleValue(metrics, "baseline_usage");
        int occupancy = getIntValue(metrics, "occupancy");
        double efficiencyScore = getDoubleValue(metrics, "efficiency_score");
        boolean isAnomaly = (Boolean) aiDecision.getOrDefault("integrity_alert", false);
        double scaleLevel = getDoubleValue(aiDecision, "scale_level");
        
        // Factors influencing decision
        List<Factor> factors = new ArrayList<>();
        
        // Factor 1: Deviation from baseline
        double deviation = baselineUsage > 0 ? ((currentUsage - baselineUsage) / baselineUsage) * 100 : 0;
        factors.add(new Factor(
            "Baseline Deviation",
            Math.abs(deviation),
            deviation > 0 ? "Above baseline" : "Below baseline",
            Math.abs(deviation) > 30
        ));
        
        // Factor 2: Efficiency score
        factors.add(new Factor(
            "Efficiency Score",
            100 - efficiencyScore,
            String.format("%.0f%% efficiency", efficiencyScore),
            efficiencyScore < 50
        ));
        
        // Factor 3: Occupancy level
        String occLevel = occupancy < 20 ? "Low" : (occupancy < 50 ? "Medium" : "High");
        factors.add(new Factor(
            "Occupancy Level",
            occupancy,
            occLevel + " occupancy (" + occupancy + " people)",
            false
        ));
        
        // Factor 4: Anomaly status
        factors.add(new Factor(
            "Anomaly Detection",
            isAnomaly ? 100 : 0,
            isAnomaly ? "Anomaly detected" : "Normal pattern",
            isAnomaly
        ));
        
        // Sort factors by influence
        factors.sort((a, b) -> Double.compare(b.influence, a.influence));
        
        explanation.put("decision", aiDecision.get("system_status"));
        explanation.put("action_taken", String.format("Scale level: %.0f%%", scaleLevel * 100));
        explanation.put("primary_factors", factors.subList(0, Math.min(3, factors.size())));
        explanation.put("insight", generateInsight(aiDecision));
        
        return explanation;
    }

    /**
     * Generate daily summary report
     */
    public Map<String, Object> generateDailySummary() {
        Map<String, Object> summary = new HashMap<>();
        
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        
        // Get today's statistics
        Map<String, Object> stats = trainingDataService.getPowerStatistics(startOfDay, now);
        
        summary.put("date", LocalDateTime.now().toLocalDate().toString());
        summary.put("period", "Today (since midnight)");
        
        if (!stats.isEmpty()) {
            summary.put("total_readings", stats.get("count"));
            summary.put("energy_consumed_kwh", stats.get("total_kwh"));
            summary.put("average_efficiency", stats.get("avg_efficiency"));
            summary.put("anomaly_count", stats.get("anomaly_count"));
            
            // Calculate cost
            double totalKwh = getDoubleValue(stats, "total_kwh");
            double estimatedCost = totalKwh * pricingService.getCurrentPricePerKwh();
            summary.put("estimated_cost", Math.round(estimatedCost * 100) / 100.0);
            summary.put("currency", "USD");
        }

        // Add weather context
        summary.put("weather", weatherService.getWeatherSummary());

        // Add top recommendations
        List<Recommendation> topRecs = generateRecommendations().stream()
                .limit(3)
                .collect(java.util.stream.Collectors.toList());
        summary.put("top_recommendations", topRecs);

        return summary;
    }

    /**
     * Generate comparison report (this week vs last week)
     */
    public Map<String, Object> generateWeeklyComparison() {
        Map<String, Object> comparison = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusWeeks(1);
        LocalDateTime twoWeeksAgo = now.minusWeeks(2);
        
        // This week's stats
        Map<String, Object> thisWeek = trainingDataService.getPowerStatistics(weekAgo, now);
        // Last week's stats
        Map<String, Object> lastWeek = trainingDataService.getPowerStatistics(twoWeeksAgo, weekAgo);
        
        comparison.put("period", "Week-over-Week Comparison");
        
        if (!thisWeek.isEmpty() && !lastWeek.isEmpty()) {
            double thisWeekKwh = getDoubleValue(thisWeek, "total_kwh");
            double lastWeekKwh = getDoubleValue(lastWeek, "total_kwh");
            double change = lastWeekKwh > 0 ? ((thisWeekKwh - lastWeekKwh) / lastWeekKwh) * 100 : 0;
            
            comparison.put("this_week_kwh", Math.round(thisWeekKwh * 100) / 100.0);
            comparison.put("last_week_kwh", Math.round(lastWeekKwh * 100) / 100.0);
            comparison.put("change_pct", Math.round(change * 100) / 100.0);
            comparison.put("trend", change > 5 ? "INCREASING" : (change < -5 ? "DECREASING" : "STABLE"));
            
            // Efficiency comparison
            double thisWeekEff = getDoubleValue(thisWeek, "avg_efficiency");
            double lastWeekEff = getDoubleValue(lastWeek, "avg_efficiency");
            comparison.put("this_week_efficiency", Math.round(thisWeekEff * 100) / 100.0);
            comparison.put("last_week_efficiency", Math.round(lastWeekEff * 100) / 100.0);
        }
        
        return comparison;
    }

    // Helper methods
    private double getDoubleValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }

    private int getIntValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return 0;
    }

    // Inner classes
    public static class Recommendation {
        public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }
        
        public final Priority priority;
        public final String title;
        public final String description;
        public final String category;
        
        public Recommendation(Priority priority, String title, String description, String category) {
            this.priority = priority;
            this.title = title;
            this.description = description;
            this.category = category;
        }
        
        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("priority", priority.name());
            map.put("title", title);
            map.put("description", description);
            map.put("category", category);
            return map;
        }
    }
    
    public static class Factor {
        public final String name;
        public final double influence;
        public final String value;
        public final boolean isCritical;
        
        public Factor(String name, double influence, String value, boolean isCritical) {
            this.name = name;
            this.influence = influence;
            this.value = value;
            this.isCritical = isCritical;
        }
        
        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("name", name);
            map.put("influence", Math.round(influence * 100) / 100.0);
            map.put("value", value);
            map.put("critical", isCritical);
            return map;
        }
    }
}
