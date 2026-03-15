import { scaleLinear } from "d3-scale";

export type ResourceKey = "hvac" | "lighting" | "electricity" | "water" | "internet" | "airQuality";

export interface ResourceConfig {
  label: string;
  unit: string;
  min: number;
  max: number;
  icon: string;
  description: string;
  getColor: (value: number) => string;
}

// Create color scales using d3-scale
const createColorScale = (colors: string[], domain: [number, number]) => {
  const scale = scaleLinear<string>()
    .domain(domain)
    .range(colors)
    .clamp(true);
  return scale;
};

export const resourceConfigs: Record<ResourceKey, ResourceConfig> = {
  hvac: {
    label: "HVAC",
    unit: "%",
    min: 0,
    max: 100,
    icon: "🌡️",
    description: "Heating, Ventilation & Air Conditioning efficiency",
    getColor: createColorScale(["#dbeafe", "#60a5fa", "#2563eb", "#1e3a8a"], [0, 100]),
  },
  lighting: {
    label: "Lighting",
    unit: "%",
    min: 0,
    max: 100,
    icon: "💡",
    description: "Lighting system usage and intensity",
    getColor: createColorScale(["#fef3c7", "#fbbf24", "#f59e0b", "#b45309"], [0, 100]),
  },
  electricity: {
    label: "Electricity",
    unit: "kW",
    min: 0,
    max: 500,
    icon: "⚡",
    description: "Electrical power consumption",
    getColor: createColorScale(["#dcfce7", "#4ade80", "#16a34a", "#14532d"], [0, 500]),
  },
  water: {
    label: "Water",
    unit: "L/min",
    min: 0,
    max: 200,
    icon: "💧",
    description: "Water flow rate",
    getColor: createColorScale(["#e0f2fe", "#38bdf8", "#0284c7", "#0c4a6e"], [0, 200]),
  },
  internet: {
    label: "Internet",
    unit: "Mbps",
    min: 0,
    max: 1000,
    icon: "📶",
    description: "Network bandwidth usage",
    getColor: createColorScale(["#ede9fe", "#a78bfa", "#7c3aed", "#4c1d95"], [0, 1000]),
  },
  airQuality: {
    label: "Air Quality",
    unit: "AQI",
    min: 0,
    max: 100,
    icon: "🌬️",
    description: "Indoor air quality index (higher is better)",
    getColor: createColorScale(["#ef4444", "#f59e0b", "#84cc16", "#22c55e"], [0, 100]),
  },
};

export function getResourceColor(resource: ResourceKey, value: number): string {
  return resourceConfigs[resource].getColor(value);
}

export function getResourcePercentage(resource: ResourceKey, value: number): number {
  const config = resourceConfigs[resource];
  return ((value - config.min) / (config.max - config.min)) * 100;
}
