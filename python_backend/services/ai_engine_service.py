"""
AI Engine Service - Core AI for power consumption analysis
Implements anomaly detection, efficiency scoring, and power scaling decisions
"""
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from collections import defaultdict
import statistics
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import async_session_maker
from models import SensorReading
from sqlalchemy import select, desc


class AiEngineService:
    """
    Core AI engine for real-time power analysis.
    Uses statistical methods for anomaly detection and efficiency scoring.
    """
    
    def __init__(self):
        # Stores power history for each hour (0-23) to learn baselines
        self.power_history: Dict[int, List[float]] = defaultdict(list)
        self.max_efficiency_score = 100.0
        self._initialized = False
    
    async def initialize(self):
        """Load historical data to warm-start the AI"""
        if self._initialized:
            return
        
        try:
            async with async_session_maker() as session:
                # Load last 50 readings
                result = await session.execute(
                    select(SensorReading)
                    .order_by(desc(SensorReading.timestamp))
                    .limit(50)
                )
                readings = result.scalars().all()
                
                for reading in readings:
                    hour = reading.timestamp.hour
                    self.power_history[hour].append(reading.current_wattage)
                
                print(f"Loaded {len(readings)} historical readings for AI warm-start")
        except Exception as e:
            print(f"Failed to load historical data: {e}")
        
        self._initialized = True
    
    async def process_cycle(
        self,
        current_occ: int,
        current_wattage: float,
        external_temp: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Process sensor data through AI engine and persist to database
        
        Args:
            current_occ: Current occupancy count
            current_wattage: Current power consumption in watts
            external_temp: Optional external temperature
            
        Returns:
            Dictionary with AI decision and metrics
        """
        now = datetime.now()
        hour = now.hour
        history = self.power_history[hour]
        
        # 1. LEARNING PHASE: Add current wattage to history (Limit to last 50 readings)
        history.append(current_wattage)
        if len(history) > 50:
            history.pop(0)
        
        # 2. AI ANALYSIS: Calculate Baseline & Standard Deviation
        baseline = self._get_mean(history)
        std_dev = self._get_standard_deviation(history, baseline)
        
        # 3. ANOMALY DETECTION (Z-Score Method)
        is_anomaly = False
        if len(history) > 5:  # Need enough data to be sure
            z_score = abs(current_wattage - baseline) / (std_dev if std_dev != 0 else 1)
            if z_score > 2.0:
                is_anomaly = True
        
        # 4. EFFICIENCY SCORING
        # Ideal: 50W per person. Lower is better.
        ideal_wattage = current_occ * 50.0
        efficiency_score = min(
            self.max_efficiency_score,
            (ideal_wattage / (current_wattage if current_wattage != 0 else 1)) * 100
        )
        if current_occ == 0 and current_wattage > 100:
            efficiency_score = 0  # Vampire load penalty
        
        # 5. DECISION LOGIC
        status = "Optimized"
        insight = "Power consumption within normal baseline."
        scale_level = 1.0
        
        if is_anomaly:
            status = "Critical Alert"
            insight = "⚠️ POWER ANOMALY: Usage deviates significantly from learned baseline."
            scale_level = 0.5  # Throttle power if unsafe
        elif efficiency_score < 50:
            status = "Inefficient"
            insight = "High power draw per occupant. Scaling down non-essentials."
            scale_level = 0.7
        
        # 6. BUILD RESPONSE
        response = {
            "timestamp": now.isoformat(),
            "system_status": status,
            "scale_level": round(scale_level, 2),
            "metrics": {
                "current_usage": round(current_wattage, 2),
                "baseline_usage": round(baseline, 2),
                "occupancy": current_occ,
                "efficiency_score": round(efficiency_score, 2)
            },
            "ai_insight": insight,
            "integrity_alert": is_anomaly
        }
        
        # 7. PERSIST TO DATABASE (async, non-blocking)
        asyncio.create_task(self._save_sensor_reading(
            now, current_occ, current_wattage, external_temp,
            baseline, efficiency_score, is_anomaly, status, scale_level, insight
        ))
        
        return response
    
    async def _save_sensor_reading(
        self,
        timestamp: datetime,
        occupancy_count: int,
        current_wattage: float,
        external_temp: Optional[float],
        baseline: float,
        efficiency_score: float,
        integrity_alert: bool,
        system_status: str,
        scale_level: float,
        ai_insight: str
    ):
        """Save sensor reading to database"""
        try:
            reading = SensorReading(
                timestamp=timestamp,
                occupancy_count=occupancy_count,
                current_wattage=current_wattage,
                external_temp=external_temp,
                baseline_usage=baseline,
                efficiency_score=efficiency_score,
                integrity_alert=integrity_alert,
                system_status=system_status,
                scale_level=scale_level,
                ai_insight=ai_insight
            )
            
            async with async_session_maker() as session:
                session.add(reading)
                await session.commit()
        except Exception as e:
            print(f"Failed to save sensor reading: {e}")
    
    @staticmethod
    def _get_mean(data: List[float]) -> float:
        """Calculate mean of data"""
        if not data:
            return 0.0
        return statistics.mean(data)
    
    @staticmethod
    def _get_standard_deviation(data: List[float], mean: float) -> float:
        """Calculate standard deviation"""
        if len(data) <= 1:
            return 0.0
        return statistics.stdev(data)
    
    def get_power_history(self, hour: Optional[int] = None) -> Dict[int, List[float]]:
        """Get power history for debugging/analysis"""
        if hour is not None:
            return {hour: self.power_history.get(hour, [])}
        return dict(self.power_history)
