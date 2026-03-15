# EcoSync AI Integration Documentation

## Overview

EcoSync uses machine learning to predict building occupancy, energy consumption, and detect anomalies in real-time. The AI module (`EcoBrain`) serves predictions to the frontend via WebSocket connections, enabling live energy optimization visualization.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      EcoSync AI Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Input Features → Feature Engineering → ML Models → Insights   │
│                                                                 │
│  • Hour of day    • Cyclical encoding   • Occupancy     • NLP  │
│  • Day of week    • Rolling averages    • Watts         • UI   │
│  • Season         • Historical baselines• Anomaly       • Logs │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Models

### 1. Occupancy Predictor (RandomForestRegressor)

**Purpose:** Predict number of occupants based on time and historical patterns.

**Input Features (19 total):**
- `hour_sin`, `hour_cos` - Cyclical hour encoding
- `dow_sin`, `dow_cos` - Day of week cyclical encoding
- `doy_sin`, `doy_cos` - Day of year (seasonal) encoding
- `is_weekend`, `is_night`, `is_morning_rush`, `is_work_hours`, `is_evening` - Time period flags
- `season_*` - One-hot encoded season (spring/summer/fall/winter)
- `historical_avg_occupancy` - Rolling average occupancy
- `historical_avg_watts` - Rolling average energy consumption
- `temperature`, `humidity` - Environmental factors (optional)

**Output:** Predicted occupancy (0-15) + confidence score

**Performance Metrics:**
- MAE (Mean Absolute Error)
- RMSE (Root Mean Square Error)
- R² Score

---

### 2. Energy Predictor (GradientBoostingRegressor)

**Purpose:** Predict energy consumption (watts) based on occupancy and time features.

**Input Features:** Same 19 features as occupancy model

**Output:** Predicted watts + confidence score

---

### 3. Anomaly Detector (Isolation Forest)

**Purpose:** Detect unusual patterns (e.g., high energy with zero occupancy).

**Input Features:** Same 19 features

**Output:** Anomaly flag (-1 = anomaly, 1 = normal) + anomaly score

**Anomaly Types:**
- **Equipment malfunction** - High watts, zero occupancy
- **Unauthorized usage** - After-hours activity
- **Sensor anomaly** - Impossible values or sudden spikes

---

## Feature Engineering

### Cyclical Encoding

Time features use sine/cosine transformation to capture cyclical nature:

```python
hour_sin = sin(2π × hour / 24)
hour_cos = cos(2π × hour / 24)
```

This ensures 23:00 and 00:00 are close in feature space (not far apart as raw values).

### Rolling Averages

Historical averages provide context:
- 1-hour rolling average
- 6-hour rolling average
- 24-hour rolling average
- Same time-slot historical baseline

---

## Confidence Scoring

Each prediction includes a confidence score (0.5 - 1.0):

**Calculation:**
- For tree-based models: Based on prediction variance across estimators
- Low variance = high confidence
- High variance = low confidence (model uncertain)

**Usage:**
- Displayed in UI for transparency
- Low confidence triggers fallback to rule-based logic
- Logged for performance monitoring

---

## AI Insight Generation

Uses template-based NLP to generate human-readable explanations:

```python
# Example templates
{
    "anomaly": "⚠️ Anomaly detected: High energy usage ({watts}W) with zero occupancy.",
    "eco_mode": "Deep Eco-Mode: No human load detected. Building is unoccupied.",
    "low_occupancy": "Low occupancy period ({occ} people). Reducing power to {watts}W.",
    "normal": "Moderate occupancy ({occ} people). Normal operations at {watts}W.",
    "high_occupancy": "High occupancy ({occ} people). Full capacity operations."
}
```

---

## API Endpoints

### WebSocket: `/ws`
Real-time predictions broadcast every 2 seconds.

### GET `/health`
Health check for monitoring.

### GET `/metrics`
Model performance metrics (MAE, RMSE, sample count).

### GET `/ai/info`
AI module status (models loaded, using fallback, etc.).

### GET `/anomalies`
Historical anomaly events.

### GET `/status`
Comprehensive system status.

---

## Sync Contract (Output Format)

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
  "ai_insight": "Deep Eco-Mode: No human load detected. Building is unoccupied.",
  "is_anomaly": false,
  "confidence_score": 0.87
}
```

---

## Data Logging

All predictions are logged to SQLite (`ecosync_data.db`):

**Tables:**
- `sensor_readings` - Raw sensor data
- `predictions` - AI predictions with actuals (when available)
- `anomalies` - Detected anomaly events

**Purpose:**
- Model retraining with real data
- Performance tracking over time
- Anomaly investigation and resolution

---

## Model Training

### Initial Training (Synthetic Data)

```bash
cd backend
python src/model_trainer.py
```

This generates 10,000 synthetic samples with realistic patterns:
- Time-based occupancy variations
- Weekend vs weekday differences
- Morning/evening rush patterns
- 5% anomaly rate

### Retraining with Real Data

When real sensor data is available:

1. Collect data via `data_logger.py`
2. Update `model_trainer.py` to load from database
3. Run training pipeline
4. Models saved to `backend/models/`

---

## File Structure

```
backend/
├── src/
│   ├── ai_module.py          # EcoBrain class (main AI logic)
│   ├── model_trainer.py      # Training pipeline
│   ├── data_logger.py        # SQLite logging
│   ├── main.py               # FastAPI application
│   └── models.py             # Pydantic schemas
├── models/
│   ├── occupancy_model.joblib
│   ├── watts_model.joblib
│   ├── anomaly_model.joblib
│   ├── scaler.joblib
│   └── feature_engineer.joblib
└── data/
    └── ecosync_data.db
```

---

## AI Ethics & Fair Play

### Transparency
- Confidence scores displayed for all predictions
- AI insights explain reasoning in plain language
- Model performance metrics publicly accessible via `/metrics`

### Bias Mitigation
- Models trained on diverse synthetic data covering all time periods
- Weekend/holiday patterns explicitly encoded
- No demographic or personal data collected

### Human Oversight
- Anomalies flagged for human investigation
- Facility managers can override AI decisions
- All predictions logged for audit trail

### Data Privacy
- Only aggregate occupancy counts (no individual tracking)
- No personally identifiable information stored
- Data retention policy: 365 days (configurable)

---

## Fallback Behavior

If trained models are unavailable:
- System gracefully degrades to rule-based predictions
- Clear logging indicates fallback mode
- Confidence scores reflect increased uncertainty
- Core functionality remains operational

---

## Performance Targets

| Metric | Target | Current (Synthetic) |
|--------|--------|---------------------|
| Occupancy MAE | < 1.5 | ~1.2 |
| Watts MAE | < 15W | ~12W |
| Anomaly Precision | > 0.85 | ~0.88 |
| Anomaly Recall | > 0.80 | ~0.82 |
| Prediction Latency | < 100ms | ~20ms |

---

## Future Enhancements

1. **Online Learning** - Continuous model updates with new data
2. **SHAP Explainability** - Feature importance for each prediction
3. **Carbon Optimization** - Grid carbon intensity integration
4. **Multi-zone Support** - Per-zone occupancy and energy prediction
5. **Weather Integration** - External temperature/humidity effects

---

## Troubleshooting

### Models Not Loading
```
EcoBrain: Model file not found: ...
```
**Solution:** Run `python src/model_trainer.py` to generate models.

### High Anomaly Rate
**Possible causes:**
- Sensor malfunction
- Model drift (retrain with recent data)
- Actual building anomalies (investigate)

### Low Confidence Scores
**Possible causes:**
- Insufficient training data
- High variance in building patterns
- Unusual conditions not in training set

---

## Contact

For AI-related questions, refer to the AI Specialist role in the implementation plan.
