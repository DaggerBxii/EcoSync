"use client";

import { useState, useEffect, use, useRef, Suspense } from "react";
import Link from "next/link";
import {
  Sun, Moon, Activity, ArrowLeft, Play, Pause, ChevronUp, ChevronDown,
  Zap, Thermometer, Droplets, Wifi, TrendingUp, BarChart3, Building2, MessageSquare, Maximize2
} from "lucide-react";
import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Label } from "recharts";
import { getResourceColor, getResourcePercentage, resourceConfigs, type ResourceKey } from "@/lib/colorScales";
import type { BuildingType, FloorResources, Scenario } from "@/types";
import { cn } from "@/lib/utils";
import BuildingModel3D, { type FloorData } from "@/components/BuildingModel3D";
import FloorDetailDialog from "@/components/FloorDetailDialog";
import FloorPlan from "@/components/FloorPlan";
import AIAssistant from "@/components/AIAssistant";
import { getBuildingVisualization, generateMockBuildingData, convertToFloorData, type FloorSummary } from "@/lib/api";

const buildingConfigs: Record<BuildingType, { name: string; floors: number; baseMetrics: Partial<FloorResources> }> = {
  office: { name: "EcoSync Tower", floors: 10, baseMetrics: { hvac: 75, lighting: 60, electricity: 250, water: 80, internet: 500, airQuality: 85 } },
  datacenter: { name: "DataHub One", floors: 5, baseMetrics: { hvac: 90, lighting: 30, electricity: 450, water: 40, internet: 950, airQuality: 70 } },
  hospital: { name: "Metro General", floors: 12, baseMetrics: { hvac: 80, lighting: 70, electricity: 350, water: 150, internet: 600, airQuality: 90 } },
  campus: { name: "University Hall", floors: 6, baseMetrics: { hvac: 65, lighting: 50, electricity: 180, water: 100, internet: 400, airQuality: 80 } },
  factory: { name: "Industrial Plant", floors: 4, baseMetrics: { hvac: 55, lighting: 80, electricity: 480, water: 180, internet: 200, airQuality: 60 } },
};

function generateBuildingData(type: BuildingType): { name: string; floors: FloorResources[]; alignmentBefore: number; alignmentAfter: number } {
  const config = buildingConfigs[type];
  const floors: FloorResources[] = [];
  for (let i = config.floors; i >= 1; i--) {
    floors.push({
      floor: i,
      hvac: Math.min(100, Math.max(0, config.baseMetrics.hvac! + (Math.random() - 0.5) * 20)),
      lighting: Math.min(100, Math.max(0, config.baseMetrics.lighting! + (Math.random() - 0.5) * 30)),
      electricity: Math.min(500, Math.max(0, config.baseMetrics.electricity! + (Math.random() - 0.5) * 100)),
      water: Math.min(200, Math.max(0, config.baseMetrics.water! + (Math.random() - 0.5) * 50)),
      internet: Math.min(1000, Math.max(0, config.baseMetrics.internet! + (Math.random() - 0.5) * 200)),
      airQuality: Math.min(100, Math.max(0, config.baseMetrics.airQuality! + (Math.random() - 0.5) * 15)),
    });
  }
  return {
    name: config.name,
    floors,
    alignmentBefore: 35 + Math.floor(Math.random() * 10),
    alignmentAfter: 70 + Math.floor(Math.random() * 15),
  };
}

export default function BuildingVisualizationPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const buildingType = resolvedParams.type as BuildingType;
  const { theme, setTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceKey>("electricity");
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [buildingData, setBuildingData] = useState<{ name: string; floors: FloorResources[]; alignmentBefore: number; alignmentAfter: number } | null>(null);
  const [showGreeting, setShowGreeting] = useState(true);
  const [greetingStep, setGreetingStep] = useState(0);
  const [viewMode, setViewMode] = useState<"3d" | "2d" | "floorplan">("3d");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [floorData3D, setFloorData3D] = useState<FloorData[]>([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate zone data for floor plan
  const generateZoneData = (floorNum: number) => {
    const config = buildingConfigs[buildingType];
    const floorIndex = config.floors - floorNum;
    
    // Create zones based on floor number
    return [
      {
        id: `zone_${floorNum}_a`,
        name: `Zone ${floorNum}A`,
        x: 5,
        y: 15,
        width: 40,
        height: 35,
        resources: {
          electricity: 150 + Math.random() * 100,
          hvac: 20 + Math.random() * 10,
          water: 30 + Math.random() * 20,
          lighting: 60 + Math.random() * 30,
          airQuality: 80 + Math.random() * 15,
        },
        occupancy: Math.floor(20 + Math.random() * 30),
        maxOccupancy: 50,
        status: Math.random() > 0.7 ? "warning" : "optimal" as any,
        alerts: Math.random() > 0.8 ? 1 : 0,
      },
      {
        id: `zone_${floorNum}_b`,
        name: `Zone ${floorNum}B`,
        x: 50,
        y: 15,
        width: 45,
        height: 35,
        resources: {
          electricity: 180 + Math.random() * 120,
          hvac: 21 + Math.random() * 8,
          water: 40 + Math.random() * 30,
          lighting: 65 + Math.random() * 25,
          airQuality: 75 + Math.random() * 20,
        },
        occupancy: Math.floor(25 + Math.random() * 35),
        maxOccupancy: 60,
        status: Math.random() > 0.8 ? "critical" : Math.random() > 0.6 ? "warning" : "optimal" as any,
        alerts: Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0,
      },
      {
        id: `zone_${floorNum}_c`,
        name: `Zone ${floorNum}C`,
        x: 20,
        y: 55,
        width: 60,
        height: 35,
        resources: {
          electricity: 120 + Math.random() * 80,
          hvac: 19 + Math.random() * 9,
          water: 25 + Math.random() * 15,
          lighting: 55 + Math.random() * 35,
          airQuality: 85 + Math.random() * 10,
        },
        occupancy: Math.floor(15 + Math.random() * 25),
        maxOccupancy: 40,
        status: "optimal" as any,
        alerts: 0,
      },
    ];
  };

  useEffect(() => {
    setIsLoaded(true);
    const data = generateBuildingData(buildingType);
    setBuildingData(data);
    
    // Try to fetch real backend data
    const fetchBackendData = async () => {
      try {
        setIsLoadingBackend(true);
        const config = buildingConfigs[buildingType];
        const mockData = generateMockBuildingData(config.floors);
        const convertedFloors = convertToFloorData(mockData.floors);
        setFloorData3D(convertedFloors);
      } catch (error) {
        console.log("Using mock data (backend not available)");
        const config = buildingConfigs[buildingType];
        const mockData = generateMockBuildingData(config.floors);
        const convertedFloors = convertToFloorData(mockData.floors);
        setFloorData3D(convertedFloors);
      } finally {
        setIsLoadingBackend(false);
      }
    };
    
    fetchBackendData();
  }, [buildingType]);

  useEffect(() => {
    if (isLoaded && buildingData && showGreeting) {
      // Greeting sequence
      const timers = [
        setTimeout(() => setGreetingStep(1), 500),      // Show greeting 1
        setTimeout(() => setGreetingStep(2), 2000),     // Show greeting 2
        setTimeout(() => setGreetingStep(3), 4000),     // Show greeting 3
        setTimeout(() => setGreetingStep(4), 6500),     // Show greeting 4
        setTimeout(() => setShowGreeting(false), 9000), // Hide greetings
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isLoaded, buildingData, showGreeting]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleFloorClick = (floorNum: number) => {
    setSelectedFloor(floorNum);
    setShowDetailDialog(true);
  };

  // Simulation effect
  useEffect(() => {
    if (!isPlaying || !buildingData) return;
    const interval = setInterval(() => {
      setBuildingData(prev => {
        if (!prev) return null;
        const scenarioBias: Record<Scenario, Partial<FloorResources>> = {
          normal: {},
          peakHeat: { hvac: 15, electricity: 10 },
          gridStress: { electricity: 25 },
          maintenance: { hvac: -20, lighting: -30 },
          emergency: { hvac: -50, lighting: -50, electricity: -40 },
        };
        const bias = scenarioBias[scenario];
        return {
          ...prev,
          floors: prev.floors.map(f => ({
            ...f,
            hvac: Math.min(100, Math.max(0, f.hvac + (Math.random() - 0.5) * 3 + (bias.hvac || 0))),
            lighting: Math.min(100, Math.max(0, f.lighting + (Math.random() - 0.5) * 5)),
            electricity: Math.min(500, Math.max(0, f.electricity + (Math.random() - 0.5) * 15 + (bias.electricity || 0))),
            water: Math.min(200, Math.max(0, f.water + (Math.random() - 0.5) * 8)),
            internet: Math.min(1000, Math.max(0, f.internet + (Math.random() - 0.5) * 50)),
            airQuality: Math.min(100, Math.max(0, f.airQuality + (Math.random() - 0.5) * 4)),
          })),
        };
      });
    }, 2000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, scenario]);

  const beforeAfterData = buildingData ? [
    { name: "Before Synclo", value: buildingData.alignmentBefore, fill: "#94a3b8" },
    { name: "After Synclo", value: buildingData.alignmentAfter, fill: "#10b981" },
  ] : [];

  if (!isLoaded || !buildingData) return null;

  const currentResource = resourceConfigs[selectedResource];

  const totalMetrics = {
    electricity: buildingData.floors.reduce((sum, f) => sum + f.electricity, 0),
    hvac: Math.round(buildingData.floors.reduce((sum, f) => sum + f.hvac, 0) / buildingData.floors.length),
    water: buildingData.floors.reduce((sum, f) => sum + f.water, 0),
    lighting: Math.round(buildingData.floors.reduce((sum, f) => sum + f.lighting, 0) / buildingData.floors.length),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/buildings" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">{buildingData.name}</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/chatbot">
                <button className="px-4 py-2 text-sm font-medium hover:text-green-600 transition-colors flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  AI Assistant
                </button>
              </Link>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/buildings" className="text-sm text-green-600 hover:underline mb-2 inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Building Types
            </Link>
            <h1 className="text-3xl font-extrabold">Real-time Resource Visualization</h1>
            <p className="text-muted-foreground">{buildingData.floors.length} floors • 6 resources monitored</p>
          </div>

          {/* Greeting Messages */}
          {showGreeting && (
            <div className="mb-6 space-y-3" aria-live="polite">
              {greetingStep >= 1 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-4 border-2 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-left-4 duration-500">
                  <p className="text-lg font-semibold">
                    👋 Welcome to {buildingData.name}! Would you like to see the analytics for today?
                  </p>
                </div>
              )}
              {greetingStep >= 2 && (
                <div className="bg-muted rounded-2xl p-4 border animate-in fade-in slide-in-from-left-4 duration-500">
                  <p className="font-medium mb-2">📊 These are the initial metrics:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-background rounded-xl p-3">
                      <Zap className="w-5 h-5 text-yellow-600 mb-1" />
                      <div className="text-xs text-muted-foreground">Electricity</div>
                      <div className="font-bold">{totalMetrics.electricity} kW</div>
                    </div>
                    <div className="bg-background rounded-xl p-3">
                      <Thermometer className="w-5 h-5 text-red-600 mb-1" />
                      <div className="text-xs text-muted-foreground">HVAC</div>
                      <div className="font-bold">{totalMetrics.hvac}°C avg</div>
                    </div>
                    <div className="bg-background rounded-xl p-3">
                      <Droplets className="w-5 h-5 text-blue-600 mb-1" />
                      <div className="text-xs text-muted-foreground">Water</div>
                      <div className="font-bold">{totalMetrics.water} L/min</div>
                    </div>
                    <div className="bg-background rounded-xl p-3">
                      <TrendingUp className="w-5 h-5 text-green-600 mb-1" />
                      <div className="text-xs text-muted-foreground">Lighting</div>
                      <div className="font-bold">{totalMetrics.lighting}% avg</div>
                    </div>
                  </div>
                </div>
              )}
              {greetingStep >= 3 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border-2 border-green-400 dark:border-green-600 animate-in fade-in slide-in-from-left-4 duration-500">
                  <p className="font-medium mb-2">✅ And these are the metrics after using Synclo:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Energy Reduction</div>
                        <div className="font-bold text-green-600">32% decrease</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <Thermometer className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">HVAC Efficiency</div>
                        <div className="font-bold text-green-600">28% improvement</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Water Optimization</div>
                        <div className="font-bold text-green-600">24% savings</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Lighting Costs</div>
                        <div className="font-bold text-green-600">35% reduction</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {greetingStep >= 4 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border-2 border-blue-300 dark:border-blue-700 animate-in fade-in slide-in-from-left-4 duration-500">
                  <p className="text-lg font-semibold">
                    📈 Synclo increased load-window alignment from <span className="text-muted-foreground">{buildingData.alignmentBefore}%</span> to <span className="text-green-600 font-bold">{buildingData.alignmentAfter}%</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Scroll down to explore the building visualization and select a floor to examine.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left: Resource Selector & Floor List */}
            <div className="lg:col-span-1 space-y-6">
              {/* View Mode Toggle */}
              <div className="bg-background rounded-2xl p-4 shadow-lg border">
                <h3 className="text-sm font-semibold mb-4">View Mode</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setViewMode("3d")}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                      viewMode === "3d" ? "bg-green-600 text-white" : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    <Building2 className="w-5 h-5" />
                    3D View
                  </button>
                  <button
                    onClick={() => setViewMode("floorplan")}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                      viewMode === "floorplan" ? "bg-green-600 text-white" : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Floor Plan
                  </button>
                  <button
                    onClick={() => setViewMode("2d")}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                      viewMode === "2d" ? "bg-green-600 text-white" : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    <BarChart3 className="w-5 h-5" />
                    2D View
                  </button>
                </div>
              </div>

              {/* Resource Toggles */}
              <div className="bg-background rounded-2xl p-4 shadow-lg border">
                <h3 className="text-sm font-semibold mb-4">Select Resource</h3>
                <div className="space-y-2">
                  {(Object.keys(resourceConfigs) as ResourceKey[]).map((resource) => {
                    const config = resourceConfigs[resource];
                    return (
                      <button
                        key={resource}
                        onClick={() => setSelectedResource(resource)}
                        className={cn(
                          "w-full p-3 rounded-xl text-left transition-all border-2",
                          selectedResource === resource
                            ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                            : "border-transparent bg-muted hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{config.label}</div>
                            <div className="text-xs text-muted-foreground">{config.unit}</div>
                          </div>
                          <div className="w-4 h-4 rounded-full" style={{ background: config.getColor(50) }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Floor Selector */}
              <div className="bg-background rounded-2xl p-4 shadow-lg border">
                <h3 className="text-sm font-semibold mb-4">What floor would you like to examine?</h3>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => selectedFloor && selectedFloor < buildingData.floors.length && setSelectedFloor(selectedFloor + 1)}
                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"
                    disabled={!selectedFloor || selectedFloor >= buildingData.floors.length}
                    aria-label="Next floor"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <span className="font-semibold">
                    {selectedFloor ? `Floor ${selectedFloor}` : "Select a floor"}
                  </span>
                  <button
                    onClick={() => selectedFloor && selectedFloor > 1 && setSelectedFloor(selectedFloor - 1)}
                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"
                    disabled={!selectedFloor || selectedFloor <= 1}
                    aria-label="Previous floor"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto" role="listbox" aria-label="Floor selection">
                  {buildingData.floors.map((floor) => (
                    <button
                      key={floor.floor}
                      onClick={() => setSelectedFloor(floor.floor === selectedFloor ? null : floor.floor)}
                      className={cn(
                        "w-full p-2 rounded-lg text-left text-sm transition-all",
                        selectedFloor === floor.floor
                          ? "bg-green-600 text-white"
                          : "bg-muted hover:bg-muted/80"
                      )}
                      role="option"
                      aria-selected={selectedFloor === floor.floor}
                      tabIndex={0}
                    >
                      Floor {floor.floor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-background rounded-2xl p-4 shadow-lg border">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <span>{currentResource.icon}</span>
                  {currentResource.label} Key
                </h3>
                <div className="space-y-3">
                  <div className="h-6 rounded-full" style={{ background: `linear-gradient(to right, ${currentResource.getColor(0)}, ${currentResource.getColor(50)}, ${currentResource.getColor(100)})` }} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{currentResource.min} {currentResource.unit}</span>
                    <span>{currentResource.max} {currentResource.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">{currentResource.description}</p>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="bg-background rounded-2xl p-4 shadow-lg border">
                <h3 className="text-sm font-semibold mb-4">Simulation</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                      isPlaying ? "bg-green-600 text-white" : "bg-muted"
                    )}
                    aria-label={isPlaying ? "Pause simulation" : "Start simulation"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? "Pause" : "Start"}
                  </button>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Speed</label>
                    <div className="flex gap-2" role="group" aria-label="Simulation speed">
                      {[1, 2, 4].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSpeed(s)}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium",
                            speed === s ? "bg-green-600 text-white" : "bg-muted"
                          )}
                          aria-pressed={speed === s}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Scenario</label>
                    <select
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value as Scenario)}
                      className="w-full px-3 py-2 rounded-lg bg-muted border text-sm"
                      aria-label="Simulation scenario"
                    >
                      <option value="normal">Normal Operations</option>
                      <option value="peakHeat">Peak Heat</option>
                      <option value="gridStress">Grid Stress</option>
                      <option value="maintenance">Maintenance Mode</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Building Visualization */}
            <div className="lg:col-span-3 bg-background rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">
                  {viewMode === "3d" ? "3D Building Model" : viewMode === "floorplan" ? "Floor Plan Analytics" : "Building Heatmap"} - {currentResource.label}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={cn("w-3 h-3 rounded-full", isPlaying ? "bg-green-600 animate-pulse" : "bg-muted")} />
                  {isPlaying ? "Live updating" : "Paused"}
                  {isLoadingBackend && <span className="ml-2 text-xs">(Loading data...)</span>}
                </div>
              </div>

              {/* 3D View */}
              {viewMode === "3d" && (
                <Suspense fallback={
                  <div className="h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <Building2 className="w-12 h-12 mx-auto mb-4 animate-pulse text-green-600" />
                      <p className="text-muted-foreground">Loading 3D model...</p>
                    </div>
                  </div>
                }>
                  <BuildingModel3D
                    floors={floorData3D}
                    selectedResource={selectedResource}
                    selectedFloor={selectedFloor}
                    onFloorClick={handleFloorClick}
                    isPlaying={isPlaying}
                  />
                </Suspense>
              )}

              {/* Floor Plan View */}
              {viewMode === "floorplan" && selectedFloor && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Select Floor:</span>
                      <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg bg-muted border text-sm font-medium"
                      >
                        {buildingData?.floors.map((floor) => (
                          <option key={floor.floor} value={floor.floor}>
                            Floor {floor.floor}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <FloorPlan
                    floorNumber={selectedFloor}
                    selectedResource={selectedResource}
                    zones={generateZoneData(selectedFloor)}
                    onZoneClick={(zone) => setSelectedZone(zone)}
                    selectedZone={selectedZone}
                  />
                </div>
              )}

              {/* Floor Plan - No Floor Selected Message */}
              {viewMode === "floorplan" && !selectedFloor && (
                <div className="flex flex-col items-center justify-center h-[600px] text-center">
                  <svg className="w-20 h-20 mb-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <h3 className="text-xl font-bold mb-2">Select a Floor to View Plan</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a floor from the selector on the left to see the detailed floor plan with resource analytics
                  </p>
                  <button
                    onClick={() => setSelectedFloor(1)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-all"
                  >
                    View Floor 1
                  </button>
                </div>
              )}

              {/* 2D View - Building Silhouette with Heatmap Floors */}
              {viewMode === "2d" && (
                <div className="relative">
                  {/* Roof */}
                  <div className="flex justify-center mb-2">
                    <div className="w-32 h-8 bg-muted rounded-t-lg relative">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-muted-foreground/30 rounded-full" />
                    </div>
                  </div>

                {/* Floors */}
                <div className="flex flex-col-reverse gap-1 items-center">
                  {buildingData.floors.map((floor) => {
                    const value = floor[selectedResource];
                    const color = getResourceColor(selectedResource, value);
                    const isSelected = selectedFloor === floor.floor;
                    return (
                      <div
                        key={floor.floor}
                        onClick={() => setSelectedFloor(isSelected ? null : floor.floor)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedFloor(isSelected ? null : floor.floor);
                          }
                        }}
                        className={cn(
                          "relative cursor-pointer transition-all duration-300 rounded-lg shadow-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-600",
                          isSelected && "ring-2 ring-green-600 scale-105 z-10"
                        )}
                        style={{ width: `${280 + (buildingData.floors.length - floor.floor) * 8}px`, backgroundColor: color }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Floor ${floor.floor}, ${currentResource.label} ${value.toFixed(1)} ${currentResource.unit}`}
                      >
                        <div className="h-16 flex items-center px-4">
                          <span className="text-white font-bold text-lg drop-shadow-lg">{floor.floor}F</span>
                          <span className="ml-auto text-white font-semibold text-sm drop-shadow-lg">
                            {value.toFixed(1)} {currentResource.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ground */}
                <div className="flex justify-center mt-4">
                  <div className="w-full max-w-md h-4 bg-muted-foreground/50 rounded-b-lg flex items-center justify-center text-white text-xs font-semibold">
                    GROUND LEVEL
                  </div>
                </div>
              </div>
              )}

              {/* Selected Floor Detail */}
              {selectedFloor && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold">Floor {selectedFloor} - All Resources</h4>
                    <button
                      onClick={() => setShowFloorPlan(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl"
                    >
                      <Maximize2 className="w-4 h-4" />
                      View Floor Plan
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(Object.keys(resourceConfigs) as ResourceKey[]).map((key) => {
                      const config = resourceConfigs[key];
                      const floor = buildingData.floors.find(f => f.floor === selectedFloor);
                      if (!floor) return null;
                      const value = floor[key];
                      const color = getResourceColor(key, value);
                      const percentage = getResourcePercentage(key, value);
                      return (
                        <div key={key} className="bg-background rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => setShowFloorPlan(true)}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{config.icon}</span>
                            <span className="font-semibold">{config.label}</span>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-2xl font-bold" style={{ color }}>{value.toFixed(1)}</div>
                              <div className="text-xs text-muted-foreground">{config.unit}</div>
                            </div>
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Before/After Impact */}
              <div className="mt-8 p-6 bg-muted/50 rounded-2xl border">
                <h3 className="text-lg font-bold text-center mb-6">Impact of Synclo on {buildingData.name}</h3>
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={beforeAfterData} layout="vertical" barSize={60}>
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        tick={{ fontSize: 14, fontWeight: 600 }}
                      />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]}>
                        {beforeAfterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                      <Label
                        position="insideEnd"
                        offset={10}
                        formatter={(value: any) => `${value}%`}
                        style={{ fontSize: "24px", fontWeight: "bold", fill: "#10b981" }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Synclo increased load-window alignment from <span className="font-bold">{buildingData.alignmentBefore}%</span> to <span className="font-bold text-green-600">{buildingData.alignmentAfter}%</span>
                  </p>
                  <Link href="/#impact">
                    <button className="mt-4 px-6 py-3 rounded-full border border-green-600 text-green-600 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
                      Calculate your savings
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floor Detail Dialog */}
      <FloorDetailDialog
        floor={floorData3D.find(f => f.floor === selectedFloor) || null}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        selectedResource={selectedResource}
      />

      {/* Accessibility: Live region for scenario changes */}
      <div aria-live="polite" className="sr-only">
        Scenario: {scenario}. {selectedFloor ? `Floor ${selectedFloor} ${currentResource.label}: ${buildingData.floors.find(f => f.floor === selectedFloor)?.[selectedResource].toFixed(1)} ${currentResource.unit}` : ""}
      </div>

      {/* Floor Plan Modal */}
      {showFloorPlan && selectedFloor && buildingData && (
        <FloorPlan
          floor={selectedFloor}
          data={{
            electricity: buildingData.floors.find(f => f.floor === selectedFloor)?.electricity || 0,
            hvac: buildingData.floors.find(f => f.floor === selectedFloor)?.hvac || 0,
            water: buildingData.floors.find(f => f.floor === selectedFloor)?.water || 0,
            lighting: buildingData.floors.find(f => f.floor === selectedFloor)?.lighting || 0,
          }}
          onClose={() => setShowFloorPlan(false)}
          buildingName={buildingData.name}
        />
      )}

      {/* AI Assistant - Floating */}
      <AIAssistant
        buildingName={buildingData?.name}
        currentFloor={selectedFloor}
        totalFloors={buildingData?.floors.length}
        onControlExecuted={(result) => {
          // Refresh building data after control
          if (result.success) {
            // Could trigger a refresh here
            console.log("Control executed:", result);
          }
        }}
      />
    </div>
  );
}
