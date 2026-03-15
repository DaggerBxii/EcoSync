"""
EcoSync AI Controller - Natural Language Resource Control
Converts natural language commands into building resource control actions.
Uses Google Gemini AI for intent parsing and parameter extraction.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum

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
    Resource, ResourceType, Zone, data_store,
    ResourceStatus
)


class ControlAction(str, Enum):
    """Types of control actions."""
    SET = "set"
    INCREASE = "increase"
    DECREASE = "decrease"
    LIMIT = "limit"
    TURN_ON = "turn_on"
    TURN_OFF = "turn_off"
    OPTIMIZE = "optimize"
    SCHEDULE = "schedule"


@dataclass
class ParsedCommand:
    """Parsed natural language command."""
    action: ControlAction
    resource_type: Optional[ResourceType]
    floor: Optional[int]
    zone_id: Optional[str]
    value: Optional[float]
    unit: Optional[str]
    confidence: float
    original_text: str
    needs_clarification: bool
    clarification_question: Optional[str]


@dataclass
class ControlResult:
    """Result of a control action."""
    success: bool
    message: str
    resources_affected: List[str]
    previous_values: Dict[str, float]
    new_values: Dict[str, float]
    timestamp: str
    estimated_impact: Optional[str] = None


class AIController:
    """
    Natural language controller for building resources.
    Uses Gemini AI to parse commands and execute control actions.
    """

    def __init__(self, use_gemini: bool = True):
        """Initialize the AI controller."""
        self.client = None
        self.model_name = "gemini-2.5-flash-lite"
        self.using_fallback = True
        self.command_history: List[Dict] = []

        if use_gemini:
            self._initialize_gemini()

    def _initialize_gemini(self) -> bool:
        """Initialize the Gemini client."""
        try:
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key or not GEMINI_AVAILABLE:
                return False

            self.client = genai.Client(api_key=api_key)
            self.using_fallback = False
            print("AIController: Gemini AI initialized successfully.")
            return True

        except Exception as e:
            print(f"AIController: Error initializing Gemini: {e}")
            return False

    def parse_command(self, user_input: str, context: Optional[Dict] = None) -> ParsedCommand:
        """
        Parse a natural language command into structured data.

        Args:
            user_input: The user's natural language command
            context: Optional context (current building, floor, etc.)

        Returns:
            ParsedCommand with extracted parameters
        """
        if self.using_fallback or self.client is None:
            return self._fallback_parse(user_input, context)

        try:
            prompt = self._build_parse_prompt(user_input, context)
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=500,
                    response_mime_type="application/json"
                )
            )

            return self._parse_gemini_response(response.text, user_input)

        except Exception as e:
            print(f"AIController: Error parsing command: {e}")
            return self._fallback_parse(user_input, context)

    def _build_parse_prompt(self, user_input: str, context: Optional[Dict]) -> str:
        """Build the prompt for Gemini to parse the command."""
        
        building_context = ""
        if context:
            building_context = f"""
CURRENT CONTEXT:
- Building: {context.get('building_name', 'Synclo Tower')}
- Current Floor: {context.get('current_floor', 'None selected')}
- Available Floors: {context.get('total_floors', 10)}
- Available Resources: electricity, water, hvac, lighting
"""

        prompt = f"""You are a building resource control parser. Parse the user's natural language command into structured data.

{building_context}

USER COMMAND: "{user_input}"

Parse this command and extract:
1. Action: set, increase, decrease, limit, turn_on, turn_off, optimize, schedule
2. Resource type: electricity, water, hvac, lighting (or null if not specified)
3. Floor: integer 1-10 (or null if not specified)
4. Value: the target value/percentage (or null)
5. Unit: the unit mentioned (%, kW, °C, L/min, etc.)

RESPONSE FORMAT (JSON only):
{{
    "action": "<action>",
    "resource_type": "<resource_type or null>",
    "floor": <floor number or null>,
    "value": <value or null>,
    "unit": "<unit or null>",
    "confidence": <0.0-1.0>,
    "needs_clarification": <boolean>,
    "clarification_question": "<question if clarification needed, else null>"
}}

EXAMPLES:
- "limit water usage on floor 2 to 60%" → {{"action": "limit", "resource_type": "water", "floor": 2, "value": 60, "unit": "%", "confidence": 0.95, "needs_clarification": false, "clarification_question": null}}
- "turn off lights on floor 5" → {{"action": "turn_off", "resource_type": "lighting", "floor": 5, "value": null, "unit": null, "confidence": 0.95, "needs_clarification": false, "clarification_question": null}}
- "increase temperature" → {{"action": "increase", "resource_type": "hvac", "floor": null, "value": null, "unit": "°C", "confidence": 0.7, "needs_clarification": true, "clarification_question": "Which floor would you like to adjust the temperature for?"}}
- "optimize everything" → {{"action": "optimize", "resource_type": null, "floor": null, "value": null, "unit": null, "confidence": 0.8, "needs_clarification": true, "clarification_question": "Would you like to optimize all floors or a specific one?"}}

Respond with ONLY the JSON object."""

        return prompt

    def _parse_gemini_response(self, response_text: str, original_text: str) -> ParsedCommand:
        """Parse Gemini's response into a ParsedCommand."""
        try:
            # Clean response
            clean = response_text.strip()
            if clean.startswith("```json"):
                clean = clean[7:]
            if clean.startswith("```"):
                clean = clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]
            clean = clean.strip()

            data = json.loads(clean)

            # Parse action
            action_str = data.get("action", "set")
            try:
                action = ControlAction(action_str)
            except ValueError:
                action = ControlAction.SET

            # Parse resource type
            resource_type = None
            rt_str = data.get("resource_type")
            if rt_str:
                try:
                    resource_type = ResourceType(rt_str)
                except ValueError:
                    pass

            return ParsedCommand(
                action=action,
                resource_type=resource_type,
                floor=data.get("floor"),
                zone_id=None,
                value=data.get("value"),
                unit=data.get("unit"),
                confidence=data.get("confidence", 0.8),
                original_text=original_text,
                needs_clarification=data.get("needs_clarification", False),
                clarification_question=data.get("clarification_question")
            )

        except json.JSONDecodeError as e:
            print(f"AIController: Error parsing Gemini response: {e}")
            return self._fallback_parse(original_text, None)

    def _fallback_parse(self, user_input: str, context: Optional[Dict]) -> ParsedCommand:
        """Fallback parser using simple pattern matching."""
        text = user_input.lower()
        
        # Detect action
        action = ControlAction.SET
        if "limit" in text or "reduce" in text:
            action = ControlAction.LIMIT
        elif "increase" in text or "raise" in text:
            action = ControlAction.INCREASE
        elif "decrease" in text or "lower" in text:
            action = ControlAction.DECREASE
        elif "turn off" in text or "shut off" in text:
            action = ControlAction.TURN_OFF
        elif "turn on" in text or "switch on" in text:
            action = ControlAction.TURN_ON
        elif "optimize" in text:
            action = ControlAction.OPTIMIZE

        # Detect resource type
        resource_type = None
        if "water" in text:
            resource_type = ResourceType.WATER
        elif "electricity" in text or "power" in text:
            resource_type = ResourceType.ELECTRICITY
        elif "hvac" in text or "temperature" in text or "heat" in text or "cool" in text:
            resource_type = ResourceType.HVAC
        elif "light" in text:
            resource_type = ResourceType.LIGHTING

        # Detect floor
        floor = None
        import re
        floor_match = re.search(r"floor\s*(\d+)", text)
        if floor_match:
            floor = int(floor_match.group(1))

        # Detect value
        value = None
        unit = None
        value_match = re.search(r"(\d+(?:\.\d+)?)\s*(%|kW|°C|L/min|gal)?", text)
        if value_match:
            value = float(value_match.group(1))
            unit = value_match.group(2)

        # Check if clarification needed
        needs_clarification = False
        clarification_question = None
        
        if resource_type is None and action not in [ControlAction.OPTIMIZE]:
            needs_clarification = True
            clarification_question = "Which resource would you like to control? (electricity, water, hvac, lighting)"
        elif floor is None and action not in [ControlAction.OPTIMIZE]:
            needs_clarification = True
            clarification_question = "Which floor would you like to adjust?"

        return ParsedCommand(
            action=action,
            resource_type=resource_type,
            floor=floor,
            zone_id=None,
            value=value,
            unit=unit,
            confidence=0.7,
            original_text=user_input,
            needs_clarification=needs_clarification,
            clarification_question=clarification_question
        )

    def execute_command(self, parsed: ParsedCommand, building_data: Optional[Dict] = None) -> ControlResult:
        """
        Execute a parsed command on building resources.

        Args:
            parsed: The parsed command
            building_data: Current building data (for frontend state updates)

        Returns:
            ControlResult with execution details
        """
        timestamp = datetime.utcnow().isoformat() + "Z"
        resources_affected: List[str] = []
        previous_values: Dict[str, float] = {}
        new_values: Dict[str, float] = {}

        # Handle clarification needed
        if parsed.needs_clarification:
            return ControlResult(
                success=False,
                message=parsed.clarification_question or "Please provide more details.",
                resources_affected=[],
                previous_values={},
                new_values={},
                timestamp=timestamp
            )

        # Get resources to modify
        resources = self._get_target_resources(parsed, building_data)
        
        if not resources:
            return ControlResult(
                success=False,
                message=f"No controllable resources found for the specified criteria.",
                resources_affected=[],
                previous_values={},
                new_values={},
                timestamp=timestamp
            )

        # Execute action on each resource
        for resource in resources:
            if not resource.is_controllable:
                continue

            previous_values[resource.resource_id] = resource.current_value
            new_value = self._calculate_new_value(resource, parsed)
            
            # Update the resource
            success = data_store.update_resource_value(resource.resource_id, new_value)
            
            if success:
                resources_affected.append(resource.resource_id)
                new_values[resource.resource_id] = new_value

        # Generate result message
        if resources_affected:
            message = self._generate_success_message(parsed, resources_affected, new_values)
            estimated_impact = self._estimate_impact(parsed, new_values)
        else:
            message = "No resources were modified. Please check your command."

        # Log command
        self.command_history.append({
            "timestamp": timestamp,
            "command": parsed.original_text,
            "parsed": {
                "action": parsed.action.value,
                "resource_type": parsed.resource_type.value if parsed.resource_type else None,
                "floor": parsed.floor,
                "value": parsed.value
            },
            "success": len(resources_affected) > 0,
            "resources_affected": resources_affected
        })

        return ControlResult(
            success=len(resources_affected) > 0,
            message=message,
            resources_affected=resources_affected,
            previous_values=previous_values,
            new_values=new_values,
            timestamp=timestamp,
            estimated_impact=estimated_impact if resources_affected else None
        )

    def _get_target_resources(self, parsed: ParsedCommand, building_data: Optional[Dict] = None) -> List[Resource]:
        """Get the list of resources to modify based on parsed command."""
        all_resources = data_store.get_all_resources()
        
        # Filter by resource type
        if parsed.resource_type:
            all_resources = [r for r in all_resources if r.resource_type == parsed.resource_type]

        # Filter by floor (using zone floor)
        if parsed.floor:
            zones = data_store.get_all_zones()
            floor_zones = [z.zone_id for z in zones if z.floor == parsed.floor]
            all_resources = [r for r in all_resources if r.zone_id in floor_zones]

        return all_resources

    def _calculate_new_value(self, resource: Resource, parsed: ParsedCommand) -> float:
        """Calculate the new value for a resource based on the action."""
        current = resource.current_value
        
        if parsed.action == ControlAction.SET:
            return parsed.value if parsed.value is not None else current
        
        elif parsed.action == ControlAction.LIMIT:
            # Limit means cap at a maximum
            if parsed.value is not None:
                if resource.resource_type == ResourceType.WATER:
                    # Water limit as percentage of max
                    max_val = resource.max_threshold or 100
                    return min(current, max_val * parsed.value / 100)
                return min(current, parsed.value)
            return current
        
        elif parsed.action == ControlAction.INCREASE:
            delta = parsed.value if parsed.value is not None else 10
            if parsed.unit == "%":
                delta = current * (delta / 100)
            return min(current + delta, resource.max_threshold or current * 2)
        
        elif parsed.action == ControlAction.DECREASE:
            delta = parsed.value if parsed.value is not None else 10
            if parsed.unit == "%":
                delta = current * (delta / 100)
            return max(current - delta, resource.min_threshold or 0)
        
        elif parsed.action == ControlAction.TURN_OFF:
            return 0
        
        elif parsed.action == ControlAction.TURN_ON:
            return resource.target_value or 50
        
        elif parsed.action == ControlAction.OPTIMIZE:
            # Set to optimal value based on resource type
            if resource.resource_type == ResourceType.HVAC:
                return 22.0  # Optimal temperature
            elif resource.resource_type == ResourceType.LIGHTING:
                return 70.0  # Optimal lighting level
            return resource.target_value or current
        
        return current

    def _generate_success_message(self, parsed: ParsedCommand, resources: List[str], new_values: Dict[str, float]) -> str:
        """Generate a human-readable success message."""
        action_verb = {
            ControlAction.SET: "set",
            ControlAction.LIMIT: "limited",
            ControlAction.INCREASE: "increased",
            ControlAction.DECREASE: "decreased",
            ControlAction.TURN_OFF: "turned off",
            ControlAction.TURN_ON: "turned on",
            ControlAction.OPTIMIZE: "optimized",
            ControlAction.SCHEDULE: "scheduled"
        }.get(parsed.action, "modified")

        resource_name = parsed.resource_type.value if parsed.resource_type else "resources"
        floor_text = f"floor {parsed.floor}" if parsed.floor else "all floors"
        value_text = f" to {parsed.value}{parsed.unit or ''}" if parsed.value else ""

        return f"✅ Successfully {action_verb} {resource_name} on {floor_text}{value_text}. {len(resources)} resource(s) updated."

    def _estimate_impact(self, parsed: ParsedCommand, new_values: Dict[str, float]) -> str:
        """Estimate the impact of the change."""
        if parsed.action in [ControlAction.DECREASE, ControlAction.LIMIT, ControlAction.TURN_OFF]:
            return "Estimated energy savings: 5-15% reduction in consumption"
        elif parsed.action == ControlAction.OPTIMIZE:
            return "Estimated efficiency improvement: 10-20% better resource utilization"
        elif parsed.action == ControlAction.INCREASE:
            return "Note: This may increase energy consumption"
        return None

    def get_command_history(self, limit: int = 10) -> List[Dict]:
        """Get recent command history."""
        return self.command_history[-limit:]

    def generate_response(self, user_input: str, result: ControlResult, context: Optional[Dict] = None) -> str:
        """
        Generate a natural language response to the user after executing a command.
        
        Args:
            user_input: Original user command
            result: The control result
            context: Additional context
            
        Returns:
            Natural language response
        """
        if not result.success:
            return result.message

        # Build a detailed response
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


# Global AI controller instance
ai_controller = AIController(use_gemini=True)