"""
Predictive Analytics Service - Time-series forecasting using ML
"""
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.training_data_service import TrainingDataService


class PredictiveAnalyticsService:
    """
    Predictive Analytics Service using ML for time-series forecasting.
    Implements mean-based forecasting and occupancy prediction.
    """
    
    def __init__(self):
        self.training_data_service = TrainingDataService()
        
        # Model state
        self.model_trained = False
        self.hourly_power_means: Dict[int, float] = {}
        self.hourly_power_std_devs: Dict[int, float] = {}
        self.hourly_occupancy_means: Dict[int, float] = {}
        self.hourly_occupancy_std_devs: Dict[int, float] = {}
        
        # ARIMA-like model parameters (simplified)
        self.ar_coefficients = [0.5, 0.3]
        self.ma_coefficients = [0.2]
        self.constant_term = 300.0
        
        # Historical data for prediction
        self.recent_power_history: List[float] = []
        self.recent_occupancy_history: List[int] = []
        
        # Initialize default values
        for i in range(24):
            self.hourly_power_means[i] = 300.0
            self.hourly_power_std_devs[i] = 50.0
            self.hourly_occupancy_means[i] = 25.0
            self.hourly_occupancy_std_devs[i] = 10.0
    
    async def train_models(self):
        """Train the prediction models using historical data"""
        print("Training predictive models...")
        
        training_data = await self.training_data_service.get_last_n_days_of_data(30)
        
        if not training_data:
            print("Insufficient data for training. Need at least some historical readings.")
            return
        
        # Group data by hour
        power_by_hour: Dict[int, List[float]] = {i: [] for i in range(24)}
        occupancy_by_hour: Dict[int, List[int]] = {i: [] for i in range(24)}
        
        for reading in training_data:
            hour = reading.timestamp.hour
            power_by_hour[hour].append(reading.current_wattage)
            occupancy_by_hour[hour].append(reading.occupancy_count)
        
        # Calculate mean and std dev for each hour
        for i in range(24):
            power_data = power_by_hour[i]
            occupancy_data = occupancy_by_hour[i]
            
            if power_data:
                mean = sum(power_data) / len(power_data)
                std_dev = self._calculate_std_dev(power_data, mean)
                self.hourly_power_means[i] = mean
                self.hourly_power_std_devs[i] = std_dev
            
            if occupancy_data:
                mean = sum(occupancy_data) / len(occupancy_data)
                std_dev = self._calculate_std_dev_double(occupancy_data, mean)
                self.hourly_occupancy_means[i] = mean
                self.hourly_occupancy_std_devs[i] = std_dev
        
        # Calculate constant term from overall mean
        all_power = [r.current_wattage for r in training_data]
        self.constant_term = sum(all_power) / len(all_power) if all_power else 300.0
        
        self.model_trained = True
        print(f"Predictive models trained successfully with {len(training_data)} samples")
    
    def forecast_power_demand(self, hours_ahead: int) -> List[float]:
        """Forecast power demand for the next N hours"""
        if not self.model_trained:
            asyncio.create_task(self.train_models())
        
        forecast = []
        now = datetime.now()
        recent_values = self._get_recent_power_values(10)
        
        for i in range(hours_ahead):
            future_time = now + timedelta(hours=i + 1)
            hour = future_time.hour
            
            # Get mean-based prediction
            distribution_prediction = self.hourly_power_means.get(hour, 300.0)
            
            # AR component: weighted sum of recent values
            ar_prediction = 0
            for j in range(min(len(self.ar_coefficients), len(recent_values))):
                ar_prediction += self.ar_coefficients[j] * recent_values[-(j + 1)]
            
            # Combine predictions
            forecast_value = (distribution_prediction * 0.7 + ar_prediction * 0.3)
            forecast.append(forecast_value)
            
            # Add to recent values for next iteration
            recent_values.append(forecast_value)
        
        return forecast
    
    def predict_occupancy(self, time: datetime) -> int:
        """Predict occupancy for a specific time"""
        if not self.model_trained:
            asyncio.create_task(self.train_models())
        
        hour = time.hour
        mean = self.hourly_occupancy_means.get(hour)
        
        if mean is not None:
            return int(round(mean))
        
        # Default based on business hours
        return 50 if 9 <= hour <= 17 else 5
    
    def forecast_occupancy(self, hours_ahead: int) -> List[int]:
        """Predict occupancy for next N hours"""
        now = datetime.now()
        return [self.predict_occupancy(now + timedelta(hours=i + 1)) for i in range(hours_ahead)]
    
    def get_model_accuracy(self) -> Dict[str, Any]:
        """Get predicted vs actual comparison for model accuracy"""
        if not self.model_trained:
            return {"trained": False}
        
        confidences = []
        for i in range(24):
            mean = self.hourly_power_means.get(i)
            std_dev = self.hourly_power_std_devs.get(i)
            if mean and std_dev:
                cv = std_dev / (mean if mean != 0 else 1)  # Coefficient of variation
                confidence = max(0, (1 - cv) * 100)
                confidences.append(confidence)
            else:
                confidences.append(50.0)
        
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        return {
            "trained": True,
            "model_type": "ARIMA-Mean Hybrid",
            "average_confidence_pct": round(avg_confidence, 2),
            "hourly_confidences": confidences
        }
    
    def get_peak_demand_forecast(self) -> Dict[str, Any]:
        """Get peak demand prediction for next 24 hours"""
        forecast = self.forecast_power_demand(24)
        
        max_demand = max(forecast) if forecast else 0
        peak_hour = forecast.index(max_demand) if forecast else 0
        total_demand = sum(forecast)
        
        return {
            "hourly_forecast": forecast,
            "peak_demand_watts": round(max_demand, 2),
            "peak_hour": peak_hour,
            "total_predicted_kwh": round(total_demand / 1000, 2),
            "average_demand_watts": round(total_demand / 24, 2)
        }
    
    def update_with_observation(self, hour: int, actual_power: float, actual_occupancy: int):
        """Update model with new observation (online learning)"""
        self.recent_power_history.append(actual_power)
        self.recent_occupancy_history.append(actual_occupancy)
        
        # Keep only last 100 observations
        if len(self.recent_power_history) > 100:
            self.recent_power_history.pop(0)
            self.recent_occupancy_history.pop(0)
        
        # Update mean incrementally using exponential moving average
        old_mean = self.hourly_power_means.get(hour, 300.0)
        alpha = 0.1  # Learning rate
        new_mean = alpha * actual_power + (1 - alpha) * old_mean
        self.hourly_power_means[hour] = new_mean
    
    def get_recommendations(self) -> List[str]:
        """Get recommended actions based on predictions"""
        recommendations = []
        peak_forecast = self.get_peak_demand_forecast()
        hourly_forecast = peak_forecast["hourly_forecast"]
        peak_hour = peak_forecast["peak_hour"]
        
        # Check for high demand periods
        if hourly_forecast[peak_hour] > 1000:
            recommendations.append(
                f"⚠️ High demand expected at hour {peak_hour}: {hourly_forecast[peak_hour]:.0f}W. "
                "Consider pre-cooling/pre-heating before peak."
            )
        
        # Check for low demand opportunities
        avg_demand = peak_forecast["average_demand_watts"]
        for i, demand in enumerate(hourly_forecast):
            if demand < avg_demand * 0.5:
                recommendations.append(
                    f"💡 Low demand period at hour {i} ({demand:.0f}W). "
                    "Good time for maintenance or high-power tasks."
                )
                break
        
        return recommendations
    
    def _get_recent_power_values(self, count: int) -> List[float]:
        """Get recent power values"""
        if len(self.recent_power_history) > count:
            return self.recent_power_history[-count:]
        return self.recent_power_history
    
    @staticmethod
    def _calculate_std_dev(data: List[float], mean: float) -> float:
        """Calculate standard deviation"""
        if len(data) <= 1:
            return 1.0
        variance = sum((x - mean) ** 2 for x in data) / (len(data) - 1)
        return variance ** 0.5
    
    @staticmethod
    def _calculate_std_dev_double(data: List[int], mean: float) -> float:
        """Calculate standard deviation for integer data"""
        if len(data) <= 1:
            return 1.0
        variance = sum((x - mean) ** 2 for x in data) / (len(data) - 1)
        return variance ** 0.5
