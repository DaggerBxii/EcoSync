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
from chatbot import chatbot
from chatbot_engine import chatbot_engine, ChatbotResponse
from ai_controller import ai_controller, ControlAction
from models import (
    ResourceType, AlertStatus, AlertSeverity, ResourceStatus, data_store,
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


# ==================== Building Visualization Endpoints ====================

@app.get("/api/building/overview")
def get_building_overview():
    """
    Get complete building overview with floors and efficiency metrics.
    This endpoint provides all data needed to render a building visualization.
    """
    overview = data_store.get_building_overview()
    return overview.to_dict()

@app.get("/api/building/floors")
def get_building_floors():
    """Get list of all floors in the building with summary data."""
    floors = data_store.get_floors()
    floor_summaries = [data_store.get_floor_summary(f).to_dict() for f in floors]

    return {
        "building_name": data_store.building_name,
        "total_floors": len(floors),
        "floors": floor_summaries
    }

@app.get("/api/building/floors/{floor_number}")
def get_floor_details(floor_number: int):
    """
    Get detailed resource information for a specific floor.
    Includes all zones, resources, and efficiency metrics for the floor.
    """
    floors = data_store.get_floors()
    if floor_number not in floors:
        raise HTTPException(status_code=404, detail=f"Floor {floor_number} not found")

    floor_data = data_store.get_floor_resources(floor_number)
    return floor_data

@app.get("/api/building/efficiency")
def get_building_efficiency():
    """
    Get efficiency metrics for all resource types.
    Shows how efficiently each resource type is being used across the building.
    """
    efficiencies = {}
    for rt in ResourceType:
        efficiency = data_store.get_resource_efficiency(rt)
        if efficiency.total_resources > 0:
            efficiencies[rt.value] = efficiency.to_dict()

    # Calculate overall building efficiency
    overview = data_store.get_building_overview()

    return {
        "building_name": data_store.building_name,
        "overall_efficiency": overview.overall_efficiency,
        "resource_efficiencies": efficiencies,
        "timestamp": overview.timestamp
    }

@app.get("/api/building/efficiency/{resource_type}")
def get_resource_type_efficiency(resource_type: str):
    """
    Get detailed efficiency metrics for a specific resource type.
    
    Resource types: electricity, water, hvac, lighting, air_quality
    """
    try:
        rt = ResourceType(resource_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid resource type: {resource_type}. Valid types: {[r.value for r in ResourceType]}"
        )

    efficiency = data_store.get_resource_efficiency(rt)

    if efficiency.total_resources == 0:
        return {
            "resource_type": resource_type,
            "message": f"No resources of type '{resource_type}' found in the building",
            "efficiency": None
        }

    # Get individual resource details
    resources = data_store.get_resources_by_type(rt)
    resource_details = []
    for r in resources:
        zone = data_store.get_zone(r.zone_id)
        resource_details.append({
            "resource_id": r.resource_id,
            "name": r.name,
            "zone_id": r.zone_id,
            "zone_name": zone.name if zone else "Unknown",
            "floor": zone.floor if zone else None,
            "current_value": r.current_value,
            "target_value": r.target_value,
            "unit": r.unit,
            "status": r.status.value,
            "efficiency": data_store.calculate_resource_efficiency(r)
        })

    return {
        "efficiency": efficiency.to_dict(),
        "resources": resource_details
    }

@app.get("/api/building/visualization")
def get_building_visualization():
    """
    Get complete data for rendering a 3D/2D building visualization.
    Includes floor layouts, resource positions, and real-time status.
    """
    overview = data_store.get_building_overview()

    # Build visualization data structure
    visualization_data = {
        "building": {
            "name": overview.building_name,
            "total_floors": overview.total_floors,
            "overall_efficiency": overview.overall_efficiency,
            "status": _get_building_status(overview.overall_efficiency, overview.critical_alerts)
        },
        "floors": [],
        "resources": [],
        "alerts": {
            "active": overview.active_alerts,
            "critical": overview.critical_alerts
        },
        "metrics": {
            "energy_consumption_kwh": overview.total_energy_consumption,
            "water_consumption_gal": overview.total_water_consumption,
            "carbon_footprint_kg": overview.carbon_footprint,
            "occupancy": overview.total_occupancy,
            "max_occupancy": overview.total_max_occupancy
        },
        "timestamp": overview.timestamp
    }

    # Add floor data with zone layouts
    for floor_summary in overview.floors:
        floor_detail = data_store.get_floor_resources(floor_summary.floor_number)

        floor_viz = {
            "floor_number": floor_summary.floor_number,
            "efficiency": floor_summary.overall_efficiency,
            "status": _get_floor_status(floor_summary.overall_efficiency, floor_summary.active_alerts),
            "zones": [],
            "resources_summary": {
                "total": floor_summary.total_resources,
                "by_type": floor_summary.resources_by_type,
                "efficiency_by_type": floor_summary.efficiency_by_type
            },
            "consumption": floor_summary.total_consumption,
            "occupancy": {
                "current": floor_summary.occupancy,
                "max": floor_summary.max_occupancy,
                "percentage": round((floor_summary.occupancy / floor_summary.max_occupancy) * 100, 1) if floor_summary.max_occupancy > 0 else 0
            },
            "area_sqft": floor_summary.area_sqft,
            "active_alerts": floor_summary.active_alerts
        }

        # Add zone details with coordinates for rendering
        for zone_data in floor_detail["zones"]:
            zone_viz = {
                "zone_id": zone_data["zone_id"],
                "name": zone_data["name"],
                "coordinates": zone_data["coordinates"],
                "efficiency": round(zone_data["zone_efficiency"], 2),
                "status": _get_zone_status(zone_data["zone_efficiency"], zone_data["active_alerts"]),
                "resources": zone_data["resources"],
                "occupancy": {
                    "current": zone_data["occupancy"],
                    "max": zone_data["max_occupancy"]
                },
                "active_alerts": zone_data["active_alerts"]
            }
            floor_viz["zones"].append(zone_viz)

        visualization_data["floors"].append(floor_viz)
        visualization_data["resources"].extend(floor_detail["resources"])

    return visualization_data


def _get_building_status(efficiency: float, critical_alerts: int) -> str:
    """Determine building status based on efficiency and alerts."""
    if critical_alerts > 0 or efficiency < 50:
        return "critical"
    elif efficiency < 70:
        return "warning"
    else:
        return "optimal"


def _get_floor_status(efficiency: float, active_alerts: int) -> str:
    """Determine floor status based on efficiency and alerts."""
    if active_alerts > 2 or efficiency < 50:
        return "critical"
    elif active_alerts > 0 or efficiency < 70:
        return "warning"
    else:
        return "optimal"


def _get_zone_status(efficiency: float, active_alerts: int) -> str:
    """Determine zone status based on efficiency and alerts."""
    if active_alerts > 0 or efficiency < 50:
        return "critical"
    elif efficiency < 70:
        return "warning"
    else:
        return "optimal"


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


# ==================== Chatbot Endpoints ====================

@app.post("/api/chatbot/message")
def chatbot_message(request: dict):
    """
    Process a message from the chatbot user using the new ChatbotEngine.

    Request body:
    {
        "user_id": "unique_user_identifier",
        "message": "user's message"
    }
    """
    try:
        user_id = request.get("user_id", "default_user")
        message = request.get("message", "")
        
        print(f"Chatbot request: user_id={user_id}, message={message[:50]}...")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Use the new chatbot engine
        response = chatbot_engine.process_message(user_id, message)
        
        print(f"Chatbot response: {response.message[:50]}...")
        
        return {
            "success": True,
            "response": response.message,
            "type": response.type,
            "options": response.options,
            "data": response.data,
            "requires_action": response.requires_action
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Chatbot error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing chatbot message: {str(e)}")


@app.get("/api/chatbot/init")
def chatbot_init(user_id: str):
    """
    Initialize a chatbot session for a user.

    Returns initial greeting and conversation options.
    """
    try:
        # Reset and get initial greeting
        response = chatbot_engine.reset_conversation(user_id)
        
        return {
            "success": True,
            "response": response.message,
            "type": response.type,
            "options": response.options
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing chatbot: {str(e)}")


@app.post("/api/chatbot/reset")
def chatbot_reset(request: dict):
    """Reset a user's conversation."""
    try:
        user_id = request.get("user_id", "default_user")
        response = chatbot_engine.reset_conversation(user_id)
        
        return {
            "success": True,
            "response": response.message,
            "type": response.type,
            "options": response.options
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting chatbot: {str(e)}")


# ==================== Natural Language Control Endpoint ====================

@app.post("/api/control/natural")
def natural_language_control(request: dict):
    """
    Process a natural language control command.
    
    Request body:
    {
        "message": "limit water usage on floor 2 to 60%",
        "context": {
            "building_name": "Synclo Tower",
            "current_floor": 2,
            "total_floors": 10
        }
    }
    
    Returns:
    {
        "success": true,
        "message": "✅ Successfully limited water on floor 2 to 60%. 3 resource(s) updated.",
        "resources_affected": ["cafe_water", "break_water", "garden_water"],
        "previous_values": {...},
        "new_values": {...},
        "estimated_impact": "Estimated energy savings: 5-15% reduction in consumption"
    }
    """
    try:
        user_message = request.get("message", "")
        context = request.get("context", {})
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Parse the natural language command
        parsed = ai_controller.parse_command(user_message, context)
        
        # Execute the command
        result = ai_controller.execute_command(parsed, context)
        
        # Generate natural language response
        response_message = ai_controller.generate_response(user_message, result, context)
        
        return {
            "success": result.success,
            "message": response_message,
            "parsed_command": {
                "action": parsed.action.value,
                "resource_type": parsed.resource_type.value if parsed.resource_type else None,
                "floor": parsed.floor,
                "value": parsed.value,
                "confidence": parsed.confidence
            },
            "resources_affected": result.resources_affected,
            "previous_values": result.previous_values,
            "new_values": result.new_values,
            "estimated_impact": result.estimated_impact,
            "needs_clarification": parsed.needs_clarification,
            "clarification_question": parsed.clarification_question
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing command: {str(e)}")


@app.get("/api/control/history")
def get_control_history(limit: int = Query(10, ge=1, le=50)):
    """Get recent control command history."""
    return {
        "count": len(ai_controller.command_history),
        "history": ai_controller.get_command_history(limit)
    }


@app.post("/api/control/batch")
def batch_control_resources(request: dict):
    """
    Execute multiple control actions at once.
    
    Request body:
    {
        "actions": [
            {"resource_id": "lobby_hvac", "value": 22.0},
            {"resource_id": "lobby_lights", "value": 70}
        ]
    }
    """
    actions = request.get("actions", [])
    if not actions:
        raise HTTPException(status_code=400, detail="No actions provided")
    
    results = []
    for action in actions:
        resource_id = action.get("resource_id")
        value = action.get("value")
        
        if not resource_id or value is None:
            continue
            
        resource = data_store.get_resource(resource_id)
        if not resource:
            results.append({
                "resource_id": resource_id,
                "success": False,
                "error": "Resource not found"
            })
            continue
            
        if not resource.is_controllable:
            results.append({
                "resource_id": resource_id,
                "success": False,
                "error": "Resource is not controllable"
            })
            continue
            
        success = data_store.update_resource_value(resource_id, value)
        results.append({
            "resource_id": resource_id,
            "success": success,
            "previous_value": resource.current_value,
            "new_value": value
        })
    
    return {
        "success": all(r["success"] for r in results),
        "results": results
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
        formatted_data = _format_for_frontend(initial_data)
        await websocket.send_text(json.dumps(formatted_data))

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
                    formatted_status = _format_for_frontend(status)
                    await websocket.send_text(json.dumps(formatted_status))

                elif action == "chat_message":
                    # Handle chatbot message
                    user_id = message.get("user_id", "default_user")
                    chat_text = message.get("message", "")

                    if chat_text:
                        chat_response = chatbot.process_message(user_id, chat_text)
                        await websocket.send_text(json.dumps({
                            "type": "chat_response",
                            "response": chat_response
                        }))

            except json.JSONDecodeError:
                pass  # Ignore invalid JSON

    except WebSocketDisconnect:
        print(f"WebSocket connection disconnected: {websocket.client}")
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


def _format_for_frontend(data: dict) -> dict:
    """
    Format the AI brain decision data for the frontend EcoSyncWebSocket component.
    
    Transforms the data from the AI module format to the expected frontend format.
    """
    # Extract the metrics from the building metrics
    building_metrics = data.get("metrics", {})
    
    # Calculate watts (sum of electricity resources) - keeping in kW for more realistic values
    electricity_resources = data_store.get_resources_by_type(ResourceType.ELECTRICITY)
    total_kw = sum(r.current_value for r in electricity_resources)  # Keep in kW
    
    # Calculate occupancy (sum of all zone occupancies)
    total_occupancy = sum(zone.occupancy for zone in data_store.get_all_zones())
    
    # Calculate carbon saved (based on efficiency improvements)
    baseline_carbon = building_metrics.get("energy_consumption", 0) * 0.5  # Baseline assumption
    current_carbon = building_metrics.get("energy_consumption", 0) * 0.4  # Current efficiency
    carbon_saved = max(0, baseline_carbon - current_carbon)
    
    # Calculate scale level based on efficiency score
    efficiency_score = data.get("efficiency_score", 0)
    scale_level = efficiency_score / 100.0  # Convert percentage to 0-1 scale
    
    formatted_data = {
        "timestamp": data.get("timestamp", datetime.utcnow().isoformat() + "Z"),
        "system_status": data.get("system_status", "optimal"),
        "scale_level": round(scale_level, 2),
        "metrics": {
            "watts": round(total_kw, 2),  # Keeping in kW for realistic values
            "occupancy": total_occupancy,
            "carbon_saved": round(carbon_saved, 2)
        },
        "ai_insight": data.get("building_insight", "Building operating normally."),
        "is_anomaly": data.get("is_anomaly", False),
        "confidence_score": round(data.get("confidence_score", 0.85), 2)
    }
    
    # Add optional fields if present in the original data
    if "unnecessary_usage_detected" in data:
        formatted_data["unnecessary_usage_detected"] = data["unnecessary_usage_detected"]
        
    if "optimization_opportunities" in data:
        formatted_data["optimization_opportunities"] = data["optimization_opportunities"]
    
    return formatted_data


# ==================== Background Task ====================

async def periodic_broadcast():
    """Periodically broadcast building data to all connected clients."""
    last_data = None
    
    while True:
        try:
            # Get building decision from AI (with caching)
            data = ai_brain.get_building_decision()
            
            # Format for frontend
            formatted_data = _format_for_frontend(data)
            last_data = formatted_data

            # Broadcast to all connected clients
            await manager.broadcast(json.dumps(formatted_data))

        except Exception as e:
            print(f"Error in periodic broadcast: {e}")
            
            # Send last known good data if available
            if last_data:
                await manager.broadcast(json.dumps(last_data))

        # Wait before next broadcast (10 seconds to avoid rate limits)
        await asyncio.sleep(10)

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
