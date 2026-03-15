package com.ecosync.controller;

import com.ecosync.service.AiEngineService;
import com.ecosync.service.SensorSimulator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private AiEngineService aiEngine;

    @Autowired
    private SensorSimulator simulator;

    @Scheduled(fixedRate = 2000)
    public void sendAiDecision() {
        Map<String, Object> sensorData = simulator.generateData();
        Map<String, Object> aiDecision = aiEngine.processCycle(
                (Integer) sensorData.get("occupancy_count"),
                (Double) sensorData.get("current_wattage"));
        messagingTemplate.convertAndSend("/topic/updates", aiDecision);
    }
}
