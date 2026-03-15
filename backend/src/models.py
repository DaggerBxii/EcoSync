"""
EcoSync Building Resource Management Models
Supports multi-resource tracking, zones, and vulnerability-based alerts.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import json


class ResourceType(str, Enum):
    """Types of building resources."""
    ELECTRICITY = "electricity"
    WATER = "water"
    HVAC = "hvac"
    LIGHTING = "lighting"
    AIR_QUALITY = "air_quality"


class AlertSeverity(str, Enum):
    """Alert severity levels."""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    """Alert lifecycle status."""
    ACTIVE = "active"
    MONITORING = "monitoring"
    RESOLVED = "resolved"
    ESCALATED = "escalated"


class ResourceStatus(str, Enum):
    """Resource health status."""
    OPTIMAL = "optimal"
    WARNING = "warning"
    CRITICAL = "critical"
    OFFLINE = "offline"


@dataclass
class Zone:
    """Building zone/area definition."""
    zone_id: str
    name: str
    floor: int
    area_sqft: float
    coordinates: Dict[str, float]  # x, y, width, height for floor plan
    resources: List[str] = field(default_factory=list)  # Resource IDs in this zone
    occupancy: int = 0
    max_occupancy: int = 50
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "zone_id": self.zone_id,
            "name": self.name,
            "floor": self.floor,
            "area_sqft": self.area_sqft,
            "coordinates": self.coordinates,
            "resources": self.resources,
            "occupancy": self.occupancy,
            "max_occupancy": self.max_occupancy,
            "created_at": self.created_at
        }


@dataclass
class Resource:
    """Building resource definition."""
    resource_id: str
    resource_type: ResourceType
    name: str
    zone_id: str
    unit: str  # kWh, gallons, °C, etc.
    current_value: float = 0.0
    target_value: Optional[float] = None
    min_threshold: Optional[float] = None
    max_threshold: Optional[float] = None
    status: ResourceStatus = ResourceStatus.OPTIMAL
    efficiency_score: float = 100.0
    is_controllable: bool = True  # Can AI control this resource?
    last_updated: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "resource_id": self.resource_id,
            "resource_type": self.resource_type.value,
            "name": self.name,
            "zone_id": self.zone_id,
            "unit": self.unit,
            "current_value": self.current_value,
            "target_value": self.target_value,
            "min_threshold": self.min_threshold,
            "max_threshold": self.max_threshold,
            "status": self.status.value,
            "efficiency_score": self.efficiency_score,
            "is_controllable": self.is_controllable,
            "last_updated": self.last_updated
        }


@dataclass
class ResourceReading:
    """Time-series reading for a resource."""
    reading_id: str
    resource_id: str
    value: float
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "reading_id": self.reading_id,
            "resource_id": self.resource_id,
            "value": self.value,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


@dataclass
class RemediationAction:
    """Automated remediation attempt."""
    action_id: str
    alert_id: str
    action_type: str
    description: str
    parameters: Dict[str, Any]
    timestamp: str
    result: Optional[str] = None  # success, failed, pending
    result_message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "action_id": self.action_id,
            "alert_id": self.alert_id,
            "action_type": self.action_type,
            "description": self.description,
            "parameters": self.parameters,
            "timestamp": self.timestamp,
            "result": self.result,
            "result_message": self.result_message
        }


@dataclass
class Alert:
    """Vulnerability-based alert with escalation tracking."""
    alert_id: str
    severity: AlertSeverity
    status: AlertStatus
    resource_type: ResourceType
    resource_id: str
    zone_id: str
    title: str
    description: str
    current_value: float
    expected_value: float
    threshold_value: float
    unit: str
    created_at: str
    updated_at: str
    resolved_at: Optional[str] = None
    
    # Automated remediation tracking
    remediation_attempted: bool = False
    remediation_actions: List[RemediationAction] = field(default_factory=list)
    escalation_reason: Optional[str] = None
    
    # Technician escalation
    technician_type: Optional[str] = None
    technician_contact: Optional[Dict[str, str]] = None
    reference_code: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "alert_id": self.alert_id,
            "severity": self.severity.value,
            "status": self.status.value,
            "resource_type": self.resource_type.value,
            "resource_id": self.resource_id,
            "zone_id": self.zone_id,
            "title": self.title,
            "description": self.description,
            "current_value": self.current_value,
            "expected_value": self.expected_value,
            "threshold_value": self.threshold_value,
            "unit": self.unit,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "resolved_at": self.resolved_at,
            "remediation_attempted": self.remediation_attempted,
            "remediation_actions": [a.to_dict() for a in self.remediation_actions],
            "escalation_reason": self.escalation_reason,
            "technician_type": self.technician_type,
            "technician_contact": self.technician_contact,
            "reference_code": self.reference_code
        }


@dataclass
class BuildingMetrics:
    """Overall building health metrics."""
    timestamp: str
    total_zones: int
    active_zones: int
    total_resources: int
    resources_by_type: Dict[str, int]
    resources_by_status: Dict[str, int]
    active_alerts: int
    critical_alerts: int
    overall_efficiency: float
    energy_consumption: float
    water_consumption: float
    carbon_footprint: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "total_zones": self.total_zones,
            "active_zones": self.active_zones,
            "total_resources": self.total_resources,
            "resources_by_type": self.resources_by_type,
            "resources_by_status": self.resources_by_status,
            "active_alerts": self.active_alerts,
            "critical_alerts": self.critical_alerts,
            "overall_efficiency": round(self.overall_efficiency, 2),
            "energy_consumption": round(self.energy_consumption, 2),
            "water_consumption": round(self.water_consumption, 2),
            "carbon_footprint": round(self.carbon_footprint, 2)
        }


# Sample building configuration - 5 Story Building
SAMPLE_ZONES = [
    # Floor 1 - Ground Floor
    Zone(
        zone_id="lobby",
        name="Main Lobby",
        floor=1,
        area_sqft=2000,
        coordinates={"x": 10, "y": 10, "width": 40, "height": 30},
        resources=["lobby_hvac", "lobby_lights"],
        max_occupancy=30
    ),
    Zone(
        zone_id="server_room",
        name="Server Room",
        floor=1,
        area_sqft=800,
        coordinates={"x": 60, "y": 10, "width": 25, "height": 20},
        resources=["server_hvac", "server_electricity"],
        max_occupancy=5
    ),
    Zone(
        zone_id="cafeteria",
        name="Cafeteria",
        floor=1,
        area_sqft=1500,
        coordinates={"x": 10, "y": 50, "width": 50, "height": 35},
        resources=["cafe_hvac", "cafe_lights", "cafe_water", "cafe_electricity"],
        max_occupancy=80
    ),

    # Floor 2 - Office Space
    Zone(
        zone_id="office_a",
        name="Office Area A",
        floor=2,
        area_sqft=3500,
        coordinates={"x": 10, "y": 10, "width": 60, "height": 40},
        resources=["office_a_hvac", "office_a_lights", "office_a_electricity"],
        max_occupancy=50
    ),
    Zone(
        zone_id="office_b",
        name="Office Area B",
        floor=2,
        area_sqft=3500,
        coordinates={"x": 80, "y": 10, "width": 60, "height": 40},
        resources=["office_b_hvac", "office_b_lights", "office_b_electricity"],
        max_occupancy=50
    ),

    # Floor 3 - Conference Center
    Zone(
        zone_id="conference_a",
        name="Conference Room A",
        floor=3,
        area_sqft=1200,
        coordinates={"x": 10, "y": 10, "width": 40, "height": 30},
        resources=["conf_a_hvac", "conf_a_lights", "conf_a_electricity"],
        max_occupancy=40
    ),
    Zone(
        zone_id="conference_b",
        name="Conference Room B",
        floor=3,
        area_sqft=1200,
        coordinates={"x": 60, "y": 10, "width": 40, "height": 30},
        resources=["conf_b_hvac", "conf_b_lights", "conf_b_electricity"],
        max_occupancy=40
    ),
    Zone(
        zone_id="break_room",
        name="Break Room",
        floor=3,
        area_sqft=800,
        coordinates={"x": 10, "y": 50, "width": 35, "height": 25},
        resources=["break_hvac", "break_lights", "break_water"],
        max_occupancy=25
    ),

    # Floor 4 - Executive Suites
    Zone(
        zone_id="exec_suite_a",
        name="Executive Suite A",
        floor=4,
        area_sqft=1500,
        coordinates={"x": 10, "y": 10, "width": 45, "height": 35},
        resources=["exec_a_hvac", "exec_a_lights", "exec_a_electricity"],
        max_occupancy=15
    ),
    Zone(
        zone_id="exec_suite_b",
        name="Executive Suite B",
        floor=4,
        area_sqft=1500,
        coordinates={"x": 65, "y": 10, "width": 45, "height": 35},
        resources=["exec_b_hvac", "exec_b_lights", "exec_b_electricity"],
        max_occupancy=15
    ),
    Zone(
        zone_id="meeting_room",
        name="Board Room",
        floor=4,
        area_sqft=1000,
        coordinates={"x": 10, "y": 55, "width": 40, "height": 30},
        resources=["board_hvac", "board_lights", "board_electricity"],
        max_occupancy=20
    ),

    # Floor 5 - Rooftop & Mechanical
    Zone(
        zone_id="rooftop_garden",
        name="Rooftop Garden",
        floor=5,
        area_sqft=2000,
        coordinates={"x": 10, "y": 10, "width": 60, "height": 40},
        resources=["garden_lights", "garden_water"],
        max_occupancy=50
    ),
    Zone(
        zone_id="mechanical_room",
        name="Mechanical Room",
        floor=5,
        area_sqft=1200,
        coordinates={"x": 80, "y": 10, "width": 35, "height": 30},
        resources=["mech_hvac", "mech_electricity"],
        max_occupancy=10
    ),
    Zone(
        zone_id="storage",
        name="Storage Area",
        floor=5,
        area_sqft=800,
        coordinates={"x": 10, "y": 60, "width": 30, "height": 25},
        resources=["storage_lights"],
        max_occupancy=5
    ),
]

SAMPLE_RESOURCES = [
    # Floor 1 - HVAC Resources
    Resource(
        resource_id="lobby_hvac",
        resource_type=ResourceType.HVAC,
        name="Lobby HVAC",
        zone_id="lobby",
        unit="°C",
        current_value=22.0,
        target_value=22.0,
        min_threshold=20.0,
        max_threshold=24.0
    ),
    Resource(
        resource_id="server_hvac",
        resource_type=ResourceType.HVAC,
        name="Server Room HVAC",
        zone_id="server_room",
        unit="°C",
        current_value=18.0,
        target_value=18.0,
        min_threshold=16.0,
        max_threshold=20.0
    ),
    Resource(
        resource_id="cafe_hvac",
        resource_type=ResourceType.HVAC,
        name="Cafeteria HVAC",
        zone_id="cafeteria",
        unit="°C",
        current_value=22.0,
        target_value=22.0,
        min_threshold=20.0,
        max_threshold=24.0
    ),

    # Floor 2 - HVAC Resources
    Resource(
        resource_id="office_a_hvac",
        resource_type=ResourceType.HVAC,
        name="Office A HVAC",
        zone_id="office_a",
        unit="°C",
        current_value=22.0,
        target_value=22.0,
        min_threshold=20.0,
        max_threshold=24.0
    ),
    Resource(
        resource_id="office_b_hvac",
        resource_type=ResourceType.HVAC,
        name="Office B HVAC",
        zone_id="office_b",
        unit="°C",
        current_value=22.0,
        target_value=22.0,
        min_threshold=20.0,
        max_threshold=24.0
    ),

    # Floor 3 - HVAC Resources
    Resource(
        resource_id="conf_a_hvac",
        resource_type=ResourceType.HVAC,
        name="Conference A HVAC",
        zone_id="conference_a",
        unit="°C",
        current_value=21.0,
        target_value=21.0,
        min_threshold=19.0,
        max_threshold=23.0
    ),
    Resource(
        resource_id="conf_b_hvac",
        resource_type=ResourceType.HVAC,
        name="Conference B HVAC",
        zone_id="conference_b",
        unit="°C",
        current_value=21.0,
        target_value=21.0,
        min_threshold=19.0,
        max_threshold=23.0
    ),
    Resource(
        resource_id="break_hvac",
        resource_type=ResourceType.HVAC,
        name="Break Room HVAC",
        zone_id="break_room",
        unit="°C",
        current_value=22.0,
        target_value=22.0,
        min_threshold=20.0,
        max_threshold=24.0
    ),

    # Floor 4 - HVAC Resources
    Resource(
        resource_id="exec_a_hvac",
        resource_type=ResourceType.HVAC,
        name="Executive Suite A HVAC",
        zone_id="exec_suite_a",
        unit="°C",
        current_value=21.5,
        target_value=21.5,
        min_threshold=20.0,
        max_threshold=23.0
    ),
    Resource(
        resource_id="exec_b_hvac",
        resource_type=ResourceType.HVAC,
        name="Executive Suite B HVAC",
        zone_id="exec_suite_b",
        unit="°C",
        current_value=21.5,
        target_value=21.5,
        min_threshold=20.0,
        max_threshold=23.0
    ),
    Resource(
        resource_id="board_hvac",
        resource_type=ResourceType.HVAC,
        name="Board Room HVAC",
        zone_id="meeting_room",
        unit="°C",
        current_value=21.0,
        target_value=21.0,
        min_threshold=19.0,
        max_threshold=23.0
    ),

    # Floor 5 - HVAC Resources
    Resource(
        resource_id="mech_hvac",
        resource_type=ResourceType.HVAC,
        name="Mechanical Room HVAC",
        zone_id="mechanical_room",
        unit="°C",
        current_value=25.0,
        target_value=25.0,
        min_threshold=22.0,
        max_threshold=28.0
    ),

    # Lighting Resources - All Floors
    Resource(
        resource_id="lobby_lights",
        resource_type=ResourceType.LIGHTING,
        name="Lobby Lighting",
        zone_id="lobby",
        unit="%",
        current_value=80.0,
        target_value=80.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="cafe_lights",
        resource_type=ResourceType.LIGHTING,
        name="Cafeteria Lighting",
        zone_id="cafeteria",
        unit="%",
        current_value=90.0,
        target_value=90.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="office_a_lights",
        resource_type=ResourceType.LIGHTING,
        name="Office A Lighting",
        zone_id="office_a",
        unit="%",
        current_value=75.0,
        target_value=75.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="office_b_lights",
        resource_type=ResourceType.LIGHTING,
        name="Office B Lighting",
        zone_id="office_b",
        unit="%",
        current_value=75.0,
        target_value=75.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="conf_a_lights",
        resource_type=ResourceType.LIGHTING,
        name="Conference A Lighting",
        zone_id="conference_a",
        unit="%",
        current_value=60.0,
        target_value=60.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="conf_b_lights",
        resource_type=ResourceType.LIGHTING,
        name="Conference B Lighting",
        zone_id="conference_b",
        unit="%",
        current_value=60.0,
        target_value=60.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="break_lights",
        resource_type=ResourceType.LIGHTING,
        name="Break Room Lighting",
        zone_id="break_room",
        unit="%",
        current_value=70.0,
        target_value=70.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="exec_a_lights",
        resource_type=ResourceType.LIGHTING,
        name="Executive Suite A Lighting",
        zone_id="exec_suite_a",
        unit="%",
        current_value=65.0,
        target_value=65.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="exec_b_lights",
        resource_type=ResourceType.LIGHTING,
        name="Executive Suite B Lighting",
        zone_id="exec_suite_b",
        unit="%",
        current_value=65.0,
        target_value=65.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="board_lights",
        resource_type=ResourceType.LIGHTING,
        name="Board Room Lighting",
        zone_id="meeting_room",
        unit="%",
        current_value=55.0,
        target_value=55.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="garden_lights",
        resource_type=ResourceType.LIGHTING,
        name="Rooftop Garden Lighting",
        zone_id="rooftop_garden",
        unit="%",
        current_value=40.0,
        target_value=40.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),
    Resource(
        resource_id="storage_lights",
        resource_type=ResourceType.LIGHTING,
        name="Storage Lighting",
        zone_id="storage",
        unit="%",
        current_value=30.0,
        target_value=30.0,
        min_threshold=0.0,
        max_threshold=100.0
    ),

    # Electricity Resources - All Floors
    Resource(
        resource_id="server_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Server Room Power",
        zone_id="server_room",
        unit="kW",
        current_value=8.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=15.0
    ),
    Resource(
        resource_id="cafe_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Cafeteria Power",
        zone_id="cafeteria",
        unit="kW",
        current_value=10.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=20.0
    ),
    Resource(
        resource_id="office_a_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Office A Power",
        zone_id="office_a",
        unit="kW",
        current_value=15.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=25.0
    ),
    Resource(
        resource_id="office_b_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Office B Power",
        zone_id="office_b",
        unit="kW",
        current_value=12.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=25.0
    ),
    Resource(
        resource_id="conf_a_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Conference A Power",
        zone_id="conference_a",
        unit="kW",
        current_value=3.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=8.0
    ),
    Resource(
        resource_id="conf_b_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Conference B Power",
        zone_id="conference_b",
        unit="kW",
        current_value=3.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=8.0
    ),
    Resource(
        resource_id="exec_a_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Executive Suite A Power",
        zone_id="exec_suite_a",
        unit="kW",
        current_value=5.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=10.0
    ),
    Resource(
        resource_id="exec_b_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Executive Suite B Power",
        zone_id="exec_suite_b",
        unit="kW",
        current_value=5.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=10.0
    ),
    Resource(
        resource_id="board_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Board Room Power",
        zone_id="meeting_room",
        unit="kW",
        current_value=4.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=8.0
    ),
    Resource(
        resource_id="mech_electricity",
        resource_type=ResourceType.ELECTRICITY,
        name="Mechanical Room Power",
        zone_id="mechanical_room",
        unit="kW",
        current_value=20.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=35.0
    ),

    # Water Resources
    Resource(
        resource_id="cafe_water",
        resource_type=ResourceType.WATER,
        name="Cafeteria Water",
        zone_id="cafeteria",
        unit="gal/min",
        current_value=2.5,
        target_value=None,
        min_threshold=0.0,
        max_threshold=5.0
    ),
    Resource(
        resource_id="break_water",
        resource_type=ResourceType.WATER,
        name="Break Room Water",
        zone_id="break_room",
        unit="gal/min",
        current_value=1.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=3.0
    ),
    Resource(
        resource_id="garden_water",
        resource_type=ResourceType.WATER,
        name="Rooftop Garden Irrigation",
        zone_id="rooftop_garden",
        unit="gal/min",
        current_value=5.0,
        target_value=None,
        min_threshold=0.0,
        max_threshold=10.0
    ),
]


@dataclass
class FloorSummary:
    """Summary of a building floor with resources and efficiency."""
    floor_number: int
    zones: List[str]
    zone_names: List[str]
    total_resources: int
    resources_by_type: Dict[str, int]
    efficiency_by_type: Dict[str, float]
    overall_efficiency: float
    total_consumption: Dict[str, float]  # electricity_kwh, water_gal, etc.
    active_alerts: int
    occupancy: int
    max_occupancy: int
    area_sqft: float

    def to_dict(self) -> Dict[str, Any]:
        # Round numerical values in total_consumption
        rounded_total_consumption = {}
        for key, value in self.total_consumption.items():
            if isinstance(value, float):
                rounded_total_consumption[key] = round(value, 2)
            else:
                rounded_total_consumption[key] = value

        return {
            "floor_number": self.floor_number,
            "zones": self.zones,
            "zone_names": self.zone_names,
            "total_resources": self.total_resources,
            "resources_by_type": self.resources_by_type,
            "efficiency_by_type": self.efficiency_by_type,
            "overall_efficiency": round(self.overall_efficiency, 2),
            "total_consumption": rounded_total_consumption,
            "active_alerts": self.active_alerts,
            "occupancy": self.occupancy,
            "max_occupancy": self.max_occupancy,
            "occupancy_percentage": round((self.occupancy / self.max_occupancy) * 100, 1) if self.max_occupancy > 0 else 0,
            "area_sqft": self.area_sqft
        }


@dataclass
class ResourceEfficiency:
    """Efficiency metrics for a specific resource type."""
    resource_type: ResourceType
    total_resources: int
    optimal_count: int
    warning_count: int
    critical_count: int
    offline_count: int
    average_efficiency: float
    total_consumption: float
    unit: str
    target_consumption: Optional[float]
    efficiency_trend: str  # "improving", "stable", "declining"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "resource_type": self.resource_type.value,
            "total_resources": self.total_resources,
            "optimal_count": self.optimal_count,
            "warning_count": self.warning_count,
            "critical_count": self.critical_count,
            "offline_count": self.offline_count,
            "average_efficiency": round(self.average_efficiency, 2),
            "total_consumption": round(self.total_consumption, 2),
            "unit": self.unit,
            "target_consumption": self.target_consumption,
            "efficiency_trend": self.efficiency_trend,
            "efficiency_percentage": round(self.average_efficiency, 2)
        }


@dataclass
class BuildingOverview:
    """Complete building overview with floors and efficiency metrics."""
    building_name: str
    total_floors: int
    total_zones: int
    total_resources: int
    floors: List[FloorSummary]
    resource_efficiencies: Dict[str, ResourceEfficiency]
    overall_efficiency: float
    total_energy_consumption: float  # kW
    total_water_consumption: float  # gal/min
    carbon_footprint: float  # kg CO2
    active_alerts: int
    critical_alerts: int
    total_occupancy: int
    total_max_occupancy: int
    timestamp: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "building_name": self.building_name,
            "total_floors": self.total_floors,
            "total_zones": self.total_zones,
            "total_resources": self.total_resources,
            "floors": [f.to_dict() for f in self.floors],
            "resource_efficiencies": {k: v.to_dict() for k, v in self.resource_efficiencies.items()},
            "overall_efficiency": round(self.overall_efficiency, 2),
            "total_energy_consumption": round(self.total_energy_consumption, 2),
            "total_water_consumption": round(self.total_water_consumption, 2),
            "carbon_footprint": round(self.carbon_footprint, 4),
            "active_alerts": self.active_alerts,
            "critical_alerts": self.critical_alerts,
            "total_occupancy": self.total_occupancy,
            "total_max_occupancy": self.total_max_occupancy,
            "occupancy_percentage": round((self.total_occupancy / self.total_max_occupancy) * 100, 1) if self.total_max_occupancy > 0 else 0,
            "timestamp": self.timestamp
        }


class BuildingDataStore:
    """In-memory data store for building resources and alerts."""

    def __init__(self):
        self.zones: Dict[str, Zone] = {}
        self.resources: Dict[str, Resource] = {}
        self.alerts: Dict[str, Alert] = {}
        self.readings: List[ResourceReading] = []
        self.remediation_actions: Dict[str, RemediationAction] = {}
        self.building_name: str = "EcoSync Tower"

        # Initialize with sample data
        self._init_sample_data()
    
    def _init_sample_data(self):
        """Initialize with sample building data."""
        for zone in SAMPLE_ZONES:
            self.zones[zone.zone_id] = zone
        
        for resource in SAMPLE_RESOURCES:
            self.resources[resource.resource_id] = resource
    
    def get_zone(self, zone_id: str) -> Optional[Zone]:
        return self.zones.get(zone_id)
    
    def get_all_zones(self) -> List[Zone]:
        return list(self.zones.values())
    
    def get_resource(self, resource_id: str) -> Optional[Resource]:
        return self.resources.get(resource_id)
    
    def get_resources_by_zone(self, zone_id: str) -> List[Resource]:
        return [r for r in self.resources.values() if r.zone_id == zone_id]
    
    def get_resources_by_type(self, resource_type: ResourceType) -> List[Resource]:
        return [r for r in self.resources.values() if r.resource_type == resource_type]
    
    def get_all_resources(self) -> List[Resource]:
        return list(self.resources.values())
    
    def update_resource_value(self, resource_id: str, value: float) -> Optional[Resource]:
        resource = self.resources.get(resource_id)
        if resource:
            resource.current_value = value
            resource.last_updated = datetime.utcnow().isoformat() + "Z"
        return resource
    
    def add_alert(self, alert: Alert):
        self.alerts[alert.alert_id] = alert
    
    def get_alert(self, alert_id: str) -> Optional[Alert]:
        return self.alerts.get(alert_id)
    
    def get_active_alerts(self) -> List[Alert]:
        return [a for a in self.alerts.values() 
                if a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]]
    
    def get_critical_alerts(self) -> List[Alert]:
        return [a for a in self.alerts.values() 
                if a.severity == AlertSeverity.CRITICAL 
                and a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]]
    
    def get_alerts_by_zone(self, zone_id: str) -> List[Alert]:
        return [a for a in self.alerts.values() if a.zone_id == zone_id]
    
    def get_alerts_by_resource(self, resource_id: str) -> List[Alert]:
        return [a for a in self.alerts.values() if a.resource_id == resource_id]
    
    def update_alert_status(self, alert_id: str, status: AlertStatus):
        alert = self.alerts.get(alert_id)
        if alert:
            alert.status = status
            alert.updated_at = datetime.utcnow().isoformat() + "Z"
            if status == AlertStatus.RESOLVED:
                alert.resolved_at = datetime.utcnow().isoformat() + "Z"
        return alert
    
    def add_remediation_action(self, action: RemediationAction):
        self.remediation_actions[action.action_id] = action
        alert = self.alerts.get(action.alert_id)
        if alert:
            alert.remediation_actions.append(action)
            alert.remediation_attempted = True
    
    def get_building_metrics(self) -> BuildingMetrics:
        """Calculate overall building metrics."""
        now = datetime.utcnow().isoformat() + "Z"
        
        resources_by_type = {}
        resources_by_status = {}
        
        for resource in self.resources.values():
            rt = resource.resource_type.value
            resources_by_type[rt] = resources_by_type.get(rt, 0) + 1
            
            st = resource.status.value
            resources_by_status[st] = resources_by_status.get(st, 0) + 1
        
        active_alerts = len(self.get_active_alerts())
        critical_alerts = len(self.get_critical_alerts())
        
        # Calculate efficiency (simplified)
        total_efficiency = sum(r.efficiency_score for r in self.resources.values())
        avg_efficiency = total_efficiency / len(self.resources) if self.resources else 100.0
        
        # Calculate energy consumption
        energy_resources = self.get_resources_by_type(ResourceType.ELECTRICITY)
        total_energy = sum(r.current_value for r in energy_resources)
        
        # Calculate water consumption
        water_resources = self.get_resources_by_type(ResourceType.WATER)
        total_water = sum(r.current_value for r in water_resources)
        
        return BuildingMetrics(
            timestamp=now,
            total_zones=len(self.zones),
            active_zones=len([z for z in self.zones.values() if z.occupancy > 0]),
            total_resources=len(self.resources),
            resources_by_type=resources_by_type,
            resources_by_status=resources_by_status,
            active_alerts=active_alerts,
            critical_alerts=critical_alerts,
            overall_efficiency=round(avg_efficiency, 2),
            energy_consumption=round(total_energy, 2),
            water_consumption=round(total_water, 2),
            carbon_footprint=round(total_energy * 0.4, 2)  # Simplified CO2 calc
        )

    def get_floors(self) -> List[int]:
        """Get list of all floor numbers in the building."""
        floors = set()
        for zone in self.zones.values():
            floors.add(zone.floor)
        return sorted(list(floors))

    def get_zones_by_floor(self, floor: int) -> List[Zone]:
        """Get all zones on a specific floor."""
        return [z for z in self.zones.values() if z.floor == floor]

    def calculate_resource_efficiency(self, resource: Resource) -> float:
        """
        Calculate efficiency score for a resource based on:
        - How close current value is to target (if target exists)
        - Whether value is within thresholds
        - Status impact
        """
        base_score = 100.0

        # If resource has a target, calculate deviation
        if resource.target_value is not None:
            if resource.target_value != 0:
                deviation = abs(resource.current_value - resource.target_value) / abs(resource.target_value)
                base_score -= min(deviation * 50, 50)  # Up to 50 points for deviation
        else:
            # Check if within thresholds
            if resource.min_threshold is not None and resource.max_threshold is not None:
                range_size = resource.max_threshold - resource.min_threshold
                if range_size > 0:
                    mid_point = (resource.min_threshold + resource.max_threshold) / 2
                    max_deviation = range_size / 2
                    if max_deviation > 0:
                        deviation = abs(resource.current_value - mid_point) / max_deviation
                        base_score -= min(deviation * 30, 30)

        # Apply status penalty
        status_penalties = {
            ResourceStatus.OPTIMAL: 0,
            ResourceStatus.WARNING: 20,
            ResourceStatus.CRITICAL: 50,
            ResourceStatus.OFFLINE: 100
        }
        base_score -= status_penalties.get(resource.status, 0)

        return max(0, min(100, base_score))

    def get_floor_summary(self, floor: int) -> FloorSummary:
        """Get summary data for a specific floor."""
        zones = self.get_zones_by_floor(floor)
        zone_ids = [z.zone_id for z in zones]
        zone_names = [z.name for z in zones]

        # Get all resources on this floor
        floor_resources = []
        for zone_id in zone_ids:
            floor_resources.extend(self.get_resources_by_zone(zone_id))

        # Count resources by type
        resources_by_type: Dict[str, int] = {}
        for r in floor_resources:
            rt = r.resource_type.value
            resources_by_type[rt] = resources_by_type.get(rt, 0) + 1

        # Calculate efficiency by type
        efficiency_by_type: Dict[str, float] = {}
        for r in floor_resources:
            rt = r.resource_type.value
            if rt not in efficiency_by_type:
                efficiency_by_type[rt] = []
            efficiency_by_type[rt].append(self.calculate_resource_efficiency(r))

        # Average efficiency by type
        for rt in efficiency_by_type:
            if efficiency_by_type[rt]:
                efficiency_by_type[rt] = sum(efficiency_by_type[rt]) / len(efficiency_by_type[rt])

        # Overall floor efficiency
        if floor_resources:
            overall_efficiency = sum(self.calculate_resource_efficiency(r) for r in floor_resources) / len(floor_resources)
        else:
            overall_efficiency = 100.0

        # Calculate consumption by type
        total_consumption: Dict[str, float] = {
            "electricity_kwh": 0.0,
            "water_gal": 0.0,
            "hvac_temp_c": 0.0,
            "lighting_percent": 0.0
        }

        for r in floor_resources:
            if r.resource_type == ResourceType.ELECTRICITY:
                total_consumption["electricity_kwh"] += r.current_value
            elif r.resource_type == ResourceType.WATER:
                total_consumption["water_gal"] += r.current_value
            elif r.resource_type == ResourceType.HVAC:
                total_consumption["hvac_temp_c"] = r.current_value  # Average temp
            elif r.resource_type == ResourceType.LIGHTING:
                total_consumption["lighting_percent"] = r.current_value  # Average lighting

        # Count active alerts for this floor
        active_alerts = 0
        for zone_id in zone_ids:
            alerts = self.get_alerts_by_zone(zone_id)
            active_alerts += len([a for a in alerts if a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]])

        # Calculate occupancy
        total_occupancy = sum(z.occupancy for z in zones)
        total_max_occupancy = sum(z.max_occupancy for z in zones)
        total_area = sum(z.area_sqft for z in zones)

        return FloorSummary(
            floor_number=floor,
            zones=zone_ids,
            zone_names=zone_names,
            total_resources=len(floor_resources),
            resources_by_type=resources_by_type,
            efficiency_by_type=efficiency_by_type,
            overall_efficiency=overall_efficiency,
            total_consumption=total_consumption,
            active_alerts=active_alerts,
            occupancy=total_occupancy,
            max_occupancy=total_max_occupancy,
            area_sqft=total_area
        )

    def get_resource_efficiency(self, resource_type: ResourceType) -> ResourceEfficiency:
        """Get efficiency metrics for a specific resource type."""
        resources = self.get_resources_by_type(resource_type)

        if not resources:
            return ResourceEfficiency(
                resource_type=resource_type,
                total_resources=0,
                optimal_count=0,
                warning_count=0,
                critical_count=0,
                offline_count=0,
                average_efficiency=0.0,
                total_consumption=0.0,
                unit="",
                target_consumption=None,
                efficiency_trend="stable"
            )

        # Count by status
        optimal_count = len([r for r in resources if r.status == ResourceStatus.OPTIMAL])
        warning_count = len([r for r in resources if r.status == ResourceStatus.WARNING])
        critical_count = len([r for r in resources if r.status == ResourceStatus.CRITICAL])
        offline_count = len([r for r in resources if r.status == ResourceStatus.OFFLINE])

        # Calculate average efficiency
        efficiencies = [self.calculate_resource_efficiency(r) for r in resources]
        avg_efficiency = sum(efficiencies) / len(efficiencies)

        # Total consumption
        total_consumption = sum(r.current_value for r in resources)

        # Get unit from first resource
        unit = resources[0].unit if resources else ""

        # Calculate target consumption (if applicable)
        targets = [r.target_value for r in resources if r.target_value is not None]
        target_consumption = sum(targets) if targets else None

        # Determine trend (simplified - would need historical data for real trend)
        if avg_efficiency >= 80:
            trend = "improving"
        elif avg_efficiency >= 60:
            trend = "stable"
        else:
            trend = "declining"

        return ResourceEfficiency(
            resource_type=resource_type,
            total_resources=len(resources),
            optimal_count=optimal_count,
            warning_count=warning_count,
            critical_count=critical_count,
            offline_count=offline_count,
            average_efficiency=avg_efficiency,
            total_consumption=total_consumption,
            unit=unit,
            target_consumption=target_consumption,
            efficiency_trend=trend
        )

    def get_building_overview(self) -> BuildingOverview:
        """Get complete building overview with floors and efficiency metrics."""
        now = datetime.utcnow().isoformat() + "Z"

        # Get all floors
        floors = self.get_floors()
        floor_summaries = [self.get_floor_summary(f) for f in floors]

        # Get efficiency for each resource type
        resource_efficiencies = {}
        for rt in ResourceType:
            efficiency = self.get_resource_efficiency(rt)
            if efficiency.total_resources > 0:
                resource_efficiencies[rt.value] = efficiency

        # Calculate overall building efficiency
        all_efficiencies = []
        for fs in floor_summaries:
            all_efficiencies.append(fs.overall_efficiency)
        overall_efficiency = sum(all_efficiencies) / len(all_efficiencies) if all_efficiencies else 100.0

        # Calculate totals
        total_energy = sum(fs.total_consumption.get("electricity_kwh", 0) for fs in floor_summaries)
        total_water = sum(fs.total_consumption.get("water_gal", 0) for fs in floor_summaries)
        carbon_footprint = total_energy * 0.4  # Simplified CO2 calculation

        # Alert counts
        active_alerts = len(self.get_active_alerts())
        critical_alerts = len(self.get_critical_alerts())

        # Occupancy
        total_occupancy = sum(fs.occupancy for fs in floor_summaries)
        total_max_occupancy = sum(fs.max_occupancy for fs in floor_summaries)

        return BuildingOverview(
            building_name=self.building_name,
            total_floors=len(floors),
            total_zones=len(self.zones),
            total_resources=len(self.resources),
            floors=floor_summaries,
            resource_efficiencies=resource_efficiencies,
            overall_efficiency=overall_efficiency,
            total_energy_consumption=total_energy,
            total_water_consumption=total_water,
            carbon_footprint=carbon_footprint,
            active_alerts=active_alerts,
            critical_alerts=critical_alerts,
            total_occupancy=total_occupancy,
            total_max_occupancy=total_max_occupancy,
            timestamp=now
        )

    def get_floor_resources(self, floor: int) -> Dict[str, Any]:
        """Get detailed resource information for a floor."""
        zones = self.get_zones_by_floor(floor)

        floor_data = {
            "floor_number": floor,
            "zones": [],
            "resources": [],
            "summary": self.get_floor_summary(floor).to_dict()
        }

        for zone in zones:
            zone_resources = self.get_resources_by_zone(zone.zone_id)
            zone_alerts = self.get_alerts_by_zone(zone.zone_id)

            zone_data = {
                "zone_id": zone.zone_id,
                "name": zone.name,
                "area_sqft": zone.area_sqft,
                "occupancy": zone.occupancy,
                "max_occupancy": zone.max_occupancy,
                "coordinates": zone.coordinates,
                "resources": [r.to_dict() for r in zone_resources],
                "active_alerts": len([a for a in zone_alerts if a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]]),
                "zone_efficiency": sum(self.calculate_resource_efficiency(r) for r in zone_resources) / len(zone_resources) if zone_resources else 100.0
            }
            floor_data["zones"].append(zone_data)
            floor_data["resources"].extend([r.to_dict() for r in zone_resources])

        return floor_data


# Global data store instance
data_store = BuildingDataStore()
