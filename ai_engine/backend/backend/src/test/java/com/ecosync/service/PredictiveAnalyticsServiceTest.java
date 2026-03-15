package com.ecosync.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PredictiveAnalyticsService
 */
@ExtendWith(MockitoExtension.class)
class PredictiveAnalyticsServiceTest {

    @Mock
    private TrainingDataService trainingDataService;

    @InjectMocks
    private PredictiveAnalyticsService predictiveAnalyticsService;

    @BeforeEach
    void setUp() {
        predictiveAnalyticsService = new PredictiveAnalyticsService();
        // trainingDataService will be autowired at runtime
        predictiveAnalyticsService.init();
    }

    @Test
    void testInit() {
        // When
        predictiveAnalyticsService.init();

        // Then
        assertFalse(predictiveAnalyticsService.isModelTrained());
    }

    @Test
    void testForecastPowerDemand_NotTrained() {
        // Given - no training data
        when(trainingDataService.getLastNDaysOfData(30)).thenReturn(java.util.Collections.emptyList());

        // When
        double[] forecast = predictiveAnalyticsService.forecastPowerDemand(24);

        // Then
        assertNotNull(forecast);
        assertEquals(24, forecast.length);
    }

    @Test
    void testPredictOccupancy() {
        // Given - no training data
        when(trainingDataService.getLastNDaysOfData(30)).thenReturn(java.util.Collections.emptyList());

        // When
        int occupancy = predictiveAnalyticsService.predictOccupancy(LocalDateTime.of(2024, 1, 15, 14, 0));

        // Then - should use default (business hours = 50)
        assertEquals(50, occupancy);
    }

    @Test
    void testPredictOccupancy_OffHours() {
        // Given
        when(trainingDataService.getLastNDaysOfData(30)).thenReturn(java.util.Collections.emptyList());

        // When - night time
        int occupancy = predictiveAnalyticsService.predictOccupancy(LocalDateTime.of(2024, 1, 15, 3, 0));

        // Then - should use default (off hours = 5)
        assertEquals(5, occupancy);
    }

    @Test
    void testForecastOccupancy() {
        // Given
        when(trainingDataService.getLastNDaysOfData(30)).thenReturn(java.util.Collections.emptyList());

        // When
        int[] forecast = predictiveAnalyticsService.forecastOccupancy(24);

        // Then
        assertNotNull(forecast);
        assertEquals(24, forecast.length);
    }

    @Test
    void testGetModelAccuracy_NotTrained() {
        // When
        Map<String, Object> accuracy = predictiveAnalyticsService.getModelAccuracy();

        // Then
        assertNotNull(accuracy);
        assertFalse((Boolean) accuracy.get("trained"));
    }

    @Test
    void testGetPeakDemandForecast() {
        // Given
        when(trainingDataService.getLastNDaysOfData(30)).thenReturn(java.util.Collections.emptyList());

        // When
        Map<String, Object> forecast = predictiveAnalyticsService.getPeakDemandForecast();

        // Then
        assertNotNull(forecast);
        assertTrue(forecast.containsKey("hourly_forecast"));
        assertTrue(forecast.containsKey("peak_demand_watts"));
        assertTrue(forecast.containsKey("peak_hour"));
    }

    @Test
    void testUpdateWithObservation() {
        // Given
        int hour = 14;
        double power = 500.0;
        int occupancy = 30;

        // When
        predictiveAnalyticsService.updateWithObservation(hour, power, occupancy);

        // Then - should not throw exception
    }

    @Test
    void testGetRecommendations() {
        // Given
        when(trainingDataService.getLastNDaysOfData(30)).thenReturn(java.util.Collections.emptyList());

        // When
        java.util.List<String> recommendations = predictiveAnalyticsService.getRecommendations();

        // Then
        assertNotNull(recommendations);
    }
}
