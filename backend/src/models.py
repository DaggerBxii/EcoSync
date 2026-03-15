from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Metrics(BaseModel):
    watts: float
    occupancy: int
    carbon_saved: float

class SyncContract(BaseModel):
    timestamp: str  # ISO format datetime string
    system_status: str
    scale_level: float
    metrics: Metrics
    ai_insight: str
    is_anomaly: bool
    confidence_score: Optional[float] = None
    unnecessary_usage_detected: Optional[bool] = None
    optimization_opportunities: Optional[list[str]] = None