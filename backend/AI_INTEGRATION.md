# EcoSync AI Integration Documentation

## Overview

EcoSync uses Google Gemini AI for intelligent energy optimization predictions and insights. The AI module (`EcoBrain`) serves real-time predictions to the frontend via WebSocket connections, enabling live energy optimization visualization.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      EcoSync AI Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Input Data → Context Building → Gemini API → Structured Output│
│                                                                 │
│  • Time features    • Historical context   • Predictions       │
│  • Environment      • Anomaly history      • Insights          │
│  • Building state                          • Recommendations   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Module: EcoBrain

### Initialization

```python
from ai_module import EcoBrain

# Initialize with Gemini (requires GEMINI_API_KEY environment variable)
ai = EcoBrain(use_gemini=True)

# Or use fallback mode (rule-based predictions)
ai = EcoBrain(use_gemini=False)
```

### Configuration

Set the `GEMINI_API_KEY` environment variable:

```bash
# Windows
set GEMINI_API_KEY=your-api-key-here

# Linux/Mac
export GEMINI_API_KEY=your-api-key-here
```

Or create a `.env` file in the backend directory:

```
GEMINI_API_KEY=your-api-key-here
```

---

## API Methods

### `get_decision(input_data)`

Get a prediction following the Sync Contract format.

**Input:**
```python
input_data = {
    "hour_of_day": 14,
    "temperature": 22.5,  # optional
    "humidity": 50        # optional
}
```

**Output (Sync Contract):**
```json
{
  "timestamp": "2026-03-15T14:30:00Z",
  "system_status": "Active",
  "scale_level": 0.65,
  "metrics": {
    "watts": 115.5,
    "occupancy": 6,
    "carbon_saved": 0.014
  },
  "ai_insight": "Moderate occupancy (6 people). Normal operations at 116W.",
  "is_anomaly": false,
  "confidence_score": 0.85
}
```

### `get_model_info()`

Get AI module status:

```python
info = ai.get_model_info()
# Returns:
{
    "using_gemini": True,
    "gemini_available": True,
    "model_name": "gemini-2.0-flash",
    "client_initialized": True,
    "historical_samples": 42,
    "anomalies_detected": 2
}
```

### `analyze_anomaly(anomaly_data)`

Get detailed analysis of an anomaly:

```python
analysis = ai.analyze_anomaly({
    "timestamp": "2026-03-15T14:30:00Z",
    "watts": 150,
    "occupancy": 0,
    "description": "High energy with zero occupancy"
})
```

### `get_energy_recommendations(hours_ahead)`

Get optimization recommendations:

```python
recommendations = ai.get_energy_recommendations(hours_ahead=24)
# Returns list of recommendations with time, action, expected_savings, priority
```

---

## Model: Gemini 2.0 Flash

The AI module uses Google's Gemini 2.0 Flash model for:
- Fast, efficient predictions
- Natural language insights
- Anomaly detection with explanations
- Energy optimization recommendations

### Prompt Engineering

The module uses structured prompts that:
1. Provide current context (time, environment, building state)
2. Include historical data for pattern recognition
3. Request JSON-formatted responses for consistency
4. Apply energy management domain knowledge

---

## Fallback Mode

When Gemini is unavailable, the system uses rule-based predictions:

- **Night hours (22:00-06:00):** Low occupancy (0-2), minimal power
- **Morning rush (06:00-09:00):** High occupancy (6-10), ramp up systems
- **Work hours (09:00-17:00):** Moderate occupancy (4-8), normal operations
- **Evening (17:00-22:00):** Decreasing occupancy (2-6), scale down
- **Weekends:** Reduced occupancy across all periods

---

## API Endpoints

### WebSocket: `/ws`
Real-time predictions broadcast every 2 seconds.

### GET `/health`
Health check for monitoring.

### GET `/ai/info`
AI module status (Gemini initialized, model name, etc.).

### GET `/ai/recommendations?hours_ahead=24`
Energy optimization recommendations.

### GET `/metrics`
Performance metrics and historical data stats.

### GET `/anomalies`
Historical anomaly events.

### GET `/status`
Comprehensive system status.

---

## Data Logging

All predictions are logged to SQLite (`ecosync_data.db`):

**Tables:**
- `sensor_readings` - Raw sensor data
- `predictions` - AI predictions with actuals
- `anomalies` - Detected anomaly events

---

## File Structure

```
backend/
├── src/
│   ├── ai_module.py          # EcoBrain class (Gemini integration)
│   ├── data_logger.py        # SQLite logging
│   ├── main.py               # FastAPI application
│   └── models.py             # Pydantic schemas
├── requirements.txt          # Dependencies (includes google-genai)
└── data/
    └── ecosync_data.db
```

---

## Installation

```bash
cd backend
pip install -r requirements.txt

# Set your Gemini API key
set GEMINI_API_KEY=your-api-key-here

# Run the server
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

---

## AI Ethics & Transparency

### Transparency
- All predictions include confidence scores
- AI insights explain the reasoning in plain language
- Fallback mode is clearly indicated when Gemini is unavailable

### Privacy
- Only aggregate occupancy counts (no individual tracking)
- No personally identifiable information stored
- Building data stays local (only sent to Gemini API for processing)

### Human Oversight
- Anomalies are flagged for human investigation
- Facility managers can override AI decisions
- All predictions logged for audit trail

---

## Troubleshooting

### Gemini Not Initializing
```
EcoBrain: GEMINI_API_KEY not found in environment.
```
**Solution:** Set the `GEMINI_API_KEY` environment variable.

### Package Not Installed
```
Warning: google-genai not installed. Using fallback mode.
```
**Solution:** Run `pip install google-genai`

### API Errors
If Gemini API returns errors, the system automatically falls back to rule-based predictions.

---

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Prediction Latency | < 500ms | ~200-400ms |
| Confidence Score | > 0.7 | ~0.8-0.9 |
| Uptime | 99.9% | With fallback |

---

## Future Enhancements

1. **Fine-tuning** - Custom model training on building-specific data
2. **Multi-building** - Support for multiple buildings with different profiles
3. **Weather Integration** - External weather data for better predictions
4. **Demand Response** - Grid-aware energy optimization
5. **Predictive Maintenance** - Equipment failure prediction