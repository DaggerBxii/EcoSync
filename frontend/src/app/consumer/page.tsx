"use client";

import { useState, useEffect } from 'react';
import { Navigation, MetricCard, StatusIndicator, AlertBanner, WebSocketProvider, useWebSocket } from '@/components/shared';
import { ConsumerMetrics } from '@/types';

// Consumer-specific icons
const BoltIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const SolarIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" fill="currentColor"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const LeafIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M12 21c4.97-4.97 7-9 7-14-4.97 0-9 2.03-14 7 0 5 2.03 9.03 7 14z" fill="currentColor"/>
  </svg>
);

const HomeIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ConsumerDashboardContent() {
  const { isConnected, status, lastMessage, send } = useWebSocket();
  const [metrics, setMetrics] = useState<ConsumerMetrics>({
    watts: 2450,
    occupancy: 3,
    carbon_saved: 4.2,
    solar_generation: 3200,
    appliances_active: 5,
    hvac_setpoint: 22,
    battery_level: 78,
    grid_import: 0,
  });
  const [aiInsight, setAiInsight] = useState('System operating normally');

  useEffect(() => {
    if (lastMessage) {
      const data = lastMessage as { metrics?: ConsumerMetrics; ai_insight?: string };
      if (data.metrics) setMetrics(data.metrics);
      if (data.ai_insight) setAiInsight(data.ai_insight);
    }

    // Send metrics update to simulate real-time data
    const interval = setInterval(() => {
      const newMetrics = {
        watts: Math.floor(2000 + Math.random() * 1500),
        occupancy: Math.floor(Math.random() * 5),
        carbon_saved: Number((3 + Math.random() * 3).toFixed(2)),
        solar_generation: Math.floor(2500 + Math.random() * 1500),
        appliances_active: Math.floor(3 + Math.random() * 5),
        hvac_setpoint: 22,
        battery_level: Math.floor(70 + Math.random() * 20),
        grid_import: Math.floor(Math.random() * 500),
      };
      
      send({
        type: 'metrics_update',
        timestamp: new Date().toISOString(),
        metrics: newMetrics,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [lastMessage, send]);

  const getStatus = (): 'optimal' | 'warning' | 'critical' => {
    if (metrics.watts > 4000 || metrics.battery_level < 20) return 'warning';
    if (metrics.watts > 5000 || metrics.battery_level < 10) return 'critical';
    return 'optimal';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <Navigation currentPerspective="consumer" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consumer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor and optimize your home energy</p>
          </div>
          <StatusIndicator status={getStatus()} size="lg" />
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <AlertBanner
            type="warning"
            title="Connecting to EcoSync..."
            message="Establishing real-time connection to your home energy system"
            className="mb-8"
          />
        )}

        {/* AI Insight */}
        <AlertBanner
          type="success"
          title="Energy Optimization Active"
          message={aiInsight}
          className="mb-8"
        />

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            value={metrics.watts.toLocaleString()}
            label="Current Power"
            unit="W"
            icon={<BoltIcon />}
            trend="stable"
            trendValue="vs last hour"
          />
          <MetricCard
            value={metrics.solar_generation.toLocaleString()}
            label="Solar Generation"
            unit="W"
            icon={<SolarIcon />}
            trend="up"
            trendValue="+12% today"
            color="text-green-600"
          />
          <MetricCard
            value={metrics.carbon_saved.toFixed(1)}
            label="Carbon Saved"
            unit="kg"
            icon={<LeafIcon />}
            trend="up"
            trendValue="today"
            color="text-green-600"
          />
          <MetricCard
            value={metrics.battery_level}
            label="Battery Level"
            unit="%"
            icon={<HomeIcon />}
            trend={metrics.battery_level > 50 ? 'up' : 'down'}
            trendValue={metrics.battery_level > 50 ? 'Charging' : 'Discharging'}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Appliances</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">{metrics.appliances_active}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Devices currently using power</p>
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: `${(metrics.appliances_active / 10) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">HVAC Setpoint</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">{metrics.hvac_setpoint}°C</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Target temperature</p>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold">-</button>
              <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">+</button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Home Occupancy</h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">{metrics.occupancy}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">People detected</p>
            <div className="mt-4 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${i < metrics.occupancy ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConsumerDashboard() {
  return (
    <WebSocketProvider perspective="consumer">
      <ConsumerDashboardContent />
    </WebSocketProvider>
  );
}
