package com.ecosync.service;

import com.ecosync.model.SensorReading;
import com.ecosync.repository.SensorReadingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AiEngineService
 */
@ExtendWith(MockitoExtension.class)
class AiEngineServiceTest {

    @Mock
    private SensorReadingRepository sensorReadingRepository;

    @InjectMocks
    private AiEngineService aiEngineService;

    @BeforeEach
    void setUp() {
        // Mock repository save to do nothing
        when(sensorReadingRepository.save(any(SensorReading.class))).thenAnswer(i -> i.getArguments()[0]);
    }

    @Test
    void testProcessCycle_NormalOperation() {
        // Given
        int occupancy = 50;
        double wattage = 500.0;

        // When
        Map<String, Object> result = aiEngineService.processCycle(occupancy, wattage);

        // Then
        assertNotNull(result);
        assertEquals("Optimized", result.get("system_status"));
        assertFalse((Boolean) result.get("integrity_alert"));
        
        Map<String, Object> metrics = (Map<String, Object>) result.get("metrics");
        assertEquals(500.0, (Double) metrics.get("current_usage"), 0.01);
        assertEquals(50, metrics.get("occupancy"));
        assertNotNull(metrics.get("efficiency_score"));
    }

    @Test
    void testProcessCycle_AnomalyDetection() {
        // Given - feed normal data first to establish baseline
        for (int i = 0; i < 10; i++) {
            aiEngineService.processCycle(50, 500.0);
        }

        // When - sudden spike in wattage
        Map<String, Object> result = aiEngineService.processCycle(50, 1500.0);

        // Then - should detect anomaly
        assertTrue((Boolean) result.get("integrity_alert"));
        assertEquals("Critical Alert", result.get("system_status"));
    }

    @Test
    void testProcessCycle_InefficientOperation() {
        // Given - low efficiency (high wattage for low occupancy)
        int occupancy = 5;
        double wattage = 1000.0;

        // When
        Map<String, Object> result = aiEngineService.processCycle(occupancy, wattage);

        // Then
        assertNotNull(result);
        Map<String, Object> metrics = (Map<String, Object>) result.get("metrics");
        assertTrue((Double) metrics.get("efficiency_score") < 50);
    }

    @Test
    void testProcessCycle_WithExternalTemp() {
        // Given
        int occupancy = 30;
        double wattage = 400.0;
        double externalTemp = 35.0;

        // When
        Map<String, Object> result = aiEngineService.processCycle(occupancy, wattage, externalTemp);

        // Then
        assertNotNull(result);
        assertNotNull(result.get("timestamp"));
    }

    @Test
    void testProcessCycle_VampireLoadPenalty() {
        // Given - zero occupancy but high wattage (vampire load)
        int occupancy = 0;
        double wattage = 200.0;

        // When
        Map<String, Object> result = aiEngineService.processCycle(occupancy, wattage);

        // Then - efficiency should be 0 due to vampire load penalty
        Map<String, Object> metrics = (Map<String, Object>) result.get("metrics");
        assertEquals(0.0, (Double) metrics.get("efficiency_score"), 0.01);
    }

    @Test
    void testLoadHistoricalData() {
        // Given
        List<SensorReading> mockReadings = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            SensorReading reading = new SensorReading();
            reading.setTimestamp(LocalDateTime.now());
            reading.setCurrentWattage(450.0 + i * 10);
            mockReadings.add(reading);
        }
        when(sensorReadingRepository.findTop50ByOrderByTimestampDesc()).thenReturn(mockReadings);

        // When
        aiEngineService.loadHistoricalData();

        // Then - should not throw exception
        verify(sensorReadingRepository, times(1)).findTop50ByOrderByTimestampDesc();
    }
}
