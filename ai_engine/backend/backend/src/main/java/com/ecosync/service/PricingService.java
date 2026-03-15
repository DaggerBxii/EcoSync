package com.ecosync.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;

/**
 * Utility Pricing Service for electricity cost optimization
 * Supports time-of-use pricing and real-time pricing integration
 */
@Service
public class PricingService {

    @Value("${utility.price.per.kwh:0.12}")
    private double basePricePerKwh;

    @Value("${utility.currency:USD}")
    private String currency;

    // Time-of-use pricing tiers (price per kWh)
    private final Map<TimePeriod, Double> timeOfUsePrices;
    
    // Cached daily prices
    private final Map<LocalDate, Map<Integer, Double>> dailyPrices;

    public PricingService() {
        this.timeOfUsePrices = new EnumMap<>(TimePeriod.class);
        this.dailyPrices = new HashMap<>();
        
        // Initialize default time-of-use prices
        initializeDefaultPrices();
    }

    private enum TimePeriod {
        PEAK,      // Highest price
        MID_PEAK,  // Medium price
        OFF_PEAK   // Lowest price
    }

    private void initializeDefaultPrices() {
        // Default TOU pricing (California-style)
        timeOfUsePrices.put(TimePeriod.PEAK, basePricePerKwh * 1.5);    // $0.18
        timeOfUsePrices.put(TimePeriod.MID_PEAK, basePricePerKwh * 1.2); // $0.144
        timeOfUsePrices.put(TimePeriod.OFF_PEAK, basePricePerKwh * 0.7); // $0.084
    }

    /**
     * Get current price per kWh based on time-of-use
     */
    public double getCurrentPricePerKwh() {
        LocalTime now = LocalTime.now();
        DayOfWeek dayOfWeek = LocalDate.now().getDayOfWeek();
        
        return getPriceForTime(now, dayOfWeek);
    }

    /**
     * Get price for a specific time
     */
    public double getPriceForTime(LocalTime time, DayOfWeek dayOfWeek) {
        TimePeriod period = getTimePeriod(time, dayOfWeek);
        return timeOfUsePrices.get(period);
    }

    /**
     * Determine time period based on time and day
     */
    private TimePeriod getTimePeriod(LocalTime time, DayOfWeek dayOfWeek) {
        boolean isWeekend = dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
        
        if (isWeekend) {
            // Weekend: mostly off-peak
            if (time.isBefore(LocalTime.of(6, 0)) || time.isAfter(LocalTime.of(22, 0))) {
                return TimePeriod.OFF_PEAK;
            }
            return TimePeriod.MID_PEAK;
        }
        
        // Weekday pricing
        if (time.isBefore(LocalTime.of(6, 0)) || time.isAfter(LocalTime.of(21, 0))) {
            return TimePeriod.OFF_PEAK;
        }
        
        if (time.isBefore(LocalTime.of(10, 0)) || time.isAfter(LocalTime.of(17, 0))) {
            return TimePeriod.MID_PEAK;
        }
        
        // Peak hours: 10 AM - 5 PM on weekdays
        return TimePeriod.PEAK;
    }

    /**
     * Calculate cost of current consumption
     */
    public double calculateRunningCost(double wattage, double durationHours) {
        double kwh = wattage / 1000 * durationHours;
        return kwh * getCurrentPricePerKwh();
    }

    /**
     * Calculate daily cost estimate
     */
    public double calculateDailyCost(double averageWattage) {
        double totalCost = 0;
        
        for (int hour = 0; hour < 24; hour++) {
            LocalTime time = LocalTime.of(hour, 0);
            double price = getPriceForTime(time, LocalDate.now().getDayOfWeek());
            double hourlyKwh = averageWattage / 1000;
            totalCost += hourlyKwh * price;
        }
        
        return totalCost;
    }

    /**
     * Calculate monthly cost estimate
     */
    public double calculateMonthlyCost(double averageDailyCost) {
        YearMonth currentMonth = YearMonth.now();
        int daysInMonth = currentMonth.lengthOfMonth();
        return averageDailyCost * daysInMonth;
    }

    /**
     * Get hourly prices for today
     */
    public Map<Integer, Double> getHourlyPricesForToday() {
        LocalDate today = LocalDate.now();
        
        if (dailyPrices.containsKey(today)) {
            return dailyPrices.get(today);
        }
        
        Map<Integer, Double> hourlyPrices = new HashMap<>();
        DayOfWeek dayOfWeek = today.getDayOfWeek();
        
        for (int hour = 0; hour < 24; hour++) {
            LocalTime time = LocalTime.of(hour, 0);
            hourlyPrices.put(hour, getPriceForTime(time, dayOfWeek));
        }
        
        dailyPrices.put(today, hourlyPrices);
        return hourlyPrices;
    }

    /**
     * Get low-cost time windows for scheduling
     */
    public List<TimeWindow> getLowCostWindows() {
        List<TimeWindow> windows = new ArrayList<>();
        Map<Integer, Double> hourlyPrices = getHourlyPricesForToday();
        
        double avgPrice = hourlyPrices.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(basePricePerKwh);
        
        double lowCostThreshold = avgPrice * 0.9;
        
        TimeWindow currentWindow = null;
        
        for (int hour = 0; hour < 24; hour++) {
            double price = hourlyPrices.get(hour);
            
            if (price <= lowCostThreshold) {
                if (currentWindow == null) {
                    currentWindow = new TimeWindow(hour, hour + 1, price);
                } else {
                    currentWindow.endHour = hour + 1;
                    currentWindow.avgPrice = (currentWindow.avgPrice + price) / 2;
                }
            } else {
                if (currentWindow != null) {
                    windows.add(currentWindow);
                    currentWindow = null;
                }
            }
        }
        
        if (currentWindow != null) {
            windows.add(currentWindow);
        }
        
        return windows;
    }

    /**
     * Get high-cost time windows to avoid
     */
    public List<TimeWindow> getHighCostWindows() {
        List<TimeWindow> windows = new ArrayList<>();
        Map<Integer, Double> hourlyPrices = getHourlyPricesForToday();
        
        double avgPrice = hourlyPrices.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(basePricePerKwh);
        
        double highCostThreshold = avgPrice * 1.1;
        
        TimeWindow currentWindow = null;
        
        for (int hour = 0; hour < 24; hour++) {
            double price = hourlyPrices.get(hour);
            
            if (price >= highCostThreshold) {
                if (currentWindow == null) {
                    currentWindow = new TimeWindow(hour, hour + 1, price);
                } else {
                    currentWindow.endHour = hour + 1;
                    currentWindow.avgPrice = (currentWindow.avgPrice + price) / 2;
                }
            } else {
                if (currentWindow != null) {
                    windows.add(currentWindow);
                    currentWindow = null;
                }
            }
        }
        
        if (currentWindow != null) {
            windows.add(currentWindow);
        }
        
        return windows;
    }

    /**
     * Get optimal time to run a high-power task
     */
    public TimeWindow getOptimalRunTime(int durationHours) {
        List<TimeWindow> lowCostWindows = getLowCostWindows();
        
        TimeWindow bestWindow = null;
        double bestPrice = Double.MAX_VALUE;
        
        for (TimeWindow window : lowCostWindows) {
            int windowDuration = window.endHour - window.startHour;
            if (windowDuration >= durationHours && window.avgPrice < bestPrice) {
                bestPrice = window.avgPrice;
                bestWindow = window;
            }
        }
        
        return bestWindow;
    }

    /**
     * Calculate potential savings from load shifting
     */
    public Map<String, Object> calculateLoadShiftingSavings(
            double wattage, int durationHours, int fromHour, int toHour) {
        
        LocalDate today = LocalDate.now();
        DayOfWeek dayOfWeek = today.getDayOfWeek();
        
        double fromPrice = getPriceForTime(LocalTime.of(fromHour, 0), dayOfWeek);
        double toPrice = getPriceForTime(LocalTime.of(toHour, 0), dayOfWeek);
        
        double kwh = wattage / 1000 * durationHours;
        double currentCost = kwh * fromPrice;
        double shiftedCost = kwh * toPrice;
        double savings = currentCost - shiftedCost;
        
        Map<String, Object> result = new HashMap<>();
        result.put("current_cost", Math.round(currentCost * 100) / 100.0);
        result.put("shifted_cost", Math.round(shiftedCost * 100) / 100.0);
        result.put("savings", Math.round(savings * 100) / 100.0);
        result.put("savings_pct", fromPrice > 0 ? Math.round(savings / currentCost * 10000) / 100.0 : 0);
        result.put("currency", currency);
        
        return result;
    }

    /**
     * Get pricing summary and recommendations
     */
    public Map<String, Object> getPricingSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        summary.put("current_price_per_kwh", Math.round(getCurrentPricePerKwh() * 1000) / 1000.0);
        summary.put("base_price_per_kwh", basePricePerKwh);
        summary.put("currency", currency);
        summary.put("peak_price", timeOfUsePrices.get(TimePeriod.PEAK));
        summary.put("mid_peak_price", timeOfUsePrices.get(TimePeriod.MID_PEAK));
        summary.put("off_peak_price", timeOfUsePrices.get(TimePeriod.OFF_PEAK));
        
        List<TimeWindow> lowCostWindows = getLowCostWindows();
        List<TimeWindow> highCostWindows = getHighCostWindows();
        
        summary.put("low_cost_windows", lowCostWindows);
        summary.put("high_cost_windows", highCostWindows);
        
        if (!lowCostWindows.isEmpty()) {
            TimeWindow bestWindow = lowCostWindows.get(0);
            summary.put("best_time_to_consume", 
                String.format("%02d:00 - %02d:00", bestWindow.startHour, bestWindow.endHour));
        }
        
        return summary;
    }

    /**
     * Get carbon intensity estimate (kg CO2 per kWh)
     * Higher during peak hours when dirtier plants are used
     */
    public double getCarbonIntensity() {
        TimePeriod currentPeriod = getTimePeriod(LocalTime.now(), LocalDate.now().getDayOfWeek());
        
        switch (currentPeriod) {
            case PEAK:
                return 0.5; // Higher carbon intensity during peak
            case MID_PEAK:
                return 0.4;
            case OFF_PEAK:
                return 0.3; // Lower carbon intensity off-peak
            default:
                return 0.4;
        }
    }

    /**
     * Calculate carbon footprint for consumption
     */
    public double calculateCarbonFootprint(double kwh) {
        return kwh * getCarbonIntensity();
    }

    // Inner class for time windows
    public static class TimeWindow {
        public int startHour;
        public int endHour;
        public double avgPrice;

        public TimeWindow(int startHour, int endHour, double avgPrice) {
            this.startHour = startHour;
            this.endHour = endHour;
            this.avgPrice = avgPrice;
        }

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("start_hour", startHour);
            map.put("end_hour", endHour);
            map.put("avg_price", avgPrice);
            map.put("time_range", String.format("%02d:00 - %02d:00", startHour, endHour));
            return map;
        }

        @Override
        public String toString() {
            return String.format("%02d:00 - %02d:00 @ $%.3f/kWh", startHour, endHour, avgPrice);
        }
    }
}
