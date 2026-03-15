# EcoSync Multi-Perspective Platform

## Architecture Overview

EcoSync is a unified sustainability orchestration platform serving three distinct user perspectives:
- **Consumer**: Homeowners and individuals optimizing residential energy
- **Enterprise**: Businesses and facilities managing commercial buildings
- **Data Center**: High-performance computing facilities optimizing compute workload

```
ecosync/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── config.py          # Configuration settings
│   │   ├── models.py          # Unified data models
│   │   ├── websocket.py       # WebSocket connection manager
│   │   ├── perspectives/      # Perspective-specific logic
│   │   │   ├── __init__.py
│   │   │   ├── consumer/
│   │   │   │   ├── routes.py
│   │   │   │   ├── ai_engine.py
│   │   │   │   └── metrics.py
│   │   │   ├── enterprise/
│   │   │   │   ├── routes.py
│   │   │   │   ├── ai_engine.py
│   │   │   │   └── metrics.py
│   │   │   └── datacenter/
│   │   │       ├── routes.py
│   │   │       ├── ai_engine.py
│   │   │       └── metrics.py
│   │   ├── utils/
│   │   │   ├── carbon_calculator.py
│   │   │   └── cost_estimator.py
│   │   └── ai/
│   │       ├── base.py        # Base AI engine
│   │       ├── anomaly_detection.py
│   │       └── forecasting.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Landing page with perspective selector
│   │   │   ├── consumer/      # Consumer dashboard
│   │   │   │   ├── page.tsx
│   │   │   │   └── dashboard.tsx
│   │   │   ├── enterprise/    # Enterprise dashboard
│   │   │   │   ├── page.tsx
│   │   │   │   └── dashboard.tsx
│   │   │   └── datacenter/    # Data Center dashboard
│   │   │       ├── page.tsx
│   │   │       └── dashboard.tsx
│   │   ├── components/
│   │   │   ├── shared/        # Shared components
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   ├── StatusIndicator.tsx
│   │   │   │   ├── AlertBanner.tsx
│   │   │   │   ├── WebSocketProvider.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   ├── consumer/      # Consumer-specific components
│   │   │   │   ├── ApplianceCard.tsx
│   │   │   │   ├── SolarPanel.tsx
│   │   │   │   └── HomeMap.tsx
│   │   │   ├── enterprise/    # Enterprise-specific components
│   │   │   │   ├── ZoneMap.tsx
│   │   │   │   ├── HVACControl.tsx
│   │   │   │   └── ComplianceChart.tsx
│   │   │   └── datacenter/    # Data Center-specific components
│   │   │       ├── ClusterView.tsx
│   │   │       ├── JobQueue.tsx
│   │   │       └── PUEMonitor.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useMetrics.ts
│   │   │   └── usePerspective.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── Dockerfile
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── deployment.md
│
└── docker-compose.yml
```

## Universal Sync Contract

All perspectives share this base data contract:

```typescript
interface SyncContract {
  timestamp: string;           // ISO 8601 timestamp
  perspective: 'consumer' | 'enterprise' | 'datacenter';
  system_status: 'optimal' | 'warning' | 'critical';
  scale_level: number;         // 1-10 efficiency score
  metrics: Record<string, number>;
  ai_insight: string;
  is_anomaly: boolean;
}
```

## Perspective-Specific Metrics

### Consumer Metrics
```typescript
interface ConsumerMetrics {
  watts: number;               // Current power consumption
  occupancy: number;           // People detected (0-10)
  carbon_saved: number;        // kg CO2 saved today
  solar_generation: number;    // Current solar output (W)
  appliances_active: number;   // Active appliances count
  hvac_setpoint: number;       // Temperature setting
  battery_level: number;       // Home battery %
  grid_import: number;         // Grid power import (W)
}
```

### Enterprise Metrics
```typescript
interface EnterpriseMetrics {
  total_watts: number;         // Total building consumption
  occupancy: number;           // Building occupancy %
  zones_active: number;        // Active zones count
  hvac_efficiency: number;     // HVAC efficiency score
  compliance_score: number;    // Environmental compliance %
  lighting_load: number;       // Lighting power (W)
  elevator_usage: number;      // Elevator trips/hour
  peak_demand: number;         // Peak demand (kW)
}
```

### Data Center Metrics
```typescript
interface DataCenterMetrics {
  gpu_utilization: number;     // Average GPU utilization %
  pue: number;                 // Power Usage Effectiveness
  clusters_active: number;     // Active compute clusters
  job_queue_depth: number;     // Jobs waiting
  renewable_forecast: number;  // Renewable availability %
  cooling_load: number;        // Cooling power (kW)
  network_throughput: number;  // Gbps
  carbon_intensity: number;    // gCO2/kWh
}
```

## AI Modules

### Consumer AI
- HVAC optimization based on occupancy and weather
- Appliance scheduling for off-peak hours
- Anomaly detection for unusual consumption
- Eco-friendly recommendations

### Enterprise AI
- Zone-by-zone occupancy prediction
- HVAC setpoint optimization
- Lighting automation
- Compliance tracking and reporting

### Data Center AI
- Renewable-aware job scheduling
- Workload balancing across clusters
- PUE optimization
- Carbon-aware compute shifting

## API Endpoints

### Consumer
- `WS /ws/consumer` - Real-time metrics stream
- `GET /api/consumer/metrics` - Historical metrics
- `POST /api/consumer/settings` - Update preferences
- `GET /api/consumer/recommendations` - AI recommendations

### Enterprise
- `WS /ws/enterprise` - Real-time metrics stream
- `GET /api/enterprise/metrics` - Historical metrics
- `POST /api/enterprise/zones` - Zone configuration
- `GET /api/enterprise/compliance` - Compliance report

### Data Center
- `WS /ws/datacenter` - Real-time metrics stream
- `GET /api/datacenter/metrics` - Historical metrics
- `POST /api/datacenter/jobs` - Job scheduling
- `GET /api/datacenter/pue` - PUE analytics

## 5-Week Milestone Plan

### Week 1: Foundation
- [ ] Project scaffolding
- [ ] Backend routing structure
- [ ] Frontend perspective navigation
- [ ] Shared components library
- [ ] WebSocket infrastructure

### Week 2: Consumer
- [ ] Consumer AI engine
- [ ] Consumer dashboard UI
- [ ] Appliance tracking
- [ ] Solar integration
- [ ] Mobile responsiveness

### Week 3: Enterprise
- [ ] Enterprise AI engine
- [ ] Enterprise dashboard UI
- [ ] Zone management
- [ ] HVAC controls
- [ ] Compliance tracking

### Week 4: Data Center
- [ ] Data Center AI engine
- [ ] Data Center dashboard UI
- [ ] Job queue visualization
- [ ] PUE monitoring
- [ ] Dark mode theme

### Week 5: Polish & Deploy
- [ ] Cross-perspective testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation
- [ ] Production deployment

## Future Enhancements

### Consumer
- EV charging optimization
- Time-of-use rate optimization
- Smart home integration (HomeKit, Alexa)
- Community energy sharing

### Enterprise
- Multi-building management
- BMS (Building Management System) integration
- Tenant portals
- LEED certification tracking

### Data Center
- Kubernetes integration
- ML framework hooks (PyTorch, TensorFlow)
- Carbon credit tracking
- Workload carbon scoring
