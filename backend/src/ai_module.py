"""
EcoSync AI Module - Building Resource Management
Uses Google Gemini AI for intelligent building resource optimization,
anomaly detection, and vulnerability-based alerts.
"""

import os
import json
import random
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-genai not installed. Using fallback mode.")

from models import (
    Resource, ResourceType, Zone, Alert, AlertStatus, AlertSeverity,
    BuildingMetrics, data_store
)
from alert_manager import alert_manager
from remediation_engine import remediation_engine


class EcoBrain:
    """
    AI module for EcoSync Building Resource Management.
    Uses Google Gemini for intelligent predictions, anomaly detection,
    and vulnerability-based alerts with automated remediation.
    """

    def __init__(self, use_gemini: bool = True):
        """Initialize the AI module."""
        self.client = None
        self.model_name = "gemini-2.5-flash-lite"
        self.using_fallback = True

        # Historical data for context
        self._historical_readings: List[Dict] = []
        self._anomaly_history: List[Dict] = []
        
        # Configuration
        self._cache_max_size = 168  # 1 week of hourly data
        
        if use_gemini:
            self._initialize_gemini()

    def _initialize_gemini(self) -> bool:
        """Initialize the Gemini client."""
        try:
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                print("EcoBrain: GEMINI_API_KEY not found in environment.")
                print("EcoBrain: Set GEMINI_API_KEY environment variable or using fallback mode.")
                return False

            if not GEMINI_AVAILABLE:
                print("EcoBrain: google-genai package not installed.")
                print("EcoBrain: Install with: pip install google-genai")
                return False

            self.client = genai.Client(api_key=api_key)
            self.using_fallback = False
            print("EcoBrain: Gemini AI initialized successfully.")
            return True

        except Exception as e:
            print(f"EcoBrain: Error initializing Gemini: {e}")
            self.using_fallback = True
            return False

    def get_building_decision(self) -> Dict[str, Any]:
        """
        Generate a comprehensive building management decision.
        
        Returns:
            Dictionary with building status, resource metrics, alerts, and AI insights
        """
        timestamp = datetime.utcnow()
        
        # Get current building state
        building_metrics = data_store.get_building_metrics()
        zones = data_store.get_all_zones()
        resources = data_store.get_all_resources()
        active_alerts = data_store.get_active_alerts()
        critical_alerts = data_store.get_critical_alerts()
        
        # Check all resources for anomalies
        self._check_resources_for_anomalies(resources)
        
        # Check remediation status for active remediations
        self._check_remediation_status()
        
        if self.using_fallback or self.client is None:
            return self._fallback_building_decision(
                timestamp, building_metrics, zones, resources, active_alerts, critical_alerts
            )

        try:
            # Get AI prediction from Gemini
            prediction = self._get_gemini_building_prediction(
                timestamp, building_metrics, zones, resources, active_alerts
            )
            return prediction
        except Exception as e:
            print(f"EcoBrain: Error getting Gemini prediction: {e}")
            return self._fallback_building_decision(
                timestamp, building_metrics, zones, resources, active_alerts, critical_alerts
            )

    def _check_resources_for_anomalies(self, resources: List[Resource]):
        """Check all resources for anomalies and create alerts."""
        for resource in resources:
            # Simulate some randomness for demo purposes
            if random.random() < 0.05:  # 5% chance of anomaly
                # Simulate a threshold breach
                if resource.max_threshold:
                    data_store.update_resource_value(
                        resource.resource_id,
                        resource.max_threshold * 1.2
                    )
            
            # Check for alerts
            alert_manager.check_resource(resource)

    def _check_remediation_status(self):
        """Check status of active remediations."""
        active_remediations = list(remediation_engine.active_remediations.keys())
        for alert_id in active_remediations:
            remediation_engine.check_remediation_status(alert_id)

    def _get_gemini_building_prediction(
        self, timestamp: datetime, metrics: BuildingMetrics,
        zones: List[Zone], resources: List[Resource], alerts: List[Alert]
    ) -> Dict[str, Any]:
        """Get building prediction from Gemini AI."""
        
        # Build context from historical data
        historical_context = self._build_historical_context()
        
        # Build resource summary
        resource_summary = self._build_resource_summary(resources)
        
        # Build alert summary
        alert_summary = self._build_alert_summary(alerts)
        
        # Build the prompt
        prompt = self._build_building_prediction_prompt(
            timestamp, metrics, zones, resource_summary, alert_summary, historical_context
        )

        # Call Gemini API
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=800,
                response_mime_type="application/json"
            )
        )

        # Parse the response
        result = self._parse_gemini_response(response.text, timestamp, metrics, alerts)
        
        return result

    def _build_building_prediction_prompt(
        self, timestamp: datetime, metrics: BuildingMetrics,
        zones: List[Zone], resource_summary: Dict, alert_summary: Dict,
        historical_context: str
    ) -> str:
        """Build the prompt for Gemini building prediction."""
        
        current_time = timestamp.strftime("%Y-%m-%d %H:%M:%S")
        
        # Get critical alerts for context
        critical_alerts = [a for a in data_store.get_critical_alerts()]
        escalated_alerts = alert_manager.get_technician_alerts()
        
        prompt = f"""You are EcoSync, an AI building resource management system. Analyze the current building state and provide optimization recommendations.

CURRENT CONTEXT:
- Time: {current_time}
- Total Zones: {metrics.total_zones}
- Active Zones: {metrics.active_zones}
- Total Resources: {metrics.total_resources}
- Overall Efficiency: {metrics.overall_efficiency}%
- Energy Consumption: {metrics.energy_consumption} kW
- Water Consumption: {metrics.water_consumption} gal/min
- Active Alerts: {metrics.active_alerts}
- Critical Alerts: {metrics.critical_alerts}

RESOURCE SUMMARY:
{json.dumps(resource_summary, indent=2)}

ALERT SUMMARY:
{json.dumps(alert_summary, indent=2)}

CRITICAL ALERTS REQUIRING ATTENTION:
{json.dumps([{
    "title": a.title,
    "zone": a.zone_id,
    "description": a.description,
    "technician_type": a.technician_type,
    "reference_code": a.reference_code
} for a in escalated_alerts[:3]], indent=2)}

{historical_context}

TASK:
Analyze the building's resource state and provide predictions in JSON format.

RESPONSE FORMAT (JSON only, no markdown):
{{
    "system_status": "<optimal|warning|critical>",
    "efficiency_score": <float 0-100>,
    "building_insight": "<detailed explanation of current state>",
    "confidence_score": <float 0.5-1.0>,
    "recommendations": [
        {{
            "priority": "<high|medium|low>",
            "resource_type": "<electricity|water|hvac|lighting|etc>",
            "action": "<specific action to take>",
            "expected_impact": "<description of expected improvement>",
            "estimated_savings": "<energy/cost savings estimate>"
        }}
    ],
    "alerts_summary": {{
        "requires_immediate_action": <boolean>,
        "technician_dispatches": <int>,
        "automated_fixes_in_progress": <int>
    }},
    "zone_priorities": [
        {{
            "zone_id": "<zone id>",
            "priority": "<high|medium|low>",
            "reason": "<why this zone needs attention>"
        }}
    ]
}}

RESPONSE RULES:
1. system_status should reflect the most critical alert level
2. efficiency_score should be based on overall building metrics
3. building_insight should mention any critical alerts requiring technician dispatch
4. recommendations should prioritize critical issues first
5. zone_priorities should identify zones needing immediate attention
6. confidence_score should reflect prediction certainty

Respond with ONLY the JSON object, no additional text."""

        return prompt

    def _build_resource_summary(self, resources: List[Resource]) -> Dict[str, Any]:
        """Build a summary of resources by type."""
        summary = {}
        for rt in ResourceType:
            rt_resources = [r for r in resources if r.resource_type == rt]
            if rt_resources:
                avg_efficiency = sum(r.efficiency_score for r in rt_resources) / len(rt_resources)
                critical_count = len([r for r in rt_resources if r.status.value == "critical"])
                summary[rt.value] = {
                    "count": len(rt_resources),
                    "avg_efficiency": round(avg_efficiency, 1),
                    "critical": critical_count
                }
        return summary

    def _build_alert_summary(self, alerts: List[Alert]) -> Dict[str, Any]:
        """Build a summary of active alerts."""
        by_severity = {}
        by_type = {}
        escalated = 0
        
        for alert in alerts:
            sev = alert.severity.value
            by_severity[sev] = by_severity.get(sev, 0) + 1
            
            rt = alert.resource_type.value
            by_type[rt] = by_type.get(rt, 0) + 1
            
            if alert.status == AlertStatus.ESCALATED:
                escalated += 1
        
        return {
            "total_active": len(alerts),
            "by_severity": by_severity,
            "by_resource_type": by_type,
            "escalated_to_technicians": escalated
        }

    def _build_historical_context(self) -> str:
        """Build context from historical data."""
        if not self._historical_readings:
            return "HISTORICAL DATA: No historical data available yet."
        
        recent = self._historical_readings[-10:]
        avg_efficiency = sum(r.get("efficiency", 100) for r in recent) / len(recent)
        
        return f"""HISTORICAL DATA (last {len(recent)} readings):
- Average Efficiency: {avg_efficiency:.1f}%
- Recent Anomalies: {len(self._anomaly_history[-5:])}"""

    def _parse_gemini_response(
        self, response_text: str, timestamp: datetime,
        metrics: BuildingMetrics, alerts: List[Alert]
    ) -> Dict[str, Any]:
        """Parse the Gemini response into the building status format."""
        try:
            # Clean the response
            clean_response = response_text.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.startswith("```"):
                clean_response = clean_response[3:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            clean_response = clean_response.strip()

            # Parse JSON
            data = json.loads(clean_response)

            # Build the response
            result = {
                "timestamp": timestamp.isoformat() + "Z",
                "system_status": data.get("system_status", "optimal"),
                "efficiency_score": data.get("efficiency_score", metrics.overall_efficiency),
                "building_insight": data.get("building_insight", "Building operating normally."),
                "confidence_score": data.get("confidence_score", 0.85),
                "metrics": metrics.to_dict(),
                "recommendations": data.get("recommendations", []),
                "alerts_summary": data.get("alerts_summary", {
                    "requires_immediate_action": len(data_store.get_critical_alerts()) > 0,
                    "technician_dispatches": len(alert_manager.get_technician_alerts()),
                    "automated_fixes_in_progress": len(remediation_engine.active_remediations)
                }),
                "zone_priorities": data.get("zone_priorities", []),
                "active_alerts": [a.to_dict() for a in alerts[:5]],  # Top 5 alerts
                "is_anomaly": len(alerts) > 0
            }

            # Update history
            self._update_history(result)

            return result

        except json.JSONDecodeError as e:
            print(f"EcoBrain: Error parsing Gemini response: {e}")
            return self._fallback_building_decision(
                timestamp, metrics, data_store.get_all_zones(),
                data_store.get_all_resources(), alerts, data_store.get_critical_alerts()
            )

    def _fallback_building_decision(
        self, timestamp: datetime, metrics: BuildingMetrics,
        zones: List[Zone], resources: List[Resource],
        alerts: List[Alert], critical_alerts: List[Alert]
    ) -> Dict[str, Any]:
        """Fallback decision when Gemini is not available."""
        
        # Determine system status
        if critical_alerts:
            system_status = "critical"
        elif alerts:
            system_status = "warning"
        else:
            system_status = "optimal"
        
        # Generate insight
        if critical_alerts:
            insight = f"⚠️ {len(critical_alerts)} critical alert(s) requiring immediate technician attention. "
            insight += f"{len(alert_manager.get_technician_alerts())} technician dispatch(es) in progress."
        elif alerts:
            insight = f"⚡ {len(alerts)} active alert(s). Automated remediation in progress for {len(remediation_engine.active_remediations)} issue(s)."
        else:
            insight = "✅ Building operating optimally. All resources within normal parameters."
        
        # Generate recommendations
        recommendations = self._generate_fallback_recommendations(resources, alerts)
        
        # Zone priorities
        zone_priorities = self._generate_zone_priorities(zones, alerts)
        
        result = {
            "timestamp": timestamp.isoformat() + "Z",
            "system_status": system_status,
            "efficiency_score": metrics.overall_efficiency,
            "building_insight": insight,
            "confidence_score": 0.75,
            "metrics": metrics.to_dict(),
            "recommendations": recommendations,
            "alerts_summary": {
                "requires_immediate_action": len(critical_alerts) > 0,
                "technician_dispatches": len(alert_manager.get_technician_alerts()),
                "automated_fixes_in_progress": len(remediation_engine.active_remediations)
            },
            "zone_priorities": zone_priorities,
            "active_alerts": [a.to_dict() for a in alerts[:5]],
            "is_anomaly": len(alerts) > 0
        }

        # Update history
        self._update_history(result)

        return result

    def _generate_fallback_recommendations(
        self, resources: List[Resource], alerts: List[Alert]
    ) -> List[Dict[str, Any]]:
        """Generate fallback recommendations."""
        recommendations = []
        
        # Check for HVAC issues
        hvac_alerts = [a for a in alerts if a.resource_type == ResourceType.HVAC]
        if hvac_alerts:
            recommendations.append({
                "priority": "high",
                "resource_type": "hvac",
                "action": "Schedule HVAC maintenance check",
                "expected_impact": "Prevent temperature control failures",
                "estimated_savings": "Avoid 15-20% energy waste from inefficient cooling"
            })
        
        # Check for high energy consumption
        elec_resources = [r for r in resources if r.resource_type == ResourceType.ELECTRICITY]
        high_elec = [r for r in elec_resources if r.current_value > (r.max_threshold or 100) * 0.9]
        if high_elec:
            recommendations.append({
                "priority": "medium",
                "resource_type": "electricity",
                "action": "Implement load balancing during peak hours",
                "expected_impact": "Reduce peak demand charges",
                "estimated_savings": "$500-1000/month in demand charges"
            })
        
        # General recommendations
        if not recommendations:
            recommendations = [
                {
                    "priority": "low",
                    "resource_type": "lighting",
                    "action": "Adjust lighting schedules based on occupancy patterns",
                    "expected_impact": "10-15% reduction in lighting energy",
                    "estimated_savings": "$200-400/month"
                },
                {
                    "priority": "low",
                    "resource_type": "hvac",
                    "action": "Optimize HVAC setpoints for unoccupied hours",
                    "expected_impact": "20-30% HVAC energy savings during off-hours",
                    "estimated_savings": "$800-1200/month"
                }
            ]
        
        return recommendations

    def _generate_zone_priorities(self, zones: List[Zone], alerts: List[Alert]) -> List[Dict[str, Any]]:
        """Generate zone priority list based on alerts."""
        zone_scores = {}
        
        for zone in zones:
            zone_alerts = [a for a in alerts if a.zone_id == zone.zone_id]
            critical = len([a for a in zone_alerts if a.severity == AlertSeverity.CRITICAL])
            warning = len([a for a in zone_alerts if a.severity == AlertSeverity.WARNING])
            
            score = critical * 10 + warning * 5
            
            if score > 20:
                priority = "high"
                reason = f"{critical} critical and {warning} warning alerts"
            elif score > 5:
                priority = "medium"
                reason = f"{warning} active alerts"
            else:
                priority = "low"
                reason = "No active issues"
            
            zone_scores[zone.zone_id] = {
                "zone_id": zone.zone_id,
                "priority": priority,
                "reason": reason
            }
        
        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        return sorted(zone_scores.values(), key=lambda x: priority_order.get(x["priority"], 3))

    def _update_history(self, result: Dict[str, Any]):
        """Update historical data with new prediction."""
        self._historical_readings.append({
            "timestamp": result["timestamp"],
            "efficiency": result["efficiency_score"],
            "status": result["system_status"]
        })

        if len(self._historical_readings) > self._cache_max_size:
            self._historical_readings.pop(0)

    def get_model_info(self) -> Dict[str, Any]:
        """Get AI module status information."""
        return {
            "using_gemini": not self.using_fallback,
            "gemini_available": GEMINI_AVAILABLE,
            "model_name": self.model_name if not self.using_fallback else "fallback",
            "client_initialized": self.client is not None,
            "historical_samples": len(self._historical_readings),
            "anomalies_detected": len(self._anomaly_history),
            "active_remediations": len(remediation_engine.active_remediations),
            "technician_alerts": len(alert_manager.get_technician_alerts())
        }

    def simulate_anomaly(self, resource_type: str, zone_id: str) -> Optional[Alert]:
        """
        Simulate an anomaly for testing/demo purposes.
        
        Args:
            resource_type: Type of resource to simulate anomaly for
            zone_id: Zone where anomaly should occur
            
        Returns:
            Created alert, or None if simulation failed
        """
        try:
            rt = ResourceType(resource_type)
        except ValueError:
            print(f"Invalid resource type: {resource_type}")
            return None
        
        # Find a resource of the specified type in the zone
        resources = data_store.get_resources_by_zone(zone_id)
        target_resources = [r for r in resources if r.resource_type == rt]
        
        if not target_resources:
            print(f"No {resource_type} resources found in zone {zone_id}")
            return None
        
        resource = target_resources[0]
        
        # Simulate the anomaly
        return alert_manager.simulate_anomaly(resource.resource_id)

    def get_resource_predictions(self, resource_id: str, hours_ahead: int = 24) -> List[Dict[str, Any]]:
        """
        Get predictions for a specific resource over the next N hours.
        
        Args:
            resource_id: Resource to predict for
            hours_ahead: Number of hours to predict
            
        Returns:
            List of hourly predictions
        """
        resource = data_store.get_resource(resource_id)
        if not resource:
            return []
        
        predictions = []
        now = datetime.utcnow()
        
        for i in range(hours_ahead):
            hour = (now.hour + i) % 24
            
            # Simple prediction logic (can be enhanced with ML)
            if resource.resource_type == ResourceType.HVAC:
                # HVAC varies by time of day
                if 9 <= hour <= 17:  # Business hours
                    predicted = resource.target_value or 22.0
                else:
                    predicted = (resource.target_value or 22.0) + 2  # Set back temperature
            elif resource.resource_type == ResourceType.ELECTRICITY:
                # Electricity varies by occupancy
                if 9 <= hour <= 17:
                    predicted = resource.current_value * 1.2
                else:
                    predicted = resource.current_value * 0.6
            else:
                predicted = resource.current_value
            
            predictions.append({
                "hour": hour,
                "predicted_value": round(predicted, 2),
                "confidence": 0.8 - (i * 0.02),  # Confidence decreases with time
                "unit": resource.unit
            })
        
        return predictions

    def get_zone_recommendations(self, zone_id: str) -> List[Dict[str, Any]]:
        """Get AI recommendations for a specific zone."""
        zone = data_store.get_zone(zone_id)
        if not zone:
            return []
        
        resources = data_store.get_resources_by_zone(zone_id)
        alerts = data_store.get_alerts_by_zone(zone_id)
        
        recommendations = []
        
        # Check each resource type
        for rt in ResourceType:
            rt_resources = [r for r in resources if r.resource_type == rt]
            rt_alerts = [a for a in alerts if a.resource_type == rt]
            
            if rt == ResourceType.HVAC and rt_alerts:
                recommendations.append({
                    "resource_type": "hvac",
                    "action": f"Inspect HVAC system in {zone.name}",
                    "priority": "high",
                    "reason": f"{len(rt_alerts)} active HVAC alert(s)"
                })
            elif rt == ResourceType.LIGHTING:
                avg_level = sum(r.current_value for r in rt_resources) / len(rt_resources) if rt_resources else 0
                if avg_level > 85:
                    recommendations.append({
                        "resource_type": "lighting",
                        "action": f"Reduce lighting levels in {zone.name} to 70%",
                        "priority": "low",
                        "reason": f"Current average {avg_level:.0f}% is higher than necessary"
                    })
        
        return recommendations


# Global AI brain instance
ai_brain = EcoBrain(use_gemini=True)
