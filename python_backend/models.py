"""
SQLAlchemy Models for EcoSync
"""
from sqlalchemy import Column, Integer, Float, Boolean, String, DateTime
from sqlalchemy.sql import func
from database import Base


class SensorReading(Base):
    """Sensor reading data model for storing historical power consumption data"""
    
    __tablename__ = "sensor_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    occupancy_count = Column(Integer, nullable=False)
    current_wattage = Column(Float, nullable=False)
    external_temp = Column(Float, nullable=True)
    baseline_usage = Column(Float, nullable=True)
    efficiency_score = Column(Float, nullable=True)
    integrity_alert = Column(Boolean, default=False)
    system_status = Column(String(50), nullable=True)
    scale_level = Column(Float, default=1.0)
    ai_insight = Column(String(1000), nullable=True)
    
    def __repr__(self):
        return f"<SensorReading(id={self.id}, wattage={self.current_wattage}, occupancy={self.occupancy_count})>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "occupancy_count": self.occupancy_count,
            "current_wattage": self.current_wattage,
            "external_temp": self.external_temp,
            "baseline_usage": self.baseline_usage,
            "efficiency_score": self.efficiency_score,
            "integrity_alert": self.integrity_alert,
            "system_status": self.system_status,
            "scale_level": self.scale_level,
            "ai_insight": self.ai_insight
        }
