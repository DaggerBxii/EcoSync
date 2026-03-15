"""
AI Module for EcoSync - The Brain
Provides ML-based predictions and insights for the EcoSync system.
"""

import random
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path
import numpy as np
import joblib

# Set up paths
BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR.parent / "models"


class EcoBrain:
    """
    AI module that provides predictions and insights for the EcoSync system.
    Uses trained ML models for occupancy prediction, energy estimation, and anomaly detection.
    """

    def __init__(self, use_trained_models: bool = True):
        """
        Initialize the AI models.
        
        Args:
            use_trained_models: If True, load pre-trained models from disk.
                               If False or if models not found, use fallback logic.
        """
        self.use_trained_models = use_trained_models
        self.occupancy_model = None
        self.watts_model = None
        self.anomaly_model = None
        self.scaler = None
        self.feature_engineer = None
        
        # Fallback flag
        self.using_fallback = False
        
        # Historical data cache for rolling averages
        self._historical_occupancy: List[float] = []
        self._historical_watts: List[float] = []
        self._cache_max_size = 168  # 1 week of hourly data
        
        # Load models if requested
        if use_trained_models:
            self._load_models()

    def _load_models(self) -> bool:
        """Load trained models from disk."""
        try:
            model_files = [
                "occupancy_model.joblib",
                "watts_model.joblib", 
                "anomaly_model.joblib",
                "scaler.joblib",
                "feature_engineer.joblib"
            ]
            
            for model_file in model_files:
                model_path = MODELS_DIR / model_file
                if not model_path.exists():
                    print(f"EcoBrain: Model file not found: {model_path}")
                    self.using_fallback = True
                    return False
            
            self.occupancy_model = joblib.load(MODELS_DIR / "occupancy_model.joblib")
            self.watts_model = joblib.load(MODELS_DIR / "watts_model.joblib")
            self.anomaly_model = joblib.load(MODELS_DIR / "anomaly_model.joblib")
            self.scaler = joblib.load(MODELS_DIR / "scaler.joblib")
            self.feature_engineer = joblib.load(MODELS_DIR / "feature_engineer.joblib")
            
            print("EcoBrain: Loaded trained ML models successfully.")
            return True
            
        except Exception as e:
            print(f"EcoBrain: Error loading models: {e}")
            print("EcoBrain: Falling back to rule-based predictions.")
            self.using_fallback = True
            return False

    def get_decision(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data and return a decision/prediction following the Sync Contract.

        Args:
            input_data: Dictionary containing input data for the AI.
                       Expected keys: hour_of_day, day_of_week (optional),
                       temperature (optional), humidity (optional)

        Returns:
            Dictionary with the structure defined in the Sync Contract
        """
        # Extract input features
        timestamp = datetime.now()
        hour_of_day = input_data.get('hour_of_day', timestamp.hour)
        day_of_week = input_data.get('day_of_week', timestamp.weekday())
        temperature = input_data.get('temperature')
        humidity = input_data.get('humidity')
        
        # Create timestamp for feature extraction
        pred_timestamp = timestamp.replace(hour=hour_of_day)

        # Get predictions
        if self.using_fallback or self.occupancy_model is None:
            occupancy_prediction, occ_confidence = self._predict_occupancy_fallback(hour_of_day, day_of_week)
            watts_prediction, watts_confidence = self._predict_watts_fallback(occupancy_prediction)
        else:
            occupancy_prediction, occ_confidence = self._predict_occupancy_ml(
                pred_timestamp, temperature, humidity
            )
            watts_prediction, watts_confidence = self._predict_watts_ml(
                pred_timestamp, occupancy_prediction, temperature, humidity
            )

        # Update historical cache
        self._update_historical_cache(occupancy_prediction, watts_prediction)

        # Check for anomaly
        is_anomaly, anomaly_confidence = self._check_anomaly(
            occupancy_prediction, 
            watts_prediction,
            temperature,
            humidity
        )

        # Calculate overall confidence score
        confidence_score = (occ_confidence + watts_confidence + (1.0 if not is_anomaly else 0.5)) / 3.0

        # Generate AI insight using NLP templates
        ai_insight = self._generate_insight(
            occupancy_prediction,
            watts_prediction,
            is_anomaly,
            hour_of_day,
            confidence_score
        )

        # Calculate scale level based on occupancy (lower occupancy = lower scale)
        max_occupancy = 10
        scale_level = max(0.1, min(1.0, occupancy_prediction / max_occupancy))

        # Determine system status
        if is_anomaly:
            system_status = "Alert"
        elif scale_level < 0.3:
            system_status = "Eco Mode"
        elif scale_level < 0.6:
            system_status = "Scaling Down"
        else:
            system_status = "Active"

        # Calculate carbon saved (based on baseline vs actual)
        baseline_watts = 150.0
        carbon_factor = 0.0004
        carbon_saved = max(0, (baseline_watts - watts_prediction) * carbon_factor)

        # Return the Sync Contract structure
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "system_status": system_status,
            "scale_level": round(scale_level, 2),
            "metrics": {
                "watts": round(watts_prediction, 2),
                "occupancy": int(round(occupancy_prediction)),
                "carbon_saved": round(carbon_saved, 3)
            },
            "ai_insight": ai_insight,
            "is_anomaly": is_anomaly,
            "confidence_score": round(confidence_score, 3)
        }

    def _predict_occupancy_ml(
        self, 
        timestamp: datetime, 
        temperature: Optional[float] = None,
        humidity: Optional[float] = None
    ) -> Tuple[float, float]:
        """ML-based occupancy prediction with confidence score."""
        # Get historical averages
        hist_avg_occ = np.mean(self._historical_occupancy) if self._historical_occupancy else 5.0
        hist_avg_watts = np.mean(self._historical_watts) if self._historical_watts else 100.0

        # Create feature vector
        feature_vector = self.feature_engineer.create_feature_vector(
            timestamp=timestamp,
            historical_avg_occupancy=hist_avg_occ,
            historical_avg_watts=hist_avg_watts,
            temperature=temperature,
            humidity=humidity
        )

        # Scale features
        feature_vector_scaled = self.scaler.transform([feature_vector])

        # Get prediction from model
        prediction = self.occupancy_model.predict(feature_vector_scaled)[0]

        # Get confidence from prediction variance (using multiple trees)
        if hasattr(self.occupancy_model, 'estimators_'):
            tree_predictions = np.array([
                tree.predict(feature_vector_scaled)[0] 
                for tree in self.occupancy_model.estimators_
            ])
            std_dev = np.std(tree_predictions)
            confidence = max(0.5, min(1.0, 1.0 - (std_dev / 5.0)))
        else:
            confidence = 0.8

        return max(0, prediction), confidence

    def _predict_watts_ml(
        self,
        timestamp: datetime,
        occupancy: float,
        temperature: Optional[float] = None,
        humidity: Optional[float] = None
    ) -> Tuple[float, float]:
        """ML-based watts prediction with confidence score."""
        hist_avg_occ = np.mean(self._historical_occupancy) if self._historical_occupancy else 5.0
        hist_avg_watts = np.mean(self._historical_watts) if self._historical_watts else 100.0

        feature_vector = self.feature_engineer.create_feature_vector(
            timestamp=timestamp,
            historical_avg_occupancy=hist_avg_occ,
            historical_avg_watts=hist_avg_watts,
            temperature=temperature,
            humidity=humidity
        )

        feature_vector_scaled = self.scaler.transform([feature_vector])

        prediction = self.watts_model.predict(feature_vector_scaled)[0]

        # Get confidence from prediction variance
        if hasattr(self.watts_model, 'estimators_'):
            tree_predictions = np.array([
                tree.predict(feature_vector_scaled)[0] 
                for tree in self.watts_model.estimators_
            ])
            std_dev = np.std(tree_predictions)
            confidence = max(0.5, min(1.0, 1.0 - (std_dev / 50.0)))
        else:
            confidence = 0.8

        return max(0, prediction), confidence

    def _check_anomaly(
        self,
        occupancy: float,
        watts: float,
        temperature: Optional[float] = None,
        humidity: Optional[float] = None
    ) -> Tuple[bool, float]:
        """Anomaly detection using Isolation Forest with rule-based fallback."""
        if self.using_fallback or self.anomaly_model is None:
            is_anomaly = occupancy == 0 and watts > 100
            if is_anomaly:
                confidence = min(1.0, 0.5 + (watts - 100) / 200)
            else:
                confidence = 0.9
            return is_anomaly, confidence

        try:
            timestamp = datetime.now()
            hist_avg_occ = np.mean(self._historical_occupancy) if self._historical_occupancy else 5.0
            hist_avg_watts = np.mean(self._historical_watts) if self._historical_watts else 100.0

            feature_vector = self.feature_engineer.create_feature_vector(
                timestamp=timestamp,
                historical_avg_occupancy=hist_avg_occ,
                historical_avg_watts=hist_avg_watts,
                temperature=temperature,
                humidity=humidity
            )

            feature_vector_scaled = self.scaler.transform([feature_vector])

            prediction = self.anomaly_model.predict(feature_vector_scaled)[0]
            is_anomaly = prediction == -1

            anomaly_score = self.anomaly_model.decision_function(feature_vector_scaled)[0]
            confidence = 1.0 / (1.0 + np.exp(-anomaly_score * 5))

            return is_anomaly, confidence

        except Exception as e:
            print(f"EcoBrain: Anomaly detection error: {e}")
            return occupancy == 0 and watts > 100, 0.7

    def _generate_insight(
        self,
        occupancy: float,
        watts: float,
        is_anomaly: bool,
        hour: int,
        confidence: float
    ) -> str:
        """Generate human-readable AI insight using NLP templates."""
        if is_anomaly:
            templates = [
                f"⚠️ Anomaly detected: High energy usage ({watts:.0f}W) with zero occupancy. Investigate immediately.",
                f"⚠️ Alert: Unusual power consumption detected. No occupants present but drawing {watts:.0f}W.",
                f"⚠️ Warning: Potential equipment malfunction. Zero occupancy with {watts:.0f}W consumption."
            ]
            return random.choice(templates)

        if occupancy == 0:
            templates = [
                "Deep Eco-Mode: No human load detected. Building is unoccupied.",
                "Maximum efficiency: Zero occupancy. All non-essential systems scaled down.",
                "Energy saving mode: Building vacant. Minimal power consumption active."
            ]
            return random.choice(templates)

        elif occupancy < 3:
            efficiency = 1.0 - (watts / 200.0)
            templates = [
                f"Low occupancy period ({int(occupancy)} people). Reducing power to {watts:.0f}W.",
                f"Minimal load detected. Operating at {efficiency*100:.0f}% efficiency.",
                f"Few occupants present. Optimized energy distribution active."
            ]
            return random.choice(templates)

        elif occupancy < 7:
            templates = [
                f"Moderate occupancy ({int(occupancy)} people). Normal operations at {watts:.0f}W.",
                f"Standard load period. Energy distribution optimized for {int(occupancy)} occupants.",
                f"Normal operations with efficient energy allocation."
            ]
            return random.choice(templates)

        else:
            templates = [
                f"High occupancy ({int(occupancy)} people). Full capacity operations at {watts:.0f}W.",
                f"Peak load period. All systems active to support {int(occupancy)} occupants.",
                f"Maximum capacity operations. Energy prioritized for occupant comfort."
            ]
            return random.choice(templates)

    def _predict_occupancy_fallback(
        self, 
        hour_of_day: int, 
        day_of_week: int
    ) -> Tuple[int, float]:
        """Fallback occupancy prediction using rule-based logic."""
        if 6 <= hour_of_day <= 9:
            prediction = random.randint(6, 10)
            confidence = 0.7
        elif 10 <= hour_of_day <= 17:
            prediction = random.randint(4, 8)
            confidence = 0.75
        elif 18 <= hour_of_day <= 21:
            prediction = random.randint(3, 7)
            confidence = 0.7
        else:
            prediction = random.randint(0, 2)
            confidence = 0.85

        if day_of_week >= 5:
            prediction = max(0, prediction - 2)
            confidence -= 0.1

        return prediction, max(0.5, confidence)

    def _predict_watts_fallback(self, occupancy: int) -> Tuple[float, float]:
        """Fallback watts prediction using rule-based logic."""
        base_wattage = 50.0
        prediction = base_wattage + (occupancy * random.uniform(8.0, 15.0))
        confidence = 0.75
        return prediction, confidence

    def _update_historical_cache(self, occupancy: float, watts: float):
        """Update the historical data cache for rolling averages."""
        self._historical_occupancy.append(occupancy)
        self._historical_watts.append(watts)

        if len(self._historical_occupancy) > self._cache_max_size:
            self._historical_occupancy.pop(0)
            self._historical_watts.pop(0)

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models."""
        return {
            "using_trained_models": not self.using_fallback,
            "occupancy_model_loaded": self.occupancy_model is not None,
            "watts_model_loaded": self.watts_model is not None,
            "anomaly_model_loaded": self.anomaly_model is not None,
            "historical_samples": len(self._historical_occupancy),
            "models_directory": str(MODELS_DIR)
        }
