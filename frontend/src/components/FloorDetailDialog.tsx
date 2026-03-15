"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, Thermometer, Droplets, Lightbulb, Wind, AlertTriangle, Users, TrendingUp, Wifi } from "lucide-react";
import type { FloorData } from "./BuildingModel3D";
import type { ResourceKey } from "@/lib/colorScales";
import { getResourceColor } from "@/lib/colorScales";

interface FloorDetailDialogProps {
  floor: FloorData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResource: ResourceKey;
}

const resourceIcons: Record<ResourceKey, any> = {
  electricity: Zap,
  hvac: Thermometer,
  water: Droplets,
  lighting: Lightbulb,
  airQuality: Wind,
  internet: Wifi,
};

const resourceLabels: Record<ResourceKey, string> = {
  electricity: "Electricity",
  hvac: "HVAC",
  water: "Water",
  lighting: "Lighting",
  airQuality: "Air Quality",
  internet: "Internet",
};

export default function FloorDetailDialog({ floor, open, onOpenChange, selectedResource }: FloorDetailDialogProps) {
  if (!floor) return null;

  const occupancyPercentage = (floor.occupancy / floor.maxOccupancy) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Floor {floor.floor} Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Floor Header */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
              <div className={`text-2xl font-bold ${
                floor.efficiency >= 80 ? "text-green-600" :
                floor.efficiency >= 60 ? "text-yellow-600" : "text-red-600"
              }`}>
                {floor.efficiency.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-muted rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> Occupancy
              </div>
              <div className="text-2xl font-bold">
                {floor.occupancy} / {floor.maxOccupancy}
              </div>
              <div className="text-xs text-muted-foreground">
                {occupancyPercentage.toFixed(1)}% full
              </div>
            </div>
            
            <div className="bg-muted rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Alerts
              </div>
              <div className={`text-2xl font-bold ${
                floor.alerts > 0 ? "text-red-600" : "text-green-600"
              }`}>
                {floor.alerts}
              </div>
              <div className="text-xs text-muted-foreground">
                {floor.alerts > 0 ? "Active" : "No issues"}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              floor.status === "optimal" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
              floor.status === "warning" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
              "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {floor.status.toUpperCase()}
            </span>
          </div>

          {/* Resource Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Resource Usage</h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(floor.resources) as ResourceKey[]).map((resource) => {
                const value = floor.resources[resource] ?? 0;
                const Icon = resourceIcons[resource];
                const color = getResourceColor(resource, value);
                
                return (
                  <div
                    key={resource}
                    className={`rounded-xl p-4 border-2 transition-all ${
                      resource === selectedResource ? "border-green-600 bg-green-50 dark:bg-green-900/20" : "border-transparent bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span className="text-sm font-medium">{resourceLabels[resource]}</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color }}>
                      {value.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {resource === "electricity" && "kW"}
                      {resource === "hvac" && "°C avg"}
                      {resource === "water" && "gal/min"}
                      {resource === "lighting" && "% avg"}
                      {resource === "airQuality" && "AQI"}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, value)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Efficiency Trend */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Efficiency Analysis
            </h3>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border-2 border-green-300 dark:border-green-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Floor {floor.floor} is performing {floor.efficiency >= 80 ? "excellently" : floor.efficiency >= 60 ? "moderately" : "below expectations"}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {floor.efficiency >= 80 && "Great job! This floor is operating at optimal efficiency levels."}
                    {floor.efficiency >= 60 && floor.efficiency < 80 && "Consider reviewing resource usage patterns to improve efficiency."}
                    {floor.efficiency < 60 && "Immediate attention recommended. Review alerts and resource consumption patterns."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Zones Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Zones</h3>
            <div className="bg-muted rounded-xl p-4">
              <div className="text-sm font-medium mb-2">{floor.name}</div>
              <div className="text-xs text-muted-foreground">
                Area: {floor.coordinates.width * floor.coordinates.height} sq ft
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {floor.alerts > 0 && (
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all">
                View Alerts
              </button>
              <button className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all">
                Take Action
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
