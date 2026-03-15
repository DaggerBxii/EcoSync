# EcoSync Backend

The backend service for the EcoSync system that manages real-time energy optimization data and communicates with the frontend via WebSockets.

## Overview

The backend serves as the central hub that:
- Runs AI predictions every 2 seconds
- Broadcasts real-time energy optimization data to connected frontends
- Manages WebSocket connections
- Provides health check endpoints

## Architecture

The backend follows the "Sync Contract" JSON structure:
```json
{
  "timestamp": "2026-03-14T16:20:00Z",
  "system_status": "Scaling Down",
  "scale_level": 0.25,
  "metrics": {
    "watts": 105.2,
    "occupancy": 0,
    "carbon_saved": 0.45
  },
  "ai_insight": "Deep Eco-Mode: No human load detected.",
  "is_anomaly": false
}
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
uvicorn src.main:app --reload
```

## Endpoints

- `GET /health` - Health check endpoint
- `WS /ws` - WebSocket endpoint for real-time data

## Docker

Build and run with Docker:
```bash
docker build -t ecosync-backend .
docker run -p 8000:8000 ecosync-backend
```