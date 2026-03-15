"use client";

import { useState, useMemo } from "react";
import { Zap, Thermometer, Droplets, Lightbulb, Wind, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import type { ResourceKey } from "@/lib/colorScales";
import { getResourceColor } from "@/lib/colorScales";

interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  resources: {
    electricity: number;
    hvac: number;
    water: number;
    lighting: number;
    airQuality: number;
    internet?: number;
  };
  occupancy: number;
  maxOccupancy: number;
  status: "optimal" | "warning" | "critical";
  alerts: number;
}

interface FloorPlanProps {
  floorNumber?: number;
  selectedResource?: ResourceKey;
  zones?: Zone[];
  onZoneClick?: (zone: Zone) => void;
  selectedZone?: Zone | null;
  // Alternative props for simple usage
  floor?: number;
  data?: {
    electricity: number;
    hvac: number;
    water: number;
    lighting: number;
  };
  onClose?: () => void;
  buildingName?: string;
}

interface ResourceFlowLine {
  from: { x: number; y: number };
  to: { x: number; y: number };
  resource: ResourceKey;
  value: number;
}

export default function FloorPlan({
  floorNumber,
  selectedResource = "electricity",
  zones = [],
  onZoneClick,
  selectedZone,
  // Alternative props
  floor,
  data,
  onClose,
  buildingName = "Building"
}: FloorPlanProps) {
  // Use floor if floorNumber not provided
  const effectiveFloorNumber = floorNumber ?? floor ?? 1;
  
  // If onClose is provided, render simplified modal view
  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">{buildingName} - Floor {effectiveFloorNumber}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">Close</button>
          </div>
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Floor plan visualization</p>
              {data && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm text-muted-foreground">Electricity</p>
                    <p className="text-xl font-bold">{data.electricity.toFixed(1)} kW</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Thermometer className="w-6 h-6 mx-auto mb-2 text-red-500" />
                    <p className="text-sm text-muted-foreground">HVAC</p>
                    <p className="text-xl font-bold">{data.hvac.toFixed(1)}°C</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-muted-foreground">Water</p>
                    <p className="text-xl font-bold">{data.water.toFixed(1)} L/min</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Lightbulb className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm text-muted-foreground">Lighting</p>
                    <p className="text-xl font-bold">{data.lighting.toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Calculate total metrics for the floor
  const totalMetrics = useMemo(() => {
    return zones.reduce(
      (acc, zone) => ({
        electricity: acc.electricity + zone.resources.electricity,
        hvac: acc.hvac + zone.resources.hvac,
        water: acc.water + zone.resources.water,
        lighting: (acc.lighting + zone.resources.lighting) / zones.length,
        airQuality: (acc.airQuality + zone.resources.airQuality) / zones.length,
        internet: 0,
      }),
      { electricity: 0, hvac: 0, water: 0, lighting: 0, airQuality: 0, internet: 0 }
    );
  }, [zones]);

  // Generate resource flow lines from main entrance to zones
  const flowLines: ResourceFlowLine[] = useMemo(() => {
    const entrancePoint = { x: 50, y: 95 }; // Bottom center entrance
    
    return zones.flatMap((zone) => {
      const zoneCenter = { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 };
      
      // Create flow lines for each resource type
      return [
        {
          from: entrancePoint,
          to: zoneCenter,
          resource: "electricity" as ResourceKey,
          value: zone.resources.electricity,
        },
        {
          from: entrancePoint,
          to: zoneCenter,
          resource: "hvac" as ResourceKey,
          value: zone.resources.hvac,
        },
        {
          from: entrancePoint,
          to: zoneCenter,
          resource: "water" as ResourceKey,
          value: zone.resources.water,
        },
      ] as ResourceFlowLine[];
    });
  }, [zones]);

  const getResourceIcon = (resource: ResourceKey) => {
    const icons = {
      electricity: Zap,
      hvac: Thermometer,
      water: Droplets,
      lighting: Lightbulb,
      airQuality: Wind,
      internet: Zap,
    };
    return icons[resource];
  };

  const getResourceLabel = (resource: ResourceKey) => {
    const labels = {
      electricity: "Electricity",
      hvac: "HVAC",
      water: "Water",
      lighting: "Lighting",
      airQuality: "Air Quality",
      internet: "Internet",
    };
    return labels[resource];
  };

  const getResourceUnit = (resource: ResourceKey) => {
    const units = {
      electricity: "kW",
      hvac: "°C",
      water: "L/min",
      lighting: "%",
      airQuality: "AQI",
      internet: "Mbps",
    };
    return units[resource];
  };

  return (
    <div className="bg-background rounded-2xl p-6 shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Floor {floorNumber} - Top View</h3>
          <p className="text-sm text-muted-foreground">Resource distribution and zone analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Floor Plan Canvas */}
        <div className="lg:col-span-2">
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* SVG Container for Flow Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                {flowLines.map((line, index) => {
                  const gradientId = `gradient-${line.resource}-${index}`;
                  const color = getResourceColor(line.resource, line.value);
                  return (
                    <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.2} />
                    </linearGradient>
                  );
                })}
              </defs>
              
              {/* Resource Flow Lines */}
              {flowLines.map((line, index) => {
                const isSelected = selectedResource === line.resource;
                const color = getResourceColor(line.resource, line.value);
                const strokeWidth = isSelected ? 3 : 2;
                const opacity = isSelected ? 0.8 : 0.3;
                
                return (
                  <g key={`flow-${index}`}>
                    {/* Flow line */}
                    <path
                      d={`M ${line.from.x}% ${line.from.y}% Q ${(line.from.x + line.to.x) / 2}% ${line.from.y}% ${line.to.x}% ${line.to.y}%`}
                      stroke={`url(#gradient-${line.resource}-${index})`}
                      strokeWidth={strokeWidth}
                      fill="none"
                      opacity={opacity}
                      strokeDasharray={isSelected ? "none" : "5,5"}
                      className={isSelected ? "animate-pulse" : ""}
                    />
                    
                    {/* Animated flow particles */}
                    {isSelected && (
                      <circle r="4" fill={color}>
                        <animateMotion
                          dur="2s"
                          repeatCount="indefinite"
                          path={`M ${line.from.x}% ${line.from.y}% Q ${(line.from.x + line.to.x) / 2}% ${line.from.y}% ${line.to.x}% ${line.to.y}%`}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Zones */}
            {zones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              const isHovered = hoveredZone === zone.id;
              const resourceValue = (selectedResource !== "internet" ? zone.resources[selectedResource] : zone.resources.internet) || 0;
              const color = getResourceColor(selectedResource, resourceValue);
              
              return (
                <div
                  key={zone.id}
                  onClick={() => onZoneClick?.(zone)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className={`absolute cursor-pointer transition-all duration-300 border-2 rounded-lg shadow-md hover:shadow-lg ${
                    isSelected
                      ? "ring-4 ring-green-500 ring-offset-2 z-20 scale-105"
                      : isHovered
                      ? "ring-2 ring-gray-400 z-10 scale-102"
                      : ""
                  }`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                    backgroundColor: color,
                    borderColor: isSelected ? "#10b981" : isHovered ? "#9ca3af" : "#374151",
                  }}
                >
                  {/* Zone Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <span className="text-white font-bold text-xs drop-shadow-lg text-center">
                      {zone.name}
                    </span>
                    <span className="text-white/90 font-semibold text-xs drop-shadow">
                      {resourceValue.toFixed(1)} {getResourceUnit(selectedResource)}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-1 right-1">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        zone.status === "critical"
                          ? "bg-red-500 animate-pulse"
                          : zone.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                  </div>

                  {/* Alert Count */}
                  {zone.alerts > 0 && (
                    <div className="absolute top-1 left-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {zone.alerts}
                    </div>
                  )}

                  {/* Occupancy Badge */}
                  <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs rounded px-1.5 py-0.5 font-medium">
                    {zone.occupancy}/{zone.maxOccupancy}
                  </div>
                </div>
              );
            })}

            {/* Entrance Marker */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-green-600 rounded-t-lg flex items-center justify-center text-white text-xs font-bold">
              ENTRANCE
            </div>

            {/* Compass */}
            <div className="absolute top-2 right-2 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-300 dark:border-gray-600">
              <div className="text-xs font-bold">
                <div className="text-green-600">N</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-xs text-muted-foreground">Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-xs text-muted-foreground">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-xs text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-transparent" />
              <span className="text-xs text-muted-foreground">Resource Flow</span>
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="space-y-4">
          {/* Floor Summary */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border-2 border-green-300 dark:border-green-700">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Floor {floorNumber} Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Zones</span>
                <span className="font-semibold">{zones.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Occupancy</span>
                <span className="font-semibold">
                  {zones.reduce((acc, z) => acc + z.occupancy, 0)} /{" "}
                  {zones.reduce((acc, z) => acc + z.maxOccupancy, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Alerts</span>
                <span className="font-semibold text-red-600">
                  {zones.reduce((acc, z) => acc + z.alerts, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Resource Metrics */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm">Resource Metrics</h4>
            {(Object.keys(totalMetrics) as ResourceKey[]).filter(r => r !== "internet").map((resource) => {
              const Icon = getResourceIcon(resource);
              const value = totalMetrics[resource];
              const color = getResourceColor(resource, resource === "lighting" || resource === "airQuality" ? value * 5 : value);
              const unit = getResourceUnit(resource);
              
              return (
                <div
                  key={resource}
                  className={`rounded-xl p-3 border-2 transition-all cursor-pointer ${
                    selectedResource === resource
                      ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                      : "border-transparent bg-muted hover:border-gray-300"
                  }`}
                  onClick={() => {}}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">{getResourceLabel(resource)}</div>
                      <div className="font-bold" style={{ color }}>
                        {resource === "lighting" || resource === "airQuality"
                          ? value.toFixed(1)
                          : value.toFixed(0)}{" "}
                        {unit}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Zone Details */}
          {selectedZone && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border-2 border-blue-300 dark:border-blue-700">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                {selectedZone.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`font-semibold ${
                      selectedZone.status === "critical"
                        ? "text-red-600"
                        : selectedZone.status === "warning"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {selectedZone.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-semibold">
                    {selectedZone.occupancy}/{selectedZone.maxOccupancy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alerts</span>
                  <span className="font-semibold text-red-600">{selectedZone.alerts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {getResourceLabel(selectedResource)}
                  </span>
                  <span className="font-semibold" style={{ color: getResourceColor(selectedResource, selectedZone.resources[selectedResource] ?? 0) }}>
                    {(selectedZone.resources[selectedResource] ?? 0).toFixed(1)} {getResourceUnit(selectedResource)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
