import random
from datetime import datetime
from typing import Dict, Any

class EcoBrain:
    """
    AI module that provides predictions and insights for the EcoSync system.
    This class will be called by the backend to get decisions/predictions.
    """
    
    def __init__(self):
        """
        Initialize the AI models here.
        In a real implementation, this would load trained models.
        """
        pass
    
    def get_decision(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data and return a decision/prediction following the Sync Contract.
        
        Args:
            input_data: Dictionary containing input data for the AI
            
        Returns:
            Dictionary with the structure defined in the Sync Contract
        """
        # This is a placeholder implementation
        # In the real implementation, this would call the actual ML models
        
        # Extract hour from input data if available, otherwise default to current hour
        hour_of_day = input_data.get('hour_of_day', datetime.now().hour)
        
        # Placeholder logic for prediction
        occupancy_prediction = self._predict_occupancy(hour_of_day)
        watts_prediction = self._predict_watts(occupancy_prediction)
        is_anomaly = self._check_anomaly(occupancy_prediction, watts_prediction)
        
        # Generate AI insight based on the data
        if occupancy_prediction == 0 and watts_prediction > 100:
            ai_insight = "Anomaly detected: High energy usage with zero occupancy."
        elif occupancy_prediction == 0:
            ai_insight = "Deep Eco-Mode: No human load detected."
        elif occupancy_prediction < 3:
            ai_insight = "Low occupancy period, reducing power consumption."
        else:
            ai_insight = "Normal operations with optimal energy distribution."
        
        # Calculate scale level based on occupancy (lower occupancy = lower scale)
        scale_level = max(0.1, min(1.0, occupancy_prediction / 10.0))
        
        # Return the Sync Contract structure
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "system_status": "Scaling Down" if scale_level < 0.5 else "Active",
            "scale_level": round(scale_level, 2),
            "metrics": {
                "watts": round(watts_prediction, 2),
                "occupancy": occupancy_prediction,
                "carbon_saved": round(random.uniform(0.1, 1.0), 2)
            },
            "ai_insight": ai_insight,
            "is_anomaly": is_anomaly
        }
    
    def _predict_occupancy(self, hour_of_day: int) -> int:
        """
        Placeholder for occupancy prediction model.
        In a real implementation, this would use a trained ML model.
        """
        # Simple logic: low occupancy during night hours (22-6), higher during day
        if 6 <= hour_of_day <= 9:  # Morning rush
            return random.randint(6, 10)
        elif 10 <= hour_of_day <= 17:  # Daytime
            return random.randint(4, 8)
        elif 18 <= hour_of_day <= 21:  # Evening
            return random.randint(3, 7)
        else:  # Night
            return random.randint(0, 2)
    
    def _predict_watts(self, occupancy: int) -> float:
        """
        Placeholder for wattage prediction model.
        In a real implementation, this would use a trained ML model.
        """
        # Base wattage + occupancy factor
        base_wattage = 50.0
        return base_wattage + (occupancy * random.uniform(8.0, 15.0))
    
    def _check_anomaly(self, occupancy: int, watts: float) -> bool:
        """
        Placeholder for anomaly detection.
        In a real implementation, this could use Isolation Forest or similar.
        """
        # Anomaly: if occupancy is 0 but watts is high (>100)
        return occupancy == 0 and watts > 100