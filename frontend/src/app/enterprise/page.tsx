"use client";

import { useState, useEffect } from 'react';
import { Navigation, MetricCard, StatusIndicator, AlertBanner, WebSocketProvider, useWebSocket } from '@/components/shared';
import { EnterpriseMetrics } from '@/types';

const BuildingIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function EnterpriseDashboardContent() {
  const { isConnected, lastMessage, send } = useWebSocket();
  const [metrics, setMetrics] = useState<EnterpriseMetrics>({
    total_watts: 75000,
    occupancy: 65,
    zones_active: 8,
    hvac_efficiency: 82,
    compliance_score: 88,
    lighting_load: 12000,
    elevator_usage: 45,
    peak_demand: 420,
  });
  const [aiInsight, setAiInsight] = useState('Building systems operating efficiently');

  useEffect(() => {
    if (lastMessage) {
      const data = lastMessage as { metrics?: EnterpriseMetrics; ai_insight?: string };
      if (data.metrics) setMetrics(data.metrics);
      if (data.ai_insight) setAiInsight(data.ai_insight);
    }

    const interval = setInterval(() => {
      send({
        type: 'metrics_update',
        timestamp: new Date().toISOString(),
        metrics: {
          total_watts: Math.floor(70000 + Math.random() * 20000),
          occupancy: Math.floor(50 + Math.random() * 40),
          zones_active: Math.floor(6 + Math.random() * 6),
          hvac_efficiency: Math.floor(75 + Math.random() * 20),
          compliance_score: Math.floor(82 + Math.random() * 15),
          lighting_load: Math.floor(10000 + Math.random() * 5000),
          elevator_usage: Math.floor(30 + Math.random() * 30),
          peak_demand: Math.floor(380 + Math.random() * 100),
        },
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [lastMessage, send]);

  const getStatus = (): 'optimal' | 'warning' | 'critical' => {
    if (metrics.compliance_score < 75 || metrics.hvac_efficiency < 60) return 'critical';
    if (metrics.compliance_score < 85 || metrics.hvac_efficiency < 70) return 'warning';
    return 'optimal';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <Navigation currentPerspective="enterprise" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enterprise Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Commercial building energy management</p>
          </div>
          <StatusIndicator status={getStatus()} size="lg" />
        </div>

        {!isConnected && (
          <AlertBanner type="warning" title="Connecting..." message="Establishing connection to building management system" className="mb-8" />
        )}

        <AlertBanner
          type="info"
          title="Compliance Update"
          message={aiInsight}
          className="mb-8"
        />

        {/* Energy Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Energy Distribution</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_30s_linear_infinite]">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="16"
                    strokeDasharray="100 168" strokeDashoffset="0" className="drop-shadow-lg" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="16"
                    strokeDasharray="63 168" strokeDashoffset="-100" className="drop-shadow-lg" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="16"
                    strokeDasharray="38 168" strokeDashoffset="-163" className="drop-shadow-lg" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="16"
                    strokeDasharray="25 168" strokeDashoffset="-201" className="drop-shadow-lg" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{(metrics.total_watts/1000).toFixed(0)}kW</div>
                    <div className="text-sm text-gray-500">Total Power</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">HVAC</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">60%</div>
                  <div className="text-sm text-gray-500">{(metrics.total_watts * 0.6 / 1000).toFixed(1)}kW</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Lighting</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">25%</div>
                  <div className="text-sm text-gray-500">{(metrics.lighting_load / 1000).toFixed(1)}kW</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Equipment</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-600">15%</div>
                  <div className="text-sm text-gray-500">{(metrics.total_watts * 0.15 / 1000).toFixed(1)}kW</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-purple-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Other</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">10%</div>
                  <div className="text-sm text-gray-500">{(metrics.total_watts * 0.1 / 1000).toFixed(1)}kW</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            value={(metrics.total_watts / 1000).toFixed(1)}
            label="Total Power"
            unit="kW"
            icon={<BuildingIcon />}
          />
          <MetricCard
            value={metrics.occupancy}
            label="Building Occupancy"
            unit="%"
            icon={<ChartIcon />}
            trend={metrics.occupancy > 60 ? 'up' : 'down'}
            trendValue="vs yesterday"
          />
          <MetricCard
            value={metrics.hvac_efficiency}
            label="HVAC Efficiency"
            unit="%"
            color={metrics.hvac_efficiency > 80 ? 'text-green-600' : 'text-yellow-500'}
          />
          <MetricCard
            value={metrics.compliance_score}
            label="Compliance Score"
            unit="%"
            icon={<ShieldIcon />}
            color={metrics.compliance_score > 85 ? 'text-green-600' : 'text-yellow-500'}
          />
        </div>

        {/* Zone Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Active Zones</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`p-4 rounded-xl border-2 ${i < metrics.zones_active ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 opacity-50'}`}>
                <div className="font-semibold text-gray-900 dark:text-white">Zone {i + 1}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{i < metrics.zones_active ? 'Active' : 'Inactive'}</div>
                {i < metrics.zones_active && (
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lighting Load</h3>
            <div className="text-4xl font-bold text-amber-600 mb-2">{(metrics.lighting_load / 1000).toFixed(1)} kW</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Current lighting power consumption</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Elevator Usage</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">{metrics.elevator_usage}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Trips per hour</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Peak Demand</h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">{metrics.peak_demand} kW</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Current demand charge basis</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EnterpriseDashboard() {
  return (
    <WebSocketProvider perspective="enterprise">
      <EnterpriseDashboardContent />
    </WebSocketProvider>
  );
}
