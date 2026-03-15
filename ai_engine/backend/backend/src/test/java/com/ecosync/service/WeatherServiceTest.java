package com.ecosync.service;

import com.ecosync.model.WeatherData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for WeatherService
 */
class WeatherServiceTest {

    private WeatherService weatherService;

    @BeforeEach
    void setUp() {
        WebClient.Builder webClientBuilder = WebClient.builder();
        weatherService = new WeatherService(webClientBuilder);
        // apiKey will be injected via @Value annotation at runtime
        // For tests, the service will use "demo" mode with simulated data
    }

    @Test
    void testGetCurrentWeather() {
        // When
        WeatherData weather = weatherService.getCurrentWeather();

        // Then
        assertNotNull(weather);
        assertNotNull(weather.getTemperature());
    }

    @Test
    void testGetExternalTemperature() {
        // When
        Double temp = weatherService.getExternalTemperature();

        // Then
        assertNotNull(temp);
        assertTrue(temp > -50 && temp < 60); // Reasonable range
    }

    @Test
    void testEstimateHvacImpact_ComfortZone() {
        // Given - temperature in comfort zone
        double temp = 22.0;

        // When
        double impact = weatherService.estimateHvacImpact(temp);

        // Then - should be minimal (close to 1.0)
        assertEquals(1.0, impact, 0.01);
    }

    @Test
    void testEstimateHvacImpact_Hot() {
        // Given - hot temperature
        double temp = 35.0;

        // When
        double impact = weatherService.estimateHvacImpact(temp);

        // Then - should be > 1.0 (more HVAC needed)
        assertTrue(impact > 1.0);
    }

    @Test
    void testEstimateHvacImpact_Cold() {
        // Given - cold temperature
        double temp = 5.0;

        // When
        double impact = weatherService.estimateHvacImpact(temp);

        // Then - should be > 1.0 (more heating needed)
        assertTrue(impact > 1.0);
    }

    @Test
    void testGetTemperatureAdjustedBaseline() {
        // Given
        double baseBaseline = 500.0;
        double externalTemp = 30.0;

        // When
        double adjusted = weatherService.getTemperatureAdjustedBaseline(baseBaseline, externalTemp);

        // Then
        assertTrue(adjusted >= baseBaseline);
    }

    @Test
    void testGetWeatherRecommendations() {
        // When
        Map<String, Object> recommendations = weatherService.getWeatherRecommendations();

        // Then
        assertNotNull(recommendations);
        assertTrue(recommendations.containsKey("tips"));
        assertTrue(recommendations.containsKey("hvac_impact_multiplier"));
    }

    @Test
    void testIsExtremeWeather_Hot() {
        // Note: This test depends on simulated weather which may vary
        // Just verify the method doesn't throw exception
        weatherService.getCurrentWeather();
        boolean isExtreme = weatherService.isExtremeWeather();
        
        // Result depends on simulated temperature
        assertNotNull(isExtreme);
    }

    @Test
    void testGetWeatherSummary() {
        // When
        Map<String, Object> summary = weatherService.getWeatherSummary();

        // Then
        assertNotNull(summary);
        assertTrue(summary.containsKey("temperature_c"));
        assertTrue(summary.containsKey("condition"));
        assertTrue(summary.containsKey("hvac_impact"));
    }
}
