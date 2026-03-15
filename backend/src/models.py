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
    SECURITY = "security"
    ELEVATOR = "elevator"
    FIRE_SAFETY = "fire_safety"
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
            "overall_efficiency": self.overall_efficiency,
            "energy_consumption": self.energy_consumption,
            "water_consumption": self.water_consumption,
            "carbon_footprint": self.carbon_footprint
        }


# Sample building configuration
SAMPLE_ZONES = [
    Zone(
        zone_id="lobby",
        name="Main Lobby",
        floor=1,
        area_sqft=2000,
        coordinates={"x": 10, "y": 10, "width": 40, "height": 30},
        resources=["lobby_hvac", "lobby_lights", "lobby_security"],
        max_occupancy=30
    ),
    Zone(
        zone_id="office_a",
        name="Office Area A",
        floor=2,
        area_sqft=3500,
        coordinates={"x": 10, "y": 50, "width": 60, "height": 40},
        resources=["office_a_hvac", "office_a_lights", "office_a_electricity"],
        max_occupancy=50
    ),
    Zone(
        zone_id="office_b",
        name="Office Area B",
        floor=2,
        area_sqft=3500,
        coordinates={"x": 80, "y": 50, "width": 60, "height": 40},
        resources=["office_b_hvac", "office_b_lights", "office_b_electricity"],
        max_occupancy=50
    ),
    Zone(
        zone_id="server_room",
        name="Server Room",
        floor=1,
        area_sqft=800,
        coordinates={"x": 60, "y": 10, "width": 25, "height": 20},
        resources=["server_hvac", "server_electricity", "server_fire"],
        max_occupancy=5
    ),
    Zone(
        zone_id="cafeteria",
        name="Cafeteria",
        floor=1,
        area_sqft=1500,
        coordinates={"x": 10, "y": 100, "width": 50, "height": 35},
        resources=["cafe_hvac", "cafe_lights", "cafe_water", "cafe_electricity"],
        max_occupancy=80
    ),
]

SAMPLE_RESOURCES = [
    # HVAC Resources
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
    
    # Lighting Resources
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
    
    # Electricity Resources
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
    
    # Security Resources
    Resource(
        resource_id="lobby_security",
        resource_type=ResourceType.SECURITY,
        name="Lobby Security System",
        zone_id="lobby",
        unit="status",
        current_value=1.0,  # 1 = armed, 0 = disarmed
        target_value=1.0,
        min_threshold=0.0,
        max_threshold=1.0
    ),
    
    # Fire Safety Resources
    Resource(
        resource_id="server_fire",
        resource_type=ResourceType.FIRE_SAFETY,
        name="Server Room Fire Suppression",
        zone_id="server_room",
        unit="status",
        current_value=1.0,  # 1 = active, 0 = inactive
        target_value=1.0,
        min_threshold=0.0,
        max_threshold=1.0
    ),
]


class BuildingDataStore:
    """In-memory data store for building resources and alerts."""
    
    def __init__(self):
        self.zones: Dict[str, Zone] = {}
        self.resources: Dict[str, Resource] = {}
        self.alerts: Dict[str, Alert] = {}
        self.readings: List[ResourceReading] = []
        self.remediation_actions: Dict[str, RemediationAction] = {}
        
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


# Global data store instance
data_store = BuildingDataStore()
