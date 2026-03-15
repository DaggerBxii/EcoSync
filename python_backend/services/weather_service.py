"""
Weather Service - OpenWeatherMap API integration for HVAC modeling
"""
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import httpx
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings


@dataclass
class WeatherData:
    """Weather data model"""
    temperature: float = 20.0
    feels_like: float = 20.0
    humidity: int = 50
    pressure: float = 1013.0
    condition: str = "Clear"
    description: str = "clear sky"
    wind_speed: float = 0.0
    city_name: str = "Unknown"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "temperature_c": round(self.temperature, 1),
            "feels_like_c": round(self.feels_like, 1),
            "humidity_pct": self.humidity,
            "pressure": self.pressure,
            "condition": self.condition,
            "description": self.description,
            "wind_speed": self.wind_speed,
            "city_name": self.city_name
        }


class WeatherService:
    """
    Weather Service for OpenWeatherMap API integration.
    Provides weather data for HVAC impact modeling.
    """
    
    def __init__(self):
        self.api_key = settings.OPENWEATHERMAP_API_KEY
        self.city_id = settings.OPENWEATHERMAP_CITY_ID
        
        # Cached weather data
        self.cached_weather: Optional[WeatherData] = None
        self.last_fetch_time = 0
        self.cache_duration_ms = 10 * 60 * 1000  # 10 minutes
    
    def get_current_weather(self) -> WeatherData:
        """Get current weather data (with caching)"""
        now = datetime.now().timestamp() * 1000
        
        # Return cached data if still valid
        if self.cached_weather and (now - self.last_fetch_time) < self.cache_duration_ms:
            return self.cached_weather
        
        # Fetch fresh data
        try:
            fresh_weather = self._fetch_weather_from_api()
            if fresh_weather:
                self.cached_weather = fresh_weather
                self.last_fetch_time = now
        except Exception as e:
            print(f"Failed to fetch weather: {e}")
        
        return self.cached_weather or self._get_simulated_weather()
    
    def _fetch_weather_from_api(self) -> Optional[WeatherData]:
        """Fetch weather from OpenWeatherMap API"""
        if not self.api_key or self.api_key == "demo":
            return self._get_simulated_weather()
        
        try:
            uri = (
                f"https://api.openweathermap.org/data/2.5/weather"
                f"?id={self.city_id}&appid={self.api_key}&units=metric"
            )
            
            with httpx.Client(timeout=5.0) as client:
                response = client.get(uri)
                response.raise_for_status()
                data = response.json()
            
            main = data.get("main", {})
            weather = data.get("weather", [{}])[0]
            wind = data.get("wind", {})
            
            return WeatherData(
                temperature=main.get("temp", 20.0),
                feels_like=main.get("feels_like", 20.0),
                humidity=main.get("humidity", 50),
                pressure=main.get("pressure", 1013.0),
                condition=weather.get("main", "Clear"),
                description=weather.get("description", "clear sky"),
                wind_speed=wind.get("speed", 0.0),
                city_name=data.get("name", "Unknown")
            )
        except Exception as e:
            print(f"Weather API error: {e}")
            return self._get_simulated_weather()
    
    def _get_simulated_weather(self) -> WeatherData:
        """Get simulated weather data (for demo/development)"""
        now = datetime.now()
        hour = now.hour
        month = now.month
        
        # Base temperature by month (simplified seasonal model)
        import math
        base_temp = 15 + 10 * math.sin((month - 3) * math.pi / 6)
        
        # Adjust by hour
        if 12 <= hour <= 15:
            hour_adjustment = 3
        elif 0 <= hour <= 6:
            hour_adjustment = -3
        else:
            hour_adjustment = 0
        
        temp = base_temp + hour_adjustment + (hash(str(now.date())) % 4 - 2)
        
        import random
        random.seed(now.date().toordinal())
        
        return WeatherData(
            temperature=temp,
            feels_like=temp - 1,
            humidity=50 + random.randint(0, 20),
            condition=random.choice(["Clear", "Clouds", "Rain"]),
            description="simulated weather",
            wind_speed=random.uniform(0, 10),
            city_name="Simulated City"
        )
    
    def estimate_hvac_impact(self, external_temp: float) -> float:
        """
        Estimate HVAC impact based on external temperature.
        Returns multiplier for expected power consumption.
        """
        comfort_temp = 22.0
        deviation = abs(external_temp - comfort_temp)
        
        base_load = 1.0
        deviation_factor = 0.1  # 10% more power per degree
        
        return base_load + (deviation * deviation_factor)
    
    def get_temperature_adjusted_baseline(self, base_baseline: float, external_temp: float) -> float:
        """Get temperature-adjusted baseline"""
        hvac_impact = self.estimate_hvac_impact(external_temp)
        return base_baseline * hvac_impact
    
    def get_weather_recommendations(self) -> Dict[str, Any]:
        """Get weather-based recommendations"""
        weather = self.get_current_weather()
        
        tips: List[str] = []
        
        # Temperature-based tips
        if weather.temperature > 30:
            tips.append("🌡️ High temperature expected. Pre-cool building before peak hours.")
            tips.append("Consider setting thermostats to 24°C for optimal efficiency.")
        elif weather.temperature < 5:
            tips.append("❄️ Cold weather expected. Ensure heating systems are optimized.")
            tips.append("Check for drafts and seal windows/doors to reduce heat loss.")
        elif weather.temperature > 25:
            tips.append("☀️ Warm weather. Use natural ventilation during cooler morning/evening hours.")
        
        # Humidity-based tips
        if weather.humidity > 70:
            tips.append("💧 High humidity. Dehumidifiers may increase power consumption.")
        elif weather.humidity < 30:
            tips.append("🏜️ Low humidity. Consider humidification for comfort.")
        
        # Weather condition tips
        if weather.condition in ["Rain", "Drizzle"]:
            tips.append("🌧️ Rainy weather. Ensure outdoor equipment is protected.")
        elif weather.condition == "Snow":
            tips.append("❄️ Snow expected. Check heating systems and insulation.")
        
        return {
            "current_temp_c": round(weather.temperature, 1),
            "humidity_pct": weather.humidity,
            "condition": weather.condition,
            "tips": tips,
            "hvac_impact_multiplier": round(self.estimate_hvac_impact(weather.temperature), 2)
        }
    
    def get_external_temperature(self) -> Optional[float]:
        """Get external temperature for AI engine"""
        weather = self.get_current_weather()
        return weather.temperature
    
    def is_extreme_weather(self) -> bool:
        """Check if weather conditions are extreme"""
        weather = self.get_current_weather()
        return weather.temperature > 35 or weather.temperature < -5
    
    def get_weather_summary(self) -> Dict[str, Any]:
        """Get weather forecast summary"""
        weather = self.get_current_weather()
        
        return {
            "temperature_c": round(weather.temperature, 1),
            "feels_like_c": round(weather.feels_like, 1),
            "humidity_pct": weather.humidity,
            "condition": weather.condition,
            "description": weather.description,
            "wind_speed": weather.wind_speed,
            "extreme_weather": self.is_extreme_weather(),
            "hvac_impact": round(self.estimate_hvac_impact(weather.temperature), 2)
        }
