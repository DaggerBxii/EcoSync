# EcoSync Python Backend

⚡ **AI-Powered Energy Management System - Python Implementation**

A FastAPI-based backend for real-time energy monitoring and optimization using machine learning.

## Features

### Core AI Capabilities

| Service | Description |
|---------|-------------|
| **AiEngineService** | Real-time anomaly detection using Z-Score analysis |
| **PredictiveAnalyticsService** | 24-hour power demand forecasting |
| **AdaptiveBaselineService** | K-Means clustering for usage patterns |
| **OptimizationEngineService** | Q-Learning for power optimization |
| **WeatherService** | OpenWeatherMap integration for HVAC modeling |
| **PricingService** | Time-of-use pricing and cost optimization |
| **InsightGeneratorService** | Explainable AI with recommendations |

## Quick Start

### 1. Install Dependencies

```bash
cd python_backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file:

```bash
# .env
APP_NAME=EcoSync AI Engine
DEBUG=True
PORT=8000

# Database (SQLite for development)
DATABASE_URL=sqlite+aiosqlite:///./ecosync.db

# External APIs (optional)
OPENWEATHERMAP_API_KEY=your_api_key_here
OPENWEATHERMAP_CITY_ID=5128581

# Utility Pricing
UTILITY_PRICE_PER_KWH=0.12
UTILITY_CURRENCY=USD
```

### 3. Run the Application

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access the Application

- **API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Root Endpoint**: http://localhost:8000

## API Endpoints

### Weather & External Data

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/weather` | GET | Current weather data |
| `/api/pricing` | GET | Electricity pricing info |
| `/api/pricing/hourly` | GET | Hourly prices for today |
| `/api/pricing/savings` | GET | Calculate load shifting savings |

### AI & Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recommendations` | GET | AI-generated recommendations |
| `/api/forecast` | GET | 24-hour power forecast |
| `/api/ai/process` | POST | Process sensor data through AI |
| `/api/ai/history` | GET | Get AI power history |
| `/api/optimization` | GET | Q-Learning optimization recommendation |

### Statistics & Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Historical statistics |
| `/api/data-quality` | GET | Data quality metrics |
| `/api/summary/daily` | GET | Daily summary report |
| `/api/summary/weekly` | GET | Week-over-week comparison |
| `/api/ml/accuracy` | GET | ML model accuracy |
| `/api/ml/baselines` | GET | Adaptive baseline patterns |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `/ws` | Real-time AI updates (2-second intervals) |
| `/ws/updates` | Alternative WebSocket endpoint |

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test class
pytest tests/test_services.py::TestAiEngineService -v
```

## Project Structure

```
python_backend/
├── main.py                     # FastAPI application entry point
├── config.py                   # Configuration settings
├── database.py                 # Database configuration
├── models.py                   # SQLAlchemy models
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (create manually)
│
├── api/
│   ├── __init__.py
│   ├── routes.py               # REST API routes
│   └── websocket.py            # WebSocket handlers
│
├── services/
│   ├── __init__.py
│   ├── ai_engine_service.py
│   ├── predictive_analytics_service.py
│   ├── adaptive_baseline_service.py
│   ├── optimization_engine_service.py
│   ├── weather_service.py
│   ├── pricing_service.py
│   ├── insight_generator_service.py
│   ├── training_data_service.py
│   └── sensor_simulator.py
│
└── tests/
    ├── __init__.py
    └── test_services.py
```

## Example Usage

### REST API Example

```python
import httpx

# Get weather data
async with httpx.AsyncClient() as client:
    response = await client.get("http://localhost:8000/api/weather")
    weather = response.json()
    print(f"Temperature: {weather['temperature_c']}°C")

# Process AI decision
async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8000/api/ai/process",
        params={"occupancy": 50, "wattage": 600.0}
    )
    ai_decision = response.json()
    print(f"Status: {ai_decision['system_status']}")
```

### WebSocket Example

```python
import asyncio
import websockets

async def listen():
    async with websockets.connect("ws://localhost:8000/ws") as ws:
        while True:
            data = await ws.recv()
            print(f"Received: {data}")

asyncio.run(listen())
```

### Service Usage (Direct)

```python
from services.ai_engine_service import AiEngineService
from services.pricing_service import PricingService

# AI Engine
ai = AiEngineService()
await ai.initialize()
result = await ai.process_cycle(occupancy=50, current_wattage=600.0)
print(result["ai_insight"])

# Pricing
pricing = PricingService()
price = pricing.get_current_price_per_kwh()
print(f"Current price: ${price}/kWh")
```

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./ecosync.db` | Database connection string |
| `PORT` | `8000` | Server port |
| `DEBUG` | `True` | Debug mode |
| `OPENWEATHERMAP_API_KEY` | `None` | Weather API key |
| `UTILITY_PRICE_PER_KWH` | `0.12` | Base electricity price |

## Database Migration

For production with PostgreSQL:

```bash
# Install PostgreSQL driver
pip install psycopg2-binary

# Update DATABASE_URL in .env
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/ecosync
```

## Monitoring

- **Prometheus Metrics**: `/metrics` (when configured)
- **Health Check**: `/health`
- **API Documentation**: `/docs`

## License

MIT License

## Support

For issues and feature requests, please open an issue on GitHub.

---

**Built with FastAPI, SQLAlchemy, and scikit-learn**
