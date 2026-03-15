"""
Data Logger for EcoSync
Handles storage and retrieval of historical sensor data and predictions.
Uses SQLite for simplicity and portability.
"""

import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from contextlib import contextmanager


class DataLogger:
    """
    Manages historical data storage for model training and analysis.
    Stores: sensor readings, AI predictions, and actual outcomes.
    """

    def __init__(self, db_path: str = "ecosync_data.db"):
        self.db_path = db_path
        self._init_database()

    @contextmanager
    def get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def _init_database(self):
        """Initialize database tables."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Table for sensor readings
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sensor_readings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    hour_of_day INTEGER NOT NULL,
                    day_of_week INTEGER NOT NULL,
                    day_of_year INTEGER NOT NULL,
                    is_weekend INTEGER NOT NULL,
                    season TEXT,
                    watts REAL,
                    occupancy INTEGER,
                    temperature REAL,
                    humidity REAL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Table for AI predictions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    hour_of_day INTEGER NOT NULL,
                    day_of_week INTEGER NOT NULL,
                    predicted_occupancy INTEGER,
                    predicted_watts REAL,
                    actual_occupancy INTEGER,
                    actual_watts REAL,
                    is_anomaly INTEGER DEFAULT 0,
                    confidence_score REAL,
                    system_status TEXT,
                    scale_level REAL,
                    ai_insight TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Table for anomaly events
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS anomalies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    anomaly_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    watts REAL,
                    occupancy INTEGER,
                    description TEXT,
                    resolved INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Create indexes for faster queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_sensor_timestamp 
                ON sensor_readings(timestamp)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_prediction_timestamp 
                ON predictions(timestamp)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_anomaly_timestamp 
                ON anomalies(timestamp)
            """)

    def log_sensor_reading(
        self,
        watts: float,
        occupancy: int,
        timestamp: Optional[datetime] = None,
        temperature: Optional[float] = None,
        humidity: Optional[float] = None
    ):
        """Log a sensor reading to the database."""
        if timestamp is None:
            timestamp = datetime.now()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sensor_readings (
                    timestamp, hour_of_day, day_of_week, day_of_year,
                    is_weekend, season, watts, occupancy, temperature, humidity
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                timestamp.isoformat(),
                timestamp.hour,
                timestamp.weekday(),
                timestamp.timetuple().tm_yday,
                1 if timestamp.weekday() >= 5 else 0,
                self._get_season(timestamp),
                watts,
                occupancy,
                temperature,
                humidity
            ))

    def log_prediction(
        self,
        prediction_data: Dict[str, Any],
        actual_occupancy: Optional[int] = None,
        actual_watts: Optional[float] = None
    ):
        """Log an AI prediction to the database."""
        timestamp = datetime.fromisoformat(prediction_data["timestamp"].replace("Z", "+00:00"))

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO predictions (
                    timestamp, hour_of_day, day_of_week,
                    predicted_occupancy, predicted_watts,
                    actual_occupancy, actual_watts,
                    is_anomaly, confidence_score,
                    system_status, scale_level, ai_insight
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prediction_data["timestamp"],
                timestamp.hour,
                timestamp.weekday(),
                prediction_data["metrics"]["occupancy"],
                prediction_data["metrics"]["watts"],
                actual_occupancy,
                actual_watts,
                1 if prediction_data.get("is_anomaly", False) else 0,
                prediction_data.get("confidence_score", 0.0),
                prediction_data["system_status"],
                prediction_data["scale_level"],
                prediction_data["ai_insight"]
            ))

    def log_anomaly(
        self,
        anomaly_type: str,
        severity: str,
        watts: float,
        occupancy: int,
        description: str,
        timestamp: Optional[datetime] = None
    ):
        """Log an anomaly event to the database."""
        if timestamp is None:
            timestamp = datetime.now()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO anomalies (
                    timestamp, anomaly_type, severity, watts, occupancy, description
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                timestamp.isoformat(),
                anomaly_type,
                severity,
                watts,
                occupancy,
                description
            ))

    def get_historical_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """Retrieve historical sensor data for model training."""
        start_date = datetime.now() - timedelta(days=days)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM sensor_readings
                WHERE timestamp >= ?
                ORDER BY timestamp DESC
            """, (start_date.isoformat(),))

            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_prediction_history(self, days: int = 7) -> List[Dict[str, Any]]:
        """Retrieve prediction history for performance analysis."""
        start_date = datetime.now() - timedelta(days=days)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM predictions
                WHERE timestamp >= ? AND actual_occupancy IS NOT NULL
                ORDER BY timestamp DESC
            """, (start_date.isoformat(),))

            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_anomaly_history(self, days: int = 30, include_resolved: bool = False) -> List[Dict[str, Any]]:
        """Retrieve anomaly history for analysis."""
        start_date = datetime.now() - timedelta(days=days)

        with self.get_connection() as conn:
            cursor = conn.cursor()

            if include_resolved:
                cursor.execute("""
                    SELECT * FROM anomalies
                    WHERE timestamp >= ?
                    ORDER BY timestamp DESC
                """, (start_date.isoformat(),))
            else:
                cursor.execute("""
                    SELECT * FROM anomalies
                    WHERE timestamp >= ? AND resolved = 0
                    ORDER BY timestamp DESC
                """, (start_date.isoformat(),))

            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_model_performance_metrics(self) -> Dict[str, Any]:
        """Calculate model performance metrics from stored predictions."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            cursor.execute("""
                SELECT 
                    predicted_occupancy,
                    actual_occupancy,
                    predicted_watts,
                    actual_watts
                FROM predictions
                WHERE actual_occupancy IS NOT NULL
                ORDER BY timestamp DESC
                LIMIT 1000
            """)

            rows = cursor.fetchall()

            if not rows:
                return {
                    "mae_occupancy": None,
                    "mae_watts": None,
                    "rmse_occupancy": None,
                    "rmse_watts": None,
                    "sample_count": 0
                }

            import numpy as np

            pred_occ = [r["predicted_occupancy"] for r in rows]
            act_occ = [r["actual_occupancy"] for r in rows]
            pred_watts = [r["predicted_watts"] for r in rows]
            act_watts = [r["actual_watts"] for r in rows]

            # Calculate MAE
            mae_occ = sum(abs(p - a) for p, a in zip(pred_occ, act_occ)) / len(rows)
            mae_watts = sum(abs(p - a) for p, a in zip(pred_watts, act_watts)) / len(rows)

            # Calculate RMSE
            rmse_occ = (sum((p - a) ** 2 for p, a in zip(pred_occ, act_occ)) / len(rows)) ** 0.5
            rmse_watts = (sum((p - a) ** 2 for p, a in zip(pred_watts, act_watts)) / len(rows)) ** 0.5

            return {
                "mae_occupancy": round(mae_occ, 3),
                "mae_watts": round(mae_watts, 3),
                "rmse_occupancy": round(rmse_occ, 3),
                "rmse_watts": round(rmse_watts, 3),
                "sample_count": len(rows)
            }

    @staticmethod
    def _get_season(timestamp: datetime) -> str:
        """Determine season based on month."""
        month = timestamp.month
        if month in [12, 1, 2]:
            return "winter"
        elif month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:
            return "summer"
        else:
            return "fall"

    def clear_old_data(self, days_to_keep: int = 365):
        """Clear data older than specified days to manage database size."""
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)

        with self.get_connection() as conn:
            cursor = conn.cursor()

            cursor.execute("DELETE FROM sensor_readings WHERE timestamp < ?", (cutoff_date.isoformat(),))
            cursor.execute("DELETE FROM predictions WHERE timestamp < ?", (cutoff_date.isoformat(),))
            cursor.execute("DELETE FROM anomalies WHERE timestamp < ? AND resolved = 1", (cutoff_date.isoformat(),))
