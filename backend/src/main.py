from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import asyncio
import json
from datetime import datetime
import os
from datetime import datetime as dt

# Import the AI module (to be implemented by AI Specialist)
from ai_module import EcoBrain

app = FastAPI()

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
                # Handle disconnection during broadcast
                self.disconnect(connection)

manager = ConnectionManager()

# Initialize the AI module
ai_brain = EcoBrain()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just receive messages (though we won't process them for now)
            data = await websocket.receive_text()
            # Optionally handle client-to-server messages here
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Background task to periodically broadcast data to all clients
async def periodic_broadcast():
    while True:
        # Prepare input data for the AI module
        current_hour = dt.now().hour
        input_data = {
            "hour_of_day": current_hour,
            # Additional input data can be added here as needed
        }
        
        # Get decision from AI module
        data = ai_brain.get_decision(input_data)
        
        # Broadcast to all connected clients
        await manager.broadcast(json.dumps(data))
        
        # Wait for 2 seconds before next broadcast
        await asyncio.sleep(2)

# Start the periodic broadcast when the application starts
@app.on_event("startup")
async def startup_event():
    # Run the periodic broadcast in the background
    asyncio.create_task(periodic_broadcast())