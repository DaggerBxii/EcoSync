package com.ecosync.repository;

import com.ecosync.model.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    /**
     * Find readings within a time range
     */
    List<SensorReading> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Find readings by occupancy count
     */
    List<SensorReading> findByOccupancyCount(int occupancyCount);

    /**
     * Find readings with integrity alerts
     */
    List<SensorReading> findByIntegrityAlertTrue();

    /**
     * Find recent readings (last N records)
     */
    List<SensorReading> findTop50ByOrderByTimestampDesc();

    /**
     * Find readings by hour of day for baseline analysis
     */
    @Query("SELECT sr FROM SensorReading sr WHERE HOUR(sr.timestamp) = :hour ORDER BY sr.timestamp DESC")
    List<SensorReading> findByHourOfDay(@Param("hour") int hour);

    /**
     * Find readings within a date range for ML training
     */
    @Query("SELECT sr FROM SensorReading sr WHERE sr.timestamp BETWEEN :start AND :end ORDER BY sr.timestamp")
    List<SensorReading> findReadingsForTraining(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Get average wattage by hour of day
     */
    @Query("SELECT HOUR(sr.timestamp) as hour, AVG(sr.currentWattage) as avgWattage FROM SensorReading sr GROUP BY HOUR(sr.timestamp)")
    List<Object[]> getAverageWattageByHour();

    /**
     * Count readings with anomalies today
     */
    @Query("SELECT COUNT(sr) FROM SensorReading sr WHERE sr.integrityAlert = true AND DATE(sr.timestamp) = CURRENT_DATE")
    long countAnomaliesToday();
}
