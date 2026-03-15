"""
Tests for EcoSync Python Backend
"""
import pytest
import asyncio
from datetime import datetime, time, timedelta
from unittest.mock import AsyncMock, patch

# Import services
from services.ai_engine_service import AiEngineService
from services.pricing_service import PricingService, TimePeriod
from services.weather_service import WeatherService
from services.optimization_engine_service import OptimizationEngineService, State, Action
from services.predictive_analytics_service import PredictiveAnalyticsService


class TestAiEngineService:
    """Tests for AI Engine Service"""
    
    @pytest.mark.asyncio
    async def test_process_cycle_normal(self):
        """Test normal operation processing"""
        service = AiEngineService()
        
        # Mock database save
        with patch.object(service, '_save_sensor_reading', new=AsyncMock()):
            result = await service.process_cycle(50, 500.0)
        
        assert result["system_status"] == "Optimized"
        assert result["integrity_alert"] == False
        assert "metrics" in result
        assert result["metrics"]["occupancy"] == 50
    
    @pytest.mark.asyncio
    async def test_process_cycle_anomaly(self):
        """Test anomaly detection"""
        service = AiEngineService()
        
        # Establish baseline
        with patch.object(service, '_save_sensor_reading', new=AsyncMock()):
            for _ in range(10):
                await service.process_cycle(50, 500.0)
            
            # Sudden spike
            result = await service.process_cycle(50, 1500.0)
        
        assert result["integrity_alert"] == True
        assert result["system_status"] == "Critical Alert"
    
    @pytest.mark.asyncio
    async def test_process_cycle_vampire_load(self):
        """Test vampire load penalty"""
        service = AiEngineService()
        
        with patch.object(service, '_save_sensor_reading', new=AsyncMock()):
            result = await service.process_cycle(0, 200.0)
        
        assert result["metrics"]["efficiency_score"] == 0


class TestPricingService:
    """Tests for Pricing Service"""
    
    def test_get_current_price(self):
        """Test current price retrieval"""
        service = PricingService()
        price = service.get_current_price_per_kwh()
        
        assert price > 0
        assert price < 1  # Reasonable range
    
    def test_get_price_for_time_peak(self):
        """Test peak hour pricing"""
        service = PricingService()
        price = service.get_price_for_time(time(14, 0), 0)  # Monday 2 PM
        
        assert price == service.time_of_use_prices[TimePeriod.PEAK]
    
    def test_get_price_for_time_off_peak(self):
        """Test off-peak pricing"""
        service = PricingService()
        price = service.get_price_for_time(time(3, 0), 0)  # 3 AM
        
        assert price == service.time_of_use_prices[TimePeriod.OFF_PEAK]
    
    def test_calculate_running_cost(self):
        """Test cost calculation"""
        service = PricingService()
        cost = service.calculate_running_cost(1000.0, 2.0)  # 1kW for 2 hours
        
        assert cost > 0
    
    def test_get_hourly_prices(self):
        """Test hourly prices"""
        service = PricingService()
        prices = service.get_hourly_prices_for_today()
        
        assert len(prices) == 24
        assert all(p > 0 for p in prices.values())


class TestWeatherService:
    """Tests for Weather Service"""
    
    def test_get_current_weather(self):
        """Test weather retrieval"""
        service = WeatherService()
        weather = service.get_current_weather()
        
        assert weather.temperature is not None
        assert -50 < weather.temperature < 60  # Reasonable range
    
    def test_estimate_hvac_impact_comfort(self):
        """Test HVAC impact in comfort zone"""
        service = WeatherService()
        impact = service.estimate_hvac_impact(22.0)
        
        assert impact == 1.0
    
    def test_estimate_hvac_impact_hot(self):
        """Test HVAC impact in hot weather"""
        service = WeatherService()
        impact = service.estimate_hvac_impact(35.0)
        
        assert impact > 1.0
    
    def test_get_weather_summary(self):
        """Test weather summary"""
        service = WeatherService()
        summary = service.get_weather_summary()
        
        assert "temperature_c" in summary
        assert "hvac_impact" in summary


class TestOptimizationEngineService:
    """Tests for Optimization Engine (Q-Learning)"""
    
    def test_initialization(self):
        """Test Q-table initialization"""
        service = OptimizationEngineService()
        
        assert len(service.q_table) > 0
        stats = service.get_training_stats()
        assert stats["total_states"] > 0
    
    def test_decide_action(self):
        """Test action decision"""
        service = OptimizationEngineService()
        state = State(1, 1, 1, 0)
        action = service.decide_action(state)
        
        assert action in Action
    
    def test_create_state(self):
        """Test state creation from readings"""
        service = OptimizationEngineService()
        state = service.create_state_from_readings(50, 500.0, 450.0, time(14, 0))
        
        assert isinstance(state, State)
    
    def test_calculate_reward(self):
        """Test reward calculation"""
        service = OptimizationEngineService()
        reward = service.calculate_reward(0.5, 0.1, False, 0.06)
        
        assert reward > 0
    
    def test_calculate_reward_anomaly(self):
        """Test reward with anomaly prevention"""
        service = OptimizationEngineService()
        reward = service.calculate_reward(0.5, 0.1, True, 0.06)
        
        assert reward > 50  # Anomaly bonus
    
    def test_get_recommendation(self):
        """Test optimization recommendation"""
        service = OptimizationEngineService()
        rec = service.get_recommendation(50, 600.0, 500.0)
        
        assert "recommended_action" in rec
        assert "scale_multiplier" in rec
        assert "q_values" in rec


class TestPredictiveAnalyticsService:
    """Tests for Predictive Analytics Service"""
    
    def test_initialization(self):
        """Test service initialization"""
        service = PredictiveAnalyticsService()
        
        assert service.model_trained == False
        assert len(service.hourly_power_means) == 24
    
    def test_forecast_power_demand(self):
        """Test power forecasting"""
        service = PredictiveAnalyticsService()
        forecast = service.forecast_power_demand(24)
        
        assert len(forecast) == 24
        assert all(f >= 0 for f in forecast)
    
    def test_predict_occupancy(self):
        """Test occupancy prediction"""
        service = PredictiveAnalyticsService()
        
        # Business hours
        occ = service.predict_occupancy(datetime(2024, 1, 15, 14, 0))
        assert occ == 50  # Default business hours
        
        # Off hours
        occ = service.predict_occupancy(datetime(2024, 1, 15, 3, 0))
        assert occ == 5  # Default off hours
    
    def test_get_peak_demand_forecast(self):
        """Test peak demand forecast"""
        service = PredictiveAnalyticsService()
        forecast = service.get_peak_demand_forecast()
        
        assert "hourly_forecast" in forecast
        assert "peak_demand_watts" in forecast
        assert "peak_hour" in forecast
    
    def test_get_recommendations(self):
        """Test recommendations"""
        service = PredictiveAnalyticsService()
        recs = service.get_recommendations()
        
        assert isinstance(recs, list)


class TestSensorSimulator:
    """Tests for Sensor Simulator"""
    
    def test_generate_data(self):
        """Test data generation"""
        from services.sensor_simulator import SensorSimulator
        
        simulator = SensorSimulator()
        data = simulator.generate_data()
        
        assert "occupancy_count" in data
        assert "current_wattage" in data
        assert data["occupancy_count"] >= 0
        assert data["current_wattage"] > 0
    
    def test_generate_anomaly(self):
        """Test anomaly generation"""
        from services.sensor_simulator import SensorSimulator
        
        simulator = SensorSimulator()
        data = simulator.generate_anomaly()
        
        # Anomaly should have high wattage
        assert data["current_wattage"] > 1000


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
