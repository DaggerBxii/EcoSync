"""
EcoSync AI Module - The Brain
Uses Google Gemini AI for intelligent energy optimization predictions and insights.
"""

import os
import json
import random
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


class EcoBrain:
    """
    AI module for EcoSync energy optimization.
    Uses Google Gemini for intelligent predictions and insights.
    """
    
    def __init__(self, use_gemini: bool = True):
        """Initialize the AI module."""
        self.client = None
        self.model_name = "gemini-2.5-flash-lite"  # Updated model according to guidelines
        self.using_fallback = True
        
        # Historical data for context
        self._historical_occupancy: List[float] = []
        self._historical_watts: List[float] = []
        self._historical_anomalies: List[Dict] = []
        
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
    
    def get_decision(self, input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate a prediction following the Sync Contract.
        
        Args:
            input_data: Optional input data (hour_of_day, temperature, humidity, etc.)
        
        Returns:
            Dictionary with timestamp, system_status, scale_level, metrics,
            ai_insight, is_anomaly, confidence_score
        """
        timestamp = datetime.now()
        
        # Extract input parameters
        hour_of_day = input_data.get("hour_of_day", timestamp.hour) if input_data else timestamp.hour
        temperature = input_data.get("temperature") if input_data else None
        humidity = input_data.get("humidity") if input_data else None
        
        if self.using_fallback or self.client is None:
            return self._fallback_decision(timestamp, hour_of_day)
        
        try:
            # Get AI prediction from Gemini
            prediction = self._get_gemini_prediction(timestamp, hour_of_day, temperature, humidity)
            return prediction
        except Exception as e:
            print(f"EcoBrain: Error getting Gemini prediction: {e}")
            return self._fallback_decision(timestamp, hour_of_day)
    
    def _get_gemini_prediction(self, timestamp: datetime, hour_of_day: int,
                               temperature: Optional[float] = None,
                               humidity: Optional[float] = None) -> Dict[str, Any]:
        """Get prediction from Gemini AI."""
        
        # Build context from historical data
        historical_context = self._build_historical_context()
        
        # Build the prompt
        prompt = self._build_prediction_prompt(timestamp, hour_of_day, temperature, humidity, historical_context)
        
        # Call Gemini API
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=500,
                response_mime_type="application/json"
            )
        )
        
        # Parse the response
        result = self._parse_gemini_response(response.text, timestamp)
        
        # Update historical data
        self._update_history(result)
        
        return result
    
    def _build_prediction_prompt(self, timestamp: datetime, hour_of_day: int,
                                  temperature: Optional[float],
                                  humidity: Optional[float],
                                  historical_context: str) -> str:
        """Build the prompt for Gemini."""

        current_time = timestamp.strftime("%Y-%m-%d %H:%M:%S")
        day_of_week = timestamp.strftime("%A")

        prompt = f"""You are EcoSync, an AI energy management system for a smart building. Analyze the current situation and provide energy optimization recommendations.

CURRENT CONTEXT:
- Current Time: {current_time}
- Hour of Day: {hour_of_day}
- Day of Week: {day_of_week}
- Temperature: {temperature if temperature else 'Unknown (assume 22°C)'}
- Humidity: {humidity if humidity else 'Unknown (assume 50%)'}

{historical_context}

TASK:
Analyze the building's energy state and provide predictions in JSON format.

RESPONSE FORMAT (JSON only, no markdown):
{{
    "occupancy": <integer 0-15>,
    "watts": <float 50-200>,
    "is_anomaly": <boolean>,
    "anomaly_type": <string or null>,
    "system_status": "<Eco Mode|Scaling Down|Active|Alert>",
    "scale_level": <float 0.1-1.0>,
    "ai_insight": "<detailed explanation of the prediction>",
    "confidence_score": <float 0.5-1.0>,
    "recommendations": ["<recommendation 1>", "<recommendation 2>"],
    "unnecessary_usage_detected": <boolean>,
    "optimization_opportunities": ["<opportunity 1>", "<opportunity 2>"]
}}

LIVE FEED ANALYSIS RULES:
1. Compare current watts to expected watts based on occupancy
2. Flag unnecessary usage when watts are significantly higher than expected for current occupancy
3. Identify optimization opportunities when energy efficiency could be improved
4. Consider time-of-day patterns and suggest adjustments

RESPONSE RULES:
1. Occupancy should be 0-2 during night hours (22:00-06:00)
2. Occupancy should be higher during work hours (09:00-17:00) on weekdays
3. Weekends have lower occupancy
4. Watts should correlate with occupancy (base ~50W + occupancy * ~10W)
5. is_anomaly should be true if occupancy=0 and watts>100
6. unnecessary_usage_detected should be true when watts exceed expected levels for current occupancy
7. scale_level = occupancy / 10 (min 0.1, max 1.0)
8. ai_insight should be human-readable and explain the reasoning
9. confidence_score should reflect prediction certainty
10. optimization_opportunities should list specific ways to reduce energy waste

Respond with ONLY the JSON object, no additional text."""

        return prompt
    
    def _build_historical_context(self) -> str:
        """Build context from historical data."""
        if not self._historical_occupancy:
            return "HISTORICAL DATA: No historical data available yet."
        
        avg_occ = sum(self._historical_occupancy[-24:]) / min(len(self._historical_occupancy), 24)
        avg_watts = sum(self._historical_watts[-24:]) / min(len(self._historical_watts), 24)
        
        recent_anomalies = [a for a in self._historical_anomalies[-5:]]
        
        context = f"""HISTORICAL DATA (last 24 hours):
- Average Occupancy: {avg_occ:.1f} people
- Average Power: {avg_watts:.1f}W
- Recent Anomalies: {len(recent_anomalies)}"""
        
        if recent_anomalies:
            context += f"\n- Last Anomaly: {recent_anomalies[-1].get('description', 'Unknown')}"
        
        return context
    
    def _parse_gemini_response(self, response_text: str, timestamp: datetime) -> Dict[str, Any]:
        """Parse the Gemini response into the Sync Contract format."""
        try:
            # Clean the response (remove markdown if present)
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

            # Extract values with defaults
            occupancy = int(data.get("occupancy", 5))
            watts = float(data.get("watts", 100))
            is_anomaly = bool(data.get("is_anomaly", False))
            system_status = data.get("system_status", "Active")
            scale_level = float(data.get("scale_level", 0.5))
            ai_insight = data.get("ai_insight", "AI prediction generated.")
            confidence = float(data.get("confidence_score", 0.8))
            unnecessary_usage_detected = bool(data.get("unnecessary_usage_detected", False))
            optimization_opportunities = data.get("optimization_opportunities", [])

            # Validate and constrain values
            occupancy = max(0, min(15, occupancy))
            watts = max(50, min(200, watts))
            scale_level = max(0.1, min(1.0, scale_level))
            confidence = max(0.5, min(1.0, confidence))

            # Calculate carbon saved
            baseline_watts = 150.0
            carbon_saved = max(0, (baseline_watts - watts) * 0.0004)

            # Build the Sync Contract response
            result = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "system_status": system_status,
                "scale_level": round(scale_level, 2),
                "metrics": {
                    "watts": round(watts, 2),
                    "occupancy": occupancy,
                    "carbon_saved": round(carbon_saved, 3)
                },
                "ai_insight": ai_insight,
                "is_anomaly": is_anomaly,
                "confidence_score": round(confidence, 3),
                "unnecessary_usage_detected": unnecessary_usage_detected,
                "optimization_opportunities": optimization_opportunities
            }

            # Log anomaly if detected
            if is_anomaly or unnecessary_usage_detected:
                self._historical_anomalies.append({
                    "timestamp": result["timestamp"],
                    "description": ai_insight,
                    "watts": watts,
                    "occupancy": occupancy,
                    "unnecessary_usage_detected": unnecessary_usage_detected
                })

            return result

        except json.JSONDecodeError as e:
            print(f"EcoBrain: Error parsing Gemini response: {e}")
            print(f"EcoBrain: Response was: {response_text[:200]}...")
            return self._fallback_decision(timestamp, timestamp.hour)
    
    def _fallback_decision(self, timestamp: datetime, hour_of_day: int) -> Dict[str, Any]:
        """Fallback decision when Gemini is not available."""

        # Rule-based prediction
        is_weekend = timestamp.weekday() >= 5

        if hour_of_day < 6 or hour_of_day > 22:
            occupancy = random.randint(0, 2)
        elif 6 <= hour_of_day <= 9:
            occupancy = random.randint(6, 10)
        elif 10 <= hour_of_day <= 17:
            occupancy = random.randint(4, 8)
        else:
            occupancy = random.randint(2, 6)

        if is_weekend:
            occupancy = max(0, occupancy - 3)

        watts = 50.0 + occupancy * random.uniform(8.0, 15.0)

        # Check for anomaly
        is_anomaly = occupancy == 0 and watts > 100
        
        # Check for unnecessary usage
        expected_watts = 50.0 + occupancy * 10.0
        unnecessary_usage_detected = watts > expected_watts * 1.3  # 30% higher than expected

        # Calculate metrics
        scale_level = max(0.1, min(1.0, occupancy / 10))
        baseline_watts = 150.0
        carbon_saved = max(0, (baseline_watts - watts) * 0.0004)

        # Determine status
        if is_anomaly:
            system_status = "Alert"
        elif scale_level < 0.3:
            system_status = "Eco Mode"
        elif scale_level < 0.6:
            system_status = "Scaling Down"
        else:
            system_status = "Active"

        # Generate insight
        ai_insight = self._generate_fallback_insight(occupancy, watts, is_anomaly)
        
        # Generate optimization opportunities
        optimization_opportunities = []
        if unnecessary_usage_detected:
            optimization_opportunities.append(f"Energy usage ({watts:.1f}W) is significantly higher than expected for current occupancy ({occupancy} people)")
            optimization_opportunities.append("Consider investigating equipment that may be consuming excess energy")
        if occupancy == 0 and watts > 80:
            optimization_opportunities.append("Zero occupancy with high energy usage detected - consider activating deep eco-mode")

        result = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "system_status": system_status,
            "scale_level": round(scale_level, 2),
            "metrics": {
                "watts": round(watts, 2),
                "occupancy": occupancy,
                "carbon_saved": round(carbon_saved, 3)
            },
            "ai_insight": ai_insight,
            "is_anomaly": is_anomaly,
            "confidence_score": 0.75,
            "unnecessary_usage_detected": unnecessary_usage_detected,
            "optimization_opportunities": optimization_opportunities
        }

        # Update history
        self._update_history(result)

        return result
    
    def _generate_fallback_insight(self, occupancy: int, watts: float, is_anomaly: bool) -> str:
        """Generate a fallback insight when Gemini is not available."""
        if is_anomaly:
            return f"⚠️ Anomaly detected: High energy usage ({watts:.0f}W) with zero occupancy. Investigate immediately."
        
        if occupancy == 0:
            return random.choice([
                "Deep Eco-Mode: No human load detected. Building is unoccupied.",
                "Maximum efficiency: Zero occupancy. All non-essential systems scaled down.",
                "Energy saving mode: Building vacant. Minimal power consumption active."
            ])
        elif occupancy < 3:
            return f"Low occupancy ({occupancy} people). Reducing power to {watts:.0f}W for efficiency."
        elif occupancy < 7:
            return f"Moderate occupancy ({occupancy} people). Normal operations at {watts:.0f}W."
        else:
            return f"High occupancy ({occupancy} people). Full capacity operations at {watts:.0f}W."
    
    def _update_history(self, result: Dict[str, Any]):
        """Update historical data with new prediction."""
        self._historical_occupancy.append(result["metrics"]["occupancy"])
        self._historical_watts.append(result["metrics"]["watts"])
        
        if len(self._historical_occupancy) > self._cache_max_size:
            self._historical_occupancy.pop(0)
            self._historical_watts.pop(0)
        
        if len(self._historical_anomalies) > 100:
            self._historical_anomalies.pop(0)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get AI module status information."""
        return {
            "using_gemini": not self.using_fallback,
            "gemini_available": GEMINI_AVAILABLE,
            "model_name": self.model_name if not self.using_fallback else "fallback",
            "client_initialized": self.client is not None,
            "historical_samples": len(self._historical_occupancy),
            "anomalies_detected": len(self._historical_anomalies)
        }
    
    def analyze_anomaly(self, anomaly_data: Dict[str, Any]) -> str:
        """Get detailed analysis of an anomaly from Gemini."""
        if self.using_fallback or self.client is None:
            return "Anomaly analysis unavailable - Gemini not initialized."
        
        try:
            prompt = f"""Analyze this building energy anomaly and provide recommendations:

ANOMALY DATA:
- Timestamp: {anomaly_data.get('timestamp', 'Unknown')}
- Power Usage: {anomaly_data.get('watts', 'Unknown')}W
- Occupancy: {anomaly_data.get('occupancy', 'Unknown')}
- Description: {anomaly_data.get('description', 'Unknown')}

Provide:
1. Likely cause of the anomaly
2. Potential risks
3. Recommended actions
4. Priority level (Low/Medium/High/Critical)

Keep the response concise and actionable."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.5,
                    max_output_tokens=300
                )
            )
            
            return response.text
            
        except Exception as e:
            return f"Error analyzing anomaly: {e}"
    
    def get_energy_recommendations(self, hours_ahead: int = 24) -> List[Dict[str, Any]]:
        """Get energy optimization recommendations for the next N hours."""
        if self.using_fallback or self.client is None:
            return self._get_fallback_recommendations(hours_ahead)
        
        try:
            historical_context = self._build_historical_context()
            
            prompt = f"""Based on current building data, provide energy optimization recommendations for the next {hours_ahead} hours.

{historical_context}

Provide 3-5 specific, actionable recommendations in JSON format:
{{
    "recommendations": [
        {{
            "time": "<hour or time range>",
            "action": "<specific action>",
            "expected_savings": "<estimated energy savings>",
            "priority": "<High/Medium/Low>"
        }}
    ]
}}

Respond with ONLY the JSON object."""
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.6,
                    max_output_tokens=500,
                    response_mime_type="application/json"
                )
            )
            
            data = json.loads(response.text)
            return data.get("recommendations", [])
            
        except Exception as e:
            print(f"EcoBrain: Error getting recommendations: {e}")
            return self._get_fallback_recommendations(hours_ahead)
    
    def _get_fallback_recommendations(self, hours_ahead: int) -> List[Dict[str, Any]]:
        """Get fallback recommendations."""
        return [
            {
                "time": "Night hours (22:00-06:00)",
                "action": "Activate deep eco-mode and reduce HVAC to minimum",
                "expected_savings": "30-40% energy reduction",
                "priority": "High"
            },
            {
                "time": "Morning rush (06:00-09:00)",
                "action": "Pre-cool/heat building before occupancy peak",
                "expected_savings": "15-20% HVAC efficiency",
                "priority": "Medium"
            },
            {
                "time": "Work hours (09:00-17:00)",
                "action": "Optimize lighting based on natural daylight",
                "expected_savings": "10-15% lighting energy",
                "priority": "Low"
            }
        ]