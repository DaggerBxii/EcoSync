/**
 * EcoSync Type Definitions
 * Universal sync contract and perspective-specific types
 */

export type Perspective = 'consumer' | 'enterprise' | 'datacenter';
export type SystemStatus = 'optimal' | 'warning' | 'critical';

// Base Sync Contract - All perspectives extend this
export interface BaseSync {
  timestamp: string;
  perspective: Perspective;
  system_status: SystemStatus;
  scale_level: number;
  ai_insight: string;
  is_anomaly: boolean;
}

// Consumer Metrics
export interface ConsumerMetrics {
  watts: number;
  occupancy: number;
  carbon_saved: number;
  solar_generation: number;
  appliances_active: number;
  hvac_setpoint: number;
  battery_level: number;
  grid_import: number;
}

export interface ConsumerSync extends BaseSync {
  perspective: 'consumer';
  metrics: ConsumerMetrics;
}

// Enterprise Metrics
export interface EnterpriseMetrics {
  total_watts: number;
  occupancy: number;
  zones_active: number;
  hvac_efficiency: number;
  compliance_score: number;
  lighting_load: number;
  elevator_usage: number;
  peak_demand: number;
}

export interface EnterpriseSync extends BaseSync {
  perspective: 'enterprise';
  metrics: EnterpriseMetrics;
}

// Data Center Metrics
export interface DataCenterMetrics {
  gpu_utilization: number;
  pue: number;
  clusters_active: number;
  job_queue_depth: number;
  renewable_forecast: number;
  cooling_load: number;
  network_throughput: number;
  carbon_intensity: number;
}

export interface DataCenterSync extends BaseSync {
  perspective: 'datacenter';
  metrics: DataCenterMetrics;
}

// Union type for all sync messages
export type PerspectiveSync = ConsumerSync | EnterpriseSync | DataCenterSync;

// WebSocket Message Types
export interface WSMessage {
  type: string;
  [key: string]: unknown;
}

export interface WSSyncMessage extends WSMessage {
  type: 'sync';
  data: PerspectiveSync;
}

// AI Recommendation Types
export interface AIRecommendation {
  recommendation: string;
  impact: string;
  confidence: number;
  action_required: boolean;
  suggested_action?: string;
}

export interface OptimizationRecommendation {
  category: string;
  action: string;
  estimated_savings: string;
  priority: 'high' | 'medium' | 'low';
}
