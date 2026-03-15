package com.ecosync.service;

import com.ecosync.model.WeatherData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import javax.annotation.PostConstruct;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Weather Service for OpenWeatherMap API integration
 * Provides weather data for HVAC impact modeling
 */
@Service
public class WeatherService {

    @Value("${openweathermap.api.key:demo}")
    private String apiKey;

    @Value("${openweathermap.city.id:5128581}")
    private String cityId;

    private final WebClient webClient;

    // Cached weather data
    private WeatherData cachedWeather;
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

    public WeatherService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @PostConstruct
    public void init() {
        // Initialize with default weather
        cachedWeather = new WeatherData();
    }

    /**
     * Get current weather data (with caching)
     */
    public WeatherData getCurrentWeather() {
        long now = System.currentTimeMillis();
        
        // Return cached data if still valid
        if (cachedWeather != null && (now - lastFetchTime) < CACHE_DURATION_MS) {
            return cachedWeather;
        }
        
        // Fetch fresh data
        try {
            WeatherData freshWeather = fetchWeatherFromApi();
            if (freshWeather != null) {
                cachedWeather = freshWeather;
                lastFetchTime = now;
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch weather: " + e.getMessage());
            // Return cached data even if stale
        }
        
        return cachedWeather;
    }

    /**
     * Fetch weather from OpenWeatherMap API
     */
    private WeatherData fetchWeatherFromApi() {
        if ("demo".equals(apiKey) || apiKey == null || apiKey.isEmpty()) {
            // Return simulated weather data for demo
            return getSimulatedWeather();
        }

        try {
            String uri = String.format(
                "https://api.openweathermap.org/data/2.5/weather?id=%s&appid=%s&units=metric",
                cityId, apiKey
            );

            WeatherData weather = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(WeatherData.class)
                .block(Duration.ofSeconds(5));

            return weather;
        } catch (Exception e) {
            System.err.println("Weather API error: " + e.getMessage());
            return getSimulatedWeather();
        }
    }

    /**
     * Get simulated weather data (for demo/development)
     */
    private WeatherData getSimulatedWeather() {
        WeatherData weather = new WeatherData();
        
        // Simulate based on time of day and season
        int hour = java.time.LocalDateTime.now().getHour();
        int month = java.time.LocalDateTime.now().getMonthValue();
        
        // Base temperature by month (simplified seasonal model)
        double baseTemp = 15 + 10 * Math.sin((month - 3) * Math.PI / 6);
        
        // Adjust by hour
        double hourAdjustment = 0;
        if (hour >= 12 && hour <= 15) {
            hourAdjustment = 3;
        } else if (hour >= 0 && hour <= 6) {
            hourAdjustment = -3;
        }
        
        double temp = baseTemp + hourAdjustment + (Math.random() * 4 - 2);
        
        WeatherData.Main main = new WeatherData.Main();
        main.setTemp(temp);
        main.setFeelsLike(temp - 1);
        main.setHumidity(50 + (int)(Math.random() * 20));
        main.setPressure(1013);
        
        weather.setMain(main);
        weather.setName("Simulated City");
        
        return weather;
    }

    /**
     * Estimate HVAC impact based on external temperature
     * Returns multiplier for expected power consumption
     */
    public double estimateHvacImpact(double externalTemp) {
        // Comfort zone: 20-24°C
        double comfortTemp = 22.0;
        double deviation = Math.abs(externalTemp - comfortTemp);
        
        // Base HVAC load + additional load per degree of deviation
        double baseLoad = 1.0;
        double deviationFactor = 0.1; // 10% more power per degree
        
        return baseLoad + (deviation * deviationFactor);
    }

    /**
     * Get temperature-adjusted baseline
     */
    public double getTemperatureAdjustedBaseline(double baseBaseline, double externalTemp) {
        double hvacImpact = estimateHvacImpact(externalTemp);
        return baseBaseline * hvacImpact;
    }

    /**
     * Get weather-based recommendations
     */
    public Map<String, Object> getWeatherRecommendations() {
        WeatherData weather = getCurrentWeather();
        Map<String, Object> recommendations = new HashMap<>();
        
        double temp = weather.getTemperature();
        int humidity = weather.getHumidity();
        String condition = weather.getCondition();
        
        recommendations.put("current_temp_c", Math.round(temp * 10) / 10.0);
        recommendations.put("humidity_pct", humidity);
        recommendations.put("condition", condition);
        
        List<String> tips = new ArrayList<>();
        
        // Temperature-based tips
        if (temp > 30) {
            tips.add("🌡️ High temperature expected. Pre-cool building before peak hours.");
            tips.add("Consider setting thermostats to 24°C for optimal efficiency.");
        } else if (temp < 5) {
            tips.add("❄️ Cold weather expected. Ensure heating systems are optimized.");
            tips.add("Check for drafts and seal windows/doors to reduce heat loss.");
        } else if (temp > 25) {
            tips.add("☀️ Warm weather. Use natural ventilation during cooler morning/evening hours.");
        }
        
        // Humidity-based tips
        if (humidity > 70) {
            tips.add("💧 High humidity. Dehumidifiers may increase power consumption.");
        } else if (humidity < 30) {
            tips.add("🏜️ Low humidity. Consider humidification for comfort.");
        }
        
        // General tips
        if ("Rain".equalsIgnoreCase(condition) || "Drizzle".equalsIgnoreCase(condition)) {
            tips.add("🌧️ Rainy weather. Ensure outdoor equipment is protected.");
        }
        
        if ("Snow".equalsIgnoreCase(condition)) {
            tips.add("❄️ Snow expected. Check heating systems and insulation.");
        }
        
        recommendations.put("tips", tips);
        recommendations.put("hvac_impact_multiplier", Math.round(estimateHvacImpact(temp) * 100) / 100.0);
        
        return recommendations;
    }

    /**
     * Get external temperature for AI engine
     */
    public Double getExternalTemperature() {
        WeatherData weather = getCurrentWeather();
        return weather.getTemperature();
    }

    /**
     * Check if weather conditions are extreme
     */
    public boolean isExtremeWeather() {
        WeatherData weather = getCurrentWeather();
        double temp = weather.getTemperature();
        
        return temp > 35 || temp < -5;
    }

    /**
     * Get weather forecast summary
     */
    public Map<String, Object> getWeatherSummary() {
        WeatherData weather = getCurrentWeather();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("temperature_c", Math.round(weather.getTemperature() * 10) / 10.0);
        summary.put("feels_like_c", Math.round(weather.getMain().getFeelsLike() * 10) / 10.0);
        summary.put("humidity_pct", weather.getHumidity());
        summary.put("condition", weather.getCondition());
        summary.put("description", weather.getDescription());
        summary.put("wind_speed", weather.getWindSpeed());
        summary.put("extreme_weather", isExtremeWeather());
        summary.put("hvac_impact", Math.round(estimateHvacImpact(weather.getTemperature()) * 100) / 100.0);
        
        return summary;
    }
}
