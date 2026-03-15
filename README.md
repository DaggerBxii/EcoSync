# EcoSync - AI-Powered Energy Optimization System

## Project Overview

EcoSync is a full-stack sustainability orchestration platform that uses machine learning to optimize building energy consumption based on real-time occupancy prediction and anomaly detection. The system synchronizes energy usage with renewable energy availability (solar, wind, water) to minimize waste and carbon footprint.

### Key Features
- **ML-Based Predictions**: RandomForest and GradientBoosting models for occupancy and energy prediction
- **Anomaly Detection**: Isolation Forest algorithm detects unusual energy patterns
- **Real-Time Updates**: WebSocket-based live data streaming (2-second intervals)
- **AI Insights**: Google Gemini integration for natural language explanations
- **Multi-Resource Tracking**: Electricity, Water, HVAC, Lighting, Air Quality
- **Natural Language Control**: Control building resources using conversational commands

### Architecture
```
┌──────────────────┐      WebSocket       ┌──────────────────┐
│    Frontend      │ ◄──────────────────► │     Backend      │
│   (Next.js)      │      (2 sec)         │   (FastAPI)      │
│   TypeScript     │                      │    Python        │
│   Tailwind CSS   │                      │                  │
└──────────────────┘                      └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │   AI Module      │
                                          │   (EcoBrain)     │
                                          │                  │
                                          │  • Gemini AI     │
                                          │  • Occupancy ML  │
                                          │  • Anomaly Detect│
                                          └──────────────────┘
```

---

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **AI/ML**: scikit-learn, PyOD (Isolation Forest), Google Gemini
- **Database**: SQLite
- **Real-time**: WebSockets
- **Server**: Uvicorn

### Frontend
- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Maps**: Leaflet / React-Leaflet
- **Real-time**: Native WebSocket API

---

## Project Structure

```
EcoSync/
├── backend/
│   ├── src/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── ai_module.py         # EcoBrain AI class (Gemini integration)
│   │   ├── models.py            # Pydantic data models & data store
│   │   ├── alert_manager.py     # Alert lifecycle management
│   │   ├── remediation_engine.py # Automated remediation logic
│   │   ├── data_logger.py       # SQLite persistence
│   │   ├── model_trainer.py     # ML model training pipeline
│   │   ├── chatbot.py           # Original chatbot implementation
│   │   ├── chatbot_engine.py    # Enhanced chatbot engine
│   │   ├── new_chatbot.py       # NEW: Enhanced chatbot with resource control
│   │   └── ai_controller.py     # Natural language resource controller
│   ├── models/                  # Trained ML model files
│   ├── tests/                   # Test files
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variables template
│   └── setup.bat / start.bat    # Windows startup scripts
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── dashboard/       # Dashboard page
│   │   │   ├── zones/           # Zone management
│   │   │   ├── alerts/          # Alert management
│   │   │   ├── chatbot/         # NEW: Enhanced chatbot page
│   │   │   └── auth/            # Authentication
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utility libraries
│   │   └── types/               # TypeScript type definitions
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── ARCHITECTURE.md              # Detailed architecture docs
├── VERCEL_DEPLOYMENT.md         # Deployment guide
└── Implmenation Plan.md         # Development milestones
```

---

## Building and Running

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env and set GEMINI_API_KEY

# Train ML models (first time only)
python src/model_trainer.py

# Start development server
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or use Windows batch files
setup.bat    # Install and train
start.bat    # Start server
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Environment Variables

**Backend (`backend/.env`):**
```
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGINS=https://your-frontend.vercel.app,*
```

**Frontend (Vercel/Environment):**
```
NEXT_PUBLIC_API_URL=https://your-backend-url
NEXT_PUBLIC_WS_URL=wss://your-backend-url/ws
```

---

## API Endpoints

### Core Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/status` | GET | Comprehensive system status |
| `/ws` | WebSocket | Real-time data stream (2s interval) |

### Zone Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/zones` | GET | List all zones |
| `/api/zones/{zone_id}` | GET | Get zone details |
| `/api/zones/{zone_id}/metrics` | GET | Zone metrics |

### Resource Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resources` | GET | List all resources |
| `/api/resources/{id}` | GET | Get resource details |
| `/api/resources/{id}/control` | POST | Control a resource |
| `/api/resources/{id}/predictions` | GET | AI predictions |

### Alert Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/alerts` | GET | List alerts (filterable) |
| `/api/alerts/summary` | GET | Alert statistics |
| `/api/alerts/{id}/acknowledge` | POST | Acknowledge alert |
| `/api/alerts/{id}/resolve` | POST | Resolve alert |

### AI Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/info` | GET | AI module status |
| `/api/ai/recommendations` | GET | Building optimization recommendations |

### NEW: Chatbot Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chatbot/message` | POST | Process chatbot message with resource control |
| `/api/chatbot/init` | GET | Initialize chatbot session |
| `/api/chatbot/reset` | POST | Reset chatbot conversation |

### NEW: Natural Language Control
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/control/natural` | POST | Execute natural language control commands |
| `/api/control/history` | GET | Get control command history |
| `/api/control/batch` | POST | Execute multiple control actions |

---

## NEW: Enhanced Chatbot with Resource Control

The new EcoSync chatbot features advanced natural language processing for building resource management:

### Supported Commands
- **Water Control**: "Limit water on floor 1 to 60%"
- **HVAC Control**: "Set HVAC on floor 2 to 21°C"
- **Lighting Control**: "Dim lights on floor 3 to 50%"
- **Electricity Control**: "Optimize electricity on floor 4"
- **Information Queries**: "How efficient is the building?"

### Implementation Details
- Uses Google GenAI SDK for natural language understanding
- Integrates with AIController for resource manipulation
- Maintains conversation context per user
- Provides real-time feedback on control actions

### Frontend Integration
- Enhanced chat interface with resource control indicators
- Quick action buttons for common commands
- Real-time status updates

---

## Sync Contract (WebSocket Data Format)

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

## Data Models

### Resource Types
- `ELECTRICITY` - Power consumption (kW)
- `WATER` - Water usage (gal/min)
- `HVAC` - Climate control (°C)
- `LIGHTING` - Light levels (%)
- `AIR_QUALITY` - Air quality index

### Alert Severity Levels
- `INFO` - Informational
- `WARNING` - Attention needed
- `CRITICAL` - Immediate action required

### Alert Status Lifecycle
```
ACTIVE → MONITORING → RESOLVED
                  ↘ ESCALATED (to technician)
```

---

## Testing

### Backend Tests
```bash
cd backend
pytest                                    # Run all tests
pytest test_api_endpoints.py             # API tests
pytest test_websocket.py                 # WebSocket tests
pytest test_ai_integration.py            # AI module tests
```

### Frontend Tests
```bash
cd frontend
npm test                                  # Run tests
npm run lint                              # Lint check
```

---

## Development Conventions

### Code Style
- **Python**: Follow PEP 8, use type hints, docstrings for classes/functions
- **TypeScript**: Strict mode enabled, prefer functional components with hooks
- **Naming**: snake_case for Python, camelCase for TypeScript

### Git Workflow
- Main branch: `main`
- Feature branches: `feature/description`
- Commit messages: Clear, concise, focus on "why"

### Component Structure (Frontend)
- One component per file
- Shared components in `components/shared/`
- Feature-specific components in respective folders

### API Design
- RESTful endpoints under `/api/`
- WebSocket at `/ws`
- All responses in JSON
- Error handling with appropriate HTTP status codes

---

## Deployment

### Vercel (Frontend)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy on push to main branch

### Backend (with ngrok for demo)
1. Start backend: `uvicorn src.main:app --host 0.0.0.0 --port 8000`
2. Start ngrok: `ngrok http 8000`
3. Update frontend environment variables with ngrok URL

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/src/main.py` | FastAPI app, routes, WebSocket handler |
| `backend/src/ai_module.py` | EcoBrain AI class with Gemini integration |
| `backend/src/models.py` | Data models, enums, BuildingDataStore |
| `backend/src/alert_manager.py` | Alert creation, escalation logic |
| `backend/src/new_chatbot.py` | NEW: Enhanced chatbot with resource control |
| `backend/src/ai_controller.py` | Natural language resource controller |
| `frontend/src/app/page.tsx` | Landing page with live dashboard |
| `frontend/src/app/chatbot/page.tsx` | NEW: Enhanced chatbot interface |

---

## AI Module (EcoBrain)

The AI module provides:
- **Occupancy Prediction**: RandomForest-based prediction from time features
- **Energy Prediction**: GradientBoosting for power consumption
- **Anomaly Detection**: Isolation Forest for unusual patterns
- **Natural Language Insights**: Google Gemini for explanations

### Fallback Mode
When Gemini API is unavailable, the system uses rule-based predictions based on:
- Time of day (night, morning rush, work hours, evening)
- Day of week (reduced occupancy on weekends)
- Historical patterns

---

## Future Roadmap

### Planned Features
- Multi-perspective support (Consumer, Enterprise, Data Center)
- EV charging optimization
- Smart home integration (HomeKit, Alexa)
- Multi-building management
- Kubernetes integration for data centers
- Carbon credit tracking

See `ARCHITECTURE.md` for detailed multi-perspective architecture plans.