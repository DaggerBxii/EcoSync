"""
Adaptive Baseline Service - K-Means clustering for usage patterns
"""
from datetime import datetime
from typing import Dict, List, Any, Optional
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.training_data_service import TrainingDataService

try:
    from sklearn.cluster import KMeans
    import numpy as np
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class AdaptiveBaselineService:
    """
    Adaptive Baseline Service using K-Means clustering.
    Learns usage patterns and provides dynamic baselines based on context.
    """
    
    def __init__(self):
        self.training_data_service = TrainingDataService()
        
        # Cluster centers for each hour
        self.hourly_cluster_centers: Dict[int, List[List[float]]] = {}
        self.models_trained = False
        self.num_clusters = 3
        
        # Pattern labels
        self.PATTERN_LOW = "low_usage"
        self.PATTERN_TYPICAL = "typical_usage"
        self.PATTERN_HIGH = "high_usage"
        
        # Initialize default centers
        for i in range(24):
            self.hourly_cluster_centers[i] = [
                [200.0],  # Low
                [500.0],  # Typical
                [800.0]   # High
            ]
    
    async def train_models(self):
        """Train K-Means models for each hour using historical data"""
        print("Training adaptive baseline models with K-Means clustering...")
        
        data = await self.training_data_service.get_last_n_days_of_data(30)
        
        if len(data) < self.num_clusters * 5:
            print(f"Insufficient data for K-Means training. Using default baselines.")
            return
        
        # Group data by hour
        power_by_hour: Dict[int, List[float]] = {i: [] for i in range(24)}
        
        for reading in data:
            hour = reading.timestamp.hour
            power_by_hour[hour].append(reading.current_wattage)
        
        # Train K-Means for each hour
        for i in range(24):
            hour_data = power_by_hour[i]
            
            if len(hour_data) < self.num_clusters:
                continue
            
            if SKLEARN_AVAILABLE:
                try:
                    # Convert to numpy array for sklearn
                    X = np.array(hour_data).reshape(-1, 1)
                    
                    # Run K-Means clustering
                    kmeans = KMeans(n_clusters=self.num_clusters, n_init=10, random_state=42)
                    kmeans.fit(X)
                    
                    # Store cluster centers (sorted)
                    centers = sorted(kmeans.cluster_centers_.tolist())
                    self.hourly_cluster_centers[i] = centers
                    
                except Exception as e:
                    print(f"K-Means failed for hour {i}: {e}")
            else:
                # Fallback: use percentile-based centers
                sorted_data = sorted(hour_data)
                n = len(sorted_data)
                self.hourly_cluster_centers[i] = [
                    [sorted_data[n // 4]],      # 25th percentile
                    [sorted_data[n // 2]],      # Median
                    [sorted_data[3 * n // 4]]   # 75th percentile
                ]
        
        self.models_trained = True
        print("Adaptive baseline models trained successfully")
    
    def get_adaptive_baseline(self, hour: int, occupancy: int) -> float:
        """Get adaptive baseline for current conditions"""
        if not self.models_trained:
            asyncio.create_task(self.train_models())
        
        centers = self.hourly_cluster_centers.get(hour)
        
        if not centers:
            return self._get_heuristic_baseline(hour, occupancy)
        
        # Return the median (typical) cluster center
        return centers[1][0] if len(centers) > 1 else centers[0][0]
    
    def get_occupancy_adjusted_baseline(self, hour: int, occupancy: int) -> float:
        """Get baseline with occupancy adjustment"""
        base_baseline = self.get_adaptive_baseline(hour, occupancy)
        
        # Adjust based on occupancy (typical is 50 people)
        occupancy_factor = occupancy / 50.0
        
        # Base load (30%) + variable load (70%)
        base_load = base_baseline * 0.3
        variable_load = base_baseline * 0.7 * occupancy_factor
        
        return base_load + variable_load
    
    def identify_usage_pattern(self, hour: int, current_wattage: float) -> str:
        """Identify current usage pattern (low/typical/high)"""
        centers = self.hourly_cluster_centers.get(hour)
        
        if not centers:
            return self.PATTERN_TYPICAL
        
        # Find closest cluster
        closest_idx = 0
        min_distance = float('inf')
        
        for i, center in enumerate(centers):
            distance = abs(current_wattage - center[0])
            if distance < min_distance:
                min_distance = distance
                closest_idx = i
        
        # Sort centers to label the pattern
        sorted_indices = sorted(range(len(centers)), key=lambda i: centers[i][0])
        rank = sorted_indices.index(closest_idx)
        
        if rank == 0:
            return self.PATTERN_LOW
        elif rank == len(centers) - 1:
            return self.PATTERN_HIGH
        return self.PATTERN_TYPICAL
    
    def get_expected_range(self, hour: int) -> Dict[str, float]:
        """Get expected range for current hour"""
        centers = self.hourly_cluster_centers.get(hour)
        
        if not centers:
            heuristic = self._get_heuristic_baseline(hour, 50)
            return {
                "min": heuristic * 0.5,
                "max": heuristic * 1.5,
                "expected": heuristic
            }
        
        flat_centers = [c[0] for c in centers]
        min_val = min(flat_centers)
        max_val = max(flat_centers)
        expected = sum(flat_centers) / len(flat_centers)
        
        return {
            "min": round(min_val, 2),
            "max": round(max_val, 2),
            "expected": round(expected, 2),
            "low_threshold": round(min_val, 2),
            "high_threshold": round(max_val, 2)
        }
    
    def _get_heuristic_baseline(self, hour: int, occupancy: int) -> float:
        """Get heuristic baseline when ML not available"""
        if 9 <= hour <= 17:  # Business hours
            return 500 + (occupancy * 50)
        return 100 + (occupancy * 20)  # Off hours
    
    def get_pattern_statistics(self) -> Dict[str, Any]:
        """Get pattern statistics"""
        sample_centers = {}
        for hour in [9, 12, 15, 18, 21]:
            centers = self.hourly_cluster_centers.get(hour)
            if centers:
                sample_centers[hour] = sorted([c[0] for c in centers])
        
        return {
            "models_trained": self.models_trained,
            "num_clusters": self.num_clusters,
            "pattern_labels": [self.PATTERN_LOW, self.PATTERN_TYPICAL, self.PATTERN_HIGH],
            "sample_cluster_centers": sample_centers
        }


# Import asyncio for async task creation
import asyncio
