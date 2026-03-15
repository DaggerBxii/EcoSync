"""
EcoSync Model Trainer
Trains the traditional ML models for occupancy prediction, energy prediction, and anomaly detection.
"""

import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from pyod.models.iforest import IForest
from typing import Tuple, Dict, Any
import warnings

warnings.filterwarnings('ignore')

class ModelTrainer:
    """
    Trains the three core ML models for EcoSync:
    1. Occupancy Predictor (RandomForest)
    2. Energy Predictor (GradientBoosting)
    3. Anomaly Detector (Isolation Forest)
    """
    
    def __init__(self):
        self.occupancy_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.energy_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.anomaly_model = IForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        
        # Create models directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
    
    def generate_synthetic_data(self, n_samples: int = 10000) -> pd.DataFrame:
        """
        Generate synthetic data for training the models.
        Simulates realistic building occupancy and energy patterns.
        """
        np.random.seed(42)
        
        # Generate timestamps
        start_date = datetime.now() - timedelta(days=365)
        timestamps = [start_date + timedelta(minutes=i*30) for i in range(n_samples)]
        
        # Generate features
        hours = np.array([t.hour for t in timestamps])
        days = np.array([t.weekday() for t in timestamps])
        is_weekend = (days >= 5).astype(int)
        
        # Simulate occupancy based on time patterns
        occupancy = np.zeros(n_samples)
        for i, hour in enumerate(hours):
            base_occ = 0
            
            # Night hours (22:00-06:00) - low occupancy
            if hour < 6 or hour >= 22:
                base_occ = np.random.poisson(0.5)
            # Morning rush (06:00-09:00) - high occupancy
            elif 6 <= hour < 9:
                base_occ = np.random.poisson(7)
            # Work hours (09:00-17:00) - moderate to high occupancy
            elif 9 <= hour < 17:
                base_occ = np.random.poisson(6)
            # Evening (17:00-22:00) - decreasing occupancy
            else:
                base_occ = np.random.poisson(max(2, 10 - (hour - 17)))
            
            # Reduce occupancy on weekends
            if is_weekend[i]:
                base_occ = max(0, base_occ - 3)
            
            # Add some randomness
            occupancy[i] = max(0, min(15, base_occ + np.random.normal(0, 1)))
        
        # Simulate energy consumption based on occupancy
        base_energy = 50  # Base energy consumption
        energy_per_person = 10  # Additional energy per person
        watts = base_energy + occupancy * energy_per_person
        
        # Add some variation based on time of day
        watt_variation = np.random.normal(0, 5)
        watts = np.maximum(40, watts + watt_variation)  # Minimum 40W
        
        # Add anomalies occasionally
        anomaly_indices = np.random.choice(n_samples, size=int(0.05 * n_samples), replace=False)
        for idx in anomaly_indices:
            # High energy usage with low/no occupancy
            if occupancy[idx] < 2:
                watts[idx] = np.random.uniform(120, 200)
        
        # Create DataFrame
        df = pd.DataFrame({
            'timestamp': timestamps,
            'hour_of_day': hours,
            'day_of_week': days,
            'is_weekend': is_weekend,
            'season': [(t.month % 12 // 3) for t in timestamps],  # 0=Winter, 1=Spring, 2=Summer, 3=Fall
            'occupancy': occupancy.astype(int),
            'watts': watts
        })
        
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Prepare features for training the models.
        """
        # Feature columns for occupancy and energy prediction
        feature_cols = ['hour_of_day', 'day_of_week', 'is_weekend', 'season']
        X = df[feature_cols].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Targets
        y_occupancy = df['occupancy'].values
        y_energy = df['watts'].values
        
        return X_scaled, y_occupancy, y_energy
    
    def train_models(self):
        """
        Train all three models using synthetic data.
        """
        print("Generating synthetic training data...")
        df = self.generate_synthetic_data(n_samples=10000)
        
        print("Preparing features...")
        X, y_occupancy, y_energy = self.prepare_features(df)
        
        # Split data
        X_train, X_test, y_occ_train, y_occ_test, y_eng_train, y_eng_test = train_test_split(
            X, y_occupancy, y_energy, test_size=0.2, random_state=42
        )
        
        # Train occupancy predictor
        print("Training occupancy predictor (RandomForest)...")
        self.occupancy_model.fit(X_train, y_occ_train)
        
        # Evaluate occupancy model
        occ_score = self.occupancy_model.score(X_test, y_occ_test)
        print(f"Occupancy model R² score: {occ_score:.3f}")
        
        # Train energy predictor
        print("Training energy predictor (GradientBoosting)...")
        self.energy_model.fit(X_train, y_eng_train)
        
        # Evaluate energy model
        eng_score = self.energy_model.score(X_test, y_eng_test)
        print(f"Energy model R² score: {eng_score:.3f}")
        
        # Prepare data for anomaly detection (using features and targets)
        # Anomaly detection on energy vs occupancy relationship
        df_features = df[['hour_of_day', 'day_of_week', 'is_weekend', 'season', 'occupancy', 'watts']].copy()
        X_anomaly = df_features.values
        
        # Scale anomaly detection features
        X_anomaly_scaled = StandardScaler().fit_transform(X_anomaly)
        
        print("Training anomaly detector (Isolation Forest)...")
        self.anomaly_model.fit(X_anomaly_scaled)
        
        print("Models trained successfully!")
        
        # Save models
        self.save_models()
        
        return {
            'occupancy_r2': occ_score,
            'energy_r2': eng_score,
            'samples_used': len(df)
        }
    
    def save_models(self):
        """
        Save trained models to disk.
        """
        joblib.dump(self.occupancy_model, 'models/occupancy_model.joblib')
        joblib.dump(self.energy_model, 'models/watts_model.joblib')
        joblib.dump(self.anomaly_model, 'models/anomaly_model.joblib')
        joblib.dump(self.scaler, 'models/scaler.joblib')
        
        print("Models saved to 'models/' directory")


def main():
    """
    Main function to train the models.
    """
    print("Starting EcoSync Model Training...")
    print("=" * 50)
    
    trainer = ModelTrainer()
    results = trainer.train_models()
    
    print("\nTraining completed!")
    print(f"Results: {results}")
    print("\nModels saved:")
    print("- models/occupancy_model.joblib")
    print("- models/watts_model.joblib") 
    print("- models/anomaly_model.joblib")
    print("- models/scaler.joblib")


if __name__ == "__main__":
    main()