# EcoSync

**AI-Powered Energy Optimization System**

EcoSync uses machine learning to optimize building energy consumption based on real-time occupancy prediction and anomaly detection.

---

## Features

- 🤖 **ML-Based Predictions** - RandomForest and GradientBoosting models for occupancy and energy prediction
- 🔍 **Anomaly Detection** - Isolation Forest algorithm detects unusual energy patterns
- ⚡ **Real-Time Updates** - WebSocket-based live data streaming (2-second intervals)
- 📊 **Confidence Scoring** - Transparent prediction reliability metrics
- 💡 **AI Insights** - Natural language explanations for all decisions
- 📈 **Performance Tracking** - SQLite logging for continuous model improvement

---

## Architecture

```
┌──────────────────┐      WebSocket       ┌──────────────────┐
│                  │ ◄──────────────────► │                  │
│    Frontend      │      (2 sec)         │     Backend      │
│   (Next.js)      │                      │   (FastAPI)      │
│                  │                      │                  │
└──────────────────┘                      └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │   AI Module      │
                                          │   (EcoBrain)     │
                                          │                  │
                                          │  • Occupancy ML  │
                                          │  • Watts ML      │
                                          │  • Anomaly Detect│
                                          └──────────────────┘
```

---

## Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Train initial ML models
python src/model_trainer.py

# Start the server
python -m uvicorn src.main:app --reload
```

Or use the provided Windows batch files:
- `setup.bat` - Install and train
- `start.bat` - Start server

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## API Endpoints

| Endpoint | Type | Description |
|----------|------|-------------|
| `/health` | GET | Health check |
| `/ws` | WebSocket | Real-time predictions |
| `/metrics` | GET | Model performance |
| `/ai/info` | GET | AI module status |
| `/status` | GET | System status |

Full API docs: http://localhost:8000/docs

---

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

---

## Project Structure

```
EcoSync/
├── backend/
│   ├── src/
│   │   ├── ai_module.py       # AI/ML logic
│   │   ├── model_trainer.py   # Training pipeline
│   │   ├── data_logger.py     # Data persistence
│   │   └── main.py            # FastAPI app
│   ├── models/                # Trained ML models
│   ├── requirements.txt
│   └── AI_INTEGRATION.md
├── frontend/
│   ├── app/                   # Next.js app
│   ├── package.json
│   └── README.md
└── README.md
```

---

## AI Models

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Occupancy Predictor | RandomForest | Predict building occupancy |
| Energy Predictor | GradientBoosting | Predict power consumption |
| Anomaly Detector | Isolation Forest | Detect unusual patterns |

See [AI_INTEGRATION.md](./backend/AI_INTEGRATION.md) for detailed documentation.

---

## Development

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Code Style

```bash
# Backend linting
cd backend
flake8 src/

# Frontend linting
cd frontend
npm run lint
```

---

## Team Roles

| Role | Responsibilities |
|------|------------------|
| Backend Developer | FastAPI, WebSocket, data flow |
| AI Specialist | ML models, training, predictions |
| Frontend Developer | Next.js, WebSocket listener, UI |
| UI/UX Designer | Visual design, gauges, alerts |
| DevOps Lead | Docker, cloud deployment, tunneling |
| Research & Docs | SPAIN audit, AI ethics, compliance |
| Product Lead | Presentation, demo, QA |

---

## Tech Stack

**Backend:**
- Python 3.8+
- FastAPI
- scikit-learn (RandomForest, GradientBoosting)
- PyOD (Isolation Forest)
- SQLite

**Frontend:**
- Next.js
- React
- Tailwind CSS
- WebSocket API

**Infrastructure:**
- Docker
- Kubernetes (EKS)
- Terraform

---

## License

MIT
