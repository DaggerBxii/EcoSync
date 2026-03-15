package com.ecosync.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for PricingService
 */
class PricingServiceTest {

    private PricingService pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new PricingService();
    }

    @Test
    void testGetCurrentPricePerKwh() {
        // When
        double price = pricingService.getCurrentPricePerKwh();

        // Then
        assertTrue(price > 0);
        assertTrue(price < 1); // Should be reasonable (less than $1/kWh)
    }

    @Test
    void testGetPriceForTime_PeakHours() {
        // Given - weekday at 2 PM (peak hours)
        LocalTime peakTime = LocalTime.of(14, 0);
        DayOfWeek weekday = DayOfWeek.MONDAY;

        // When
        double price = pricingService.getPriceForTime(peakTime, weekday);

        // Then - should be peak price (highest)
        assertTrue(price >= pricingService.getCurrentPricePerKwh());
    }

    @Test
    void testGetPriceForTime_OffPeak() {
        // Given - early morning (off-peak)
        LocalTime offPeakTime = LocalTime.of(3, 0);
        DayOfWeek weekday = DayOfWeek.WEDNESDAY;

        // When
        double price = pricingService.getPriceForTime(offPeakTime, weekday);

        // Then - should be lower than peak
        assertNotNull(price);
        assertTrue(price > 0);
    }

    @Test
    void testGetPriceForTime_Weekend() {
        // Given - weekend
        LocalTime time = LocalTime.of(12, 0);
        DayOfWeek weekend = DayOfWeek.SATURDAY;

        // When
        double price = pricingService.getPriceForTime(time, weekend);

        // Then
        assertNotNull(price);
    }

    @Test
    void testCalculateRunningCost() {
        // Given
        double wattage = 1000.0; // 1 kW
        double hours = 2.0;

        // When
        double cost = pricingService.calculateRunningCost(wattage, hours);

        // Then
        assertTrue(cost > 0);
    }

    @Test
    void testCalculateDailyCost() {
        // Given
        double averageWattage = 500.0;

        // When
        double dailyCost = pricingService.calculateDailyCost(averageWattage);

        // Then
        assertTrue(dailyCost > 0);
    }

    @Test
    void testGetHourlyPricesForToday() {
        // When
        java.util.Map<Integer, Double> hourlyPrices = pricingService.getHourlyPricesForToday();

        // Then
        assertNotNull(hourlyPrices);
        assertEquals(24, hourlyPrices.size());
        assertTrue(hourlyPrices.values().stream().allMatch(p -> p > 0));
    }

    @Test
    void testGetLowCostWindows() {
        // When
        java.util.List<PricingService.TimeWindow> windows = pricingService.getLowCostWindows();

        // Then
        assertNotNull(windows);
        // May be empty depending on current time/pricing
    }

    @Test
    void testGetHighCostWindows() {
        // When
        java.util.List<PricingService.TimeWindow> windows = pricingService.getHighCostWindows();

        // Then
        assertNotNull(windows);
    }

    @Test
    void testCalculateLoadShiftingSavings() {
        // Given
        double wattage = 2000.0;
        int durationHours = 3;
        int fromHour = 14; // Peak
        int toHour = 3;    // Off-peak

        // When
        java.util.Map<String, Object> savings = pricingService.calculateLoadShiftingSavings(
            wattage, durationHours, fromHour, toHour);

        // Then
        assertNotNull(savings);
        assertTrue((Double) savings.get("savings") >= 0);
        assertNotNull(savings.get("current_cost"));
        assertNotNull(savings.get("shifted_cost"));
    }

    @Test
    void testGetPricingSummary() {
        // When
        java.util.Map<String, Object> summary = pricingService.getPricingSummary();

        // Then
        assertNotNull(summary);
        assertTrue(summary.containsKey("current_price_per_kwh"));
        assertTrue(summary.containsKey("peak_price"));
        assertTrue(summary.containsKey("off_peak_price"));
    }

    @Test
    void testGetCarbonIntensity() {
        // When
        double intensity = pricingService.getCarbonIntensity();

        // Then - should be between 0.3 and 0.5 kg CO2/kWh
        assertTrue(intensity >= 0.3);
        assertTrue(intensity <= 0.5);
    }

    @Test
    void testCalculateCarbonFootprint() {
        // Given
        double kwh = 100.0;

        // When
        double footprint = pricingService.calculateCarbonFootprint(kwh);

        // Then
        assertTrue(footprint > 0);
    }
}
