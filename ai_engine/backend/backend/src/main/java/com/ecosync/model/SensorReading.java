package com.ecosync.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings")
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "occupancy_count", nullable = false)
    private Integer occupancyCount;

    @Column(name = "current_wattage", nullable = false)
    private Double currentWattage;

    @Column(name = "external_temp")
    private Double externalTemp;

    @Column(name = "baseline_usage")
    private Double baselineUsage;

    @Column(name = "efficiency_score")
    private Double efficiencyScore;

    @Column(name = "integrity_alert")
    private Boolean integrityAlert;

    @Column(name = "system_status")
    private String systemStatus;

    @Column(name = "scale_level")
    private Double scaleLevel;

    @Column(name = "ai_insight", length = 1000)
    private String aiInsight;

    public SensorReading() {
    }

    public SensorReading(LocalDateTime timestamp, Integer occupancyCount, Double currentWattage) {
        this.timestamp = timestamp;
        this.occupancyCount = occupancyCount;
        this.currentWattage = currentWattage;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getOccupancyCount() {
        return occupancyCount;
    }

    public void setOccupancyCount(Integer occupancyCount) {
        this.occupancyCount = occupancyCount;
    }

    public Double getCurrentWattage() {
        return currentWattage;
    }

    public void setCurrentWattage(Double currentWattage) {
        this.currentWattage = currentWattage;
    }

    public Double getExternalTemp() {
        return externalTemp;
    }

    public void setExternalTemp(Double externalTemp) {
        this.externalTemp = externalTemp;
    }

    public Double getBaselineUsage() {
        return baselineUsage;
    }

    public void setBaselineUsage(Double baselineUsage) {
        this.baselineUsage = baselineUsage;
    }

    public Double getEfficiencyScore() {
        return efficiencyScore;
    }

    public void setEfficiencyScore(Double efficiencyScore) {
        this.efficiencyScore = efficiencyScore;
    }

    public Boolean getIntegrityAlert() {
        return integrityAlert;
    }

    public void setIntegrityAlert(Boolean integrityAlert) {
        this.integrityAlert = integrityAlert;
    }

    public String getSystemStatus() {
        return systemStatus;
    }

    public void setSystemStatus(String systemStatus) {
        this.systemStatus = systemStatus;
    }

    public Double getScaleLevel() {
        return scaleLevel;
    }

    public void setScaleLevel(Double scaleLevel) {
        this.scaleLevel = scaleLevel;
    }

    public String getAiInsight() {
        return aiInsight;
    }

    public void setAiInsight(String aiInsight) {
        this.aiInsight = aiInsight;
    }

    @Override
    public String toString() {
        return "SensorReading{" +
                "id=" + id +
                ", timestamp=" + timestamp +
                ", occupancyCount=" + occupancyCount +
                ", currentWattage=" + currentWattage +
                ", efficiencyScore=" + efficiencyScore +
                ", integrityAlert=" + integrityAlert +
                ", systemStatus='" + systemStatus + '\'' +
                '}';
    }
}
