"use client";

import { useState, useEffect } from "react";
import { Zap, Thermometer, Droplets, Lightbulb, X, ArrowLeft, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloorPlanProps {
  floor: number;
  data: {
    electricity: number;
    hvac: number;
    water: number;
    lighting: number;
  };
  onClose: () => void;
  buildingName?: string;
}

interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "office" | "meeting" | "kitchen" | "restroom" | "corridor" | "server";
}

interface ResourceFlow {
  id: string;
  type: "electricity" | "hvac" | "water" | "lighting";
  path: { x: number; y: number }[];
  progress: number;
  color: string;
}

const rooms: Room[] = [
  { id: "office1", name: "Office A", x: 5, y: 5, width: 30, height: 25, type: "office" },
  { id: "office2", name: "Office B", x: 38, y: 5, width: 25, height: 25, type: "office" },
  { id: "meeting1", name: "Meeting Room", x: 66, y: 5, width: 20, height: 20, type: "meeting" },
  { id: "kitchen", name: "Kitchen", x: 66, y: 28, width: 20, height: 15, type: "kitchen" },
  { id: "corridor", name: "Corridor", x: 5, y: 33, width: 56, height: 12, type: "corridor" },
  { id: "restroom1", name: "Restroom M", x: 5, y: 48, width: 15, height: 15, type: "restroom" },
  { id: "restroom2", name: "Restroom F", x: 23, y: 48, width: 15, height: 15, type: "restroom" },
  { id: "server", name: "Server Room", x: 66, y: 46, width: 20, height: 17, type: "server" },
  { id: "office3", name: "Office C", x: 41, y: 48, width: 22, height: 20, type: "office" },
  { id: "office4", name: "Office D", x: 66, y: 66, width: 20, height: 20, type: "office" },
  { id: "meeting2", name: "Conference", x: 5, y: 66, width: 30, height: 20, type: "meeting" },
  { id: "office5", name: "Office E", x: 38, y: 71, width: 25, height: 15, type: "office" },
];

const resourceColors = {
  electricity: "#fbbf24",
  hvac: "#ef4444",
  water: "#3b82f6",
  lighting: "#a855f7",
};

const resourceIcons = {
  electricity: Zap,
  hvac: Thermometer,
  water: Droplets,
  lighting: Lightbulb,
};

export default function FloorPlan({ floor, data, onClose, buildingName = "Building" }: FloorPlanProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [flows, setFlows] = useState<ResourceFlow[]>([]);
  const [selectedResource, setSelectedResource] = useState<keyof typeof resourceColors | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  // Generate resource flows
  useEffect(() => {
    const generateFlows = () => {
      const newFlows: ResourceFlow[] = [];
      
      // Electricity flows (from server room to offices)
      const electricityPaths = [
        [{ x: 76, y: 55 }, { x: 76, y: 39 }, { x: 33, y: 39 }, { x: 20, y: 20 }],
        [{ x: 76, y: 55 }, { x: 76, y: 39 }, { x: 50, y: 39 }, { x: 50, y: 18 }],
        [{ x: 76, y: 55 }, { x: 76, y: 39 }, { x: 52, y: 39 }, { x: 52, y: 58 }],
      ];

      // HVAC flows (through corridors and rooms)
      const hvacPaths = [
        [{ x: 33, y: 39 }, { x: 20, y: 39 }, { x: 20, y: 20 }],
        [{ x: 33, y: 39 }, { x: 50, y: 39 }, { x: 50, y: 18 }],
        [{ x: 33, y: 39 }, { x: 76, y: 39 }, { x: 76, y: 15 }],
      ];

      // Water flows (from restrooms)
      const waterPaths = [
        [{ x: 12, y: 55 }, { x: 12, y: 39 }, { x: 33, y: 39 }],
        [{ x: 30, y: 55 }, { x: 30, y: 39 }, { x: 33, y: 39 }],
      ];

      // Lighting flows (throughout)
      const lightingPaths = [
        [{ x: 20, y: 15 }, { x: 50, y: 15 }, { x: 76, y: 15 }],
        [{ x: 20, y: 58 }, { x: 52, y: 58 }, { x: 76, y: 76 }],
      ];

      electricityPaths.forEach((path, i) => {
        newFlows.push({ id: `elec-${i}`, type: "electricity", path, progress: Math.random(), color: resourceColors.electricity });
      });

      hvacPaths.forEach((path, i) => {
        newFlows.push({ id: `hvac-${i}`, type: "hvac", path, progress: Math.random(), color: resourceColors.hvac });
      });

      waterPaths.forEach((path, i) => {
        newFlows.push({ id: `water-${i}`, type: "water", path, progress: Math.random(), color: resourceColors.water });
      });

      lightingPaths.forEach((path, i) => {
        newFlows.push({ id: `light-${i}`, type: "lighting", path, progress: Math.random(), color: resourceColors.lighting });
      });

      setFlows(newFlows);
    };

    generateFlows();
  }, []);

  // Animate flows
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setFlows(prev => prev.map(flow => ({
        ...flow,
        progress: (flow.progress + 0.02) % 1,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getRoomColor = (room: Room) => {
    const baseColors: Record<string, string> = {
      office: "bg-slate-100 dark:bg-slate-800",
      meeting: "bg-blue-50 dark:bg-blue-900/30",
      kitchen: "bg-orange-50 dark:bg-orange-900/30",
      restroom: "bg-cyan-50 dark:bg-cyan-900/30",
      corridor: "bg-gray-100 dark:bg-gray-800",
      server: "bg-red-50 dark:bg-red-900/30",
    };
    return baseColors[room.type] || "bg-gray-100";
  };

  const getRoomResourceData = (room: Room) => {
    // Simulate room-specific resource usage
    const factor = room.type === "server" ? 2 : room.type === "kitchen" ? 1.5 : 1;
    return {
      electricity: Math.round(data.electricity / 10 * factor * (0.8 + Math.random() * 0.4)),
      hvac: Math.round(data.hvac * (0.9 + Math.random() * 0.2)),
      water: room.type === "restroom" || room.type === "kitchen" ? Math.round(data.water / 5) : 0,
      lighting: Math.round(data.lighting * (0.8 + Math.random() * 0.4)),
    };
  };

  const filteredFlows = selectedResource 
    ? flows.filter(f => f.type === selectedResource)
    : flows;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close floor plan"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold">{buildingName} - Floor {floor}</h2>
              <p className="text-sm text-muted-foreground">Interactive Floor Plan</p>
            </div>
          </div>

          {/* Resource Legend */}
          <div className="flex items-center gap-4">
            {(Object.keys(resourceColors) as Array<keyof typeof resourceColors>).map((resource) => {
              const Icon = resourceIcons[resource];
              const isActive = selectedResource === resource;
              return (
                <button
                  key={resource}
                  onClick={() => setSelectedResource(isActive ? null : resource)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    isActive 
                      ? "bg-foreground text-background" 
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? undefined : resourceColors[resource] }} />
                  <span className="capitalize">{resource}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Floor Plan */}
          <div className="flex-1 p-8 relative overflow-hidden">
            <div className="w-full h-full max-w-4xl mx-auto relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border overflow-hidden">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Rooms */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                {rooms.map((room) => {
                  const roomData = getRoomResourceData(room);
                  const isHovered = hoveredRoom === room.id;
                  
                  return (
                    <g key={room.id}>
                      <rect
                        x={room.x}
                        y={room.y}
                        width={room.width}
                        height={room.height}
                        className={cn(
                          "transition-all duration-300 cursor-pointer",
                          isHovered && "stroke-2 stroke-green-500"
                        )}
                        fill={isHovered ? "rgba(16, 185, 129, 0.1)" : "transparent"}
                        stroke={isHovered ? "#10b981" : "#cbd5e1"}
                        strokeWidth={isHovered ? 0.5 : 0.3}
                        onMouseEnter={() => setHoveredRoom(room.id)}
                        onMouseLeave={() => setHoveredRoom(null)}
                      />
                      <text
                        x={room.x + room.width / 2}
                        y={room.y + room.height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[2px] fill-current font-medium pointer-events-none"
                      >
                        {room.name}
                      </text>
                    </g>
                  );
                })}

                {/* Resource Flows */}
                {filteredFlows.map((flow) => {
                  const getPosition = (progress: number) => {
                    const totalSegments = flow.path.length - 1;
                    const segmentProgress = progress * totalSegments;
                    const segmentIndex = Math.floor(segmentProgress);
                    const localProgress = segmentProgress - segmentIndex;
                    
                    if (segmentIndex >= flow.path.length - 1) {
                      return flow.path[flow.path.length - 1];
                    }
                    
                    const start = flow.path[segmentIndex];
                    const end = flow.path[segmentIndex + 1];
                    
                    return {
                      x: start.x + (end.x - start.x) * localProgress,
                      y: start.y + (end.y - start.y) * localProgress,
                    };
                  };

                  const pos = getPosition(flow.progress);
                  
                  return (
                    <g key={flow.id}>
                      {/* Flow path */}
                      <path
                        d={`M ${flow.path.map(p => `${p.x},${p.y}`).join(' L ')}`}
                        fill="none"
                        stroke={flow.color}
                        strokeWidth={0.3}
                        strokeDasharray="1,1"
                        opacity={0.3}
                      />
                      {/* Animated dot */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={0.8}
                        fill={flow.color}
                        className="animate-pulse"
                      >
                        <animate
                          attributeName="r"
                          values="0.6;1;0.6"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </svg>

              {/* Room Tooltip */}
              {hoveredRoom && (
                <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-md rounded-xl p-4 shadow-lg border animate-in fade-in slide-in-from-bottom-4 duration-200">
                  {(() => {
                    const room = rooms.find(r => r.id === hoveredRoom);
                    if (!room) return null;
                    const roomData = getRoomResourceData(room);
                    return (
                      <div>
                        <h4 className="font-bold mb-2">{room.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span>{roomData.electricity} kW</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            <span>{roomData.hvac}°C</span>
                          </div>
                          {roomData.water > 0 && (
                            <div className="flex items-center gap-2">
                              <Droplets className="w-4 h-4 text-blue-500" />
                              <span>{roomData.water} L/min</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-purple-500" />
                            <span>{roomData.lighting}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel - Floor Stats */}
          <div className="w-80 border-l bg-background/80 backdrop-blur-md p-6 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Floor {floor} Resources</h3>
            
            {/* Resource Cards */}
            <div className="space-y-4">
              {(Object.keys(resourceColors) as Array<keyof typeof resourceColors>).map((resource) => {
                const Icon = resourceIcons[resource];
                const value = data[resource];
                const units: Record<string, string> = {
                  electricity: "kW",
                  hvac: "°C",
                  water: "L/min",
                  lighting: "%",
                };
                const labels: Record<string, string> = {
                  electricity: "Power Usage",
                  hvac: "Temperature",
                  water: "Water Flow",
                  lighting: "Brightness",
                };

                return (
                  <div
                    key={resource}
                    className={cn(
                      "bg-muted rounded-xl p-4 transition-all cursor-pointer",
                      selectedResource === resource && "ring-2 ring-green-500"
                    )}
                    onClick={() => setSelectedResource(selectedResource === resource ? null : resource)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" style={{ color: resourceColors[resource] }} />
                        <span className="font-medium">{labels[resource]}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Click to filter</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: resourceColors[resource] }}>
                      {value} <span className="text-sm font-normal">{units[resource]}</span>
                    </div>
                    
                    {/* Mini bar */}
                    <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${resource === 'hvac' ? (value / 40) * 100 : resource === 'lighting' ? value : (value / 500) * 100}%`,
                          backgroundColor: resourceColors[resource],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Efficiency Score */}
            <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Floor Efficiency</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {Math.round(70 + Math.random() * 20)}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                This floor is operating efficiently
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Quick Actions</h4>
              <button className="w-full py-2 px-4 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors text-left">
                Adjust HVAC Settings
              </button>
              <button className="w-full py-2 px-4 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors text-left">
                View Historical Data
              </button>
              <button className="w-full py-2 px-4 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors text-left">
                Set Energy Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}