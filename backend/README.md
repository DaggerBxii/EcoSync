# EcoSync Backend

The backend service for the EcoSync system that manages real-time energy optimization data and communicates with the frontend via WebSockets.

## Overview

The backend serves as the central hub that:
- Runs AI predictions every 2 seconds using trained ML models
- Broadcasts real-time energy optimization data to connected frontends
- Manages WebSocket connections
- Provides health check and metrics endpoints

## AI Integration

The backend uses three ML models:

1. **Occupancy Predictor** (RandomForest) - Predicts building occupancy
2. **Energy Predictor** (GradientBoosting) - Predicts power consumption
3. **Anomaly Detector** (Isolation Forest) - Detects unusual patterns

See [AI_INTEGRATION.md](./AI_INTEGRATION.md) for detailed documentation.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Train ML Models (Required First Run)

```bash
python src/model_trainer.py
```

This generates initial models using synthetic data. Models are saved to `models/` directory.

### 3. Run the Server

```bash
python -m uvicorn src.main:app --reload
```

Or use the provided batch files (Windows):
- `setup.bat` - Install dependencies and train models
- `start.bat` - Start the server

## Endpoints

| Endpoint | Type | Description |
|----------|------|-------------|
| `/health` | GET | Health check |
| `/ws` | WebSocket | Real-time predictions (2s interval) |
| `/metrics` | GET | Model performance metrics |
| `/ai/info` | GET | AI module status |
| `/anomalies` | GET | Historical anomaly events |
| `/status` | GET | Comprehensive system status |

## API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Sync Contract

All WebSocket messages follow this JSON structure:

```json
{
  "timestamp": "2026-03-15T16:20:00Z",
  "system_status": "Eco Mode",
  "scale_level": 0.25,
  "metrics": {
    "watts": 105.2,
    "occupancy": 0,
    "carbon_saved": 0.045
  },
  "ai_insight": "Deep Eco-Mode: No human load detected.",
  "is_anomaly": false,
  "confidence_score": 0.87
}
```

## Project Structure

```
backend/
├── src/
│   ├── ai_module.py          # EcoBrain AI module
│   ├── model_trainer.py      # ML training pipeline
│   ├── data_logger.py        # SQLite data logging
│   ├── main.py               # FastAPI application
│   └── models.py             # Pydantic schemas
├── models/                   # Trained ML models (generated)
│   ├── occupancy_model.joblib
│   ├── watts_model.joblib
│   ├── anomaly_model.joblib
│   ├── scaler.joblib
│   └── feature_engineer.joblib
├── data/                     # SQLite database (generated)
│   └── ecosync_data.db
├── requirements.txt
├── AI_INTEGRATION.md
├── setup.bat
└── start.bat
```

## Docker

Build and run with Docker:

```bash
docker build -t ecosync-backend .
docker run -p 8000:8000 ecosync-backend
```

## Development

### Running Tests

```bash
pytest
```

### Code Style

```bash
# Linting
flake8 src/

# Type checking
mypy src/
```

## Troubleshooting

### Models Not Found Error

Run the model trainer:
```bash
python src/model_trainer.py
```

### Port Already in Use

Change the port:
```bash
python -m uvicorn src.main:app --reload --port 8001
```

### Import Errors

Ensure you're in the backend directory and dependencies are installed:
```bash
cd backend
pip install -r requirements.txt
```

## License

MIT
