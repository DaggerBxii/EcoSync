"""
EcoSync Chatbot Engine - Conversational AI Interface
Orchestrates between EcoBrain, AIController, and conversation management.
Provides natural language control and building insights.
"""

import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum

from dotenv import load_dotenv
load_dotenv()

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Import from EcoBrain and AIController
from ai_module import ai_brain
from ai_controller import ai_controller, ControlAction, ControlResult
from models import (
    ResourceType, data_store, Resource, Zone, Alert,
    AlertSeverity, AlertStatus
)


class ConversationStep(str, Enum):
    """Conversation flow steps."""
    GREETING = "greeting"
    ANALYTICS = "analytics"
    BUILDING_VIEW = "building_view"
    CONTROL = "control"
    CLARIFICATION = "clarification"
    GENERAL = "general"


@dataclass
class ConversationContext:
    """Context for a conversation session."""
    user_id: str
    current_step: ConversationStep = ConversationStep.GREETING
    current_floor: Optional[int] = None
    selected_resource: Optional[ResourceType] = None
    pending_command: Optional[Dict] = None
    last_interaction: datetime = field(default_factory=datetime.utcnow)
    message_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "current_step": self.current_step.value,
            "current_floor": self.current_floor,
            "selected_resource": self.selected_resource.value if self.selected_resource else None,
            "pending_command": self.pending_command,
            "last_interaction": self.last_interaction.isoformat(),
            "message_count": self.message_count
        }


@dataclass
class ChatbotResponse:
    """Structured response from the chatbot."""
    message: str
    type: str = "general"
    options: List[str] = field(default_factory=list)
    data: Optional[Dict] = None
    requires_action: bool = False
    action_payload: Optional[Dict] = None


class ChatbotEngine:
    """
    Conversational AI interface for EcoSync.
    Orchestrates EcoBrain insights with natural language control.
    """
    
    def __init__(self):
        self.conversations: Dict[str, ConversationContext] = {}
        self.client = None
        self.model_name = "gemini-2.5-flash-lite"
        self.using_fallback = True
        
        # Initialize Gemini for conversational responses
        if GEMINI_AVAILABLE:
            self._initialize_gemini()
    
    def _initialize_gemini(self) -> bool:
        """Initialize Gemini client for conversational AI."""
        try:
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                return False
            
            self.client = genai.Client(api_key=api_key)
            self.using_fallback = False
            print("ChatbotEngine: Gemini initialized for conversations")
            return True
        except Exception as e:
            print(f"ChatbotEngine: Gemini init failed: {e}")
            return False
    
    def get_or_create_context(self, user_id: str) -> ConversationContext:
        """Get existing context or create new one."""
        if user_id not in self.conversations:
            self.conversations[user_id] = ConversationContext(user_id=user_id)
        return self.conversations[user_id]
    
    def process_message(self, user_id: str, message: str) -> ChatbotResponse:
        """
        Process a user message and return a response.
        """
        try:
            context = self.get_or_create_context(user_id)
            context.message_count += 1
            context.last_interaction = datetime.utcnow()

            message_lower = message.lower().strip()

            # Check for control commands first
            control_keywords = [
                "limit", "set", "turn off", "turn on", "increase", "decrease",
                "reduce", "optimize", "adjust", "change", "setpoint", "dim",
                "raise", "lower", "cut", "max", "min"
            ]

            is_control = any(keyword in message_lower for keyword in control_keywords)

            if is_control:
                return self._handle_control_command(context, message)

            # Handle based on current conversation step
            if context.current_step == ConversationStep.GREETING:
                return self._handle_greeting(context, message)
            elif context.current_step == ConversationStep.ANALYTICS:
                return self._handle_analytics_query(context, message)
            elif context.current_step == ConversationStep.BUILDING_VIEW:
                return self._handle_building_query(context, message)
            elif context.current_step == ConversationStep.CLARIFICATION:
                return self._handle_clarification(context, message)
            else:
                return self._handle_general_query(context, message)
                
        except Exception as e:
            print(f"ChatbotEngine error: {e}")
            import traceback
            print(traceback.format_exc())
            return ChatbotResponse(
                message="I'm sorry, I encountered an error. Please try again or type 'help' for assistance.",
                type="error",
                options=["Help", "Try again", "Main menu"]
            )
    
    def _handle_control_command(self, context: ConversationContext, message: str) -> ChatbotResponse:
        """Handle natural language control commands."""
        try:
            # Parse the command using AIController
            parsed = ai_controller.parse_command(message, {
                "building_name": "Synclo Tower",
                "current_floor": context.current_floor,
                "total_floors": 10
            })
            
            print(f"Parsed command: {parsed}")
            
            # Check if clarification is needed
            if parsed.needs_clarification:
                context.current_step = ConversationStep.CLARIFICATION
                context.pending_command = {
                    "original_message": message,
                    "parsed": parsed
                }
                return ChatbotResponse(
                    message=parsed.clarification_question or "Could you please clarify?",
                    type="clarification",
                    options=self._generate_clarification_options(parsed)
                )
            
            # Execute the command
            result = ai_controller.execute_command(parsed)
            
            print(f"Control result: success={result.success}, resources={len(result.resources_affected)}")
            
            # Update context
            context.current_step = ConversationStep.CONTROL
            if parsed.floor:
                context.current_floor = parsed.floor
            if parsed.resource_type:
                context.selected_resource = parsed.resource_type
            
            # Build response
            response_message = ai_controller.generate_response(message, result)
            
            return ChatbotResponse(
                message=response_message,
                type="control",
                options=["Show building view", "Make another change", "View analytics"],
                data={
                    "control_result": {
                        "success": result.success,
                        "resources_affected": result.resources_affected,
                        "previous_values": result.previous_values,
                        "new_values": result.new_values,
                        "estimated_impact": result.estimated_impact
                    }
                },
                requires_action=False
            )
        except Exception as e:
            print(f"Control command error: {e}")
            import traceback
            print(traceback.format_exc())
            return ChatbotResponse(
                message=f"I couldn't execute that command. Error: {str(e)[:100]}. Try 'help' for examples.",
                type="error",
                options=["Help", "Try again", "Main menu"]
            )
    
    def _handle_greeting(self, context: ConversationContext, message: str) -> ChatbotResponse:
        """Handle initial greeting and onboarding."""
        message_lower = message.lower()
        
        # Check for quick responses
        if any(word in message_lower for word in ["yes", "sure", "ok", "yeah", "yep"]):
            return self._show_analytics(context)
        
        elif any(word in message_lower for word in ["no", "skip", "later", "nope"]):
            context.current_step = ConversationStep.BUILDING_VIEW
            return ChatbotResponse(
                message="No problem! You can explore the building visualization or ask me to control resources. What would you like to do?",
                type="general",
                options=["Show building view", "Control resources", "Help"]
            )
        
        # Default greeting with options
        return ChatbotResponse(
            message=f"Hello! 👋 I'm your EcoSync building assistant.\n\nI can help you:\n• View building analytics\n• Control resources (e.g., 'limit water on floor 2')\n• Explore the building visualization\n\nWould you like to see today's analytics?",
            type="greeting",
            options=["Yes, show analytics", "Skip to building view", "Control resources"]
        )
    
    def _show_analytics(self, context: ConversationContext) -> ChatbotResponse:
        """Show building analytics."""
        context.current_step = ConversationStep.ANALYTICS
        
        # Get data from EcoBrain
        building_data = ai_brain.get_building_decision()
        metrics = building_data.get("metrics", {})
        
        message = (
            f"📊 **Building Analytics**\n\n"
            f"⚡ **Electricity**: {metrics.get('energy_consumption', 0):.1f} kW\n"
            f"💧 **Water**: {metrics.get('water_consumption', 0):.1f} gal/min\n"
            f"🌡️ **HVAC**: Operating optimally\n"
            f"📈 **Efficiency**: {building_data.get('efficiency_score', 0):.1f}%\n\n"
            f"{building_data.get('building_insight', '')}\n\n"
            f"Would you like to explore the building or make any adjustments?"
        )
        
        return ChatbotResponse(
            message=message,
            type="analytics",
            options=["Show building view", "Control resources", "Back to menu"],
            data={"building_data": building_data}
        )
    
    def _handle_analytics_query(self, context: ConversationContext, message: str) -> ChatbotResponse:
        """Handle queries when in analytics mode."""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["building", "view", "explore", "floor"]):
            return self._show_building_view(context)
        
        elif any(word in message_lower for word in ["control", "adjust", "change", "set"]):
            return ChatbotResponse(
                message="What would you like to control? Try saying something like:\n• 'Limit water on floor 2 to 60%'\n• 'Turn off lights on floor 5'\n• 'Set HVAC to 22°C'",
                type="control",
                options=["Limit water", "Adjust HVAC", "Control lighting"]
            )
        
        elif "more" in message_lower or "detail" in message_lower:
            # Get detailed recommendations from EcoBrain
            building_data = ai_brain.get_building_decision()
            recommendations = building_data.get("recommendations", [])
            
            rec_text = "\n".join([f"• {r.get('action', 'Optimize')}" for r in recommendations[:3]])
            
            return ChatbotResponse(
                message=f"📈 **Detailed Recommendations**:\n\n{rec_text}\n\nWould you like me to implement any of these?",
                type="analytics",
                options=["Apply recommendations", "Show building view", "Back to menu"]
            )
        
        else:
            return self._show_analytics(context)
    
    def _show_building_view(self, context: ConversationContext) -> ChatbotResponse:
        """Show building visualization options."""
        context.current_step = ConversationStep.BUILDING_VIEW
        
        return ChatbotResponse(
            message="🏢 **Building View**\n\nYou can:\n• Click on any floor to see details\n• Ask me about a specific floor (e.g., 'Show floor 3')\n• Control resources by floor\n\nWhat floor would you like to explore?",
            type="building",
            options=["Floor 1", "Floor 5", "Floor 10", "All floors"]
        )
    
    def _handle_building_query(self, context: ConversationContext, message: str) -> ChatbotResponse:
        """Handle building view queries."""
        message_lower = message.lower()
        
        # Check for floor number
        import re
        floor_match = re.search(r'floor\s*(\d+)', message_lower)
        if floor_match or re.search(r'^(\d+)$', message.strip()):
            floor_num = int(floor_match.group(1) if floor_match else message.strip())
            context.current_floor = floor_num
            
            # Get floor data from data_store
            zones = [z for z in data_store.get_all_zones() if z.floor == floor_num]
            resources = []
            for zone in zones:
                resources.extend(data_store.get_resources_by_zone(zone.zone_id))
            
            if resources:
                elec = sum(r.current_value for r in resources if r.resource_type == ResourceType.ELECTRICITY)
                water = sum(r.current_value for r in resources if r.resource_type == ResourceType.WATER)
                hvac = sum(r.current_value for r in resources if r.resource_type == ResourceType.HVAC) / max(1, len([r for r in resources if r.resource_type == ResourceType.HVAC]))
                
                message_text = (
                    f"📍 **Floor {floor_num}**\n\n"
                    f"⚡ Electricity: {elec:.1f} kW\n"
                    f"💧 Water: {water:.1f} gal/min\n"
                    f"🌡️ HVAC: {hvac:.1f}°C avg\n\n"
                    f"Would you like to adjust any resources on this floor?"
                )
                
                return ChatbotResponse(
                    message=message_text,
                    type="building",
                    options=["Adjust HVAC", "Control lighting", "Limit water", "Back to building view"]
                )
        
        elif "all" in message_lower or "overview" in message_lower:
            return ChatbotResponse(
                message="🏢 **Building Overview**\n\nThe building has 10 floors with various zones. You can:\n• Ask about a specific floor\n• Control resources across floors\n• View efficiency metrics\n\nWhat would you like to do?",
                type="building",
                options=["Show floor 1", "Show floor 5", "Control resources", "View analytics"]
            )
        
        elif any(word in message_lower for word in ["control", "adjust", "change"]):
            return ChatbotResponse(
                message="What would you like to control? You can say things like:\n• 'Limit water on this floor to 60%'\n• 'Turn off lights'\n• 'Set temperature to 22°C'",
                type="control",
                options=["Limit water", "Adjust temperature", "Dim lights", "Cancel"]
            )
        
        return self._show_building_view(context)
    
    def _handle_clarification(self, context: ConversationContext, message: str) -> ChatbotResponse:
        """Handle clarification responses."""
        pending = context.pending_command
        if not pending:
            context.current_step = ConversationStep.GENERAL
            return self._handle_general_query(context, message)
        
        # Re-parse with additional context
        original_message = pending["original_message"]
        combined_message = f"{original_message} on {message}"
        
        # Clear pending and process as new command
        context.pending_command = None
        context.current_step = ConversationStep.CONTROL
        
        return self._handle_control_command(context, combined_message)
    
    def _handle_general_query(self, context: ConversationContext, message: str) -> ChatbotResponse:
        """Handle general queries using Gemini or fallback."""
        message_lower = message.lower()
        
        # Quick commands
        if any(word in message_lower for word in ["hello", "hi", "hey"]):
            return self._handle_greeting(context, message)
        
        elif "analytics" in message_lower or "report" in message_lower:
            return self._show_analytics(context)
        
        elif "building" in message_lower or "floor" in message_lower:
            return self._show_building_view(context)
        
        elif "help" in message_lower:
            return ChatbotResponse(
                message="**How to use EcoSync Chatbot:**\n\n**Control Resources:**\n• 'Limit water on floor 2 to 60%'\n• 'Turn off lights on floor 5'\n• 'Set HVAC to 22°C'\n• 'Optimize electricity'\n\n**View Data:**\n• 'Show analytics'\n• 'Show floor 3'\n• 'Building overview'\n\nWhat would you like to do?",
                type="help",
                options=["Show analytics", "Control resources", "Show building view"]
            )
        
        # Use Gemini for intelligent response
        if not self.using_fallback and self.client:
            return self._get_gemini_response(context, message)
        
        # Fallback
        return ChatbotResponse(
            message="I can help you control building resources or view analytics. Try saying:\n• 'Show analytics'\n• 'Limit water on floor 2'\n• 'Show building view'",
            type="general",
            options=["Show analytics", "Control resources", "Help"]
        )
    
    def _get_gemini_response(self, context: ConversationContext, message: str) -> ChatbotResponse:
        """Get conversational response from Gemini."""
        try:
            # Get current building state
            building_data = ai_brain.get_building_decision()
            
            prompt = f"""You are EcoSync Assistant, a helpful building management AI.

Current Building State:
- Efficiency: {building_data.get('efficiency_score', 0):.1f}%
- Status: {building_data.get('system_status', 'optimal')}
- Active Alerts: {building_data.get('alerts_summary', {}).get('total_active', 0)}

User Message: "{message}"

Conversation History: {context.message_count} messages
Current Context: {context.current_step.value}

Provide a helpful, concise response. If the user is asking about building resources,
refer to the current state. Suggest specific actions they can take.

Keep response under 3 sentences. Be friendly and professional."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7
                )
            )
            
            return ChatbotResponse(
                message=response.text,
                type="general",
                options=["Show analytics", "Control resources", "Help"]
            )
            
        except Exception as e:
            print(f"ChatbotEngine: Gemini response error: {e}")
            return ChatbotResponse(
                message="I can help you control resources or view building data. What would you like to do?",
                type="general",
                options=["Show analytics", "Control resources", "Help"]
            )
    
    def _generate_clarification_options(self, parsed) -> List[str]:
        """Generate options based on what needs clarification."""
        options = []
        
        if parsed.resource_type is None:
            options.extend(["Electricity", "Water", "HVAC", "Lighting"])
        
        if parsed.floor is None:
            options.extend(["Floor 1", "Floor 2", "Floor 5", "All floors"])
        
        if not options:
            options = ["Floor 1", "Floor 2", "Floor 3"]
        
        return options
    
    def reset_conversation(self, user_id: str) -> ChatbotResponse:
        """Reset a conversation to initial state."""
        if user_id in self.conversations:
            del self.conversations[user_id]
        
        return ChatbotResponse(
            message="Conversation reset. How can I help you today?",
            type="greeting",
            options=["Show analytics", "Control resources", "Help"]
        )
    
    def get_conversation_summary(self, user_id: str) -> Optional[Dict]:
        """Get summary of current conversation."""
        context = self.conversations.get(user_id)
        if not context:
            return None
        
        return context.to_dict()


# Global chatbot engine instance
chatbot_engine = ChatbotEngine()