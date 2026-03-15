"""
REST API Routes for EcoSync Dashboard
"""
from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ai_engine_service import AiEngineService
from services.predictive_analytics_service import PredictiveAnalyticsService
from services.adaptive_baseline_service import AdaptiveBaselineService
from services.optimization_engine_service import OptimizationEngineService
from services.weather_service import WeatherService
from services.pricing_service import PricingService
from services.insight_generator_service import InsightGeneratorService
from services.training_data_service import TrainingDataService

router = APIRouter()

# Initialize services
ai_engine = AiEngineService()
predictive_analytics = PredictiveAnalyticsService()
adaptive_baseline = AdaptiveBaselineService()
optimization_engine = OptimizationEngineService()
weather_service = WeatherService()
pricing_service = PricingService()
training_data_service = TrainingDataService()
insight_generator = InsightGeneratorService(
    training_data_service=training_data_service,
    pricing_service=pricing_service,
    weather_service=weather_service
)


@router.get("/weather")
async def get_weather() -> Dict[str, Any]:
    """Get current weather data"""
    return weather_service.get_weather_summary()


@router.get("/pricing")
async def get_pricing() -> Dict[str, Any]:
    """Get current electricity pricing"""
    return pricing_service.get_pricing_summary()


@router.get("/recommendations")
async def get_recommendations() -> List[Dict[str, Any]]:
    """Get AI-generated recommendations"""
    recommendations = await insight_generator.generate_recommendations()
    return [r.to_dict() for r in recommendations]


@router.get("/forecast")
async def get_forecast() -> Dict[str, Any]:
    """Get 24-hour power demand forecast"""
    return predictive_analytics.get_peak_demand_forecast()


@router.get("/summary/daily")
async def get_daily_summary() -> Dict[str, Any]:
    """Get daily summary report"""
    return await insight_generator.generate_daily_summary()


@router.get("/summary/weekly")
async def get_weekly_comparison() -> Dict[str, Any]:
    """Get week-over-week comparison"""
    return await insight_generator.generate_weekly_comparison()


@router.get("/stats")
async def get_statistics(days: int = Query(default=7, ge=1, le=365)) -> Dict[str, Any]:
    """Get historical data statistics"""
    from datetime import datetime, timedelta
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    return await training_data_service.get_power_statistics(start_date, end_date)


@router.get("/data-quality")
async def get_data_quality() -> Dict[str, Any]:
    """Get data quality metrics"""
    return await training_data_service.get_data_quality_metrics()


@router.get("/optimization")
async def get_optimization_recommendation(
    occupancy: int = Query(..., ge=0),
    current_wattage: float = Query(..., gt=0),
    baseline_wattage: float = Query(..., gt=0)
) -> Dict[str, Any]:
    """Get RL-based optimization recommendation"""
    return optimization_engine.get_recommendation(occupancy, current_wattage, baseline_wattage)


@router.get("/ml/accuracy")
async def get_model_accuracy() -> Dict[str, Any]:
    """Get ML model accuracy metrics"""
    return predictive_analytics.get_model_accuracy()


@router.get("/ml/baselines")
async def get_baseline_stats() -> Dict[str, Any]:
    """Get adaptive baseline patterns"""
    pattern_stats = await training_data_service.get_average_power_by_hour()
    typical_occupancy = await training_data_service.get_typical_occupancy_by_hour()
    peak_hours = await training_data_service.get_peak_usage_hours()
    off_peak_hours = await training_data_service.get_off_peak_usage_hours()
    
    return {
        "pattern_statistics": pattern_stats,
        "typical_occupancy": typical_occupancy,
        "peak_hours": peak_hours,
        "off_peak_hours": off_peak_hours
    }


@router.get("/pricing/hourly")
async def get_hourly_prices() -> Dict[int, float]:
    """Get hourly electricity prices for today"""
    return pricing_service.get_hourly_prices_for_today()


@router.get("/pricing/savings")
async def calculate_savings(
    wattage: float = Query(..., gt=0),
    duration_hours: int = Query(..., ge=1),
    from_hour: int = Query(..., ge=0, le=23),
    to_hour: int = Query(..., ge=0, le=23)
) -> Dict[str, Any]:
    """Calculate potential savings from load shifting"""
    return pricing_service.calculate_load_shifting_savings(
        wattage, duration_hours, from_hour, to_hour
    )


@router.post("/ai/process")
async def process_ai_decision(
    occupancy: int = Query(..., ge=0),
    wattage: float = Query(..., gt=0),
    external_temp: float = Query(default=None)
) -> Dict[str, Any]:
    """Process sensor data through AI engine"""
    await ai_engine.initialize()
    return await ai_engine.process_cycle(occupancy, wattage, external_temp)


@router.get("/ai/history")
async def get_ai_history(hour: int = Query(default=None, ge=0, le=23)) -> Dict[str, Any]:
    """Get AI power history"""
    return {"history": ai_engine.get_power_history(hour)}


@router.get("/adaptive-baseline/pattern")
async def get_usage_pattern(
    hour: int = Query(..., ge=0, le=23),
    wattage: float = Query(..., gt=0)
) -> Dict[str, Any]:
    """Identify current usage pattern"""
    pattern = adaptive_baseline.identify_usage_pattern(hour, wattage)
    expected_range = adaptive_baseline.get_expected_range(hour)
    
    return {
        "pattern": pattern,
        "expected_range": expected_range
    }


@router.get("/adaptive-baseline/stats")
async def get_adaptive_baseline_stats() -> Dict[str, Any]:
    """Get adaptive baseline statistics"""
    return adaptive_baseline.get_pattern_statistics()


@router.get("/optimization/stats")
async def get_optimization_stats() -> Dict[str, Any]:
    """Get Q-Learning optimization statistics"""
    return optimization_engine.get_training_stats()
