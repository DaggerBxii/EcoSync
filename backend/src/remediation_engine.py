"""
EcoSync Remediation Engine
Handles automated fixes for building resource anomalies.
Attempts self-healing before escalating to technician alerts.
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass

from models import (
    Resource, ResourceType, Alert, AlertStatus, AlertSeverity,
    RemediationAction, data_store
)


@dataclass
class RemediationResult:
    """Result of a remediation attempt."""
    success: bool
    message: str
    new_value: Optional[float] = None
    requires_escalation: bool = False


class RemediationEngine:
    """
    Automated remediation engine for building resource issues.
    Attempts to fix anomalies before escalating to human technicians.
    """
    
    def __init__(self):
        self.remediation_handlers: Dict[ResourceType, Callable] = {
            ResourceType.HVAC: self._remediate_hvac,
            ResourceType.WATER: self._remediate_water,
            ResourceType.LIGHTING: self._remediate_lighting,
            ResourceType.ELECTRICITY: self._remediate_electricity,
            ResourceType.SECURITY: self._remediate_security,
            ResourceType.FIRE_SAFETY: self._remediate_fire_safety,
            ResourceType.ELEVATOR: self._remediate_elevator,
            ResourceType.AIR_QUALITY: self._remediate_air_quality,
        }
        
        # Track ongoing remediation attempts
        self.active_remediations: Dict[str, Dict[str, Any]] = {}
    
    def attempt_remediation(self, alert: Alert) -> RemediationAction:
        """
        Attempt to automatically remediate an alert.
        
        Args:
            alert: The alert to remediate
            
        Returns:
            RemediationAction with the result
        """
        resource = data_store.get_resource(alert.resource_id)
        if not resource:
            return self._create_failed_action(alert, "Resource not found")
        
        # Check if resource is controllable
        if not resource.is_controllable:
            return self._create_failed_action(
                alert, 
                f"Resource {resource.name} is not auto-controllable. Manual intervention required."
            )
        
        # Get the appropriate handler
        handler = self.remediation_handlers.get(alert.resource_type)
        if not handler:
            return self._create_failed_action(
                alert,
                f"No remediation handler for {alert.resource_type.value}"
            )
        
        # Create remediation action
        action_id = str(uuid.uuid4())
        action = RemediationAction(
            action_id=action_id,
            alert_id=alert.alert_id,
            action_type=f"auto_remediate_{alert.resource_type.value}",
            description=f"Attempting automated remediation for {alert.title}",
            parameters={
                "resource_id": alert.resource_id,
                "current_value": alert.current_value,
                "expected_value": alert.expected_value,
                "threshold": alert.threshold_value
            },
            timestamp=datetime.utcnow().isoformat() + "Z",
            result="pending"
        )
        
        # Execute the handler
        try:
            result = handler(resource, alert)
            action.result = "success" if result.success else "failed"
            action.result_message = result.message
            
            if result.new_value is not None:
                action.parameters["new_value"] = result.new_value
            
            # Track active remediation for monitoring
            if result.success:
                self.active_remediations[alert.alert_id] = {
                    "action_id": action_id,
                    "alert_id": alert.alert_id,
                    "resource_id": alert.resource_id,
                    "started_at": datetime.utcnow(),
                    "expected_resolution_minutes": 10,
                    "status": "monitoring"
                }
                
                # Update alert status to monitoring
                data_store.update_alert_status(alert.alert_id, AlertStatus.MONITORING)
            else:
                # Immediate escalation if remediation failed
                if result.requires_escalation:
                    self._escalate_alert(alert, result.message)
                    
        except Exception as e:
            action.result = "failed"
            action.result_message = f"Remediation error: {str(e)}"
            self._escalate_alert(alert, f"Remediation system error: {str(e)}")
        
        # Save the action
        data_store.add_remediation_action(action)
        
        return action
    
    def _create_failed_action(self, alert: Alert, message: str) -> RemediationAction:
        """Create a failed remediation action."""
        action = RemediationAction(
            action_id=str(uuid.uuid4()),
            alert_id=alert.alert_id,
            action_type="auto_remediate_failed",
            description=message,
            parameters={},
            timestamp=datetime.utcnow().isoformat() + "Z",
            result="failed",
            result_message=message
        )
        data_store.add_remediation_action(action)
        self._escalate_alert(alert, message)
        return action
    
    def _escalate_alert(self, alert: Alert, reason: str):
        """Escalate alert to technician."""
        alert.status = AlertStatus.ESCALATED
        alert.escalation_reason = reason
        alert.updated_at = datetime.utcnow().isoformat() + "Z"
        
        # Set technician info based on resource type
        alert.technician_type = self._get_technician_type(alert.resource_type)
        alert.technician_contact = self._get_technician_contact(alert.resource_type)
        alert.reference_code = self._generate_reference_code(alert)
    
    def _get_technician_type(self, resource_type: ResourceType) -> str:
        """Get the appropriate technician type for a resource."""
        technician_map = {
            ResourceType.HVAC: "HVAC Technician",
            ResourceType.WATER: "Plumber",
            ResourceType.ELECTRICITY: "Electrician",
            ResourceType.LIGHTING: "Electrical Technician",
            ResourceType.SECURITY: "Security Systems Technician",
            ResourceType.FIRE_SAFETY: "Fire Safety Technician",
            ResourceType.ELEVATOR: "Elevator Technician",
            ResourceType.AIR_QUALITY: "HVAC Technician",
        }
        return technician_map.get(resource_type, "Maintenance Technician")
    
    def _get_technician_contact(self, resource_type: ResourceType) -> Dict[str, str]:
        """Get vendor contact info based on resource type."""
        contacts = {
            ResourceType.HVAC: {
                "company": "CoolAir Services",
                "phone": "+1-555-HVAC-911",
                "email": "emergency@coolair-services.com"
            },
            ResourceType.WATER: {
                "company": "AquaFlow Plumbing",
                "phone": "+1-555-PLUM-911",
                "email": "emergency@aquaflow.com"
            },
            ResourceType.ELECTRICITY: {
                "company": "PowerTech Electric",
                "phone": "+1-555-ELEC-911",
                "email": "emergency@powertech.com"
            },
            ResourceType.LIGHTING: {
                "company": "PowerTech Electric",
                "phone": "+1-555-ELEC-911",
                "email": "emergency@powertech.com"
            },
            ResourceType.SECURITY: {
                "company": "SecureGuard Systems",
                "phone": "+1-555-SECU-911",
                "email": "emergency@secureguard.com"
            },
            ResourceType.FIRE_SAFETY: {
                "company": "FireSafe Solutions",
                "phone": "+1-555-FIRE-911",
                "email": "emergency@firesafe.com"
            },
            ResourceType.ELEVATOR: {
                "company": "ElevatorTech Pro",
                "phone": "+1-555-ELEV-911",
                "email": "emergency@elevatortech.com"
            },
            ResourceType.AIR_QUALITY: {
                "company": "CleanAir Specialists",
                "phone": "+1-555-AIR-911",
                "email": "emergency@cleanair.com"
            },
        }
        return contacts.get(resource_type, {
            "company": "General Maintenance",
            "phone": "+1-555-MAINT-01",
            "email": "emergency@maintenance.com"
        })
    
    def _generate_reference_code(self, alert: Alert) -> str:
        """Generate a unique reference code for the alert."""
        timestamp = datetime.utcnow().strftime("%y%m%d")
        resource_code = alert.resource_type.value[:3].upper()
        zone_code = alert.zone_id[:3].upper()
        return f"{resource_code}-{zone_code}-{timestamp}-{alert.alert_id[:4]}"
    
    def check_remediation_status(self, alert_id: str) -> Optional[Dict[str, Any]]:
        """
        Check if a remediation attempt has resolved the issue.
        Called periodically to monitor active remediations.
        
        Returns:
            Dict with status info, or None if not found
        """
        remediation = self.active_remediations.get(alert_id)
        if not remediation:
            return None
        
        alert = data_store.get_alert(alert_id)
        resource = data_store.get_resource(remediation["resource_id"])
        
        if not alert or not resource:
            return None
        
        # Check if enough time has passed
        elapsed = datetime.utcnow() - remediation["started_at"]
        
        # Check if issue is resolved
        is_resolved = self._is_issue_resolved(alert, resource)
        
        if is_resolved:
            # Mark as resolved
            remediation["status"] = "resolved"
            data_store.update_alert_status(alert_id, AlertStatus.RESOLVED)
            del self.active_remediations[alert_id]
            
            return {
                "status": "resolved",
                "message": f"Issue resolved after {elapsed.seconds // 60} minutes",
                "elapsed_minutes": elapsed.seconds // 60
            }
        
        # Check if we've exceeded monitoring time
        if elapsed > timedelta(minutes=remediation["expected_resolution_minutes"]):
            # Escalate to technician
            remediation["status"] = "escalated"
            self._escalate_alert(
                alert,
                f"Automated fix did not resolve issue after {remediation['expected_resolution_minutes']} minutes"
            )
            del self.active_remediations[alert_id]
            
            return {
                "status": "escalated",
                "message": f"Issue not resolved after {elapsed.seconds // 60} minutes. Technician required.",
                "elapsed_minutes": elapsed.seconds // 60
            }
        
        # Still monitoring
        return {
            "status": "monitoring",
            "message": f"Monitoring for resolution... ({elapsed.seconds // 60} minutes elapsed)",
            "elapsed_minutes": elapsed.seconds // 60,
            "remaining_minutes": remediation["expected_resolution_minutes"] - (elapsed.seconds // 60)
        }
    
    def _is_issue_resolved(self, alert: Alert, resource: Resource) -> bool:
        """Check if the alert condition is resolved."""
        # For HVAC: temperature should be back within threshold
        if alert.resource_type == ResourceType.HVAC:
            if alert.current_value > alert.expected_value:  # Too hot
                return resource.current_value <= alert.threshold_value
            else:  # Too cold
                return resource.current_value >= alert.threshold_value
        
        # For water: pressure should be back to normal
        if alert.resource_type == ResourceType.WATER:
            return resource.current_value >= alert.threshold_value
        
        # For electricity: load should be reduced
        if alert.resource_type == ResourceType.ELECTRICITY:
            return resource.current_value <= alert.threshold_value
        
        # For lighting: should be at expected level
        if alert.resource_type == ResourceType.LIGHTING:
            return resource.current_value >= alert.expected_value * 0.9
        
        # Default: check if value is within acceptable range
        if resource.min_threshold is not None and resource.current_value < resource.min_threshold:
            return False
        if resource.max_threshold is not None and resource.current_value > resource.max_threshold:
            return False
        
        return True
    
    # ==================== Resource-Specific Remediation Handlers ====================
    
    def _remediate_hvac(self, resource: Resource, alert: Alert) -> RemediationResult:
        """
        Remediate HVAC issues.
        
        Scenarios:
        - Temperature too high: Increase cooling, open dampers
        - Temperature too low: Increase heating
        """
        current_temp = resource.current_value
        target_temp = resource.target_value or 22.0
        
        if current_temp > alert.threshold_value:  # Too hot
            # Attempt 1: Increase cooling power
            new_temp = current_temp - 2.0  # Simulate cooling effect
            data_store.update_resource_value(resource.resource_id, new_temp)
            
            return RemediationResult(
                success=True,
                message=f"Increased cooling power. Target: {target_temp}°C. Monitoring...",
                new_value=new_temp
            )
        
        elif current_temp < alert.threshold_value:  # Too cold
            # Attempt 1: Increase heating
            new_temp = current_temp + 2.0  # Simulate heating effect
            data_store.update_resource_value(resource.resource_id, new_temp)
            
            return RemediationResult(
                success=True,
                message=f"Increased heating power. Target: {target_temp}°C. Monitoring...",
                new_value=new_temp
            )
        
        return RemediationResult(
            success=False,
            message="HVAC temperature within normal range",
            requires_escalation=False
        )
    
    def _remediate_water(self, resource: Resource, alert: Alert) -> RemediationResult:
        """
        Remediate water system issues.
        
        Scenarios:
        - Low pressure: Activate backup pump
        - High usage: Check for leaks
        """
        current_pressure = resource.current_value
        
        if current_pressure < alert.threshold_value:  # Low pressure
            # Attempt: Activate backup pump
            new_pressure = current_pressure + 1.5  # Simulate pump activation
            data_store.update_resource_value(resource.resource_id, new_pressure)
            
            return RemediationResult(
                success=True,
                message=f"Activated backup pump. Monitoring pressure recovery...",
                new_value=new_pressure
            )
        
        return RemediationResult(
            success=False,
            message="Water pressure within normal range",
            requires_escalation=False
        )
    
    def _remediate_lighting(self, resource: Resource, alert: Alert) -> RemediationResult:
        """
        Remediate lighting issues.
        
        Scenarios:
        - Lights off during occupied hours: Reset controller
        - Dim lights: Increase brightness
        """
        current_level = resource.current_value
        expected_level = alert.expected_value
        
        if current_level < expected_level * 0.5:  # Lights mostly off
            # Attempt: Reset lighting controller
            new_level = expected_level
            data_store.update_resource_value(resource.resource_id, new_level)
            
            return RemediationResult(
                success=True,
                message=f"Reset lighting controller. Restored to {new_level}% brightness. Monitoring...",
                new_value=new_level
            )
        
        return RemediationResult(
            success=False,
            message="Lighting levels acceptable",
            requires_escalation=False
        )
    
    def _remediate_electricity(self, resource: Resource, alert: Alert) -> RemediationResult:
        """
        Remediate electrical issues.
        
        Scenarios:
        - Circuit overload: Shed non-critical loads
        - High consumption: Optimize usage
        """
        current_load = resource.current_value
        max_load = alert.threshold_value
        
        if current_load > max_load:  # Overload
            # Attempt: Load shedding (reduce by 20%)
            new_load = current_load * 0.8
            data_store.update_resource_value(resource.resource_id, new_load)
            
            return RemediationResult(
                success=True,
                message=f"Shed non-critical loads. Reduced consumption by 20%. Monitoring...",
                new_value=new_load
            )
        
        return RemediationResult(
            success=False,
            message="Electrical load within normal range",
            requires_escalation=False
        )
    
    def _remediate_security(self, resource: Resource, alert: Alert) -> RemediationResult:
        """Remediate security system issues."""
        # Security issues typically require immediate human attention
        return RemediationResult(
            success=False,
            message="Security system issue requires immediate technician inspection",
            requires_escalation=True
        )
    
    def _remediate_fire_safety(self, resource: Resource, alert: Alert) -> RemediationResult:
        """Remediate fire safety issues."""
        # Fire safety issues always require immediate human attention
        return RemediationResult(
            success=False,
            message="Fire safety system issue requires immediate technician inspection",
            requires_escalation=True
        )
    
    def _remediate_elevator(self, resource: Resource, alert: Alert) -> RemediationResult:
        """Remediate elevator issues."""
        # Elevator issues typically require technician
        return RemediationResult(
            success=False,
            message="Elevator issue requires certified technician",
            requires_escalation=True
        )
    
    def _remediate_air_quality(self, resource: Resource, alert: Alert) -> RemediationResult:
        """
        Remediate air quality issues.
        
        Scenarios:
        - High CO2: Increase ventilation
        - Low humidity: Activate humidifier
        """
        # Attempt to increase ventilation
        return RemediationResult(
            success=True,
            message="Increased ventilation rate. Monitoring air quality...",
            new_value=resource.current_value
        )


# Global remediation engine instance
remediation_engine = RemediationEngine()
