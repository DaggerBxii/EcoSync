package com.ecosync.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for OptimizationEngineService (Q-Learning)
 */
class OptimizationEngineServiceTest {

    private OptimizationEngineService optimizationEngine;

    @BeforeEach
    void setUp() {
        optimizationEngine = new OptimizationEngineService();
        // pricingService will be autowired at runtime
        // For unit tests, we just initialize the Q-table
        optimizationEngine.init();
    }

    @Test
    void testInit() {
        // Then - Q-table should be initialized
        Map<String, Object> stats = optimizationEngine.getTrainingStats();
        assertTrue((Integer) stats.get("total_states") > 0);
    }

    @Test
    void testDecideAction() {
        // Given
        OptimizationEngineService.State state = new OptimizationEngineService.State(1, 1, 1, 0);

        // When
        OptimizationEngineService.Action action = optimizationEngine.decideAction(state);

        // Then
        assertNotNull(action);
        assertTrue(action instanceof OptimizationEngineService.Action);
    }

    @Test
    void testCreateStateFromReadings() {
        // Given
        int occupancy = 50;
        double currentWattage = 500.0;
        double baselineWattage = 450.0;
        LocalTime time = LocalTime.of(14, 0);

        // When
        OptimizationEngineService.State state = optimizationEngine.createStateFromReadings(
            occupancy, currentWattage, baselineWattage, time);

        // Then
        assertNotNull(state);
    }

    @Test
    void testLearn() {
        // Given
        OptimizationEngineService.State state = new OptimizationEngineService.State(1, 1, 1, 0);
        OptimizationEngineService.State nextState = new OptimizationEngineService.State(1, 1, 0, 0);
        OptimizationEngineService.Action action = OptimizationEngineService.Action.MAINTAIN;
        double reward = 10.0;

        // When
        optimizationEngine.learn(state, action, reward, nextState);

        // Then - Q-value should be updated
        Map<String, Object> stats = optimizationEngine.getTrainingStats();
        assertNotNull(stats);
    }

    @Test
    void testCalculateReward() {
        // Given
        double energySaved = 0.5; // kWh
        double comfortDeviation = 0.1;
        boolean wasAnomaly = false;
        double costSaved = 0.06;

        // When
        double reward = optimizationEngine.calculateReward(energySaved, comfortDeviation, wasAnomaly, costSaved);

        // Then
        assertTrue(reward > 0);
    }

    @Test
    void testCalculateReward_WithAnomalyPrevention() {
        // Given
        double energySaved = 0.5;
        double comfortDeviation = 0.1;
        boolean wasAnomaly = true; // Prevented anomaly!
        double costSaved = 0.06;

        // When
        double reward = optimizationEngine.calculateReward(energySaved, comfortDeviation, wasAnomaly, costSaved);

        // Then - should be higher due to anomaly bonus
        assertTrue(reward > 50);
    }

    @Test
    void testLearnStep() {
        // Given
        int occupancy = 40;
        double currentWattage = 500.0;
        double baselineWattage = 450.0;
        OptimizationEngineService.Action action = OptimizationEngineService.Action.SCALE_DOWN;
        double newWattage = 450.0;
        boolean preventedAnomaly = false;

        // When
        OptimizationEngineService.LearningResult result = optimizationEngine.learnStep(
            occupancy, currentWattage, baselineWattage, action, newWattage, preventedAnomaly);

        // Then
        assertNotNull(result);
        assertNotNull(result.fromState);
        assertNotNull(result.toState);
        assertEquals(action, result.action);
    }

    @Test
    void testGetRecommendation() {
        // Given
        int occupancy = 50;
        double currentWattage = 600.0;
        double baselineWattage = 500.0;

        // When
        Map<String, Object> recommendation = optimizationEngine.getRecommendation(
            occupancy, currentWattage, baselineWattage);

        // Then
        assertNotNull(recommendation);
        assertTrue(recommendation.containsKey("recommended_action"));
        assertTrue(recommendation.containsKey("scale_multiplier"));
        assertTrue(recommendation.containsKey("q_values"));
    }

    @Test
    void testDecayExploration() {
        // Given - get initial stats
        Map<String, Object> initialStats = optimizationEngine.getTrainingStats();
        assertNotNull(initialStats.get("exploration_rate"));

        // When
        optimizationEngine.decayExploration();

        // Then - should not throw exception
        Map<String, Object> newStats = optimizationEngine.getTrainingStats();
        assertNotNull(newStats.get("exploration_rate"));
    }

    @Test
    void testReset() {
        // Given - do some learning first
        OptimizationEngineService.State state = new OptimizationEngineService.State(0, 0, 0, 0);
        optimizationEngine.learn(state, OptimizationEngineService.Action.MAINTAIN, 10.0, state);

        // When
        optimizationEngine.reset();

        // Then - should be initialized
        Map<String, Object> stats = optimizationEngine.getTrainingStats();
        assertTrue((Integer) stats.get("total_states") > 0);
    }

    @Test
    void testActionScaleMultipliers() {
        // Then
        assertEquals(1.1, OptimizationEngineService.Action.SCALE_UP.scaleMultiplier);
        assertEquals(0.9, OptimizationEngineService.Action.SCALE_DOWN.scaleMultiplier);
        assertEquals(1.0, OptimizationEngineService.Action.MAINTAIN.scaleMultiplier);
        assertEquals(0.7, OptimizationEngineService.Action.SHED_LOAD.scaleMultiplier);
        assertEquals(1.2, OptimizationEngineService.Action.BOOST.scaleMultiplier);
    }
}
