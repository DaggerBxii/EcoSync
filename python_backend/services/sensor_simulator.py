"""
Sensor Simulator - Generates simulated sensor data for testing
"""
import random
from datetime import datetime
from typing import Dict, Any


class SensorSimulator:
    """Generates simulated sensor data for testing and development"""
    
    def __init__(self):
        self.random = random.Random()
    
    def generate_data(self) -> Dict[str, Any]:
        """Generate simulated sensor data"""
        now = datetime.now()
        hour = now.hour
        
        # Base occupancy by hour (business hours vs off hours)
        if 9 <= hour <= 17:
            base_occ = 50  # Business hours
        else:
            base_occ = 5   # Off hours
        
        occupancy_count = base_occ + self.random.randint(0, 10)
        
        # Base wattage by occupancy
        base_wattage = 300 + (occupancy_count * 5)
        current_wattage = base_wattage + (self.random.random() * 200)
        
        # External temperature (simulated)
        external_temp = 20 + (self.random.random() * 5)
        
        return {
            "occupancy_count": occupancy_count,
            "current_wattage": round(current_wattage, 2),
            "external_temp": round(external_temp, 2),
            "timestamp": now.isoformat()
        }
    
    def generate_anomaly(self) -> Dict[str, Any]:
        """Generate anomalous sensor data for testing"""
        data = self.generate_data()
        # Spike wattage to trigger anomaly
        data["current_wattage"] = data["current_wattage"] * 3
        return data
    
    def generate_inefficient(self) -> Dict[str, Any]:
        """Generate inefficient operation data for testing"""
        data = self.generate_data()
        # High wattage for low occupancy
        data["occupancy_count"] = 5
        data["current_wattage"] = 1000
        return data
