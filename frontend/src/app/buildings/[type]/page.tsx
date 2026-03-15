"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

type ResourceKey = 'hvac' | 'lighting' | 'electricity' | 'water' | 'internet' | 'airQuality';
type BuildingType = 'office' | 'datacenter' | 'hospital' | 'campus' | 'factory';
type ViewMode = 'overall' | 'detailed';

interface FloorResources {
  floor: number;
  hvac: number; // % efficiency
  lighting: number; // % usage
  electricity: number; // kW
  water: number; // L/min
  internet: number; // Mbps
  airQuality: number; // AQI score (0-100, higher is better)
}

interface BuildingData {
  name: string;
  type: BuildingType;
  floors: FloorResources[];
  alignmentBefore: number;
  alignmentAfter: number;
}

// Resource configuration with colors, labels, and units
const resourceConfig: Record<ResourceKey, {
  label: string;
  unit: string;
  gradient: string[];
  min: number;
  max: number;
  icon: string;
  description: string;
}> = {
  hvac: {
    label: 'HVAC',
    unit: '%',
    gradient: ['#dbeafe', '#60a5fa', '#2563eb', '#1e3a8a'],
    min: 0,
    max: 100,
    icon: '🌡️',
    description: 'Heating, Ventilation & Air Conditioning efficiency',
  },
  lighting: {
    label: 'Lighting',
    unit: '%',
    gradient: ['#fef3c7', '#fbbf24', '#f59e0b', '#b45309'],
    min: 0,
    max: 100,
    icon: '💡',
    description: 'Lighting system usage and intensity',
  },
  electricity: {
    label: 'Electricity',
    unit: 'kW',
    gradient: ['#dcfce7', '#4ade80', '#16a34a', '#14532d'],
    min: 0,
    max: 500,
    icon: '⚡',
    description: 'Electrical power consumption',
  },
  water: {
    label: 'Water',
    unit: 'L/min',
    gradient: ['#e0f2fe', '#38bdf8', '#0284c7', '#0c4a6e'],
    min: 0,
    max: 200,
    icon: '💧',
    description: 'Water flow rate',
  },
  internet: {
    label: 'Internet',
    unit: 'Mbps',
    gradient: ['#ede9fe', '#a78bfa', '#7c3aed', '#4c1d95'],
    min: 0,
    max: 1000,
    icon: '📶',
    description: 'Network bandwidth usage',
  },
  airQuality: {
    label: 'Air Quality',
    unit: 'AQI',
    gradient: ['#ef4444', '#f59e0b', '#84cc16', '#22c55e'],
    min: 0,
    max: 100,
    icon: '🌬️',
    description: 'Indoor air quality index (higher is better)',
  },
};

// Generate mock building data
function generateBuildingData(type: BuildingType): BuildingData {
  const configs: Record<BuildingType, { name: string; floors: number; baseMetrics: Partial<FloorResources> }> = {
    office: { name: 'Synclo Tower', floors: 10, baseMetrics: { hvac: 75, lighting: 60, electricity: 250, water: 80, internet: 500, airQuality: 85 } },
    datacenter: { name: 'DataHub One', floors: 5, baseMetrics: { hvac: 90, lighting: 30, electricity: 450, water: 40, internet: 950, airQuality: 70 } },
    hospital: { name: 'Metro General', floors: 12, baseMetrics: { hvac: 80, lighting: 70, electricity: 350, water: 150, internet: 600, airQuality: 90 } },
    campus: { name: 'University Hall', floors: 6, baseMetrics: { hvac: 65, lighting: 50, electricity: 180, water: 100, internet: 400, airQuality: 80 } },
    factory: { name: 'Industrial Plant', floors: 4, baseMetrics: { hvac: 55, lighting: 80, electricity: 480, water: 180, internet: 200, airQuality: 60 } },
  };

  const config = configs[type];
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
    type,
    floors,
    alignmentBefore: 35 + Math.floor(Math.random() * 10),
    alignmentAfter: 70 + Math.floor(Math.random() * 15),
  };
}

// Get color for resource value
function getColorForResource(resource: ResourceKey, value: number): string {
  const config = resourceConfig[resource];
  const normalized = (value - config.min) / (config.max - config.min);
  const index = Math.min(config.gradient.length - 1, Math.floor(normalized * (config.gradient.length - 1)));
  return config.gradient[index];
}

// Floor detail modal component
function FloorDetailModal({ 
  floor, 
  resource, 
  onClose 
}: { 
  floor: FloorResources | null; 
  resource: ResourceKey;
  onClose: () => void;
}) {
  if (!floor) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in-up" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Floor {floor.floor} Details</h2>
            <p className="text-gray-600 dark:text-gray-400">Real-time resource metrics</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* All Resources Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {(Object.keys(resourceConfig) as ResourceKey[]).map((key) => {
            const config = resourceConfig[key];
            const value = floor[key];
            const color = getColorForResource(key, value);
            const percentage = ((value - config.min) / (config.max - config.min)) * 100;
            
            return (
              <div key={key} className={`p-4 rounded-xl border-2 transition-all ${key === resource ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{config.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{config.description}</div>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold" style={{ color }}>{value.toFixed(1)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">{config.unit}</div>
                  </div>
                  <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Synclo Recommendation */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <div className="font-semibold text-green-800 dark:text-green-200 mb-1">Synclo Insight</div>
              <div className="text-sm text-green-700 dark:text-green-300">
                {resource === 'hvac' && "HVAC efficiency is optimal. Consider scheduling maintenance during off-peak hours."}
                {resource === 'lighting' && "Lighting usage is above average. Occupancy sensors could reduce waste by 25%."}
                {resource === 'electricity' && "Peak demand detected. Load shifting could save 15% on energy costs."}
                {resource === 'water' && "Water flow is within normal range. No action required."}
                {resource === 'internet' && "Network utilization is high. Consider bandwidth optimization during peak hours."}
                {resource === 'airQuality' && "Air quality is good. Continue current ventilation schedule."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuildingVisualizationPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const buildingType = resolvedParams.type as BuildingType;
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceKey>('electricity');
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overall');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [scenario, setScenario] = useState('normal');
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);

  useEffect(() => {
    setIsLoaded(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDarkMode(true);
    }
    setBuildingData(generateBuildingData(buildingType));
  }, [buildingType]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  // Simulation effect
  useEffect(() => {
    if (!isPlaying || !buildingData) return;
    
    const interval = setInterval(() => {
      setBuildingData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          floors: prev.floors.map(f => ({
            ...f,
            hvac: Math.min(100, Math.max(0, f.hvac + (Math.random() - 0.5) * 3)),
            lighting: Math.min(100, Math.max(0, f.lighting + (Math.random() - 0.5) * 5)),
            electricity: Math.min(500, Math.max(0, f.electricity + (Math.random() - 0.5) * 15)),
            water: Math.min(200, Math.max(0, f.water + (Math.random() - 0.5) * 8)),
            internet: Math.min(1000, Math.max(0, f.internet + (Math.random() - 0.5) * 50)),
            airQuality: Math.min(100, Math.max(0, f.airQuality + (Math.random() - 0.5) * 4)),
          }))
        };
      });
    }, 2000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  if (!isLoaded || !buildingData) return null;

  const currentResource = resourceConfig[selectedResource];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/buildings" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.5 2 5 4.5 5 8c0 2.5 1.5 4.5 3.5 5.5C8 15 7 17 7 19c0 2.5 2.5 3 5 3s5-.5 5-3c0-2-1-4-1.5-5.5C17.5 12.5 19 10.5 19 8c0-3.5-3.5-6-7-6zm0 2c2.5 0 5 1.5 5 4 0 1.5-.5 2.5-1.5 3.5-.5-1.5-1.5-3-3.5-3s-3 1.5-3.5 3C7.5 10.5 7 9.5 7 8c0-2.5 2.5-4 5-4z"/>
                  <ellipse cx="12" cy="18" rx="4" ry="2" opacity="0.6"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Synclo</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:inline">{buildingData.name}</span>
              <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 fade-in-up">
            <Link href="/buildings" className="text-sm text-green-600 dark:text-green-400 hover:underline mb-2 inline-block">
              ← Back to Building Types
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{buildingData.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">Real-time resource visualization across {buildingData.floors.length} floors</p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('overall')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'overall'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  🏢 Overall View
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'detailed'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  📊 Detailed View
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left: Resource Selector */}
            <div className="lg:col-span-1 space-y-6">
              {/* Resource Toggles */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 fade-in-up">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Select Resource</h3>
                <div className="space-y-2">
                  {(Object.keys(resourceConfig) as ResourceKey[]).map((resource) => {
                    const config = resourceConfig[resource];
                    return (
                      <button
                        key={resource}
                        onClick={() => setSelectedResource(resource)}
                        className={`w-full p-3 rounded-xl text-left transition-all ${
                          selectedResource === resource
                            ? 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 border-2 border-green-600'
                            : 'bg-gray-50 dark:bg-gray-900 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{config.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{config.unit}</div>
                          </div>
                          <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${config.gradient[1]}, ${config.gradient[2]})` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 fade-in-up">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  <span className="text-lg mr-2">{currentResource.icon}</span>
                  {currentResource.label} Key
                </h3>
                <div className="space-y-3">
                  <div className="h-6 rounded-full" style={{ background: `linear-gradient(to right, ${currentResource.gradient.join(', ')})` }} />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>{currentResource.min} {currentResource.unit}</span>
                    <span>{currentResource.max} {currentResource.unit}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {currentResource.description}
                  </p>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 fade-in-up">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Simulation</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isPlaying 
                        ? 'bg-green-600 text-white shadow-lg' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {isPlaying ? '⏸ Pause Simulation' : '▶ Start Simulation'}
                  </button>
                  
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-500 mb-2 block">Speed</label>
                    <div className="flex gap-2">
                      {[1, 2, 4].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSpeed(s)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            speed === s 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-500 mb-2 block">Scenario</label>
                    <select
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="normal">Normal Operations</option>
                      <option value="peak-heat">Peak Heat</option>
                      <option value="grid-stress">Grid Stress</option>
                      <option value="maintenance">Maintenance Mode</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Building Visualization */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {viewMode === 'overall' ? 'Building Overview' : `Detailed View - ${currentResource.label}`}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-3 h-3 rounded-full bg-green-600 animate-pulse" />
                  {isPlaying ? 'Live updating' : 'Paused'}
                </div>
              </div>
              
              {/* Building Silhouette with Heatmap Floors */}
              <div className="relative">
                {/* Building Top/Roof */}
                <div className="flex justify-center mb-2">
                  <div className="w-32 h-8 bg-gray-300 dark:bg-gray-600 rounded-t-lg relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-400 dark:bg-gray-500 rounded-full" />
                  </div>
                </div>
                
                {/* Floors */}
                <div className="flex flex-col-reverse gap-1 items-center">
                  {buildingData.floors.map((floor) => {
                    const value = floor[selectedResource];
                    const color = getColorForResource(selectedResource, value);
                    const isSelected = selectedFloor === floor.floor;
                    const percentage = ((value - resourceConfig[selectedResource].min) / (resourceConfig[selectedResource].max - resourceConfig[selectedResource].min)) * 100;
                    
                    return (
                      <div
                        key={floor.floor}
                        onClick={() => setSelectedFloor(isSelected ? null : floor.floor)}
                        className={`relative cursor-pointer transition-all duration-300 ${isSelected ? 'scale-105 z-10' : 'hover:scale-102'}`}
                        style={{ 
                          width: `${280 + (buildingData.floors.length - floor.floor) * 8}px`,
                        }}
                      >
                        {/* Floor Rectangle with Heatmap Color */}
                        <div 
                          className="h-16 rounded-lg shadow-md relative overflow-hidden group"
                          style={{ backgroundColor: color }}
                        >
                          {/* Floor Number */}
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold text-lg drop-shadow-lg">
                            {floor.floor}F
                          </div>
                          
                          {/* Resource Value */}
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white font-semibold text-sm drop-shadow-lg">
                            {value.toFixed(1)} {currentResource.unit}
                          </div>
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                              Click for details →
                            </span>
                          </div>
                          
                          {/* Selection Ring */}
                          {isSelected && (
                            <div className="absolute inset-0 border-4 border-white/80 rounded-lg animate-pulse" />
                          )}
                        </div>
                        
                        {/* Floor Connectors (windows suggestion) */}
                        <div className="absolute top-2 left-8 right-8 h-10 flex items-center justify-around opacity-30">
                          {[...Array(Math.floor((buildingData.floors.length - floor.floor) / 2) + 3)].map((_, i) => (
                            <div key={i} className="w-3 h-6 bg-white/40 rounded-sm" />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Ground Level */}
                <div className="flex justify-center mt-4">
                  <div className="w-full max-w-md h-4 bg-gray-400 dark:bg-gray-600 rounded-b-lg relative">
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
                      GROUND LEVEL
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Floor Detail Panel */}
              {selectedFloor && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-green-300 dark:border-green-700 fade-in-up">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Floor {selectedFloor} - All Resources</h4>
                    <button 
                      onClick={() => setSelectedFloor(null)}
                      className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(Object.keys(resourceConfig) as ResourceKey[]).map((key) => {
                      const config = resourceConfig[key];
                      const floor = buildingData.floors.find(f => f.floor === selectedFloor);
                      if (!floor) return null;
                      const value = floor[key];
                      const color = getColorForResource(key, value);
                      const percentage = ((value - config.min) / (config.max - config.min)) * 100;
                      
                      return (
                        <div key={key} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{config.icon}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{config.label}</span>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-2xl font-bold" style={{ color }}>{value.toFixed(1)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">{config.unit}</div>
                            </div>
                            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => {}}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    View Full Floor Report →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Before/After Impact */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">Impact of Synclo on {buildingData.name}</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">Before Synclo</h4>
                <div className="relative h-48 bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-400 dark:bg-gray-600 transition-all duration-1000" style={{ height: `${buildingData.alignmentBefore}%` }} />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-4xl font-bold text-gray-600 dark:text-gray-400">{buildingData.alignmentBefore}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Load-window alignment</p>
              </div>
              
              <div className="text-center">
                <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-4">After Synclo</h4>
                <div className="relative h-48 bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" style={{ height: `${buildingData.alignmentAfter}%` }} />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-4xl font-bold text-green-600 dark:text-green-400">{buildingData.alignmentAfter}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Load-window alignment</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-700 dark:text-gray-300">
                Synclo increased load-window alignment from <span className="font-bold text-gray-600 dark:text-gray-400">{buildingData.alignmentBefore}%</span> to <span className="font-bold text-green-600 dark:text-green-400">{buildingData.alignmentAfter}%</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floor Detail Modal */}
      <FloorDetailModal 
        floor={selectedFloor ? buildingData.floors.find(f => f.floor === selectedFloor) || null : null}
        resource={selectedResource}
        onClose={() => setSelectedFloor(null)}
      />
    </div>
  );
}
