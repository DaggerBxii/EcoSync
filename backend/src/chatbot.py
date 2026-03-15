"""
EcoSync Chatbot Module
Handles conversational AI for building resource management
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
from dataclasses import dataclass

from models import data_store, ResourceType
from ai_module import ai_brain

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-genai not installed. Using fallback mode.")


@dataclass
class DailyReport:
    """Structure for daily resource usage report."""
    date: str
    electricity_usage: float
    water_usage: float
    hvac_usage: float
    lighting_usage: float
    electricity_efficiency: float
    water_efficiency: float
    hvac_efficiency: float
    lighting_efficiency: float
    recommendations: List[str]
    peak_hours: Dict[str, float]  # {resource_type: hour}


class EcoChatBot:
    """Chatbot for EcoSync building management system."""

    def __init__(self):
        self.conversation_state = {}  # Store conversation state per user
        self.data_store = data_store
        self.ai_brain = ai_brain
        self.client = None
        self.model_name = "gemini-2.5-flash-lite"
        
        # Initialize Gemini if available
        if GEMINI_AVAILABLE:
            api_key = os.environ.get("GEMINI_API_KEY")
            if api_key:
                try:
                    self.client = genai.Client(api_key=api_key)
                    print("EcoChatBot: Gemini AI initialized successfully.")
                except Exception as e:
                    print(f"EcoChatBot: Error initializing Gemini: {e}")
            else:
                print("EcoChatBot: GEMINI_API_KEY not found in environment.")

    def process_message(self, user_id: str, message: str) -> Dict[str, Any]:
        """
        Process a user message and return a response.
        
        Args:
            user_id: Unique identifier for the user
            message: User's input message
            
        Returns:
            Dictionary containing the chatbot response
        """
        # Initialize conversation state if needed
        if user_id not in self.conversation_state:
            self.conversation_state[user_id] = {
                "step": "greeting",
                "context": {}
            }

        state = self.conversation_state[user_id]
        
        # Normalize the message
        message_lower = message.lower().strip()
        
        # Handle different conversation steps
        if state["step"] == "greeting":
            return self.handle_greeting(user_id, message_lower)
        elif state["step"] == "ask_report":
            return self.handle_ask_report(user_id, message_lower)
        elif state["step"] == "show_report":
            return self.handle_show_report(user_id, message_lower)
        else:
            # Default fallback
            return self.handle_general_query(user_id, message_lower)

    def _get_gemini_response(self, prompt: str) -> str:
        """Get response from Gemini AI."""
        if not self.client:
            return None
            
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=500
                )
            )
            return response.text
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return None

    def handle_greeting(self, user_id: str, message: str) -> Dict[str, Any]:
        """Handle the initial greeting."""
        response = {
            "response": "Hello! I'm EcoSync Assistant, your building resource management AI. I can help you monitor and optimize energy usage, water consumption, and other building resources. Would you like to see today's resource usage report?",
            "options": ["Yes", "No"],
            "next_step": "ask_report"
        }
        
        # Update conversation state
        self.conversation_state[user_id]["step"] = "ask_report"
        
        return response

    def handle_ask_report(self, user_id: str, message: str) -> Dict[str, Any]:
        """Handle user's response about wanting a report."""
        if "yes" in message or "y" in message or "sure" in message or "ok" in message:
            report = self.generate_daily_report()
            graph_base64 = self.generate_power_usage_graph(report)
            
            response = {
                "response": self.format_report_message(report),
                "graph": graph_base64,
                "report_data": report.__dict__,
                "options": ["Tell me more about efficiency", "Show resource reduction tips", "Main menu"],
                "next_step": "show_report"
            }
            
            # Update conversation state
            self.conversation_state[user_id]["step"] = "show_report"
            self.conversation_state[user_id]["context"]["report"] = report
        else:
            response = {
                "response": "Okay, I'm here to help with any questions about building resource management. You can ask me about energy usage, efficiency metrics, or resource optimization.",
                "options": ["Ask about energy usage", "Ask about efficiency", "Get optimization tips"],
                "next_step": "general"
            }
            
            # Reset conversation state
            self.conversation_state[user_id]["step"] = "greeting"
        
        return response

    def handle_show_report(self, user_id: str, message: str) -> Dict[str, Any]:
        """Handle follow-up questions after showing the report."""
        context = self.conversation_state[user_id].get("context", {})
        report = context.get("report")
        
        if not report:
            return self.handle_general_query(user_id, message)
        
        if "efficiency" in message:
            efficiency_details = self.get_efficiency_details(report)
            response = {
                "response": efficiency_details,
                "options": ["Show reduction tips", "Main menu"],
                "next_step": "show_report"
            }
        elif "reduction" in message or "tips" in message or "optimize" in message:
            reduction_tips = self.get_resource_reduction_tips()
            response = {
                "response": reduction_tips,
                "options": ["Back to report", "Main menu"],
                "next_step": "show_report"
            }
        elif "menu" in message or "back" in message:
            # Reset to greeting
            self.conversation_state[user_id]["step"] = "greeting"
            response = {
                "response": "Returning to main menu. Hello! I'm EcoSync Assistant. Would you like to see today's resource usage report?",
                "options": ["Yes", "No"],
                "next_step": "ask_report"
            }
        else:
            return self.handle_general_query(user_id, message)
        
        return response

    def handle_general_query(self, user_id: str, message: str) -> Dict[str, Any]:
        """Handle general queries that don't fit specific steps."""
        if "hello" in message or "hi" in message:
            return self.handle_greeting(user_id, message)
        elif "report" in message or "today" in message or "usage" in message:
            report = self.generate_daily_report()
            graph_base64 = self.generate_power_usage_graph(report)
            
            response = {
                "response": self.format_report_message(report),
                "graph": graph_base64,
                "report_data": report.__dict__,
                "options": ["Tell me more about efficiency", "Show resource reduction tips", "Main menu"],
                "next_step": "show_report"
            }
            
            # Update conversation state
            self.conversation_state[user_id]["step"] = "show_report"
            self.conversation_state[user_id]["context"]["report"] = report
        elif "efficiency" in message:
            report = self.generate_daily_report()
            efficiency_details = self.get_efficiency_details(report)
            response = {
                "response": efficiency_details,
                "options": ["Show report", "Show reduction tips", "Main menu"],
                "next_step": "general"
            }
        elif "reduce" in message or "save" in message or "optimize" in message:
            reduction_tips = self.get_resource_reduction_tips()
            response = {
                "response": reduction_tips,
                "options": ["Show report", "Main menu"],
                "next_step": "general"
            }
        else:
            # Use Gemini for intelligent responses based on building context
            building_state = self._get_building_context()
            prompt = f"""
            You are EcoSync Assistant, an AI building resource management expert.
            Current building state: {building_state}
            
            User asked: "{message}"
            
            Provide a helpful, accurate response related to building resource management.
            If the question is about energy, water, HVAC, or lighting, relate it to the building's current state.
            Keep the response concise but informative.
            """
            
            gemini_response = self._get_gemini_response(prompt)
            if gemini_response:
                response_text = gemini_response
            else:
                # Fallback to AI brain
                ai_response = self.ai_brain.get_building_decision()
                response_text = ai_response.get("building_insight", "I'm here to help with building resource management.")
            
            response = {
                "response": response_text,
                "options": ["Show report", "Get efficiency info", "Get optimization tips"],
                "next_step": "general"
            }
        
        return response

    def _get_building_context(self) -> str:
        """Get current building context for AI queries."""
        metrics = self.data_store.get_building_metrics()
        zones = self.data_store.get_all_zones()
        resources = self.data_store.get_all_resources()
        alerts = self.data_store.get_active_alerts()
        
        context = {
            "timestamp": metrics.timestamp,
            "total_zones": metrics.total_zones,
            "active_zones": metrics.active_zones,
            "total_resources": metrics.total_resources,
            "overall_efficiency": metrics.overall_efficiency,
            "energy_consumption": metrics.energy_consumption,
            "water_consumption": metrics.water_consumption,
            "active_alerts": len(alerts),
            "critical_alerts": metrics.critical_alerts
        }
        
        return json.dumps(context, indent=2)

    def generate_daily_report(self) -> DailyReport:
        """Generate a daily resource usage report."""
        # Get current building metrics
        metrics = self.data_store.get_building_metrics()
        
        # Calculate resource usage
        electricity_resources = self.data_store.get_resources_by_type(ResourceType.ELECTRICITY)
        water_resources = self.data_store.get_resources_by_type(ResourceType.WATER)
        hvac_resources = self.data_store.get_resources_by_type(ResourceType.HVAC)
        lighting_resources = self.data_store.get_resources_by_type(ResourceType.LIGHTING)
        
        # Sum up current values
        electricity_usage = sum(r.current_value for r in electricity_resources)
        water_usage = sum(r.current_value for r in water_resources)
        hvac_usage = sum(r.current_value for r in hvac_resources) / len(hvac_resources) if hvac_resources else 0
        lighting_usage = sum(r.current_value for r in lighting_resources) / len(lighting_resources) if lighting_resources else 0
        
        # Calculate efficiencies
        electricity_efficiency = sum(r.efficiency_score for r in electricity_resources) / len(electricity_resources) if electricity_resources else 100
        water_efficiency = sum(r.efficiency_score for r in water_resources) / len(water_resources) if water_resources else 100
        hvac_efficiency = sum(r.efficiency_score for r in hvac_resources) / len(hvac_resources) if hvac_resources else 100
        lighting_efficiency = sum(r.efficiency_score for r in lighting_resources) / len(lighting_resources) if lighting_resources else 100
        
        # Generate smart recommendations using Gemini
        recommendations = self.generate_smart_recommendations(
            electricity_efficiency, water_efficiency, hvac_efficiency, lighting_efficiency
        )
        
        # Find peak hours (simulated)
        peak_hours = {
            "electricity": 14.0,  # 2 PM
            "water": 11.0,        # 11 AM
            "hvac": 15.0,         # 3 PM
            "lighting": 8.0       # 8 AM
        }
        
        return DailyReport(
            date=datetime.now().strftime("%Y-%m-%d"),
            electricity_usage=round(electricity_usage, 2),
            water_usage=round(water_usage, 2),
            hvac_usage=round(hvac_usage, 2),
            lighting_usage=round(lighting_usage, 2),
            electricity_efficiency=round(electricity_efficiency, 2),
            water_efficiency=round(water_efficiency, 2),
            hvac_efficiency=round(hvac_efficiency, 2),
            lighting_efficiency=round(lighting_efficiency, 2),
            recommendations=recommendations,
            peak_hours=peak_hours
        )

    def generate_smart_recommendations(self, elec_eff: float, water_eff: float, hvac_eff: float, light_eff: float) -> List[str]:
        """Generate smart recommendations using Gemini based on efficiency scores."""
        building_context = self._get_building_context()
        
        prompt = f"""
        You are an expert in building resource management. Based on the following building context and efficiency scores,
        provide 3-5 specific, actionable recommendations to improve resource efficiency:
        
        Building Context:
        {building_context}
        
        Efficiency Scores:
        - Electricity: {elec_eff}%
        - Water: {water_eff}%
        - HVAC: {hvac_eff}%
        - Lighting: {light_eff}%
        
        Provide the recommendations as a numbered list with specific actions.
        Focus on time-based optimizations during low-usage periods.
        """
        
        gemini_response = self._get_gemini_response(prompt)
        
        if gemini_response:
            # Parse the response into a list of recommendations
            # Split by numbers or bullet points
            lines = gemini_response.split('\n')
            recommendations = []
            for line in lines:
                # Look for lines that start with numbers or bullets
                line = line.strip()
                if line.startswith(('1.', '2.', '3.', '4.', '5.', '-', '*')) and len(line) > 10:
                    # Remove the number/bullet prefix
                    rec = line[2:].strip() if line[1] == '.' else line[1:].strip()
                    recommendations.append(rec)
            
            # If parsing didn't work well, just return the whole response as one recommendation
            if not recommendations:
                recommendations = [gemini_response[:100] + "..." if len(gemini_response) > 100 else gemini_response]
                
            return recommendations[:5]  # Limit to 5 recommendations
        else:
            # Fallback to simple recommendations
            return self.generate_recommendations(elec_eff, water_eff, hvac_eff, light_eff)

    def generate_recommendations(self, elec_eff: float, water_eff: float, hvac_eff: float, light_eff: float) -> List[str]:
        """Generate recommendations based on efficiency scores."""
        recommendations = []
        
        if elec_eff < 80:
            recommendations.append("Consider scheduling high-energy equipment during off-peak hours to reduce costs")
        if water_eff < 80:
            recommendations.append("Check for leaks in plumbing systems and install low-flow fixtures")
        if hvac_eff < 80:
            recommendations.append("Adjust temperature setpoints during unoccupied hours to save energy")
        if light_eff < 80:
            recommendations.append("Implement smart lighting controls based on occupancy and daylight availability")
        
        if not recommendations:
            recommendations.append("All resources are operating efficiently!")
        
        return recommendations

    def generate_power_usage_graph(self, report: DailyReport) -> str:
        """Generate a graph of power usage and return as base64 string."""
        # Create figure and axis
        fig, ax = plt.subplots(figsize=(12, 7))
        
        # Generate realistic time-series data for the past 24 hours
        hours = list(range(24))  # 0-23 hours
        
        # Generate realistic usage patterns for each resource type
        # These patterns simulate real building usage throughout the day
        
        # Electricity usage: peaks during business hours, low at night
        import numpy as np
        electricity_pattern = []
        for h in hours:
            if 8 <= h <= 18:  # Business hours
                base = report.electricity_usage * 0.9
                variation = np.random.normal(0, report.electricity_usage * 0.1)
            elif 6 <= h < 8 or 18 < h <= 22:  # Early morning, evening
                base = report.electricity_usage * 0.5
                variation = np.random.normal(0, report.electricity_usage * 0.05)
            else:  # Night
                base = report.electricity_usage * 0.2
                variation = np.random.normal(0, report.electricity_usage * 0.03)
            electricity_pattern.append(max(0, base + variation))
        
        # Water usage: peaks in morning and afternoon
        water_pattern = []
        for h in hours:
            if 7 <= h <= 9 or 12 <= h <= 14 or 16 <= h <= 18:  # Morning, lunch, evening
                base = report.water_usage * 1.2
                variation = np.random.normal(0, report.water_usage * 0.15)
            else:
                base = report.water_usage * 0.6
                variation = np.random.normal(0, report.water_usage * 0.1)
            water_pattern.append(max(0, base + variation))
        
        # HVAC usage: varies with outdoor temperature and occupancy
        hvac_pattern = []
        for h in hours:
            if 9 <= h <= 17:  # Occupied hours
                base = report.hvac_usage
                variation = np.random.normal(0, report.hvac_usage * 0.1)
            else:  # Unoccupied hours - reduced
                base = report.hvac_usage * 0.7
                variation = np.random.normal(0, report.hvac_usage * 0.08)
            hvac_pattern.append(max(0, base + variation))
        
        # Lighting usage: high when natural light is low and building is occupied
        lighting_pattern = []
        for h in hours:
            if 7 <= h <= 20 and (h < 9 or h > 17):  # Evening hours when people might still be around but natural light is low
                base = report.lighting_usage * 0.8
                variation = np.random.normal(0, report.lighting_usage * 0.1)
            elif 9 <= h <= 17:  # Daylight hours with occupancy
                base = report.lighting_usage * 0.4  # Lower due to natural light
                variation = np.random.normal(0, report.lighting_usage * 0.05)
            else:  # Night hours
                base = report.lighting_usage * 0.1  # Minimal lighting
                variation = np.random.normal(0, report.lighting_usage * 0.03)
            lighting_pattern.append(max(0, base + variation))
        
        # Plot the data
        ax.plot(hours, electricity_pattern, label='Electricity (kW)', marker='o', linewidth=2, markersize=4)
        ax.plot(hours, water_pattern, label='Water (gal/min)', marker='s', linewidth=2, markersize=4)
        ax.plot(hours, hvac_pattern, label='HVAC (°C)', marker='^', linewidth=2, markersize=4)
        ax.plot(hours, lighting_pattern, label='Lighting (%)', marker='d', linewidth=2, markersize=4)
        
        # Customize the chart
        ax.set_title('24-Hour Resource Usage Patterns', fontsize=16, fontweight='bold')
        ax.set_xlabel('Hour of Day', fontsize=12)
        ax.set_ylabel('Usage Amount', fontsize=12)
        ax.legend(loc='upper left', bbox_to_anchor=(1, 1))
        ax.grid(True, linestyle='--', alpha=0.6)
        
        # Set x-axis ticks to show every 2 hours
        ax.set_xticks(range(0, 24, 2))
        
        # Adjust layout to prevent label cutoff
        plt.tight_layout()
        
        # Save plot to a BytesIO object
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
        img_buffer.seek(0)
        
        # Encode to base64
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Close the figure to free memory
        plt.close(fig)
        
        return img_str

    def format_report_message(self, report: DailyReport) -> str:
        """Format the daily report into a readable message."""
        message = f"""
📊 **Daily Resource Usage Report - {report.date}**

⚡ **Electricity**: {report.electricity_usage} kW ({report.electricity_efficiency}% efficient)
💧 **Water**: {report.water_usage} gal/min ({report.water_efficiency}% efficient)
🌡️ **HVAC**: {report.hvac_usage}°C ({report.hvac_efficiency}% efficient)
💡 **Lighting**: {report.lighting_usage}% brightness ({report.lighting_efficiency}% efficient)

📈 **Peak Usage Times:**
   - Electricity: {int(report.peak_hours['electricity'])}:00
   - Water: {int(report.peak_hours['water'])}:00
   - HVAC: {int(report.peak_hours['hvac'])}:00
   - Lighting: {int(report.peak_hours['lighting'])}:00

🎯 **Recommendations:**
"""
        for rec in report.recommendations:
            message += f"   • {rec}\n"
        
        return message.strip()

    def get_efficiency_details(self, report: DailyReport) -> str:
        """Get detailed efficiency information."""
        message = f"""
🔍 **Detailed Efficiency Analysis**

⚡ **Electricity Efficiency**: {report.electricity_efficiency}%
   - Optimized when usage is below {report.electricity_usage * 1.2:.1f} kW during peak hours
   - Savings potential: Up to 15-20% during off-peak hours

💧 **Water Efficiency**: {report.water_efficiency}%
   - Optimized when usage is below {report.water_usage * 1.1:.1f} gal/min
   - Savings potential: Up to 10-15% with efficient fixtures

🌡️ **HVAC Efficiency**: {report.hvac_efficiency}%
   - Optimized when maintaining {report.hvac_usage - 1:.0f}-{report.hvac_usage + 1:.0f}°C
   - Savings potential: Up to 25-30% during unoccupied hours

💡 **Lighting Efficiency**: {report.lighting_efficiency}%
   - Optimized when maintaining {report.lighting_usage:.0f}% brightness during occupied hours
   - Savings potential: Up to 20-30% with smart controls

💡 **Overall Building Efficiency**: {(report.electricity_efficiency + report.water_efficiency + report.hvac_efficiency + report.lighting_efficiency) / 4:.1f}%
"""
        return message

    def get_resource_reduction_tips(self) -> str:
        """Get tips for reducing resource usage during low-usage periods."""
        # Get building context to customize recommendations
        building_context = self._get_building_context()
        
        prompt = f"""
        You are an expert in building resource management. Based on the following building context,
        provide specific recommendations for reducing resource usage during low-usage periods.
        Focus on time-based optimizations and specific actions for each resource type.
        
        Building Context:
        {building_context}
        
        Provide recommendations in the following format:
        **Electricity Reduction During Low-Usage:**
        • Action 1
        • Action 2
        
        **Water Conservation During Low-Usage:**
        • Action 1
        • Action 2
        
        **HVAC Optimization During Low-Usage:**
        • Action 1
        • Action 2
        
        **Lighting Efficiency During Low-Usage:**
        • Action 1
        • Action 2
        """
        
        gemini_response = self._get_gemini_response(prompt)
        
        if gemini_response:
            return f"💡 **Smart Resource Reduction Tips**\n\n{gemini_response}"
        else:
            # Fallback to default tips
            message = """
💡 **Resource Reduction Tips for Low-Usage Periods** 

🌙 **Night Hours (10 PM - 6 AM)**:
   • Reduce lighting to 20-30% of capacity
   • Increase HVAC setback to save 10-15% energy
   • Shut down non-essential electrical equipment

🧍 **Low Occupancy Times**:
   • Activate occupancy-based controls
   • Reduce ventilation rates in unoccupied areas
   • Dim lights in unused spaces

📅 **Scheduled Downtime**:
   • Perform maintenance during these periods
   • Update system schedules based on actual usage
   • Calibrate sensors for better automation

⚡ **Peak Demand Management**:
   • Shift high-energy processes to off-peak hours
   • Use stored energy during peak periods
   • Implement demand response strategies
"""
            return message

    def calculate_resource_efficiency_metrics(self) -> Dict[str, Any]:
        """Calculate efficiency metrics for each resource type."""
        # Get all resources by type
        electricity_resources = self.data_store.get_resources_by_type(ResourceType.ELECTRICITY)
        water_resources = self.data_store.get_resources_by_type(ResourceType.WATER)
        hvac_resources = self.data_store.get_resources_by_type(ResourceType.HVAC)
        lighting_resources = self.data_store.get_resources_by_type(ResourceType.LIGHTING)
        
        # Calculate efficiency metrics for each type
        electricity_metrics = self._calculate_resource_type_metrics(electricity_resources, "Electricity")
        water_metrics = self._calculate_resource_type_metrics(water_resources, "Water")
        hvac_metrics = self._calculate_resource_type_metrics(hvac_resources, "HVAC")
        lighting_metrics = self._calculate_resource_type_metrics(lighting_resources, "Lighting")
        
        return {
            "electricity": electricity_metrics,
            "water": water_metrics,
            "hvac": hvac_metrics,
            "lighting": lighting_metrics,
            "overall_building_efficiency": self.data_store.get_building_metrics().overall_efficiency
        }
    
    def _calculate_resource_type_metrics(self, resources: List, resource_name: str) -> Dict[str, Any]:
        """Calculate metrics for a specific resource type."""
        if not resources:
            return {
                "count": 0,
                "average_efficiency": 0,
                "total_usage": 0,
                "status_distribution": {},
                "recommendations": [f"No {resource_name.lower()} resources found in the building"]
            }
        
        # Calculate metrics
        total_usage = sum(r.current_value for r in resources)
        avg_efficiency = sum(r.efficiency_score for r in resources) / len(resources)
        
        # Count status distribution
        status_dist = {}
        for r in resources:
            status = r.status.value
            status_dist[status] = status_dist.get(status, 0) + 1
        
        # Generate recommendations based on efficiency
        recommendations = []
        if avg_efficiency < 70:
            recommendations.append(f"{resource_name} efficiency is below optimal. Consider maintenance or optimization.")
        elif avg_efficiency < 90:
            recommendations.append(f"{resource_name} efficiency could be improved with minor adjustments.")
        else:
            recommendations.append(f"{resource_name} is operating at optimal efficiency.")
        
        return {
            "count": len(resources),
            "average_efficiency": round(avg_efficiency, 2),
            "total_usage": round(total_usage, 2),
            "status_distribution": status_dist,
            "recommendations": recommendations
        }


# Global chatbot instance
chatbot = EcoChatBot()