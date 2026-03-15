"""
Training Data Service - Historical data management and analytics
"""
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import async_session_maker
from models import SensorReading
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession


class TrainingDataService:
    """Service for managing historical training data and providing analytics"""
    
    def __init__(self):
        pass
    
    async def get_training_data(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> List[SensorReading]:
        """Get historical readings for ML model training"""
        async with async_session_maker() as session:
            result = await session.execute(
                select(SensorReading)
                .where(SensorReading.timestamp >= start_date)
                .where(SensorReading.timestamp <= end_date)
                .order_by(SensorReading.timestamp)
            )
            return list(result.scalars().all())
    
    async def get_last_n_days_of_data(self, days: int) -> List[SensorReading]:
        """Get last N days of data for training"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        return await self.get_training_data(start_date, end_date)
    
    async def get_average_power_by_hour(self) -> Dict[int, float]:
        """Get average power consumption by hour of day"""
        async with async_session_maker() as session:
            result = await session.execute(
                select(
                    extract('hour', SensorReading.timestamp).label('hour'),
                    func.avg(SensorReading.current_wattage).label('avg_wattage')
                )
                .group_by(extract('hour', SensorReading.timestamp))
            )
            rows = result.all()
            return {int(row.hour): row.avg_wattage for row in rows}
    
    async def get_power_statistics(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get power statistics for a specific time range"""
        readings = await self.get_training_data(start_date, end_date)
        
        if not readings:
            return {}
        
        wattages = [r.current_wattage for r in readings]
        
        stats = {
            "count": len(readings),
            "min": min(wattages),
            "max": max(wattages),
            "avg": sum(wattages) / len(wattages),
            "total_kwh": sum(wattages) / 1000,
        }
        
        # Calculate efficiency stats
        efficiency_scores = [r.efficiency_score for r in readings if r.efficiency_score is not None]
        if efficiency_scores:
            stats["avg_efficiency"] = sum(efficiency_scores) / len(efficiency_scores)
        
        # Count anomalies
        anomaly_count = sum(1 for r in readings if r.integrity_alert)
        stats["anomaly_count"] = anomaly_count
        stats["anomaly_rate"] = (anomaly_count / len(readings)) * 100 if readings else 0
        
        return stats
    
    async def get_typical_occupancy_by_hour(self) -> Dict[int, int]:
        """Get typical occupancy patterns by hour"""
        readings = await self.get_last_n_days_of_data(7)
        
        occupancy_by_hour: Dict[int, List[int]] = {i: [] for i in range(24)}
        
        for reading in readings:
            hour = reading.timestamp.hour
            occupancy_by_hour[hour].append(reading.occupancy_count)
        
        typical_occupancy = {}
        for hour, values in occupancy_by_hour.items():
            if values:
                values.sort()
                median = values[len(values) // 2]
                typical_occupancy[hour] = median
        
        return typical_occupancy
    
    async def get_peak_usage_hours(self) -> List[int]:
        """Get peak usage hours"""
        hourly_averages = await self.get_average_power_by_hour()
        
        sorted_hours = sorted(hourly_averages.items(), key=lambda x: x[1], reverse=True)
        return [hour for hour, _ in sorted_hours[:5]]
    
    async def get_off_peak_usage_hours(self) -> List[int]:
        """Get off-peak usage hours (lowest consumption)"""
        hourly_averages = await self.get_average_power_by_hour()
        
        sorted_hours = sorted(hourly_averages.items(), key=lambda x: x[1])
        return [hour for hour, _ in sorted_hours[:5]]
    
    async def get_daily_consumption_summary(self, days: int) -> List[Dict[str, Any]]:
        """Get daily energy consumption summary"""
        daily_summaries = []
        now = datetime.now()
        
        for i in range(days - 1, -1, -1):
            day_start = (now - timedelta(days=i)).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            day_end = day_start + timedelta(days=1)
            
            stats = await self.get_power_statistics(day_start, day_end)
            if stats:
                stats["date"] = day_start.strftime("%Y-%m-%d")
                daily_summaries.append(stats)
        
        return daily_summaries
    
    async def get_data_quality_metrics(self) -> Dict[str, Any]:
        """Get data quality metrics"""
        async with async_session_maker() as session:
            result = await session.execute(select(SensorReading))
            all_readings = list(result.scalars().all())
        
        total_readings = len(all_readings)
        metrics = {"total_readings": total_readings}
        
        if total_readings == 0:
            metrics["quality_score"] = 0
            return metrics
        
        # Check for missing fields
        readings_with_temp = sum(1 for r in all_readings if r.external_temp is not None)
        readings_with_efficiency = sum(1 for r in all_readings if r.efficiency_score is not None)
        
        metrics["readings_with_temperature"] = readings_with_temp
        metrics["temperature_coverage_pct"] = (readings_with_temp / total_readings) * 100
        
        metrics["readings_with_efficiency"] = readings_with_efficiency
        metrics["efficiency_coverage_pct"] = (readings_with_efficiency / total_readings) * 100
        
        # Overall quality score (0-100)
        quality_score = (
            (readings_with_temp / total_readings) * 50 +
            (readings_with_efficiency / total_readings) * 50
        )
        metrics["quality_score"] = round(quality_score, 2)
        
        return metrics
