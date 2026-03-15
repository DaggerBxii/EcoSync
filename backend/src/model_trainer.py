"""
Model Trainer for EcoSync
Trains and saves ML models for occupancy prediction, watts prediction, and anomaly detection.
"""

import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any, Optional
from pathlib import Path

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from pyod.models.isolation_forest import IForest

# Set up paths
BASE_DIR = Path(__file__).parent.parent
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)


class FeatureEngineer:
    """
    Handles feature engineering for the EcoSync models.
    Transforms raw input data into ML-ready features.
    """

    def __init__(self):
        self.season_encoder = OneHotEncoder(
            categories=[["spring", "summer", "fall", "winter"]],
            sparse_output=False,
            handle_unknown="ignore"
        )
        self.season_encoder.fit([["spring"], ["summer"], ["fall"], ["winter"]])

    def extract_time_features(self, timestamp: datetime) -> Dict[str, Any]:
        """Extract time-based features from a timestamp."""
        hour = timestamp.hour
        day_of_week = timestamp.weekday()
        day_of_year = timestamp.timetuple().tm_yday
        month = timestamp.month
        is_weekend = 1 if day_of_week >= 5 else 0

        # Cyclical encoding for hour (captures proximity of 23:00 and 00:00)
        hour_sin = np.sin(2 * np.pi * hour / 24)
        hour_cos = np.cos(2 * np.pi * hour / 24)

        # Cyclical encoding for day of week
        dow_sin = np.sin(2 * np.pi * day_of_week / 7)
        dow_cos = np.cos(2 * np.pi * day_of_week / 7)

        # Cyclical encoding for day of year (seasonal patterns)
        doy_sin = np.sin(2 * np.pi * day_of_year / 365)
        doy_cos = np.cos(2 * np.pi * day_of_year / 365)

        # Time period classification
        is_night = 1 if hour < 6 or hour > 22 else 0
        is_morning_rush = 1 if 6 <= hour <= 9 else 0
        is_work_hours = 1 if 9 < hour < 17 else 0
        is_evening = 1 if 17 <= hour <= 22 else 0

        # Season
        season = self._get_season(month)

        return {
            "hour": hour,
            "hour_sin": hour_sin,
            "hour_cos": hour_cos,
            "day_of_week": day_of_week,
            "dow_sin": dow_sin,
            "dow_cos": dow_cos,
            "day_of_year": day_of_year,
            "doy_sin": doy_sin,
            "doy_cos": doy_cos,
            "month": month,
            "is_weekend": is_weekend,
            "is_night": is_night,
            "is_morning_rush": is_morning_rush,
            "is_work_hours": is_work_hours,
            "is_evening": is_evening,
            "season": season
        }

    def create_feature_vector(
        self,
        timestamp: datetime,
        historical_avg_occupancy: Optional[float] = None,
        historical_avg_watts: Optional[float] = None,
        temperature: Optional[float] = None,
        humidity: Optional[float] = None
    ) -> np.ndarray:
        """Create a complete feature vector for model prediction."""
        time_features = self.extract_time_features(timestamp)

        # Encode season
        season_encoded = self.season_encoder.transform([[time_features["season"]]])[0]

        # Build feature vector
        features = [
            time_features["hour_sin"],
            time_features["hour_cos"],
            time_features["dow_sin"],
            time_features["dow_cos"],
            time_features["doy_sin"],
            time_features["doy_cos"],
            time_features["is_weekend"],
            time_features["is_night"],
            time_features["is_morning_rush"],
            time_features["is_work_hours"],
            time_features["is_evening"],
        ]

        # Add season one-hot encoding
        features.extend(season_encoded.tolist())

        # Add historical averages if available (rolling window features)
        features.append(historical_avg_occupancy if historical_avg_occupancy else 5.0)
        features.append(historical_avg_watts if historical_avg_watts else 100.0)

        # Add environmental features if available
        features.append(temperature if temperature else 22.0)
        features.append(humidity if humidity else 50.0)

        return np.array(features, dtype=np.float32)

    def get_feature_names(self) -> list:
        """Get names of all features in order."""
        return [
            "hour_sin", "hour_cos",
            "dow_sin", "dow_cos",
            "doy_sin", "doy_cos",
            "is_weekend", "is_night", "is_morning_rush", "is_work_hours", "is_evening",
            "season_spring", "season_summer", "season_fall", "season_winter",
            "historical_avg_occupancy", "historical_avg_watts",
            "temperature", "humidity"
        ]

    @staticmethod
    def _get_season(month: int) -> str:
        """Determine season based on month."""
        if month in [12, 1, 2]:
            return "winter"
        elif month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:
            return "summer"
        else:
            return "fall"


class ModelTrainer:
    """Trains and manages ML models for EcoSync."""

    def __init__(self):
        self.feature_engineer = FeatureEngineer()
        self.occupancy_model = None
        self.watts_model = None
        self.anomaly_model = None
        self.scaler = StandardScaler()

    def generate_synthetic_data(
        self,
        num_samples: int = 10000,
        seed: int = 42
    ) -> Tuple[pd.DataFrame, pd.Series, pd.Series, pd.Series]:
        """Generate synthetic training data for initial model training."""
        np.random.seed(seed)

        # Generate timestamps spread across a year
        base_date = datetime.now() - timedelta(days=365)
        timestamps = [
            base_date + timedelta(
                days=np.random.randint(0, 365),
                hours=np.random.randint(0, 24)
            )
            for _ in range(num_samples)
        ]

        data = []
        for ts in timestamps:
            features = self.feature_engineer.extract_time_features(ts)

            # Generate realistic occupancy based on time patterns
            base_occupancy = 5

            # Time of day effect
            if features["is_night"]:
                base_occupancy = np.random.randint(0, 2)
            elif features["is_morning_rush"]:
                base_occupancy = np.random.randint(6, 11)
            elif features["is_work_hours"]:
                base_occupancy = np.random.randint(4, 9)
            elif features["is_evening"]:
                base_occupancy = np.random.randint(2, 6)

            # Weekend effect
            if features["is_weekend"]:
                base_occupancy = max(0, base_occupancy - 3)

            # Add noise
            occupancy = max(0, base_occupancy + np.random.randint(-2, 3))

            # Generate watts based on occupancy
            base_watts = 50 + occupancy * np.random.uniform(8, 15)
            watts = base_watts + np.random.uniform(-10, 20)

            # Generate some anomalies (high watts, zero occupancy)
            is_anomaly = 0
            if np.random.random() < 0.05:  # 5% anomaly rate
                if np.random.random() < 0.3:
                    occupancy = 0
                    watts = np.random.uniform(120, 200)
                    is_anomaly = 1

            data.append({
                **features,
                "occupancy": occupancy,
                "watts": watts,
                "is_anomaly": is_anomaly
            })

        df = pd.DataFrame(data)

        # Add historical average features (simulated)
        df["historical_avg_occupancy"] = df.groupby(
            ["hour", "day_of_week"]
        )["occupancy"].transform(lambda x: x.rolling(10, min_periods=1).mean())
        df["historical_avg_watts"] = df.groupby(
            ["hour", "day_of_week"]
        )["watts"].transform(lambda x: x.rolling(10, min_periods=1).mean())

        # Fill NaN values
        df["historical_avg_occupancy"] = df["historical_avg_occupancy"].fillna(5.0)
        df["historical_avg_watts"] = df["historical_avg_watts"].fillna(100.0)

        X = df[self.feature_engineer.get_feature_names()]
        y_occupancy = df["occupancy"]
        y_watts = df["watts"]
        y_anomaly = df["is_anomaly"]

        return X, y_occupancy, y_watts, y_anomaly

    def train_occupancy_model(
        self,
        X: pd.DataFrame,
        y: pd.Series
    ) -> Dict[str, float]:
        """Train the occupancy prediction model."""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        self.occupancy_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )

        self.occupancy_model.fit(X_train_scaled, y_train)

        y_pred = self.occupancy_model.predict(X_test_scaled)

        metrics = {
            "mae": mean_absolute_error(y_test, y_pred),
            "rmse": np.sqrt(mean_squared_error(y_test, y_pred)),
            "r2": r2_score(y_test, y_pred)
        }

        cv_scores = cross_val_score(
            self.occupancy_model, X_train_scaled, y_train,
            cv=5, scoring="neg_mean_absolute_error"
        )
        metrics["cv_mae_mean"] = -cv_scores.mean()
        metrics["cv_mae_std"] = cv_scores.std()

        return metrics

    def train_watts_model(
        self,
        X: pd.DataFrame,
        y: pd.Series
    ) -> Dict[str, float]:
        """Train the watts prediction model."""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        self.watts_model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=10,
            learning_rate=0.1,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )

        self.watts_model.fit(X_train_scaled, y_train)

        y_pred = self.watts_model.predict(X_test_scaled)

        metrics = {
            "mae": mean_absolute_error(y_test, y_pred),
            "rmse": np.sqrt(mean_squared_error(y_test, y_pred)),
            "r2": r2_score(y_test, y_pred)
        }

        cv_scores = cross_val_score(
            self.watts_model, X_train_scaled, y_train,
            cv=5, scoring="neg_mean_absolute_error"
        )
        metrics["cv_mae_mean"] = -cv_scores.mean()
        metrics["cv_mae_std"] = cv_scores.std()

        return metrics

    def train_anomaly_model(
        self,
        X: pd.DataFrame,
        contamination: float = 0.05
    ) -> None:
        """Train the anomaly detection model using Isolation Forest."""
        X_scaled = self.scaler.fit_transform(X)

        self.anomaly_model = IForest(
            contamination=contamination,
            n_estimators=100,
            max_samples="auto",
            random_state=42,
            n_jobs=-1
        )

        self.anomaly_model.fit(X_scaled)

    def train_all_models(
        self,
        use_synthetic_data: bool = True,
        num_samples: int = 10000
    ) -> Dict[str, Any]:
        """Train all models and save them to disk."""
        print("Starting model training...")

        if use_synthetic_data:
            print(f"Generating {num_samples} synthetic samples...")
            X, y_occupancy, y_watts, y_anomaly = self.generate_synthetic_data(
                num_samples=num_samples
            )
        else:
            print("Loading real data from database...")
            raise NotImplementedError(
                "Real data loading not yet implemented. Use synthetic data for now."
            )

        print(f"Training data shape: {X.shape}")
        print(f"Feature names: {self.feature_engineer.get_feature_names()}")

        print("\nTraining occupancy prediction model...")
        occupancy_metrics = self.train_occupancy_model(X, y_occupancy)
        print(f"Occupancy model metrics: {occupancy_metrics}")

        print("\nTraining watts prediction model...")
        watts_metrics = self.train_watts_model(X, y_watts)
        print(f"Watts model metrics: {watts_metrics}")

        print("\nTraining anomaly detection model...")
        self.train_anomaly_model(X)
        print("Anomaly model trained.")

        self.save_models()

        return {
            "occupancy": occupancy_metrics,
            "watts": watts_metrics,
            "samples_used": num_samples
        }

    def save_models(self) -> None:
        """Save all trained models to disk."""
        if self.occupancy_model is None:
            raise ValueError("No models trained yet. Call train_all_models first.")

        joblib.dump(self.occupancy_model, MODELS_DIR / "occupancy_model.joblib")
        joblib.dump(self.watts_model, MODELS_DIR / "watts_model.joblib")
        joblib.dump(self.anomaly_model, MODELS_DIR / "anomaly_model.joblib")
        joblib.dump(self.scaler, MODELS_DIR / "scaler.joblib")
        joblib.dump(self.feature_engineer, MODELS_DIR / "feature_engineer.joblib")

        print(f"\nModels saved to {MODELS_DIR}")

    def load_models(self) -> bool:
        """Load trained models from disk."""
        try:
            self.occupancy_model = joblib.load(MODELS_DIR / "occupancy_model.joblib")
            self.watts_model = joblib.load(MODELS_DIR / "watts_model.joblib")
            self.anomaly_model = joblib.load(MODELS_DIR / "anomaly_model.joblib")
            self.scaler = joblib.load(MODELS_DIR / "scaler.joblib")
            self.feature_engineer = joblib.load(MODELS_DIR / "feature_engineer.joblib")
            print("Models loaded successfully.")
            return True
        except FileNotFoundError as e:
            print(f"Models not found. Need to train first: {e}")
            return False


def main():
    """Main entry point for training."""
    trainer = ModelTrainer()

    results = trainer.train_all_models(
        use_synthetic_data=True,
        num_samples=10000
    )

    print("\n" + "=" * 50)
    print("Training Complete!")
    print("=" * 50)
    print(f"Occupancy MAE: {results['occupancy']['mae']:.3f}")
    print(f"Watts MAE: {results['watts']['mae']:.3f}")
    print(f"Samples used: {results['samples_used']}")
    print(f"Models saved to: {MODELS_DIR}")


if __name__ == "__main__":
    main()
