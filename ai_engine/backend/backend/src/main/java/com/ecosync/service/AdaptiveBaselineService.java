package com.ecosync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smile.clustering.KMeans;
import smile.math.matrix.Matrix;

import javax.annotation.PostConstruct;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Adaptive Baseline Service using K-Means clustering
 * Learns usage patterns and provides dynamic baselines based on context
 */
@Service
public class AdaptiveBaselineService {

    @Autowired
    private TrainingDataService trainingDataService;

    // Cluster centers for each hour (24 hours x clusters)
    private Map<Integer, double[][]> hourlyClusterCenters;
    private Map<Integer, Integer[]> hourlyClusterLabels;
    private boolean modelsTrained = false;
    
    // Number of clusters (typical, high, low usage patterns)
    private static final int NUM_CLUSTERS = 3;
    
    // Pattern labels
    private static final String PATTERN_LOW = "low_usage";
    private static final String PATTERN_TYPICAL = "typical_usage";
    private static final String PATTERN_HIGH = "high_usage";

    @PostConstruct
    public void init() {
        hourlyClusterCenters = new HashMap<>();
        hourlyClusterLabels = new HashMap<>();
        
        for (int i = 0; i < 24; i++) {
            hourlyClusterCenters.put(i, new double[NUM_CLUSTERS][1]);
            hourlyClusterLabels.put(i, new Integer[NUM_CLUSTERS]);
        }
    }

    /**
     * Train K-Means models for each hour using historical data
     */
    public void trainModels() {
        System.out.println("Training adaptive baseline models with K-Means clustering...");
        
        // Get historical data
        List<com.ecosync.model.SensorReading> data = trainingDataService.getLastNDaysOfData(30);
        
        if (data.size() < NUM_CLUSTERS * 5) {
            System.out.println("Insufficient data for K-Means training. Need at least " + (NUM_CLUSTERS * 5) + " samples.");
            // Use default baselines
            useDefaultBaselines();
            return;
        }

        // Group data by hour
        Map<Integer, List<Double>> powerByHour = new HashMap<>();
        for (int i = 0; i < 24; i++) {
            powerByHour.put(i, new ArrayList<>());
        }
        
        for (com.ecosync.model.SensorReading reading : data) {
            int hour = reading.getTimestamp().getHour();
            powerByHour.get(hour).add(reading.getCurrentWattage());
        }
        
        // Train K-Means for each hour
        for (int i = 0; i < 24; i++) {
            List<Double> hourData = powerByHour.get(i);
            
            if (hourData.size() < NUM_CLUSTERS) {
                // Not enough data, use defaults
                continue;
            }
            
            // Convert to matrix for K-Means
            double[][] x = new double[hourData.size()][1];
            for (int j = 0; j < hourData.size(); j++) {
                x[j][0] = hourData.get(j);
            }
            
            try {
                // Run K-Means clustering
                smile.clustering.KMeans kmeans = smile.clustering.KMeans.fit(x, NUM_CLUSTERS, 10, 100);

                // Store cluster centers
                hourlyClusterCenters.put(i, kmeans.centroids);
                // Convert int[] to Integer[]
                int[] primitiveLabels = kmeans.y;
                Integer[] objectLabels = new Integer[primitiveLabels.length];
                for (int j = 0; j < primitiveLabels.length; j++) {
                    objectLabels[j] = primitiveLabels[j];
                }
                hourlyClusterLabels.put(i, objectLabels);

            } catch (Exception e) {
                System.err.println("K-Means failed for hour " + i + ": " + e.getMessage());
                useDefaultBaselinesForHour(i);
            }
        }
        
        modelsTrained = true;
        System.out.println("Adaptive baseline models trained successfully");
    }

    /**
     * Get adaptive baseline for current conditions
     */
    public double getAdaptiveBaseline(int hour, int occupancy) {
        if (!modelsTrained) {
            trainModels();
        }
        
        double[][] centers = hourlyClusterCenters.get(hour);
        
        if (centers == null || centers.length == 0) {
            // Fall back to simple heuristic
            return getHeuristicBaseline(hour, occupancy);
        }
        
        // Sort cluster centers to identify low/typical/high patterns
        List<Double> sortedCenters = new ArrayList<>();
        for (double[] center : centers) {
            sortedCenters.add(center[0]);
        }
        Collections.sort(sortedCenters);
        
        // Return the median (typical) cluster center
        return sortedCenters.get(sortedCenters.size() / 2);
    }

    /**
     * Get baseline with occupancy adjustment
     */
    public double getOccupancyAdjustedBaseline(int hour, int occupancy) {
        double baseBaseline = getAdaptiveBaseline(hour, occupancy);
        
        // Adjust based on occupancy
        // Typical occupancy is assumed to be around 50
        double occupancyFactor = occupancy / 50.0;
        
        // Base load (independent of occupancy) + variable load
        double baseLoad = baseBaseline * 0.3;
        double variableLoad = baseBaseline * 0.7 * occupancyFactor;
        
        return baseLoad + variableLoad;
    }

    /**
     * Identify current usage pattern (low/typical/high)
     */
    public String identifyUsagePattern(int hour, double currentWattage) {
        if (!modelsTrained) {
            trainModels();
        }
        
        double[][] centers = hourlyClusterCenters.get(hour);
        
        if (centers == null || centers.length == 0) {
            return PATTERN_TYPICAL;
        }
        
        // Find closest cluster
        int closestCluster = 0;
        double minDistance = Double.MAX_VALUE;
        
        for (int i = 0; i < centers.length; i++) {
            double distance = Math.abs(currentWattage - centers[i][0]);
            if (distance < minDistance) {
                minDistance = distance;
                closestCluster = i;
            }
        }
        
        // Sort centers to label the pattern
        List<Map.Entry<Integer, Double>> sortedCenters = new ArrayList<>();
        for (int i = 0; i < centers.length; i++) {
            sortedCenters.add(new AbstractMap.SimpleEntry<>(i, centers[i][0]));
        }
        sortedCenters.sort(Map.Entry.comparingByValue());
        
        // Label based on rank
        int rank = 0;
        for (int i = 0; i < sortedCenters.size(); i++) {
            if (sortedCenters.get(i).getKey() == closestCluster) {
                rank = i;
                break;
            }
        }
        
        if (rank == 0) return PATTERN_LOW;
        if (rank == sortedCenters.size() - 1) return PATTERN_HIGH;
        return PATTERN_TYPICAL;
    }

    /**
     * Get expected range for current hour
     */
    public Map<String, Object> getExpectedRange(int hour) {
        if (!modelsTrained) {
            trainModels();
        }
        
        double[][] centers = hourlyClusterCenters.get(hour);
        
        Map<String, Object> range = new HashMap<>();
        
        if (centers == null || centers.length == 0) {
            double heuristic = getHeuristicBaseline(hour, 50);
            range.put("min", heuristic * 0.5);
            range.put("max", heuristic * 1.5);
            range.put("expected", heuristic);
            return range;
        }
        
        // Find min and max cluster centers
        double min = Double.MAX_VALUE;
        double max = Double.MIN_VALUE;
        double sum = 0;
        
        for (double[] center : centers) {
            min = Math.min(min, center[0]);
            max = Math.max(max, center[0]);
            sum += center[0];
        }
        
        range.put("min", Math.round(min * 100) / 100.0);
        range.put("max", Math.round(max * 100) / 100.0);
        range.put("expected", Math.round((sum / centers.length) * 100) / 100.0);
        range.put("low_threshold", Math.round(min * 100) / 100.0);
        range.put("high_threshold", Math.round(max * 100) / 100.0);
        
        return range;
    }

    /**
     * Check if current usage is abnormal for the context
     */
    public boolean isAbnormal(int hour, double currentWattage, double thresholdMultiplier) {
        Map<String, Object> range = getExpectedRange(hour);
        
        double min = (double) range.get("min");
        double max = (double) range.get("max");
        
        double adjustedMin = min / thresholdMultiplier;
        double adjustedMax = max * thresholdMultiplier;
        
        return currentWattage < adjustedMin || currentWattage > adjustedMax;
    }

    /**
     * Get day-type specific baseline (weekday vs weekend)
     */
    public double getDayTypeBaseline(int hour, DayOfWeek dayOfWeek) {
        // Weekend adjustment factor
        boolean isWeekend = dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
        
        double baseBaseline = getAdaptiveBaseline(hour, 50);
        
        if (isWeekend) {
            // Weekend typically has lower occupancy
            return baseBaseline * 0.6;
        }
        
        return baseBaseline;
    }

    /**
     * Get efficiency target based on adaptive baseline
     */
    public double getEfficiencyTarget(int hour, int occupancy) {
        double adaptiveBaseline = getOccupancyAdjustedBaseline(hour, occupancy);
        
        // Target is 80% of adaptive baseline (encourage improvement)
        return adaptiveBaseline * 0.8;
    }

    /**
     * Get pattern statistics
     */
    public Map<String, Object> getPatternStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("models_trained", modelsTrained);
        stats.put("num_clusters", NUM_CLUSTERS);
        stats.put("pattern_labels", Arrays.asList(PATTERN_LOW, PATTERN_TYPICAL, PATTERN_HIGH));
        
        // Sample cluster centers for a few hours
        Map<Integer, List<Double>> sampleCenters = new HashMap<>();
        for (int hour : Arrays.asList(9, 12, 15, 18, 21)) {
            double[][] centers = hourlyClusterCenters.get(hour);
            if (centers != null) {
                List<Double> hourCenters = new ArrayList<>();
                for (double[] center : centers) {
                    hourCenters.add(center[0]);
                }
                Collections.sort(hourCenters);
                sampleCenters.put(hour, hourCenters);
            }
        }
        stats.put("sample_cluster_centers", sampleCenters);
        
        return stats;
    }

    // Helper methods
    private void useDefaultBaselines() {
        for (int i = 0; i < 24; i++) {
            useDefaultBaselinesForHour(i);
        }
    }

    private void useDefaultBaselinesForHour(int hour) {
        double[][] defaultCenters = new double[NUM_CLUSTERS][1];
        double baseWattage = getHeuristicBaseline(hour, 50);
        
        defaultCenters[0][0] = baseWattage * 0.5;  // Low
        defaultCenters[1][0] = baseWattage;        // Typical
        defaultCenters[2][0] = baseWattage * 1.5;  // High
        
        hourlyClusterCenters.put(hour, defaultCenters);
    }

    private double getHeuristicBaseline(int hour, int occupancy) {
        // Business hours: higher baseline
        if (hour >= 9 && hour <= 17) {
            return 500 + (occupancy * 50);
        }
        // Off hours: lower baseline
        return 100 + (occupancy * 20);
    }

    public boolean isModelsTrained() {
        return modelsTrained;
    }
}
