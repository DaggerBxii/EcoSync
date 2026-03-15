# EcoSync - AI-Powered Energy Management System

⚡ **Intelligent power optimization using machine learning and reinforcement learning**

---

## Overview

EcoSync is an advanced AI-driven energy management system that optimizes power consumption in real-time using:

- **Statistical Anomaly Detection** (Z-Score analysis)
- **Machine Learning Forecasting** (ARIMA + K-Means clustering)
- **Reinforcement Learning** (Q-Learning for optimization)
- **Explainable AI** (Human-readable insights and recommendations)
- **External Intelligence** (Weather, utility pricing integration)

---

## Features

### Core AI Capabilities

| Feature | Description |
|---------|-------------|
| **Anomaly Detection** | Real-time power anomaly detection using statistical Z-Score analysis |
| **Adaptive Baselines** | K-Means clustering learns usage patterns by hour and day type |
| **Power Forecasting** | 24-hour ahead power demand prediction using ARIMA models |
| **Q-Learning Optimization** | Reinforcement learning agent learns optimal scaling decisions |
| **Efficiency Scoring** | Real-time efficiency metrics based on occupancy vs. consumption |
| **Weather Integration** | HVAC impact modeling based on external temperature |
| **Pricing Optimization** | Time-of-use pricing awareness for cost optimization |

### Dashboard & Visualization

- Real-time power monitoring with live WebSocket updates
- Interactive charts (Chart.js) for 24-hour forecasts
- Weather and pricing widgets
- AI recommendations panel
- System log with alert tracking

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Dashboard  │  │   Charts    │  │  Alerts & Notifications │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ WebSocket / REST API
┌────────────────────────────▼────────────────────────────────────┐
│                      Spring Boot Backend                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    AI Engine Core                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Anomaly    │  │  Predictive  │  │  Optimization   │  │  │
│  │  │  Detection   │  │  Analytics   │  │  (Q-Learning)   │  │  │
│  │  │  (Z-Score)   │  │  (ARIMA/KM)  │  │                 │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Weather    │  │   Pricing    │  │    Insight      │  │  │
│  │  │ Integration  │  │ Integration  │  │   Generator     │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────┐  ┌────────────────────────────────────┐  │
│  │   Data Layer      │  │   API Layer                        │  │
│  │   JPA Repository  │  │   REST + WebSocket + Swagger       │  │
│  │   H2/PostgreSQL   │  │   /api/* + /ws                     │  │
│  └───────────────────┘  └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Java 17, Spring Boot 3.5.11 |
| **ML Library** | Smile (Statistical Machine Learning in Java) |
| **Database** | H2 (Dev), PostgreSQL (Prod) |
| **Real-time** | WebSocket (STOMP) |
| **Frontend** | HTML5, Chart.js, Vanilla JS |
| **API Docs** | OpenAPI 3 / Swagger |
| **Monitoring** | Spring Actuator, Prometheus |

---

## Getting Started

### Prerequisites

- Java 17 or higher
- Gradle 8.x
- (Optional) PostgreSQL for production

### Quick Start

1. **Clone the repository**
   ```bash
   cd ai_engine/backend/backend
   ```

2. **Run the application**
   ```bash
   ./gradlew bootRun
   ```

3. **Access the dashboard**
   - Open browser: http://localhost:8080
   - API Docs: http://localhost:8080/swagger-ui.html
   - H2 Console: http://localhost:8080/h2-console

4. **Run tests**
   ```bash
   ./gradlew test
   ```

---

## Configuration

### application.properties

```properties
# Server
server.port=8080

# Database (H2 for development)
spring.datasource.url=jdbc:h2:mem:ecosync_db
spring.h2.console.enabled=true

# External APIs
openweathermap.api.key=your_api_key_here
utility.price.per.kwh=0.12

# Monitoring
management.endpoints.web.exposure.include=health,metrics,prometheus
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENWEATHERMAP_API_KEY` | `demo` | OpenWeatherMap API key |
| `UTILITY_PRICE_PER_KWH` | `0.12` | Base electricity price |
| `SERVER_PORT` | `8080` | HTTP server port |

---

## API Reference

### WebSocket Endpoints

| Endpoint | Description |
|----------|-------------|
| `/ws` | WebSocket connection endpoint |
| `/topic/updates` | Subscribe for real-time AI decisions |

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/weather` | GET | Current weather data |
| `/api/pricing` | GET | Electricity pricing info |
| `/api/recommendations` | GET | AI-generated recommendations |
| `/api/forecast` | GET | 24-hour power forecast |
| `/api/summary/daily` | GET | Daily summary report |
| `/api/summary/weekly` | GET | Week-over-week comparison |
| `/api/stats` | GET | Historical statistics |
| `/api/optimization` | GET | RL optimization recommendation |

---

## AI Services

### 1. AiEngineService

Core AI engine for real-time power analysis.

```java
// Process sensor data
Map<String, Object> result = aiEngineService.processCycle(occupancy, wattage);

// Response includes:
// - system_status: "Optimized", "Inefficient", or "Critical Alert"
// - efficiency_score: 0-100
// - integrity_alert: boolean for anomaly detection
// - scale_level: power scaling recommendation
```

### 2. PredictiveAnalyticsService

Time-series forecasting using ARIMA and normal distributions.

```java
// Forecast next 24 hours
double[] forecast = predictiveAnalyticsService.forecastPowerDemand(24);

// Predict occupancy
int occupancy = predictiveAnalyticsService.predictOccupancy(futureTime);
```

### 3. AdaptiveBaselineService

K-Means clustering for pattern recognition.

```java
// Get adaptive baseline for current conditions
double baseline = adaptiveBaselineService.getAdaptiveBaseline(hour, occupancy);

// Identify usage pattern
String pattern = adaptiveBaselineService.identifyUsagePattern(hour, wattage);
// Returns: "low_usage", "typical_usage", or "high_usage"
```

### 4. OptimizationEngineService

Q-Learning for decision optimization.

```java
// Get RL-based recommendation
Map<String, Object> rec = optimizationEngine.getRecommendation(
    occupancy, currentWattage, baselineWattage);

// Actions: SCALE_UP, SCALE_DOWN, MAINTAIN, SHED_LOAD, BOOST
```

### 5. WeatherService

OpenWeatherMap integration for HVAC modeling.

```java
// Get weather impact on HVAC
double hvacImpact = weatherService.estimateHvacImpact(externalTemp);
```

### 6. PricingService

Time-of-use pricing and cost optimization.

```java
// Get current price
double price = pricingService.getCurrentPricePerKwh();

// Calculate load shifting savings
Map<String, Object> savings = pricingService.calculateLoadShiftingSavings(
    wattage, durationHours, fromHour, toHour);
```

### 7. InsightGeneratorService

Explainable AI with human-readable insights.

```java
// Generate insight from AI decision
String insight = insightGeneratorService.generateInsight(aiDecision);

// Get recommendations
List<Recommendation> recs = insightGeneratorService.generateRecommendations();
```

---

## Data Model

### SensorReading Entity

```java
{
  "id": Long,
  "timestamp": LocalDateTime,
  "occupancyCount": Integer,
  "currentWattage": Double,
  "externalTemp": Double,
  "baselineUsage": Double,
  "efficiencyScore": Double,
  "integrityAlert": Boolean,
  "systemStatus": String,
  "scaleLevel": Double,
  "aiInsight": String
}
```

---

## Testing

### Run All Tests
```bash
./gradlew test
```

### Test Coverage

| Service | Test Class |
|---------|------------|
| AiEngineService | AiEngineServiceTest |
| PricingService | PricingServiceTest |
| PredictiveAnalyticsService | PredictiveAnalyticsServiceTest |
| OptimizationEngineService | OptimizationEngineServiceTest |
| WeatherService | WeatherServiceTest |

---

## Monitoring & Observability

### Health Checks
- `GET /actuator/health` - Application health status
- `GET /actuator/info` - Application information

### Metrics
- `GET /actuator/metrics` - All application metrics
- `GET /actuator/prometheus` - Prometheus-format metrics

### API Documentation
- `GET /swagger-ui.html` - Interactive API documentation
- `GET /v3/api-docs` - OpenAPI JSON specification

---

## Production Deployment

### Database Migration (PostgreSQL)

1. Update `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/ecosync
   spring.datasource.username=ecosync_user
   spring.datasource.password=secure_password
   spring.jpa.hibernate.ddl-auto=validate
   ```

2. Enable authentication in `SecurityConfig.java`

3. Configure OpenWeatherMap API key

### Docker Deployment

```dockerfile
FROM eclipse-temurin:17-jdk-alpine
COPY build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

---

## Troubleshooting

### Common Issues

**Issue**: WebSocket connection fails
- **Solution**: Check CORS configuration, ensure `/ws` endpoint is accessible

**Issue**: ML models not training
- **Solution**: Ensure sufficient historical data (minimum 50 readings)

**Issue**: Weather data shows "demo" values
- **Solution**: Configure valid OpenWeatherMap API key

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `./gradlew test`
5. Submit a pull request

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues and feature requests, please open an issue on GitHub.

---

**Built with ❤️ using Spring Boot and Machine Learning**
