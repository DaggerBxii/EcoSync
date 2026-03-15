"""
WebSocket Router for real-time updates
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Any
import asyncio
import json
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ai_engine_service import AiEngineService
from services.sensor_simulator import SensorSimulator

router = APIRouter()

# Connection manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"New WebSocket connection. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: Dict[str, Any]):
        """Send message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending message: {e}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send message to specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")


manager = ConnectionManager()

# Initialize services
ai_engine = AiEngineService()
simulator = SensorSimulator()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time AI updates"""
    await manager.connect(websocket)
    
    # Initialize AI engine
    await ai_engine.initialize()
    
    try:
        while True:
            # Generate simulated sensor data
            sensor_data = simulator.generate_data()
            
            # Process through AI engine
            ai_decision = await ai_engine.process_cycle(
                sensor_data["occupancy_count"],
                sensor_data["current_wattage"],
                sensor_data.get("external_temp")
            )
            
            # Send to client
            await manager.send_personal_message(ai_decision, websocket)
            
            # Wait 2 seconds before next update
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


@router.websocket("/ws/updates")
async def updates_websocket(websocket: WebSocket):
    """Alternative WebSocket endpoint for updates"""
    await manager.connect(websocket)
    await ai_engine.initialize()
    
    try:
        while True:
            sensor_data = simulator.generate_data()
            ai_decision = await ai_engine.process_cycle(
                sensor_data["occupancy_count"],
                sensor_data["current_wattage"]
            )
            await manager.send_personal_message(ai_decision, websocket)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
