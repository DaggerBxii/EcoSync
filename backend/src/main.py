from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import List
import asyncio
import json
from datetime import datetime
import os
from datetime import datetime as dt

# Import the AI module
from ai_module import EcoBrain
from data_logger import DataLogger

app = FastAPI(title="EcoSync Backend", version="1.0.0")

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

# Initialize the AI module
ai_brain = EcoBrain(use_trained_models=True)

# Initialize data logger
data_logger = DataLogger()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Optionally handle client-to-server messages here
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/health")
def health_check():
    """Health check endpoint for DevOps monitoring."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"}

@app.get("/metrics")
def get_model_metrics():
    """
    Get model performance metrics.
    Returns MAE, RMSE for occupancy and watts predictions.
    """
    metrics = data_logger.get_model_performance_metrics()
    model_info = ai_brain.get_model_info()
    
    return {
        "model_performance": metrics,
        "model_status": {
            "using_trained_models": model_info["using_trained_models"],
            "models_loaded": model_info["occupancy_model_loaded"] and model_info["watts_model_loaded"],
            "historical_samples": model_info["historical_samples"]
        }
    }

@app.get("/ai/info")
def get_ai_info():
    """
    Get AI module information.
    Returns model loading status and configuration.
    """
    info = ai_brain.get_model_info()
    return info

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
    model_info = ai_brain.get_model_info()
    performance = data_logger.get_model_performance_metrics()
    
    return {
        "system": "EcoSync Backend",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ai_module": model_info,
        "model_performance": performance,
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
    print(f"Model info: {ai_brain.get_model_info()}")
