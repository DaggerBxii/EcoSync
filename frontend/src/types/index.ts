export type ResourceKey = "hvac" | "lighting" | "electricity" | "water" | "internet" | "airQuality";
export type BuildingType = "office" | "datacenter" | "hospital" | "campus" | "factory";
export type ViewMode = "overall" | "detailed";
export type Scenario = "normal" | "peakHeat" | "gridStress" | "maintenance" | "emergency";

export interface FloorResources {
  floor: number;
  hvac: number;
  lighting: number;
  electricity: number;
  water: number;
  internet: number;
  airQuality: number;
}

export interface BuildingData {
  name: string;
  type: BuildingType;
  floors: FloorResources[];
  alignmentBefore: number;
  alignmentAfter: number;
}

export interface SimulationState {
  isPlaying: boolean;
  speed: number;
  scenario: Scenario;
}

export interface LeadRegistration {
  name: string;
  email: string;
  company: string;
  role: string;
  useCase: string;
  consent: boolean;
}
