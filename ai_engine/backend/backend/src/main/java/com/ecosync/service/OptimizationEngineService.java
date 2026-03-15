package com.ecosync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.LocalTime;
import java.util.*;

/**
 * Optimization Engine using Q-Learning (Reinforcement Learning)
 * Learns optimal power scaling decisions to balance energy savings and comfort
 */
@Service
public class OptimizationEngineService {

    @Autowired
    private PricingService pricingService;

    // Q-table: State -> (Action -> Q-Value)
    private final Map<State, Map<Action, Double>> qTable = new HashMap<>();

    // Learning parameters
    private final double learningRate = 0.1;      // Alpha: How much new info overrides old
    private final double discountFactor = 0.95;   // Gamma: Importance of future rewards
    private double explorationRate = 0.2;         // Epsilon: Exploration vs exploitation

    // Action space
    public enum Action {
        SCALE_UP(1.1),      // Increase power by 10%
        SCALE_DOWN(0.9),    // Decrease power by 10%
        MAINTAIN(1.0),      // Keep current level
        SHED_LOAD(0.7),     // Aggressive reduction (30%)
        BOOST(1.2);         // Significant increase (20%)

        public final double scaleMultiplier;

        Action(double scaleMultiplier) {
            this.scaleMultiplier = scaleMultiplier;
        }
    }

    // State representation
    public static class State {
        private final int occupancyLevel;     // Low (0), Medium (1), High (2)
        private final int timePeriod;         // Off-peak (0), Mid-peak (1), Peak (2)
        private final int loadLevel;          // Low (0), Normal (1), High (2)
        private final int comfortDeviation;   // None (0), Slight (1), Significant (2)

        public State(int occupancyLevel, int timePeriod, int loadLevel, int comfortDeviation) {
            this.occupancyLevel = occupancyLevel;
            this.timePeriod = timePeriod;
            this.loadLevel = loadLevel;
            this.comfortDeviation = comfortDeviation;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            State state = (State) o;
            return occupancyLevel == state.occupancyLevel &&
                   timePeriod == state.timePeriod &&
                   loadLevel == state.loadLevel &&
                   comfortDeviation == state.comfortDeviation;
        }

        @Override
        public int hashCode() {
            return Objects.hash(occupancyLevel, timePeriod, loadLevel, comfortDeviation);
        }

        @Override
        public String toString() {
            return String.format("State{occ=%d, time=%d, load=%d, comfort=%d}",
                    occupancyLevel, timePeriod, loadLevel, comfortDeviation);
        }
    }

    @PostConstruct
    public void init() {
        initializeQTable();
    }

    /**
     * Initialize Q-table with all state-action combinations
     */
    private void initializeQTable() {
        // Generate all possible states
        for (int occ = 0; occ < 3; occ++) {
            for (int time = 0; time < 3; time++) {
                for (int load = 0; load < 3; load++) {
                    for (int comfort = 0; comfort < 3; comfort++) {
                        State state = new State(occ, time, load, comfort);
                        Map<Action, Double> actions = new EnumMap<>(Action.class);
                        
                        // Initialize with small random values to encourage exploration
                        for (Action action : Action.values()) {
                            actions.put(action, Math.random() * 0.1);
                        }
                        
                        qTable.put(state, actions);
                    }
                }
            }
        }
        System.out.println("Initialized Q-table with " + qTable.size() + " states");
    }

    /**
     * Decide optimal action using epsilon-greedy policy
     */
    public Action decideAction(State currentState) {
        // Exploration: random action
        if (Math.random() < explorationRate) {
            Action[] actions = Action.values();
            return actions[new Random().nextInt(actions.length)];
        }

        // Exploitation: choose best known action
        Map<Action, Double> stateActions = qTable.get(currentState);
        if (stateActions == null) {
            return Action.MAINTAIN;
        }

        Action bestAction = null;
        double bestValue = Double.NEGATIVE_INFINITY;

        for (Map.Entry<Action, Double> entry : stateActions.entrySet()) {
            if (entry.getValue() > bestValue) {
                bestValue = entry.getValue();
                bestAction = entry.getKey();
            }
        }

        return bestAction != null ? bestAction : Action.MAINTAIN;
    }

    /**
     * Create state from sensor readings
     */
    public State createStateFromReadings(int occupancy, double currentWattage, 
                                          double baselineWattage, LocalTime time) {
        // Discretize occupancy
        int occLevel = occupancy < 20 ? 0 : (occupancy < 50 ? 1 : 2);

        // Discretize time period (pricing)
        int timePeriod = getTimePeriodValue(time);

        // Discretize load level
        double loadRatio = currentWattage / (baselineWattage > 0 ? baselineWattage : 1);
        int loadLevel = loadRatio < 0.7 ? 0 : (loadRatio < 1.3 ? 1 : 2);

        // Discretize comfort deviation (simplified: based on occupancy vs power)
        double powerPerPerson = currentWattage / (occupancy > 0 ? occupancy : 1);
        int comfortDev = powerPerPerson < 30 ? 2 : (powerPerPerson < 100 ? 1 : 0);

        return new State(occLevel, timePeriod, loadLevel, comfortDev);
    }

    private int getTimePeriodValue(LocalTime time) {
        if (time.isBefore(LocalTime.of(6, 0)) || time.isAfter(LocalTime.of(21, 0))) {
            return 0; // Off-peak
        }
        if (time.isBefore(LocalTime.of(10, 0)) || time.isAfter(LocalTime.of(17, 0))) {
            return 1; // Mid-peak
        }
        return 2; // Peak
    }

    /**
     * Q-learning update rule
     */
    public void learn(State state, Action action, double reward, State nextState) {
        Map<Action, Double> stateActions = qTable.get(state);
        if (stateActions == null) {
            return;
        }

        double oldQ = stateActions.getOrDefault(action, 0.0);

        // Get max Q-value for next state
        Map<Action, Double> nextStateActions = qTable.get(nextState);
        double maxNextQ = 0.0;
        if (nextStateActions != null) {
            maxNextQ = nextStateActions.values().stream()
                    .mapToDouble(Double::doubleValue)
                    .max()
                    .orElse(0.0);
        }

        // Q-learning update formula
        double newQ = oldQ + learningRate * (reward + discountFactor * maxNextQ - oldQ);
        stateActions.put(action, newQ);
    }

    /**
     * Calculate reward based on outcome
     */
    public double calculateReward(double energySavedKwh, double comfortDeviation, 
                                   boolean wasAnomaly, double costSaved) {
        // Energy savings reward
        double energyReward = energySavedKwh * 10;  // Points per kWh saved

        // Comfort penalty
        double comfortPenalty = comfortDeviation * 5;  // Points lost per unit discomfort

        // Anomaly prevention bonus
        double anomalyBonus = wasAnomaly ? 50 : 0;  // Big reward for preventing anomalies

        // Cost savings reward
        double costReward = costSaved * 100;  // Points per dollar saved

        return energyReward - comfortPenalty + anomalyBonus + costReward;
    }

    /**
     * Run a complete learning step
     */
    public LearningResult learnStep(int occupancy, double currentWattage, double baselineWattage,
                                     Action takenAction, double newWattage, 
                                     boolean preventedAnomaly) {
        LocalTime time = LocalTime.now();
        
        // Create current state
        State currentState = createStateFromReadings(occupancy, currentWattage, baselineWattage, time);
        
        // Calculate outcomes
        double energySavedKwh = (currentWattage - newWattage) / 1000;
        double costSaved = energySavedKwh * pricingService.getCurrentPricePerKwh();
        double comfortDeviation = Math.abs(currentWattage - newWattage) / baselineWattage;
        
        // Calculate reward
        double reward = calculateReward(energySavedKwh, comfortDeviation, preventedAnomaly, costSaved);
        
        // Create next state (after action)
        State nextState = createStateFromReadings(occupancy, newWattage, baselineWattage, time);
        
        // Update Q-table
        learn(currentState, takenAction, reward, nextState);
        
        return new LearningResult(currentState, nextState, takenAction, reward, energySavedKwh, costSaved);
    }

    /**
     * Get recommended action for current conditions
     */
    public Map<String, Object> getRecommendation(int occupancy, double currentWattage, 
                                                   double baselineWattage) {
        LocalTime time = LocalTime.now();
        State currentState = createStateFromReadings(occupancy, currentWattage, baselineWattage, time);
        
        Action recommendedAction = decideAction(currentState);
        
        Map<String, Object> recommendation = new HashMap<>();
        recommendation.put("current_state", currentState.toString());
        recommendation.put("recommended_action", recommendedAction.name());
        recommendation.put("scale_multiplier", recommendedAction.scaleMultiplier);
        recommendation.put("expected_new_wattage", Math.round(currentWattage * recommendedAction.scaleMultiplier));
        recommendation.put("action_description", getActionDescription(recommendedAction));
        
        // Q-values for all actions (for transparency)
        Map<String, Double> qValues = new HashMap<>();
        Map<Action, Double> stateActions = qTable.get(currentState);
        if (stateActions != null) {
            for (Map.Entry<Action, Double> entry : stateActions.entrySet()) {
                qValues.put(entry.getKey().name(), Math.round(entry.getValue() * 100) / 100.0);
            }
        }
        recommendation.put("q_values", qValues);
        
        return recommendation;
    }

    /**
     * Get training statistics
     */
    public Map<String, Object> getTrainingStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_states", qTable.size());
        stats.put("learning_rate", learningRate);
        stats.put("discount_factor", discountFactor);
        stats.put("exploration_rate", explorationRate);
        
        // Find most valuable actions
        Map<String, Integer> actionCounts = new HashMap<>();
        for (Action action : Action.values()) {
            actionCounts.put(action.name(), 0);
        }
        
        double totalQ = 0;
        int count = 0;
        for (Map<Action, Double> actions : qTable.values()) {
            for (Map.Entry<Action, Double> entry : actions.entrySet()) {
                totalQ += entry.getValue();
                count++;
                if (entry.getValue() > 0.5) {
                    actionCounts.put(entry.getKey().name(), 
                            actionCounts.get(entry.getKey().name()) + 1);
                }
            }
        }
        
        stats.put("average_q_value", Math.round(totalQ / count * 100) / 100.0);
        stats.put("preferred_actions", actionCounts);
        
        return stats;
    }

    /**
     * Reduce exploration rate over time (simulated annealing)
     */
    public void decayExploration() {
        explorationRate = Math.max(0.05, explorationRate * 0.99);
    }

    /**
     * Reset Q-table for retraining
     */
    public void reset() {
        qTable.clear();
        initializeQTable();
        explorationRate = 0.2;
    }

    private String getActionDescription(Action action) {
        switch (action) {
            case SCALE_UP: return "Increase power allocation by 10%";
            case SCALE_DOWN: return "Reduce power allocation by 10%";
            case MAINTAIN: return "Maintain current power level";
            case SHED_LOAD: return "Aggressively reduce non-essential loads by 30%";
            case BOOST: return "Increase power by 20% for high-demand situation";
            default: return "Unknown action";
        }
    }

    // Result class for learning step
    public static class LearningResult {
        public final State fromState;
        public final State toState;
        public final Action action;
        public final double reward;
        public final double energySavedKwh;
        public final double costSaved;

        public LearningResult(State fromState, State toState, Action action, 
                              double reward, double energySavedKwh, double costSaved) {
            this.fromState = fromState;
            this.toState = toState;
            this.action = action;
            this.reward = reward;
            this.energySavedKwh = energySavedKwh;
            this.costSaved = costSaved;
        }

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("from_state", fromState.toString());
            map.put("to_state", toState.toString());
            map.put("action", action.name());
            map.put("reward", Math.round(reward * 100) / 100.0);
            map.put("energy_saved_kwh", Math.round(energySavedKwh * 1000) / 1000.0);
            map.put("cost_saved", Math.round(costSaved * 100) / 100.0);
            return map;
        }
    }
}
