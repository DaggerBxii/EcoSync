/**
 * EcoSync API Client
 * Connects to the FastAPI backend for real-time building data
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BuildingOverview {
  building_name: string;
  total_floors: number;
  overall_efficiency: number;
  total_zones: number;
  active_zones: number;
  total_resources: number;
  total_energy_consumption: number;
  total_water_consumption: number;
  carbon_footprint: number;
  total_occupancy: number;
  total_max_occupancy: number;
  active_alerts: number;
  critical_alerts: number;
  floors: FloorSummary[];
  timestamp: string;
}

export interface FloorSummary {
  floor_number: number;
  zones: string[];
  zone_names: string[];
  total_resources: number;
  resources_by_type: Record<string, number>;
  efficiency_by_type: Record<string, number>;
  overall_efficiency: number;
  total_consumption: Record<string, number>;
  active_alerts: number;
  occupancy: number;
  max_occupancy: number;
  area_sqft: number;
  occupancy_percentage: number;
}

export interface FloorDetail {
  floor_number: number;
  total_resources: number;
  zones: ZoneData[];
  resources: ResourceData[];
  efficiency_metrics: {
    electricity: number;
    water: number;
    hvac: number;
    lighting: number;
    air_quality: number;
  };
}

export interface ZoneData {
  zone_id: string;
  name: string;
  floor: number;
  area_sqft: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  resourceIds: string[];
  occupancy: number;
  max_occupancy: number;
  zone_efficiency: number;
  active_alerts: number;
  resources: ResourceData[];
}

export interface ResourceData {
  resource_id: string;
  resource_type: string;
  name: string;
  zone_id: string;
  unit: string;
  current_value: number;
  target_value: number | null;
  min_threshold: number | null;
  max_threshold: number | null;
  status: "optimal" | "warning" | "critical" | "offline";
  efficiency_score: number;
  is_controllable: boolean;
  last_updated: string;
}

export interface Alert {
  alert_id: string;
  severity: "info" | "warning" | "critical";
  status: "active" | "monitoring" | "resolved" | "escalated";
  resource_type: string;
  resource_id: string;
  zone_id: string;
  title: string;
  description: string;
  current_value: number;
  expected_value: number;
  threshold_value: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  permissions: string[];
}

/**
 * Fetch building overview data
 */
export async function getBuildingOverview(): Promise<BuildingOverview> {
  const response = await fetch(`${API_BASE_URL}/api/building/overview`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch building overview: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get all floors with summary data
 */
export async function getBuildingFloors(): Promise<{ building_name: string; total_floors: number; floors: FloorSummary[] }> {
  const response = await fetch(`${API_BASE_URL}/api/building/floors`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch floors: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get detailed floor data including zones and resources
 */
export async function getFloorDetails(floorNumber: number): Promise<FloorDetail> {
  const response = await fetch(`${API_BASE_URL}/api/building/floors/${floorNumber}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch floor ${floorNumber} details: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get building visualization data (optimized for 3D rendering)
 */
export async function getBuildingVisualization(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/building/visualization`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch visualization data: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get all alerts
 */
export async function getAlerts(status?: string, severity?: string): Promise<{ count: number; alerts: Alert[] }> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (severity) params.append("severity", severity);
  
  const response = await fetch(`${API_BASE_URL}/api/alerts?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get system status
 */
export async function getSystemStatus(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch system status: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Convert backend floor data to format expected by 3D model
 */
export function convertToFloorData(backendFloors: FloorSummary[], backendDetails?: Record<number, FloorDetail>) {
  return backendFloors.map((floor) => {
    const details = backendDetails?.[floor.floor_number];
    
    // Calculate resource values from efficiency or consumption data
    const resources = {
      electricity: floor.total_consumption?.electricity_kwh || floor.efficiency_by_type?.electricity || 50,
      hvac: floor.efficiency_by_type?.hvac || 50,
      water: floor.total_consumption?.water_gal || floor.efficiency_by_type?.water || 50,
      lighting: floor.efficiency_by_type?.lighting || 50,
      airQuality: floor.efficiency_by_type?.air_quality || 85,
    };
    
    // Determine status based on efficiency and alerts
    let status: "optimal" | "warning" | "critical" = "optimal";
    if (floor.active_alerts > 2 || floor.overall_efficiency < 50) {
      status = "critical";
    } else if (floor.active_alerts > 0 || floor.overall_efficiency < 70) {
      status = "warning";
    }
    
    return {
      floor: floor.floor_number,
      name: floor.zone_names.join(", ") || `Floor ${floor.floor_number}`,
      efficiency: floor.overall_efficiency,
      occupancy: floor.occupancy,
      maxOccupancy: floor.max_occupancy,
      resources,
      coordinates: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      alerts: floor.active_alerts,
      status,
    };
  });
}

/**
 * Mock data generator for demo when backend is not available
 */
export function generateMockBuildingData(totalFloors: number = 10) {
  const floors: FloorSummary[] = [];
  
  for (let i = 1; i <= totalFloors; i++) {
    floors.push({
      floor_number: i,
      zones: [`zone_${i}_a`, `zone_${i}_b`],
      zone_names: [`Zone ${i}A`, `Zone ${i}B`],
      total_resources: 8,
      resources_by_type: {
        electricity: 2,
        hvac: 2,
        water: 1,
        lighting: 2,
        air_quality: 1,
      },
      efficiency_by_type: {
        electricity: 70 + Math.random() * 25,
        hvac: 65 + Math.random() * 30,
        water: 75 + Math.random() * 20,
        lighting: 60 + Math.random() * 35,
        air_quality: 80 + Math.random() * 15,
      },
      overall_efficiency: 65 + Math.random() * 30,
      total_consumption: {
        electricity_kwh: 200 + Math.random() * 200,
        water_gal: 50 + Math.random() * 100,
      },
      active_alerts: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
      occupancy: Math.floor(20 + Math.random() * 80),
      max_occupancy: 100,
      area_sqft: 5000 + Math.random() * 3000,
      occupancy_percentage: 20 + Math.random() * 60,
    });
  }
  
  return {
    building_name: "EcoSync Tower",
    total_floors: totalFloors,
    floors,
  };
}
