/**
 * API Client for EcoSync Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Consumer API
export const consumerAPI = {
  getMetrics: (hours = 24) =>
    fetchAPI(`/consumer/metrics?hours=${hours}`),
  
  getRecommendations: () =>
    fetchAPI(`/consumer/recommendations`),
  
  updateSettings: (settings: Record<string, unknown>) =>
    fetchAPI(`/consumer/settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    }),
  
  getCarbonData: (energyKwh: number) =>
    fetchAPI(`/consumer/carbon?energy_kwh=${energyKwh}`),
  
  getCostEstimate: (energyKwh: number, peakKw?: number) =>
    fetchAPI(`/consumer/cost?energy_kwh=${energyKwh}${peakKw ? `&peak_kw=${peakKw}` : ''}`),
};

// Enterprise API
export const enterpriseAPI = {
  getMetrics: (hours = 24) =>
    fetchAPI(`/enterprise/metrics?hours=${hours}`),
  
  getRecommendations: () =>
    fetchAPI(`/enterprise/recommendations`),
  
  getZones: () =>
    fetchAPI(`/enterprise/zones`),
  
  updateZones: (zones: Record<string, unknown>) =>
    fetchAPI(`/enterprise/zones`, {
      method: 'POST',
      body: JSON.stringify(zones),
    }),
  
  getCompliance: () =>
    fetchAPI(`/enterprise/compliance`),
  
  getCarbonData: (energyKwh: number) =>
    fetchAPI(`/enterprise/carbon?energy_kwh=${energyKwh}`),
  
  getCostEstimate: (energyKwh: number, peakKw?: number) =>
    fetchAPI(`/enterprise/cost?energy_kwh=${energyKwh}${peakKw ? `&peak_kw=${peakKw}` : ''}`),
};

// Data Center API
export const datacenterAPI = {
  getMetrics: (hours = 24) =>
    fetchAPI(`/datacenter/metrics?hours=${hours}`),
  
  getRecommendations: () =>
    fetchAPI(`/datacenter/recommendations`),
  
  getPUEAnalytics: () =>
    fetchAPI(`/datacenter/pue`),
  
  getJobQueue: () =>
    fetchAPI(`/datacenter/jobs`),
  
  scheduleJob: (job: Record<string, unknown>) =>
    fetchAPI(`/datacenter/jobs`, {
      method: 'POST',
      body: JSON.stringify(job),
    }),
  
  getClusters: () =>
    fetchAPI(`/datacenter/clusters`),
  
  getCarbonData: (energyKwh: number) =>
    fetchAPI(`/datacenter/carbon?energy_kwh=${energyKwh}`),
  
  getCostEstimate: (energyKwh: number, peakKw?: number) =>
    fetchAPI(`/datacenter/cost?energy_kwh=${energyKwh}${peakKw ? `&peak_kw=${peakKw}` : ''}`),
};
