"use client";

import { useState, useEffect } from 'react';
import { Navigation, MetricCard, StatusIndicator, AlertBanner, WebSocketProvider, useWebSocket } from '@/components/shared';
import { DataCenterMetrics } from '@/types';

const ServerIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="2" y="14" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="6" cy="6" r="1" fill="currentColor"/>
    <circle cx="6" cy="18" r="1" fill="currentColor"/>
  </svg>
);

const ChipIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="8" y="8" width="8" height="8" fill="currentColor"/>
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const LeafIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M12 21c4.97-4.97 7-9 7-14-4.97 0-9 2.03-14 7 0 5 2.03 9.03 7 14z" fill="currentColor"/>
  </svg>
);

function DataCenterDashboardContent() {
  const { isConnected, lastMessage, send } = useWebSocket();
  const [metrics, setMetrics] = useState<DataCenterMetrics>({
    gpu_utilization: 72,
    pue: 1.32,
    clusters_active: 4,
    job_queue_depth: 45,
    renewable_forecast: 65,
    cooling_load: 380,
    network_throughput: 85,
    carbon_intensity: 380,
  });
  const [aiInsight, setAiInsight] = useState('High renewable energy availability forecast for next 4 hours');

  useEffect(() => {
    if (lastMessage) {
      const data = lastMessage as { metrics?: DataCenterMetrics; ai_insight?: string };
      if (data.metrics) setMetrics(data.metrics);
      if (data.ai_insight) setAiInsight(data.ai_insight);
    }

    const interval = setInterval(() => {
      send({
        type: 'metrics_update',
        timestamp: new Date().toISOString(),
        metrics: {
          gpu_utilization: Math.floor(60 + Math.random() * 35),
          pue: Number((1.25 + Math.random() * 0.2).toFixed(2)),
          clusters_active: Math.floor(3 + Math.random() * 3),
          job_queue_depth: Math.floor(30 + Math.random() * 50),
          renewable_forecast: Math.floor(50 + Math.random() * 40),
          cooling_load: Math.floor(350 + Math.random() * 100),
          network_throughput: Math.floor(70 + Math.random() * 25),
          carbon_intensity: Math.floor(350 + Math.random() * 100),
        },
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [lastMessage, send]);

  const getStatus = (): 'optimal' | 'warning' | 'critical' => {
    if (metrics.pue > 1.6 || metrics.gpu_utilization > 95 || metrics.job_queue_depth > 150) return 'critical';
    if (metrics.pue > 1.45 || metrics.gpu_utilization > 85 || metrics.job_queue_depth > 80) return 'warning';
    return 'optimal';
  };

  const clusters = [
    { name: 'GPU Cluster A', nodes: 32, util: 85 },
    { name: 'GPU Cluster B', nodes: 32, util: 72 },
    { name: 'CPU Cluster', nodes: 64, util: 45 },
    { name: 'Storage', nodes: 16, util: 60 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <Navigation currentPerspective="datacenter" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Center Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">High-performance compute facility management</p>
          </div>
          <StatusIndicator status={getStatus()} size="lg" />
        </div>

        {!isConnected && (
          <AlertBanner type="warning" title="Connecting..." message="Establishing connection to data center monitoring system" className="mb-8" />
        )}

        <AlertBanner
          type="success"
          title="Optimal Job Window Detected"
          message={aiInsight}
          className="mb-8"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            value={metrics.gpu_utilization}
            label="GPU Utilization"
            unit="%"
            icon={<ChipIcon />}
            color={metrics.gpu_utilization > 80 ? 'text-green-600' : metrics.gpu_utilization < 40 ? 'text-yellow-500' : 'text-gray-900 dark:text-white'}
          />
          <MetricCard
            value={metrics.pue.toFixed(2)}
            label="PUE"
            icon={<ServerIcon />}
            color={metrics.pue < 1.3 ? 'text-green-600' : metrics.pue > 1.5 ? 'text-red-500' : 'text-gray-900 dark:text-white'}
            trend={metrics.pue < 1.35 ? 'down' : 'stable'}
            trendValue="Target: 1.30"
          />
          <MetricCard
            value={metrics.renewable_forecast}
            label="Renewable Forecast"
            unit="%"
            icon={<LeafIcon />}
            color="text-green-600"
          />
          <MetricCard
            value={metrics.job_queue_depth}
            label="Job Queue"
            unit="jobs"
            trend={metrics.job_queue_depth > 50 ? 'up' : 'stable'}
            trendValue={metrics.job_queue_depth > 50 ? 'High load' : 'Normal'}
          />
        </div>

        {/* Cluster Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Compute Clusters</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {clusters.map((cluster, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">{cluster.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{cluster.nodes} nodes</div>
                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-green-600 rounded-full" style={{ width: `${cluster.util}%` }} />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{cluster.util}% utilization</div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cooling Load</h3>
            <div className="text-4xl font-bold text-cyan-600 mb-2">{metrics.cooling_load} kW</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Current cooling power consumption</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Network Throughput</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">{metrics.network_throughput} Gbps</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Current network bandwidth</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Carbon Intensity</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">{metrics.carbon_intensity}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">gCO₂/kWh grid intensity</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DataCenterDashboard() {
  return (
    <WebSocketProvider perspective="datacenter">
      <DataCenterDashboardContent />
    </WebSocketProvider>
  );
}
