"""
EcoSync New Chatbot - Enhanced Conversational AI Interface
Integrates with building resource allocation system using Google GenAI
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from dotenv import load_dotenv
load_dotenv()

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-genai not installed. Using fallback mode.")

from models import ResourceType, data_store, Resource
from ai_controller import ai_controller, ControlResult
from ai_module import ai_brain


@dataclass
class ChatMessage:
    """Represents a chat message."""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: str = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat() + "Z"


class EcoSyncChatbot:
    """
    Enhanced chatbot for EcoSync building management system.
    Integrates with resource allocation system using Google GenAI.
    """
    
    def __init__(self):
        self.client = None
        self.model_name = "gemini-3-flash-preview"
        self.using_fallback = True
        self.chat_histories = {}  # Store chat history per user
        
        # Initialize Gemini if available
        if GEMINI_AVAILABLE:
            self._initialize_gemini()

    def _initialize_gemini(self) -> bool:
        """Initialize the Gemini client."""
        try:
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                print("EcoSyncChatbot: GEMINI_API_KEY not found in environment.")
                return False

            self.client = genai.Client(api_key=api_key)
            self.using_fallback = False
            print("EcoSyncChatbot: Gemini AI initialized successfully.")
            return True
        except Exception as e:
            print(f"EcoSyncChatbot: Error initializing Gemini: {e}")
            return False

    def get_or_create_history(self, user_id: str) -> List[ChatMessage]:
        """Get or create chat history for a user."""
        if user_id not in self.chat_histories:
            self.chat_histories[user_id] = []
        return self.chat_histories[user_id]

    def process_message(self, user_id: str, message: str) -> Dict[str, Any]:
        """
        Process a user message and return a response.
        
        Args:
            user_id: Unique identifier for the user
            message: User's input message
            
        Returns:
            Dictionary containing the chatbot response
        """
        # Add user message to history
        user_msg = ChatMessage(role="user", content=message)
        history = self.get_or_create_history(user_id)
        history.append(user_msg)

        # Check if this is a control command
        control_result = self._process_control_command(message, user_id)
        
        if control_result:
            # This was a control command, return the result
            response_content = self._format_control_response(control_result, message)
        else:
            # This is a regular query, use Gemini for response
            response_content = self._get_genai_response(message, user_id)

        # Add assistant response to history
        assistant_msg = ChatMessage(role="assistant", content=response_content)
        history.append(assistant_msg)

        # Keep only the last 10 messages to prevent history from growing too large
        if len(history) > 10:
            self.chat_histories[user_id] = history[-10:]

        return {
            "response": response_content,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "control" if control_result else "query"
        }

    def _process_control_command(self, message: str, user_id: str) -> Optional[ControlResult]:
        """
        Check if the message is a control command and process it.
        
        Args:
            message: User's input message
            user_id: User ID for context
            
        Returns:
            ControlResult if it was a control command, None otherwise
        """
        # Parse the command using AIController
        parsed = ai_controller.parse_command(message, {
            "building_name": data_store.building_name,
            "current_floor": None,  # Could be enhanced to track current floor per user
            "total_floors": len(data_store.get_floors())
        })

        # Check if this is a control command (not just a query)
        control_keywords = [
            "limit", "set", "turn off", "turn on", "increase", "decrease",
            "reduce", "optimize", "adjust", "change", "setpoint", "dim",
            "raise", "lower", "cut", "max", "min", "control"
        ]

        is_control = any(keyword in message.lower() for keyword in control_keywords)
        
        if is_control and not parsed.needs_clarification:
            # Execute the command
            result = ai_controller.execute_command(parsed)
            return result

        return None

    def _format_control_response(self, result: ControlResult, original_command: str) -> str:
        """Format the response for a control command."""
        if result.success:
            response_parts = [result.message]
            
            if result.estimated_impact:
                response_parts.append(f"\n📊 {result.estimated_impact}")
                
            # Add details about what changed
            if result.resources_affected:
                response_parts.append(f"\n\n🔧 Resources modified:")
                for resource_id in result.resources_affected[:3]:  # Show max 3
                    prev = result.previous_values.get(resource_id, 0)
                    new = result.new_values.get(resource_id, 0)
                    change = new - prev
                    change_symbol = "↓" if change < 0 else "↑" if change > 0 else "→"
                    response_parts.append(f"  • {resource_id}: {prev:.1f} → {new:.1f} {change_symbol}")
                    
            return "\n".join(response_parts)
        else:
            return f"❌ Failed to execute command: {original_command}\n{result.message}"

    def _get_genai_response(self, message: str, user_id: str) -> str:
        """Get response from Gemini AI."""
        if not self.client or self.using_fallback:
            return self._fallback_response(message)

        try:
            # Get current building state
            building_data = ai_brain.get_building_decision()
            building_metrics = data_store.get_building_metrics()
            
            # Prepare context for the AI
            context = {
                "building_name": data_store.building_name,
                "building_metrics": building_metrics.to_dict(),
                "building_insight": building_data.get("building_insight", ""),
                "recommendations": building_data.get("recommendations", []),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Prepare the prompt with building context
            prompt = f"""
            You are EcoSync Assistant, an AI building resource management expert for {context['building_name']}.
            
            Current Building State:
            - Overall Efficiency: {context['building_metrics']['overall_efficiency']}%
            - Energy Consumption: {context['building_metrics']['energy_consumption']} kW
            - Water Consumption: {context['building_metrics']['water_consumption']} gal/min
            - Active Alerts: {context['building_metrics']['active_alerts']}
            - Critical Alerts: {context['building_metrics']['critical_alerts']}
            - Active Zones: {context['building_metrics']['active_zones']}/{context['building_metrics']['total_zones']}
            
            Building Insight: {context['building_insight']}
            
            User asked: "{message}"
            
            Provide a helpful, accurate response related to building resource management.
            If the question is about energy, water, HVAC, or lighting, relate it to the current building state.
            Keep the response concise but informative.
            If the user wants to control resources, suggest specific commands they can use.
            
            Example commands:
            - "Limit water on floor 2 to 60%"
            - "Turn off lights on floor 5"
            - "Set HVAC to 22°C"
            - "Optimize electricity"
            """

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7
                )
            )
            
            return response.text
            
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return self._fallback_response(message)

    def _fallback_response(self, message: str) -> str:
        """Fallback response when Gemini is not available."""
        # Get basic building metrics
        metrics = data_store.get_building_metrics()
        
        # Simple rule-based responses
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["hello", "hi", "hey"]):
            return f"Hello! I'm EcoSync Assistant. I can help you manage building resources. Current efficiency: {metrics.overall_efficiency}%."
        elif "efficiency" in message_lower:
            return f"The building is currently operating at {metrics.overall_efficiency}% efficiency. Energy consumption: {metrics.energy_consumption} kW."
        elif "energy" in message_lower or "electricity" in message_lower:
            return f"Current energy consumption is {metrics.energy_consumption} kW. The building has {metrics.resources_by_type.get('electricity', 0)} electricity resources."
        elif "water" in message_lower:
            return f"Current water consumption is {metrics.water_consumption} gal/min. The building has {metrics.resources_by_type.get('water', 0)} water resources."
        elif "hvac" in message_lower or "temperature" in message_lower:
            hvac_resources = data_store.get_resources_by_type(ResourceType.HVAC)
            avg_temp = sum(r.current_value for r in hvac_resources) / len(hvac_resources) if hvac_resources else 0
            return f"Average HVAC temperature is {avg_temp:.1f}°C. The building has {metrics.resources_by_type.get('hvac', 0)} HVAC resources."
        elif "lighting" in message_lower:
            lighting_resources = data_store.get_resources_by_type(ResourceType.LIGHTING)
            avg_lighting = sum(r.current_value for r in lighting_resources) / len(lighting_resources) if lighting_resources else 0
            return f"Average lighting level is {avg_lighting:.1f}%. The building has {metrics.resources_by_type.get('lighting', 0)} lighting resources."
        else:
            return f"I'm EcoSync Assistant. I can help you manage building resources. Current efficiency: {metrics.overall_efficiency}%. Try asking about energy, water, HVAC, or lighting, or use commands like 'limit water on floor 2 to 60%'."

    def get_building_status(self, user_id: str) -> Dict[str, Any]:
        """Get current building status for the chat interface."""
        building_overview = data_store.get_building_overview()
        
        return {
            "building_name": building_overview.building_name,
            "overall_efficiency": building_overview.overall_efficiency,
            "total_energy_consumption": building_overview.total_energy_consumption,
            "total_water_consumption": building_overview.total_water_consumption,
            "active_alerts": building_overview.active_alerts,
            "critical_alerts": building_overview.critical_alerts,
            "total_occupancy": building_overview.total_occupancy,
            "total_max_occupancy": building_overview.total_max_occupancy,
            "timestamp": building_overview.timestamp
        }

    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get chat history for a user."""
        history = self.get_or_create_history(user_id)
        return [{"role": msg.role, "content": msg.content, "timestamp": msg.timestamp} 
                for msg in history]


# Global chatbot instance
chatbot = EcoSyncChatbot()