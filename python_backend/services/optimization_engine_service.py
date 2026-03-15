"""
Optimization Engine Service - Q-Learning for power optimization
"""
import random
from datetime import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.pricing_service import PricingService


class Action(Enum):
    """Action space for Q-Learning"""
    SCALE_UP = 1.1       # Increase power by 10%
    SCALE_DOWN = 0.9     # Decrease power by 10%
    MAINTAIN = 1.0       # Keep current level
    SHED_LOAD = 0.7      # Aggressive reduction (30%)
    BOOST = 1.2          # Significant increase (20%)


@dataclass
class State:
    """State representation for Q-Learning"""
    occupancy_level: int      # Low (0), Medium (1), High (2)
    time_period: int          # Off-peak (0), Mid-peak (1), Peak (2)
    load_level: int           # Low (0), Normal (1), High (2)
    comfort_deviation: int    # None (0), Slight (1), Significant (2)
    
    def __hash__(self):
        return hash((self.occupancy_level, self.time_period, self.load_level, self.comfort_deviation))
    
    def __eq__(self, other):
        if not isinstance(other, State):
            return False
        return (
            self.occupancy_level == other.occupancy_level and
            self.time_period == other.time_period and
            self.load_level == other.load_level and
            self.comfort_deviation == other.comfort_deviation
        )
    
    def __str__(self):
        return f"State(occ={self.occupancy_level}, time={self.time_period}, load={self.load_level}, comfort={self.comfort_deviation})"


@dataclass
class LearningResult:
    """Result of a learning step"""
    from_state: State
    to_state: State
    action: Action
    reward: float
    energy_saved_kwh: float
    cost_saved: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "from_state": str(self.from_state),
            "to_state": str(self.to_state),
            "action": self.action.name,
            "reward": round(self.reward, 2),
            "energy_saved_kwh": round(self.energy_saved_kwh, 3),
            "cost_saved": round(self.cost_saved, 2)
        }


class OptimizationEngineService:
    """
    Optimization Engine using Q-Learning (Reinforcement Learning).
    Learns optimal power scaling decisions to balance energy savings and comfort.
    """
    
    def __init__(self):
        self.pricing_service = PricingService()
        
        # Q-table: State -> (Action -> Q-Value)
        self.q_table: Dict[State, Dict[Action, float]] = {}
        
        # Learning parameters
        self.learning_rate = 0.1      # Alpha
        self.discount_factor = 0.95   # Gamma
        self.exploration_rate = 0.2   # Epsilon
        
        # Initialize Q-table
        self._initialize_q_table()
    
    def _initialize_q_table(self):
        """Initialize Q-table with all state-action combinations"""
        for occ in range(3):
            for time_period in range(3):
                for load in range(3):
                    for comfort in range(3):
                        state = State(occ, time_period, load, comfort)
                        self.q_table[state] = {
                            action: random.random() * 0.1
                            for action in Action
                        }
        print(f"Initialized Q-table with {len(self.q_table)} states")
    
    def decide_action(self, current_state: State) -> Action:
        """Decide optimal action using epsilon-greedy policy"""
        # Exploration: random action
        if random.random() < self.exploration_rate:
            return random.choice(list(Action))
        
        # Exploitation: choose best known action
        state_actions = self.q_table.get(current_state)
        if not state_actions:
            return Action.MAINTAIN
        
        best_action = max(state_actions.keys(), key=lambda a: state_actions[a])
        return best_action
    
    def create_state_from_readings(
        self,
        occupancy: int,
        current_wattage: float,
        baseline_wattage: float,
        t: time
    ) -> State:
        """Create state from sensor readings"""
        # Discretize occupancy
        occ_level = 0 if occupancy < 20 else (1 if occupancy < 50 else 2)
        
        # Discretize time period (pricing)
        time_period = self._get_time_period_value(t)
        
        # Discretize load level
        load_ratio = current_wattage / (baseline_wattage if baseline_wattage > 0 else 1)
        load_level = 0 if load_ratio < 0.7 else (1 if load_ratio < 1.3 else 2)
        
        # Discretize comfort deviation
        power_per_person = current_wattage / (occupancy if occupancy > 0 else 1)
        comfort_dev = 2 if power_per_person < 30 else (1 if power_per_person < 100 else 0)
        
        return State(occ_level, time_period, load_level, comfort_dev)
    
    def _get_time_period_value(self, t: time) -> int:
        """Convert time to period value (0=off-peak, 1=mid-peak, 2=peak)"""
        if t.hour < 6 or t.hour >= 21:
            return 0  # Off-peak
        if t.hour < 10 or t.hour >= 17:
            return 1  # Mid-peak
        return 2  # Peak
    
    def learn(self, state: State, action: Action, reward: float, next_state: State):
        """Q-learning update rule"""
        state_actions = self.q_table.get(state)
        if not state_actions:
            return
        
        old_q = state_actions.get(action, 0.0)
        
        # Get max Q-value for next state
        next_state_actions = self.q_table.get(next_state, {})
        max_next_q = max(next_state_actions.values()) if next_state_actions else 0.0
        
        # Q-learning update formula
        new_q = old_q + self.learning_rate * (reward + self.discount_factor * max_next_q - old_q)
        state_actions[action] = new_q
    
    def calculate_reward(
        self,
        energy_saved_kwh: float,
        comfort_deviation: float,
        was_anomaly: bool,
        cost_saved: float
    ) -> float:
        """Calculate reward based on outcome"""
        energy_reward = energy_saved_kwh * 10       # Points per kWh saved
        comfort_penalty = comfort_deviation * 5     # Points lost per unit discomfort
        anomaly_bonus = 50 if was_anomaly else 0    # Big reward for preventing anomalies
        cost_reward = cost_saved * 100              # Points per dollar saved
        
        return energy_reward - comfort_penalty + anomaly_bonus + cost_reward
    
    def learn_step(
        self,
        occupancy: int,
        current_wattage: float,
        baseline_wattage: float,
        taken_action: Action,
        new_wattage: float,
        prevented_anomaly: bool
    ) -> LearningResult:
        """Run a complete learning step"""
        now = datetime.now()
        
        # Create current state
        current_state = self.create_state_from_readings(
            occupancy, current_wattage, baseline_wattage, now.time()
        )
        
        # Calculate outcomes
        energy_saved_kwh = (current_wattage - new_wattage) / 1000
        cost_saved = energy_saved_kwh * self.pricing_service.get_current_price_per_kwh()
        comfort_deviation = abs(current_wattage - new_wattage) / baseline_wattage if baseline_wattage > 0 else 0
        
        # Calculate reward
        reward = self.calculate_reward(energy_saved_kwh, comfort_deviation, prevented_anomaly, cost_saved)
        
        # Create next state
        next_state = self.create_state_from_readings(
            occupancy, new_wattage, baseline_wattage, now.time()
        )
        
        # Update Q-table
        self.learn(current_state, taken_action, reward, next_state)
        
        return LearningResult(current_state, next_state, taken_action, reward, energy_saved_kwh, cost_saved)
    
    def get_recommendation(
        self,
        occupancy: int,
        current_wattage: float,
        baseline_wattage: float
    ) -> Dict[str, Any]:
        """Get recommended action for current conditions"""
        now = datetime.now()
        current_state = self.create_state_from_readings(
            occupancy, current_wattage, baseline_wattage, now.time()
        )
        
        recommended_action = self.decide_action(current_state)
        
        # Q-values for all actions
        state_actions = self.q_table.get(current_state, {})
        q_values = {
            action.name: round(value, 2)
            for action, value in state_actions.items()
        }
        
        return {
            "current_state": str(current_state),
            "recommended_action": recommended_action.name,
            "scale_multiplier": recommended_action.value,
            "expected_new_wattage": round(current_wattage * recommended_action.value),
            "action_description": self._get_action_description(recommended_action),
            "q_values": q_values
        }
    
    def get_training_stats(self) -> Dict[str, Any]:
        """Get training statistics"""
        action_counts = {action.name: 0 for action in Action}
        
        total_q = 0
        count = 0
        for state_actions in self.q_table.values():
            for action, value in state_actions.items():
                total_q += value
                count += 1
                if value > 0.5:
                    action_counts[action.name] += 1
        
        return {
            "total_states": len(self.q_table),
            "learning_rate": self.learning_rate,
            "discount_factor": self.discount_factor,
            "exploration_rate": self.exploration_rate,
            "average_q_value": round(total_q / count, 2) if count > 0 else 0,
            "preferred_actions": action_counts
        }
    
    def decay_exploration(self):
        """Reduce exploration rate over time (simulated annealing)"""
        self.exploration_rate = max(0.05, self.exploration_rate * 0.99)
    
    def reset(self):
        """Reset Q-table for retraining"""
        self.q_table.clear()
        self._initialize_q_table()
        self.exploration_rate = 0.2
    
    def _get_action_description(self, action: Action) -> str:
        """Get human-readable action description"""
        descriptions = {
            Action.SCALE_UP: "Increase power allocation by 10%",
            Action.SCALE_DOWN: "Reduce power allocation by 10%",
            Action.MAINTAIN: "Maintain current power level",
            Action.SHED_LOAD: "Aggressively reduce non-essential loads by 30%",
            Action.BOOST: "Increase power by 20% for high-demand situation"
        }
        return descriptions.get(action, "Unknown action")


# Import datetime for learn_step
from datetime import datetime
