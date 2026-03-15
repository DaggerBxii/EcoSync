"""
Pricing Service - Utility pricing and cost optimization
"""
from datetime import datetime, time, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings


class TimePeriod(Enum):
    PEAK = "peak"
    MID_PEAK = "mid_peak"
    OFF_PEAK = "off_peak"


@dataclass
class TimeWindow:
    start_hour: int
    end_hour: int
    avg_price: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "start_hour": self.start_hour,
            "end_hour": self.end_hour,
            "avg_price": round(self.avg_price, 4),
            "time_range": f"{self.start_hour:02d}:00 - {self.end_hour:02d}:00"
        }


class PricingService:
    """
    Utility Pricing Service for electricity cost optimization.
    Supports time-of-use pricing and real-time pricing integration.
    """
    
    def __init__(self):
        self.base_price_per_kwh = settings.UTILITY_PRICE_PER_KWH
        self.currency = settings.UTILITY_CURRENCY
        
        # Time-of-use pricing tiers
        self.time_of_use_prices = {
            TimePeriod.PEAK: self.base_price_per_kwh * 1.5,      # $0.18
            TimePeriod.MID_PEAK: self.base_price_per_kwh * 1.2,  # $0.144
            TimePeriod.OFF_PEAK: self.base_price_per_kwh * 0.7   # $0.084
        }
    
    def get_current_price_per_kwh(self) -> float:
        """Get current price per kWh based on time-of-use"""
        now = datetime.now()
        return self.get_price_for_time(now.time(), now.weekday())
    
    def get_price_for_time(self, t: time, day_of_week: int) -> float:
        """Get price for a specific time"""
        period = self._get_time_period(t, day_of_week)
        return self.time_of_use_prices[period]
    
    def _get_time_period(self, t: time, day_of_week: int) -> TimePeriod:
        """Determine time period based on time and day"""
        is_weekend = day_of_week >= 5  # Saturday=5, Sunday=6
        
        if is_weekend:
            if t.hour < 6 or t.hour >= 22:
                return TimePeriod.OFF_PEAK
            return TimePeriod.MID_PEAK
        
        # Weekday pricing
        if t.hour < 6 or t.hour >= 21:
            return TimePeriod.OFF_PEAK
        
        if t.hour < 10 or t.hour >= 17:
            return TimePeriod.MID_PEAK
        
        return TimePeriod.PEAK
    
    def calculate_running_cost(self, wattage: float, duration_hours: float) -> float:
        """Calculate cost of current consumption"""
        kwh = wattage / 1000 * duration_hours
        return kwh * self.get_current_price_per_kwh()
    
    def calculate_daily_cost(self, average_wattage: float) -> float:
        """Calculate daily cost estimate"""
        total_cost = 0
        
        for hour in range(24):
            price = self.get_price_for_time(time(hour, 0), datetime.now().weekday())
            hourly_kwh = average_wattage / 1000
            total_cost += hourly_kwh * price
        
        return total_cost
    
    def calculate_monthly_cost(self, average_daily_cost: float) -> float:
        """Calculate monthly cost estimate"""
        days_in_month = datetime.now().replace(day=28) + timedelta(days=4)
        days_in_month = (days_in_month - timedelta(days=days_in_month.day)).day
        return average_daily_cost * days_in_month
    
    def get_hourly_prices_for_today(self) -> Dict[int, float]:
        """Get hourly prices for today"""
        today = datetime.now().weekday()
        return {
            hour: self.get_price_for_time(time(hour, 0), today)
            for hour in range(24)
        }
    
    def get_low_cost_windows(self) -> List[TimeWindow]:
        """Get low-cost time windows for scheduling"""
        hourly_prices = self.get_hourly_prices_for_today()
        avg_price = sum(hourly_prices.values()) / len(hourly_prices)
        low_cost_threshold = avg_price * 0.9
        
        windows = []
        current_window: Optional[TimeWindow] = None
        
        for hour in range(24):
            price = hourly_prices[hour]
            
            if price <= low_cost_threshold:
                if current_window is None:
                    current_window = TimeWindow(hour, hour + 1, price)
                else:
                    current_window = TimeWindow(
                        current_window.start_hour,
                        hour + 1,
                        (current_window.avg_price + price) / 2
                    )
            else:
                if current_window:
                    windows.append(current_window)
                    current_window = None
        
        if current_window:
            windows.append(current_window)
        
        return windows
    
    def get_high_cost_windows(self) -> List[TimeWindow]:
        """Get high-cost time windows to avoid"""
        hourly_prices = self.get_hourly_prices_for_today()
        avg_price = sum(hourly_prices.values()) / len(hourly_prices)
        high_cost_threshold = avg_price * 1.1
        
        windows = []
        current_window: Optional[TimeWindow] = None
        
        for hour in range(24):
            price = hourly_prices[hour]
            
            if price >= high_cost_threshold:
                if current_window is None:
                    current_window = TimeWindow(hour, hour + 1, price)
                else:
                    current_window = TimeWindow(
                        current_window.start_hour,
                        hour + 1,
                        (current_window.avg_price + price) / 2
                    )
            else:
                if current_window:
                    windows.append(current_window)
                    current_window = None
        
        if current_window:
            windows.append(current_window)
        
        return windows
    
    def get_optimal_run_time(self, duration_hours: int) -> Optional[TimeWindow]:
        """Get optimal time to run a high-power task"""
        low_cost_windows = self.get_low_cost_windows()
        
        best_window = None
        best_price = float('inf')
        
        for window in low_cost_windows:
            window_duration = window.end_hour - window.start_hour
            if window_duration >= duration_hours and window.avg_price < best_price:
                best_price = window.avg_price
                best_window = window
        
        return best_window
    
    def calculate_load_shifting_savings(
        self,
        wattage: float,
        duration_hours: int,
        from_hour: int,
        to_hour: int
    ) -> Dict[str, Any]:
        """Calculate potential savings from load shifting"""
        today = datetime.now().weekday()
        
        from_price = self.get_price_for_time(time(from_hour, 0), today)
        to_price = self.get_price_for_time(time(to_hour, 0), today)
        
        kwh = wattage / 1000 * duration_hours
        current_cost = kwh * from_price
        shifted_cost = kwh * to_price
        savings = current_cost - shifted_cost
        
        return {
            "current_cost": round(current_cost, 2),
            "shifted_cost": round(shifted_cost, 2),
            "savings": round(savings, 2),
            "savings_pct": round((savings / current_cost * 100) if current_cost > 0 else 0, 2),
            "currency": self.currency
        }
    
    def get_pricing_summary(self) -> Dict[str, Any]:
        """Get pricing summary and recommendations"""
        low_cost_windows = self.get_low_cost_windows()
        high_cost_windows = self.get_high_cost_windows()
        
        summary = {
            "current_price_per_kwh": round(self.get_current_price_per_kwh(), 4),
            "base_price_per_kwh": self.base_price_per_kwh,
            "currency": self.currency,
            "peak_price": self.time_of_use_prices[TimePeriod.PEAK],
            "mid_peak_price": self.time_of_use_prices[TimePeriod.MID_PEAK],
            "off_peak_price": self.time_of_use_prices[TimePeriod.OFF_PEAK],
            "low_cost_windows": [w.to_dict() for w in low_cost_windows],
            "high_cost_windows": [w.to_dict() for w in high_cost_windows]
        }
        
        if low_cost_windows:
            best_window = low_cost_windows[0]
            summary["best_time_to_consume"] = f"{best_window.start_hour:02d}:00 - {best_window.end_hour:02d}:00"
        
        return summary
    
    def get_carbon_intensity(self) -> float:
        """
        Get carbon intensity estimate (kg CO2 per kWh).
        Higher during peak hours when dirtier plants are used.
        """
        now = datetime.now()
        period = self._get_time_period(now.time(), now.weekday())
        
        carbon_rates = {
            TimePeriod.PEAK: 0.5,
            TimePeriod.MID_PEAK: 0.4,
            TimePeriod.OFF_PEAK: 0.3
        }
        
        return carbon_rates[period]
    
    def calculate_carbon_footprint(self, kwh: float) -> float:
        """Calculate carbon footprint for consumption"""
        return kwh * self.get_carbon_intensity()
