"""
EcoSync Alert Manager
Handles alert lifecycle, vulnerability detection, and technician escalation.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

from models import (
    Resource, ResourceType, Zone, Alert, AlertSeverity, AlertStatus,
    ResourceStatus, data_store
)
from remediation_engine import remediation_engine


class AlertManager:
    """
    Manages building alerts with vulnerability-based escalation.
    Detects anomalies, attempts automated fixes, and escalates to technicians when needed.
    """
    
    def __init__(self):
        self.alert_rules = self._init_alert_rules()
    
    def _init_alert_rules(self) -> Dict[ResourceType, Dict[str, Any]]:
        """Initialize alert rules for each resource type."""
        return {
            ResourceType.HVAC: {
                "threshold_breach": True,
                "monitoring_duration_minutes": 10,
                "severity_map": {
                    "minor": AlertSeverity.WARNING,
                    "major": AlertSeverity.CRITICAL
                }
            },
            ResourceType.WATER: {
                "threshold_breach": True,
                "monitoring_duration_minutes": 15,
                "severity_map": {
                    "minor": AlertSeverity.WARNING,
                    "major": AlertSeverity.CRITICAL
                }
            },
            ResourceType.ELECTRICITY: {
                "threshold_breach": True,
                "monitoring_duration_minutes": 5,
                "severity_map": {
                    "minor": AlertSeverity.WARNING,
                    "major": AlertSeverity.CRITICAL
                }
            },
            ResourceType.LIGHTING: {
                "threshold_breach": True,
                "monitoring_duration_minutes": 10,
                "severity_map": {
                    "minor": AlertSeverity.WARNING,
                    "major": AlertSeverity.CRITICAL
                }
            },
            ResourceType.SECURITY: {
                "threshold_breach": True,
                "monitoring_duration_minutes": 0,  # Immediate escalation
                "severity_map": {
                    "any": AlertSeverity.CRITICAL
                }
            },
            ResourceType.FIRE_SAFETY: {
                "threshold_breach": True,
                "monitoring_duration_minutes": 0,  # Immediate escalation
                "severity_map": {
                    "any": AlertSeverity.CRITICAL
                }
            },
            ResourceType.ELEVATOR: {
                "threshold_breach": True,
                "monitoring_duration_minutes": 5,
                "severity_map": {
                    "minor": AlertSeverity.WARNING,
                    "major": AlertSeverity.CRITICAL
                }
            },
            ResourceType.AIR_QUALITY: {
                "threshold_breach": True,
                "monitoring_duration_minutes": 15,
                "severity_map": {
                    "minor": AlertSeverity.WARNING,
                    "major": AlertSeverity.CRITICAL
                }
            },
        }
    
    def check_resource(self, resource: Resource) -> Optional[Alert]:
        """
        Check a resource for anomalies and create alerts if needed.
        
        Args:
            resource: The resource to check
            
        Returns:
            Alert if anomaly detected, None otherwise
        """
        # Skip if resource is offline
        if resource.status == ResourceStatus.OFFLINE:
            return None
        
        # Check for existing active alert for this resource
        existing_alerts = data_store.get_alerts_by_resource(resource.resource_id)
        active_alert = next(
            (a for a in existing_alerts if a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]),
            None
        )
        
        # Check thresholds
        threshold_violation = self._check_thresholds(resource)
        
        if not threshold_violation:
            # No violation - if there was an active alert, mark it resolved
            if active_alert:
                data_store.update_alert_status(active_alert.alert_id, AlertStatus.RESOLVED)
            return None
        
        # If there's already an active alert, don't create a new one
        if active_alert:
            return active_alert
        
        # Create new alert
        alert = self._create_alert(resource, threshold_violation)
        data_store.add_alert(alert)
        
        # Attempt automated remediation (unless immediate escalation required)
        rules = self.alert_rules.get(resource.resource_type, {})
        if rules.get("monitoring_duration_minutes", 10) > 0:
            remediation_engine.attempt_remediation(alert)
        else:
            # Immediate escalation for critical systems
            remediation_engine._escalate_alert(
                alert,
                f"{resource.resource_type.value} system requires immediate technician attention"
            )
        
        return alert
    
    def _check_thresholds(self, resource: Resource) -> Optional[Dict[str, Any]]:
        """
        Check if resource value is outside acceptable thresholds.
        
        Returns:
            Dict with violation details, or None if within thresholds
        """
        value = resource.current_value
        
        # Check max threshold
        if resource.max_threshold is not None and value > resource.max_threshold:
            return {
                "type": "max_threshold_exceeded",
                "current_value": value,
                "threshold": resource.max_threshold,
                "severity": "major" if value > resource.max_threshold * 1.2 else "minor"
            }
        
        # Check min threshold
        if resource.min_threshold is not None and value < resource.min_threshold:
            return {
                "type": "min_threshold_breached",
                "current_value": value,
                "threshold": resource.min_threshold,
                "severity": "major" if value < resource.min_threshold * 0.8 else "minor"
            }
        
        return None
    
    def _create_alert(self, resource: Resource, violation: Dict[str, Any]) -> Alert:
        """Create an alert from a threshold violation."""
        alert_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat() + "Z"
        
        # Determine severity
        rules = self.alert_rules.get(resource.resource_type, {})
        severity_map = rules.get("severity_map", {})
        severity = severity_map.get(violation["severity"], AlertSeverity.WARNING)
        
        # Create alert title and description
        title, description = self._generate_alert_content(resource, violation)
        
        return Alert(
            alert_id=alert_id,
            severity=severity,
            status=AlertStatus.ACTIVE,
            resource_type=resource.resource_type,
            resource_id=resource.resource_id,
            zone_id=resource.zone_id,
            title=title,
            description=description,
            current_value=violation["current_value"],
            expected_value=resource.target_value or 0.0,
            threshold_value=violation["threshold"],
            unit=resource.unit,
            created_at=now,
            updated_at=now,
            remediation_attempted=False,
            remediation_actions=[]
        )
    
    def _generate_alert_content(self, resource: Resource, violation: Dict[str, Any]) -> tuple:
        """Generate human-readable alert title and description."""
        violation_type = violation["type"]
        current = violation["current_value"]
        threshold = violation["threshold"]
        
        if resource.resource_type == ResourceType.HVAC:
            if violation_type == "max_threshold_exceeded":
                title = f"High Temperature in {resource.name}"
                description = f"Temperature is {current}°C, exceeding threshold of {threshold}°C. HVAC system may be malfunctioning."
            else:
                title = f"Low Temperature in {resource.name}"
                description = f"Temperature is {current}°C, below minimum of {threshold}°C. Heating system may be malfunctioning."
        
        elif resource.resource_type == ResourceType.WATER:
            if violation_type == "max_threshold_exceeded":
                title = f"High Water Usage in {resource.name}"
                description = f"Water flow is {current} gal/min, exceeding normal threshold of {threshold} gal/min. Possible leak detected."
            else:
                title = f"Low Water Pressure in {resource.name}"
                description = f"Water pressure is {current} gal/min, below minimum of {threshold} gal/min. Pump may be failing."
        
        elif resource.resource_type == ResourceType.ELECTRICITY:
            title = f"High Power Consumption in {resource.name}"
            description = f"Power consumption is {current} kW, exceeding safe threshold of {threshold} kW. Circuit overload risk."
        
        elif resource.resource_type == ResourceType.LIGHTING:
            if violation_type == "max_threshold_exceeded":
                title = f"Excessive Lighting in {resource.name}"
                description = f"Lighting level at {current}%, exceeding efficient threshold of {threshold}%."
            else:
                title = f"Lighting Failure in {resource.name}"
                description = f"Lighting level at {current}%, below required minimum of {threshold}%. Possible electrical issue."
        
        elif resource.resource_type == ResourceType.SECURITY:
            title = f"Security System Alert - {resource.name}"
            description = f"Security system in {resource.zone_id} requires immediate attention. System may be compromised."
        
        elif resource.resource_type == ResourceType.FIRE_SAFETY:
            title = f"Fire Safety System Alert - {resource.name}"
            description = f"Fire safety system in {resource.zone_id} has detected an issue. Immediate inspection required."
        
        elif resource.resource_type == ResourceType.ELEVATOR:
            title = f"Elevator Issue - {resource.name}"
            description = f"Elevator in {resource.zone_id} is experiencing problems. Technician inspection required."
        
        elif resource.resource_type == ResourceType.AIR_QUALITY:
            title = f"Poor Air Quality in {resource.name}"
            description = f"Air quality metrics in {resource.zone_id} are outside acceptable ranges. Ventilation system check required."
        
        else:
            title = f"Resource Alert - {resource.name}"
            description = f"Resource value {current} is outside acceptable range. Threshold: {threshold}."
        
        return title, description
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get summary of all alerts."""
        all_alerts = list(data_store.alerts.values())
        active_alerts = [a for a in all_alerts if a.status in [AlertStatus.ACTIVE, AlertStatus.MONITORING]]
        critical_alerts = [a for a in active_alerts if a.severity == AlertSeverity.CRITICAL]
        escalated_alerts = [a for a in all_alerts if a.status == AlertStatus.ESCALATED]
        
        # Group by resource type
        by_resource_type = {}
        for alert in active_alerts:
            rt = alert.resource_type.value
            by_resource_type[rt] = by_resource_type.get(rt, 0) + 1
        
        # Group by zone
        by_zone = {}
        for alert in active_alerts:
            by_zone[alert.zone_id] = by_zone.get(alert.zone_id, 0) + 1
        
        return {
            "total_alerts": len(all_alerts),
            "active_alerts": len(active_alerts),
            "critical_alerts": len(critical_alerts),
            "escalated_alerts": len(escalated_alerts),
            "resolved_alerts": len([a for a in all_alerts if a.status == AlertStatus.RESOLVED]),
            "by_resource_type": by_resource_type,
            "by_zone": by_zone,
            "requires_immediate_attention": len(critical_alerts) > 0 or len(escalated_alerts) > 0
        }
    
    def acknowledge_alert(self, alert_id: str, user_id: str = "system") -> Optional[Alert]:
        """Acknowledge an alert (mark as being handled)."""
        alert = data_store.get_alert(alert_id)
        if alert:
            alert.updated_at = datetime.utcnow().isoformat() + "Z"
            # Add acknowledgment to metadata
            if "acknowledgments" not in alert.__dict__:
                alert.__dict__["acknowledgments"] = []
            alert.__dict__["acknowledgments"].append({
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
        return alert
    
    def resolve_alert(self, alert_id: str, resolution_notes: str = "") -> Optional[Alert]:
        """Manually resolve an alert."""
        alert = data_store.update_alert_status(alert_id, AlertStatus.RESOLVED)
        if alert:
            alert.__dict__["resolution_notes"] = resolution_notes
            alert.__dict__["resolved_by"] = "manual"
        return alert
    
    def get_technician_alerts(self) -> List[Alert]:
        """Get all alerts that have been escalated to technicians."""
        return [a for a in data_store.alerts.values() if a.status == AlertStatus.ESCALATED]
    
    def simulate_anomaly(self, resource_id: str, anomaly_type: str = "threshold_breach") -> Optional[Alert]:
        """
        Simulate an anomaly for testing purposes.
        
        Args:
            resource_id: Resource to simulate anomaly for
            anomaly_type: Type of anomaly to simulate
            
        Returns:
            Created alert, or None if resource not found
        """
        resource = data_store.get_resource(resource_id)
        if not resource:
            return None
        
        # Modify resource value to trigger threshold violation
        if anomaly_type == "threshold_breach":
            if resource.max_threshold:
                # Set value above max threshold
                new_value = resource.max_threshold * 1.3
            elif resource.min_threshold:
                # Set value below min threshold
                new_value = resource.min_threshold * 0.7
            else:
                new_value = resource.current_value * 1.5
            
            data_store.update_resource_value(resource_id, new_value)
        
        # Check resource to trigger alert creation
        return self.check_resource(resource)


# Global alert manager instance
alert_manager = AlertManager()
