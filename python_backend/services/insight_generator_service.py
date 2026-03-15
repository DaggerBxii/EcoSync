"""
Insight Generator Service - Explainable AI with human-readable insights
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class Priority(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class Recommendation:
    priority: Priority
    title: str
    description: str
    category: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "priority": self.priority.value,
            "title": self.title,
            "description": self.description,
            "category": self.category
        }


@dataclass
class Factor:
    name: str
    influence: float
    value: str
    is_critical: bool
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "influence": round(self.influence, 2),
            "value": self.value,
            "critical": self.is_critical
        }


class InsightGeneratorService:
    """
    Insight Generator Service for Explainable AI (XAI).
    Generates human-readable explanations and actionable recommendations.
    """
    
    def __init__(self, training_data_service=None, pricing_service=None, weather_service=None):
        self.training_data_service = training_data_service
        self.pricing_service = pricing_service
        self.weather_service = weather_service
    
    def generate_insight(self, ai_decision: Dict[str, Any]) -> str:
        """Generate detailed insight from AI decision"""
        base_insight = ai_decision.get("ai_insight", "")
        metrics = ai_decision.get("metrics", {})
        
        if not metrics:
            return base_insight
        
        current_usage = metrics.get("current_usage", 0)
        baseline_usage = metrics.get("baseline_usage", 0)
        occupancy = metrics.get("occupancy", 0)
        efficiency_score = metrics.get("efficiency_score", 0)
        is_anomaly = ai_decision.get("integrity_alert", False)
        status = ai_decision.get("system_status", "")
        
        # Generate primary insight
        if is_anomaly:
            insight = self._generate_anomaly_insight(current_usage, baseline_usage, occupancy)
        elif efficiency_score < 50:
            insight = self._generate_inefficiency_insight(current_usage, baseline_usage, occupancy, efficiency_score)
        elif efficiency_score > 80:
            insight = self._generate_efficient_insight(current_usage, occupancy, efficiency_score)
        else:
            insight = self._generate_normal_insight(current_usage, baseline_usage, efficiency_score)
        
        # Add context
        context = self._generate_contextual_advice(status, occupancy)
        return f"{insight} {context}"
    
    def _generate_anomaly_insight(self, current: float, baseline: float, occupancy: int) -> str:
        """Generate insight for anomaly situations"""
        deviation = ((current - baseline) / baseline * 100) if baseline > 0 else 0
        severity = "SEVERE" if abs(deviation) > 50 else ("MODERATE" if abs(deviation) > 30 else "MINOR")
        
        return (
            f"⚠️ {severity} ANOMALY: Power usage ({current:.0f}W) is {abs(deviation):.0f}% "
            f"{'above' if deviation > 0 else 'below'} baseline ({baseline:.0f}W). "
            "Possible causes: equipment malfunction, unusual occupancy pattern, or weather impact."
        )
    
    def _generate_inefficiency_insight(self, current: float, baseline: float, occupancy: int, efficiency: float) -> str:
        """Generate insight for inefficient operation"""
        power_per_person = current / occupancy if occupancy > 0 else current
        
        return (
            f"⚡ INEFFICIENT: Power draw per occupant ({power_per_person:.0f}W) exceeds optimal range. "
            f"Efficiency score: {efficiency:.0f}%. Consider scaling down non-essential systems."
        )
    
    def _generate_efficient_insight(self, current: float, occupancy: int, efficiency: float) -> str:
        """Generate insight for efficient operation"""
        return (
            f"✅ OPTIMAL: Energy usage is efficient ({efficiency:.0f}% score). "
            f"Current load of {current:.0f}W for {occupancy} occupants is within expected parameters."
        )
    
    def _generate_normal_insight(self, current: float, baseline: float, efficiency: float) -> str:
        """Generate insight for normal operation"""
        pct = (current / baseline * 100) if baseline > 0 else 100
        return (
            f"📊 NORMAL: Power consumption ({current:.0f}W) is within {pct:.0f}% of baseline ({baseline:.0f}W). "
            f"Efficiency: {efficiency:.0f}%."
        )
    
    def _generate_contextual_advice(self, status: str, occupancy: int) -> str:
        """Generate contextual advice based on status and occupancy"""
        if status == "Critical Alert":
            return "Immediate investigation recommended."
        elif status == "Inefficient":
            if occupancy < 20:
                return "Low occupancy detected - consider zone-based power reduction."
            return "Review HVAC scheduling for optimization opportunities."
        elif status == "Optimized":
            return "Continue current operating parameters."
        return ""
    
    async def generate_recommendations(self) -> List[Recommendation]:
        """Generate actionable recommendations based on historical data"""
        recommendations: List[Recommendation] = []
        
        if self.training_data_service:
            # Get historical statistics
            stats = await self.training_data_service.get_power_statistics(
                datetime.now() - timedelta(days=7),
                datetime.now()
            )
            
            if stats:
                # Check for high anomaly rate
                anomaly_rate = stats.get("anomaly_rate", 0)
                if anomaly_rate > 5:
                    recommendations.append(Recommendation(
                        Priority.HIGH,
                        "High Anomaly Rate",
                        f"Anomaly rate is {anomaly_rate:.1f}% this week. Schedule equipment inspection.",
                        "maintenance"
                    ))
                
                # Check efficiency
                avg_efficiency = stats.get("avg_efficiency", 100)
                if avg_efficiency < 60:
                    recommendations.append(Recommendation(
                        Priority.HIGH,
                        "Low Average Efficiency",
                        f"Average efficiency is {avg_efficiency:.0f}%. Target: 80%+. Review power allocation policies.",
                        "optimization"
                    ))
        
        # Add weather-based recommendations
        if self.weather_service:
            weather_recs = self.weather_service.get_weather_recommendations()
            for tip in weather_recs.get("tips", []):
                recommendations.append(Recommendation(
                    Priority.MEDIUM,
                    "Weather Advisory",
                    tip,
                    "weather"
                ))
        
        # Add pricing-based recommendations
        if self.pricing_service:
            low_cost_windows = self.pricing_service.get_low_cost_windows()
            if low_cost_windows and low_cost_windows[0].avg_price < self.pricing_service.get_current_price_per_kwh() * 0.8:
                best_window = low_cost_windows[0]
                savings_pct = (1 - best_window.avg_price / self.pricing_service.get_current_price_per_kwh()) * 100
                recommendations.append(Recommendation(
                    Priority.MEDIUM,
                    "Cost Savings Opportunity",
                    f"Schedule high-power tasks between {best_window.start_hour:02d}:00 - {best_window.end_hour:02d}:00 for {savings_pct:.1f}% savings.",
                    "pricing"
                ))
        
        # Sort by priority
        priority_order = {Priority.CRITICAL: 0, Priority.HIGH: 1, Priority.MEDIUM: 2, Priority.LOW: 3}
        recommendations.sort(key=lambda r: priority_order[r.priority])
        
        return recommendations
    
    def explain_decision(self, ai_decision: Dict[str, Any]) -> Dict[str, Any]:
        """Generate explanation for why a specific decision was made"""
        metrics = ai_decision.get("metrics", {})
        
        if not metrics:
            return {}
        
        current_usage = metrics.get("current_usage", 0)
        baseline_usage = metrics.get("baseline_usage", 0)
        occupancy = metrics.get("occupancy", 0)
        efficiency_score = metrics.get("efficiency_score", 0)
        is_anomaly = ai_decision.get("integrity_alert", False)
        scale_level = ai_decision.get("scale_level", 1.0)
        
        # Factors influencing decision
        factors: List[Factor] = []
        
        # Factor 1: Deviation from baseline
        deviation = ((current_usage - baseline_usage) / baseline_usage * 100) if baseline_usage > 0 else 0
        factors.append(Factor(
            "Baseline Deviation",
            abs(deviation),
            f"{'Above' if deviation > 0 else 'Below'} baseline by {abs(deviation):.0f}%",
            abs(deviation) > 30
        ))
        
        # Factor 2: Efficiency score
        factors.append(Factor(
            "Efficiency Score",
            100 - efficiency_score,
            f"{efficiency_score:.0f}% efficiency",
            efficiency_score < 50
        ))
        
        # Factor 3: Occupancy level
        occ_level = "Low" if occupancy < 20 else ("Medium" if occupancy < 50 else "High")
        factors.append(Factor(
            "Occupancy Level",
            occupancy,
            f"{occ_level} occupancy ({occupancy} people)",
            False
        ))
        
        # Factor 4: Anomaly status
        factors.append(Factor(
            "Anomaly Detection",
            100 if is_anomaly else 0,
            "Anomaly detected" if is_anomaly else "Normal pattern",
            is_anomaly
        ))
        
        # Sort factors by influence
        factors.sort(key=lambda f: f.influence, reverse=True)
        
        return {
            "decision": ai_decision.get("system_status"),
            "action_taken": f"Scale level: {scale_level * 100:.0f}%",
            "primary_factors": [f.to_dict() for f in factors[:3]],
            "insight": self.generate_insight(ai_decision)
        }
    
    async def generate_daily_summary(self) -> Dict[str, Any]:
        """Generate daily summary report"""
        start_of_day = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        summary = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "period": "Today (since midnight)"
        }
        
        if self.training_data_service:
            stats = await self.training_data_service.get_power_statistics(start_of_day, datetime.now())
            
            if stats:
                summary["total_readings"] = stats.get("count", 0)
                summary["energy_consumed_kwh"] = round(stats.get("total_kwh", 0), 2)
                summary["average_efficiency"] = round(stats.get("avg_efficiency", 0), 2)
                summary["anomaly_count"] = stats.get("anomaly_count", 0)
                
                # Calculate cost
                total_kwh = stats.get("total_kwh", 0)
                if self.pricing_service:
                    summary["estimated_cost"] = round(total_kwh * self.pricing_service.get_current_price_per_kwh(), 2)
                    summary["currency"] = self.pricing_service.currency
        
        # Add weather context
        if self.weather_service:
            summary["weather"] = self.weather_service.get_weather_summary()
        
        # Add top recommendations
        if hasattr(self, 'generate_recommendations'):
            recommendations = await self.generate_recommendations()
            summary["top_recommendations"] = [r.to_dict() for r in recommendations[:3]]
        
        return summary
    
    async def generate_weekly_comparison(self) -> Dict[str, Any]:
        """Generate comparison report (this week vs last week)"""
        now = datetime.now()
        week_ago = now - timedelta(weeks=1)
        two_weeks_ago = now - timedelta(weeks=2)
        
        comparison = {
            "period": "Week-over-Week Comparison"
        }
        
        if self.training_data_service:
            this_week = await self.training_data_service.get_power_statistics(week_ago, now)
            last_week = await self.training_data_service.get_power_statistics(two_weeks_ago, week_ago)
            
            if this_week and last_week:
                this_week_kwh = this_week.get("total_kwh", 0)
                last_week_kwh = last_week.get("total_kwh", 0)
                
                change = ((this_week_kwh - last_week_kwh) / last_week_kwh * 100) if last_week_kwh > 0 else 0
                
                comparison["this_week_kwh"] = round(this_week_kwh, 2)
                comparison["last_week_kwh"] = round(last_week_kwh, 2)
                comparison["change_pct"] = round(change, 2)
                comparison["trend"] = "INCREASING" if change > 5 else ("DECREASING" if change < -5 else "STABLE")
                
                # Efficiency comparison
                comparison["this_week_efficiency"] = round(this_week.get("avg_efficiency", 0), 2)
                comparison["last_week_efficiency"] = round(last_week.get("avg_efficiency", 0), 2)
        
        return comparison
