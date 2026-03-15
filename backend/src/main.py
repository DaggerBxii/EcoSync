from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
import asyncio
import json
from datetime import datetime
import os
from datetime import datetime as dt

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import the AI module
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))
from ai_module import EcoBrain
from data_logger import DataLogger

app = FastAPI(title="EcoSync Backend", version="1.0.0")

# Add CORS middleware to allow connections from Vercel frontend
# Get allowed origins from environment variable, default to "*" for development
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")  # Correct variable name
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    allowed_origins = ["*"]  # Default to allow all for development

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Expose headers for WebSocket connections
    expose_headers=["Access-Control-Allow-Origin"]
)

# Global list to store active websocket connections
active_connections: List[WebSocket] = []

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

# Initialize the AI module with Gemini
ai_brain = EcoBrain(use_gemini=True)

# Initialize data logger
data_logger = DataLogger()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Log connection
        print(f"New WebSocket connection established from: {websocket.client}")
        while True:
            data = await websocket.receive_text()
            # Optionally handle client-to-server messages here
    except WebSocketDisconnect:
        print(f"WebSocket connection disconnected: {websocket.client}")
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/health")
def health_check():
    """Health check endpoint for DevOps monitoring."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"}

@app.get("/metrics")
def get_model_metrics():
    """
    Get AI module performance metrics.
    """
    metrics = data_logger.get_model_performance_metrics()
    ai_info = ai_brain.get_model_info()

    return {
        "performance": metrics,
        "ai_status": {
            "using_gemini": ai_info.get("using_gemini", False),
            "model_name": ai_info.get("model_name", "unknown"),
            "historical_samples": ai_info.get("historical_samples", 0)
        }
    }

@app.get("/ai/info")
def get_ai_info():
    """
    Get AI module information.
    Returns Gemini status and configuration.
    """
    info = ai_brain.get_model_info()
    return info

@app.get("/ai/recommendations")
def get_recommendations(hours_ahead: int = 24):
    """
    Get energy optimization recommendations for the next N hours.
    """
    recommendations = ai_brain.get_energy_recommendations(hours_ahead)
    return {
        "hours_ahead": hours_ahead,
        "recommendations": recommendations
    }

@app.get("/anomalies")
def get_anomalies(days: int = 7, include_resolved: bool = False):
    """
    Get historical anomaly events.

    Args:
        days: Number of days to look back
        include_resolved: Whether to include resolved anomalies
    """
    anomalies = data_logger.get_anomaly_history(days=days, include_resolved=include_resolved)
    return {
        "count": len(anomalies),
        "anomalies": anomalies
    }

@app.get("/status")
def get_system_status():
    """Get comprehensive system status."""
    ai_info = ai_brain.get_model_info()
    performance = data_logger.get_model_performance_metrics()

    return {
        "system": "EcoSync Backend",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ai_module": ai_info,
        "performance": performance,
        "active_connections": len(manager.active_connections)
    }

# Background task to periodically broadcast data to all clients
async def periodic_broadcast():
    while True:
        # Prepare input data for the AI module
        current_hour = dt.now().hour
        input_data = {
            "hour_of_day": current_hour,
        }

        # Get decision from AI module
        data = ai_brain.get_decision(input_data)

        # Log the prediction
        data_logger.log_prediction(data)

        # Broadcast to all connected clients
        await manager.broadcast(json.dumps(data))

        # Wait for 2 seconds before next broadcast
        await asyncio.sleep(2)

# Start the periodic broadcast when the application starts
@app.on_event("startup")
async def startup_event():
    # Run the periodic broadcast in the background
    asyncio.create_task(periodic_broadcast())
    print("EcoSync Backend started. AI Module initialized.")
    print(f"AI info: {ai_brain.get_model_info()}")
    print("WebSocket endpoint available at: /ws")
    print("Backend configured to accept external connections")
    print("Access the API at the server's public IP address")