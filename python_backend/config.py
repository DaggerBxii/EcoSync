"""
EcoSync Configuration Settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "EcoSync AI Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./ecosync.db"
    # For PostgreSQL: postgresql+psycopg2://user:password@localhost:5432/ecosync
    
    # External APIs
    OPENWEATHERMAP_API_KEY: Optional[str] = None  # Set to use real weather data
    OPENWEATHERMAP_CITY_ID: str = "5128581"  # Default: New York
    
    # Utility Pricing
    UTILITY_PRICE_PER_KWH: float = 0.12
    UTILITY_CURRENCY: str = "USD"
    
    # AI Settings
    ANOMALY_THRESHOLD: float = 2.0  # Z-score threshold
    EFFICIENCY_IDEAL_WATTAGE_PER_PERSON: float = 50.0
    ML_TRAINING_DAYS: int = 30
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:8080", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
