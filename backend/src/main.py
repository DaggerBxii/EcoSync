"""
EcoSync Backend - Building Resource Management API
FastAPI backend for commercial building resource management with 
vulnerability-based alerts and automated remediation.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
import asyncio
import json
import os
from datetime import datetime

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import modules
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from ai_module import ai_brain
from models import (
    ResourceType, AlertStatus, AlertSeverity, data_store,
    Zone, Resource, Alert
)
from alert_manager import alert_manager
from remediation_engine import remediation_engine

app = FastAPI(
    title="EcoSync Building Resource Management",
    description="AI-powered building resource management with vulnerability-based alerts",
    version="2.0.0"
)

# Add CORS middleware
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Access-Control-Allow-Origin"]
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()


# ==================== Health & Status Endpoints ====================

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": "EcoSync Building Resource Management"
    }

@app.get("/status")
def get_system_status():
    """Get comprehensive system status."""
    ai_info = ai_brain.get_model_info()
    building_metrics = data_store.get_building_metrics()
    alert_summary = alert_manager.get_alert_summary()
    
    return {
        "system": "EcoSync Building Resource Management",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ai_module": ai_info,
        "building_metrics": building_metrics.to_dict(),
        "alert_summary": alert_summary,
        "active_connections": len(manager.active_connections)
    }


# ==================== Zone Endpoints ====================

@app.get("/api/zones")
def get_all_zones():
    """Get all building zones."""
    zones = data_store.get_all_zones()
    return {
        "count": len(zones),
        "zones": [z.to_dict() for z in zones]
    }

@app.get("/api/zones/{zone_id}")
def get_zone(zone_id: str):
    """Get a specific zone with its resources."""
    zone = data_store.get_zone(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    resources = data_store.get_resources_by_zone(zone_id)
    alerts = data_store.get_alerts_by_zone(zone_id)
    
    return {
        "zone": zone.to_dict(),
        "resources": [r.to_dict() for r in resources],
        "active_alerts": [a.to_dict() for a in alerts if a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]],
        "alert_count": len([a for a in alerts if a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]])
    }

@app.get("/api/zones/{zone_id}/metrics")
def get_zone_metrics(zone_id: str):
    """Get metrics for a specific zone."""
    zone = data_store.get_zone(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    resources = data_store.get_resources_by_zone(zone_id)
    alerts = data_store.get_alerts_by_zone(zone_id)
    
    # Calculate zone efficiency
    if resources:
        avg_efficiency = sum(r.efficiency_score for r in resources) / len(resources)
    else:
        avg_efficiency = 100.0
    
    # Resource breakdown
    resource_breakdown = {}
    for r in resources:
        rt = r.resource_type.value
        resource_breakdown[rt] = resource_breakdown.get(rt, 0) + 1
    
    return {
        "zone_id": zone_id,
        "zone_name": zone.name,
        "efficiency_score": round(avg_efficiency, 2),
        "occupancy": zone.occupancy,
        "max_occupancy": zone.max_occupancy,
        "occupancy_percentage": round((zone.occupancy / zone.max_occupancy) * 100, 1) if zone.max_occupancy > 0 else 0,
        "resource_count": len(resources),
        "resource_breakdown": resource_breakdown,
        "active_alerts": len([a for a in alerts if a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]]),
        "critical_alerts": len([a for a in alerts if a.severity == AlertSeverity.CRITICAL]),
        "floor": zone.floor,
        "area_sqft": zone.area_sqft
    }


# ==================== Resource Endpoints ====================

@app.get("/api/resources")
def get_all_resources(
    resource_type: Optional[str] = None,
    zone_id: Optional[str] = None
):
    """Get all resources, optionally filtered by type or zone."""
    if resource_type:
        try:
            rt = ResourceType(resource_type)
            resources = data_store.get_resources_by_type(rt)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid resource type: {resource_type}")
    elif zone_id:
        resources = data_store.get_resources_by_zone(zone_id)
    else:
        resources = data_store.get_all_resources()
    
    return {
        "count": len(resources),
        "resources": [r.to_dict() for r in resources]
    }

@app.get("/api/resources/{resource_id}")
def get_resource(resource_id: str):
    """Get a specific resource."""
    resource = data_store.get_resource(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    alerts = data_store.get_alerts_by_resource(resource_id)
    
    return {
        "resource": resource.to_dict(),
        "active_alerts": [a.to_dict() for a in alerts if a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]],
        "alert_history": [a.to_dict() for a in alerts if a.status == AlertStatus.RESOLVED][:5]
    }

@app.post("/api/resources/{resource_id}/control")
def control_resource(resource_id: str, action: dict):
    """
    Control a resource (e.g., adjust HVAC setpoint, dim lights).
    
    Request body:
    {
        "action": "set_value",
        "value": 22.0
    }
    """
    resource = data_store.get_resource(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if not resource.is_controllable:
        raise HTTPException(status_code=400, detail="Resource is not controllable")
    
    action_type = action.get("action")
    value = action.get("value")
    
    if action_type == "set_value" and value is not None:
        data_store.update_resource_value(resource_id, value)
        return {
            "success": True,
            "message": f"{resource.name} set to {value} {resource.unit}",
            "resource": data_store.get_resource(resource_id).to_dict()
        }
    
    raise HTTPException(status_code=400, detail="Invalid action or value")

@app.get("/api/resources/{resource_id}/predictions")
def get_resource_predictions(
    resource_id: str,
    hours_ahead: int = Query(24, ge=1, le=72)
):
    """Get AI predictions for a resource."""
    resource = data_store.get_resource(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    predictions = ai_brain.get_resource_predictions(resource_id, hours_ahead)
    
    return {
        "resource_id": resource_id,
        "resource_name": resource.name,
        "predictions": predictions
    }


# ==================== Alert Endpoints ====================

@app.get("/api/alerts")
def get_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    resource_type: Optional[str] = None,
    zone_id: Optional[str] = None
):
    """Get alerts with optional filtering."""
    alerts = list(data_store.alerts.values())
    
    if status:
        try:
            st = AlertStatus(status)
            alerts = [a for a in alerts if a.status == st]
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    
    if severity:
        try:
            sev = AlertSeverity(severity)
            alerts = [a for a in alerts if a.severity == sev]
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid severity: {severity}")
    
    if resource_type:
        try:
            rt = ResourceType(resource_type)
            alerts = [a for a in alerts if a.resource_type == rt]
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid resource type: {resource_type}")
    
    if zone_id:
        alerts = [a for a in alerts if a.zone_id == zone_id]
    
    return {
        "count": len(alerts),
        "alerts": [a.to_dict() for a in sorted(alerts, key=lambda x: x.created_at, reverse=True)]
    }

@app.get("/api/alerts/summary")
def get_alert_summary():
    """Get alert summary statistics."""
    return alert_manager.get_alert_summary()

@app.get("/api/alerts/technician")
def get_technician_alerts():
    """Get all alerts escalated to technicians."""
    alerts = alert_manager.get_technician_alerts()
    return {
        "count": len(alerts),
        "alerts": [a.to_dict() for a in alerts]
    }

@app.get("/api/alerts/{alert_id}")
def get_alert(alert_id: str):
    """Get a specific alert."""
    alert = data_store.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert.to_dict()

@app.post("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    """Acknowledge an alert."""
    alert = alert_manager.acknowledge_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {
        "success": True,
        "message": "Alert acknowledged",
        "alert": alert.to_dict()
    }

@app.post("/api/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str, notes: Optional[str] = ""):
    """Manually resolve an alert."""
    alert = alert_manager.resolve_alert(alert_id, notes)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {
        "success": True,
        "message": "Alert resolved",
        "alert": alert.to_dict()
    }


# ==================== Remediation Endpoints ====================

@app.get("/api/remediation/active")
def get_active_remediations():
    """Get all active remediation attempts."""
    remediations = []
    for alert_id, remediation in remediation_engine.active_remediations.items():
        alert = data_store.get_alert(alert_id)
        if alert:
            status = remediation_engine.check_remediation_status(alert_id)
            remediations.append({
                "alert_id": alert_id,
                "alert_title": alert.title,
                "zone_id": alert.zone_id,
                "started_at": remediation["started_at"].isoformat(),
                "status": status
            })
    
    return {
        "count": len(remediations),
        "remediations": remediations
    }


# ==================== AI & Insights Endpoints ====================

@app.get("/api/ai/info")
def get_ai_info():
    """Get AI module information."""
    return ai_brain.get_model_info()

@app.get("/api/ai/recommendations")
def get_ai_recommendations():
    """Get AI-generated building optimization recommendations."""
    decision = ai_brain.get_building_decision()
    return {
        "timestamp": decision.get("timestamp"),
        "recommendations": decision.get("recommendations", []),
        "zone_priorities": decision.get("zone_priorities", []),
        "building_insight": decision.get("building_insight", ""),
        "efficiency_score": decision.get("efficiency_score", 0)
    }

@app.get("/api/ai/zone-recommendations/{zone_id}")
def get_zone_ai_recommendations(zone_id: str):
    """Get AI recommendations for a specific zone."""
    recommendations = ai_brain.get_zone_recommendations(zone_id)
    return {
        "zone_id": zone_id,
        "recommendations": recommendations
    }


# ==================== Simulation Endpoints ====================

@app.post("/api/simulate/anomaly")
def simulate_anomaly(
    resource_type: str = Query(..., description="Type of resource to simulate anomaly for"),
    zone_id: str = Query(..., description="Zone where anomaly should occur")
):
    """
    Simulate an anomaly for testing/demo purposes.
    
    Example: /api/simulate/anomaly?resource_type=hvac&zone_id=office_a
    """
    alert = ai_brain.simulate_anomaly(resource_type, zone_id)
    
    if not alert:
        raise HTTPException(
            status_code=400,
            detail=f"Could not simulate anomaly for {resource_type} in zone {zone_id}"
        )
    
    return {
        "success": True,
        "message": f"Simulated {resource_type} anomaly in {zone_id}",
        "alert": alert.to_dict()
    }


# ==================== WebSocket Endpoint ====================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time building data updates."""
    await manager.connect(websocket)
    try:
        print(f"New WebSocket connection established from: {websocket.client}")
        
        # Send initial data
        initial_data = ai_brain.get_building_decision()
        await websocket.send_text(json.dumps(initial_data))
        
        while True:
            # Wait for client messages (can be used for commands)
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                action = message.get("action")
                
                if action == "simulate_anomaly":
                    # Handle simulation request
                    rt = message.get("resource_type", "hvac")
                    zone = message.get("zone_id", "office_a")
                    alert = ai_brain.simulate_anomaly(rt, zone)
                    if alert:
                        await websocket.send_text(json.dumps({
                            "type": "simulation_result",
                            "alert": alert.to_dict()
                        }))
                
                elif action == "get_status":
                    # Send current status
                    status = ai_brain.get_building_decision()
                    await websocket.send_text(json.dumps(status))
                    
            except json.JSONDecodeError:
                pass  # Ignore invalid JSON
            
    except WebSocketDisconnect:
        print(f"WebSocket connection disconnected: {websocket.client}")
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


# ==================== Background Task ====================

async def periodic_broadcast():
    """Periodically broadcast building data to all connected clients."""
    while True:
        try:
            # Get building decision from AI
            data = ai_brain.get_building_decision()
            
            # Broadcast to all connected clients
            await manager.broadcast(json.dumps(data))
            
        except Exception as e:
            print(f"Error in periodic broadcast: {e}")
        
        # Wait before next broadcast
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    """Start background tasks when the application starts."""
    asyncio.create_task(periodic_broadcast())
    print("=" * 60)
    print("EcoSync Building Resource Management Backend Started")
    print("=" * 60)
    print(f"AI Module: {'Gemini AI' if not ai_brain.using_fallback else 'Fallback Mode'}")
    print(f"Zones: {len(data_store.get_all_zones())}")
    print(f"Resources: {len(data_store.get_all_resources())}")
    print("WebSocket endpoint: /ws")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
