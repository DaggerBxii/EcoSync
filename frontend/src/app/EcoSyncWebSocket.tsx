'use client';

import { useState, useEffect, useRef } from 'react';

interface EcoSyncData {
  timestamp: string;
  system_status: string;
  scale_level: number;
  metrics: {
    watts: number;
    occupancy: number;
    carbon_saved: number;
  };
  ai_insight: string;
  is_anomaly: boolean;
  confidence_score: number;
  unnecessary_usage_detected?: boolean;
  optimization_opportunities?: string[];
}

export default function EcoSyncWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [data, setData] = useState<EcoSyncData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use environment variable for WebSocket URL, fallback to localhost for development
  const wsUrl = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8000/ws`
    : 'ws://localhost:8000/ws';

  useEffect(() => {
    const connect = () => {
      console.log('Attempting to connect to:', wsUrl);
      setConnectionStatus('connecting');
      
      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('connected');
          setError(null);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const jsonData: EcoSyncData = JSON.parse(event.data);
            setData(jsonData);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
            setError('Failed to parse incoming data');
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          setConnectionStatus('disconnected');
          
          // Attempt to reconnect after a delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
          setError('WebSocket connection error');
        };
      } catch (err) {
        console.error('Failed to create WebSocket:', err);
        setConnectionStatus('error');
        setError('Failed to create WebSocket connection');
        
        // Attempt to reconnect after a delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };

    connect();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wsUrl]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-black dark:text-white">Live EcoSync Data</h3>
        <div className={`flex items-center gap-2 ${getStatusColor()}`}>
          <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="capitalize">{connectionStatus}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Power Usage</div>
              <div className="text-2xl font-bold text-ecosync-green">{data.metrics.watts}kW</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Occupancy</div>
              <div className="text-2xl font-bold text-ecosync-blue">{data.metrics.occupancy} people</div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">System Status</div>
            <div className="text-lg font-semibold capitalize">{data.system_status}</div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Efficiency Scale</div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
              <div 
                className="bg-ecosync-green h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${data.scale_level * 100}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">{(data.scale_level * 100).toFixed(0)}%</div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">AI Insight</div>
            <div className="text-gray-800 dark:text-gray-200">{data.ai_insight}</div>
          </div>

          {data.unnecessary_usage_detected && data.optimization_opportunities && data.optimization_opportunities.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold mb-2">Optimization Opportunities</div>
              <ul className="space-y-1">
                {data.optimization_opportunities.map((opportunity, index) => (
                  <li key={index} className="text-sm text-yellow-600 dark:text-yellow-400 flex items-start">
                    <span className="mr-2">•</span>
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {connectionStatus === 'connecting' ? 'Connecting to EcoSync backend...' : 'Waiting for data...'}
        </div>
      )}
    </div>
  );
}