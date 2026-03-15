"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in Next.js
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Jamaica parish data with coordinates and energy levels
const jamaicaParishes = [
  { name: 'Kingston', lat: 17.9714, lng: -76.7931, energy: 92, areas: ['New Kingston', 'Half Way Tree', 'Downtown', 'Kingston 5', 'Port Royal'] },
  { name: 'St. Andrew', lat: 18.0179, lng: -76.8000, energy: 85, areas: ['Portmore', 'Spanish Town', 'Mandela', 'Linstead', 'Constant Spring'] },
  { name: 'St. Catherine', lat: 17.9500, lng: -77.0833, energy: 78, areas: ['Spanish Town', 'Portmore', 'Old Harbour', 'Bog Walk', 'Linstead'] },
  { name: 'Clarendon', lat: 17.8833, lng: -77.2333, energy: 65, areas: ['May Pen', 'Frankfield', 'Chapelton', 'Milk River', 'Rocky Point'] },
  { name: 'Manchester', lat: 18.0333, lng: -77.5000, energy: 58, areas: ['Mandeville', 'Christiana', 'Williamsfield', 'Porus', 'Balaclava'] },
  { name: 'St. Elizabeth', lat: 18.0167, lng: -77.7500, energy: 52, areas: ['Black River', 'Santa Cruz', 'Lacovia', 'Junction', 'Magotty'] },
  { name: 'Westmoreland', lat: 18.2000, lng: -78.1333, energy: 62, areas: ['Negril', 'Savanna-la-Mar', 'Grange Hill', 'Bluefields', 'Frome'] },
  { name: 'Hanover', lat: 18.4167, lng: -78.1333, energy: 48, areas: ['Lucea', 'Hopewell', 'Bethel', 'Green Island', 'Rose Hall'] },
  { name: 'St. James', lat: 18.5000, lng: -77.9167, energy: 75, areas: ['Montego Bay', 'Irons Shore', 'Cambridge', 'Reading', 'Catadupa'] },
  { name: 'Trelawny', lat: 18.4167, lng: -77.6667, energy: 50, areas: ['Falmouth', 'Martha Brae', 'Clark\'s Town', 'Duncans', 'Albert Town'] },
  { name: 'St. Ann', lat: 18.4000, lng: -77.2000, energy: 58, areas: ['Ocho Rios', 'St. Ann\'s Bay', 'Runaway Bay', 'Discovery Bay', 'Priory'] },
  { name: 'St. Mary', lat: 18.3667, lng: -76.9500, energy: 45, areas: ['Port Maria', 'Oracabessa', 'Island Head', 'Boscobel', 'Annotto Bay'] },
  { name: 'Portland', lat: 18.1667, lng: -76.5833, energy: 40, areas: ['Port Antonio', 'Buff Bay', 'Long Bay', 'Boston', 'Moore Town'] },
  { name: 'St. Thomas', lat: 17.9667, lng: -76.2333, energy: 42, areas: ['Morant Bay', 'Bath', 'Yallahs', 'Seaforth', 'Golden Grove'] },
];

interface OpenStreetMapProps {
  selectedParish: string | null;
  onParishSelect: (parish: string | null) => void;
}

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

export default function OpenStreetMap({ selectedParish, onParishSelect }: OpenStreetMapProps) {
  const [selectedParishData, setSelectedParishData] = useState<typeof jamaicaParishes[0] | null>(null);
  const [streetData, setStreetData] = useState<{ name: string; energy: number }[]>([]);

  // Get energy color
  const getEnergyColor = (energy: number): string => {
    if (energy >= 80) return '#ef4444';
    if (energy >= 60) return '#f97316';
    if (energy >= 40) return '#facc15';
    return '#22c55e';
  };

  // Get energy opacity based on level
  const getEnergyOpacity = (energy: number): number => {
    return 0.3 + (energy / 100) * 0.5;
  };

  // Handle parish click
  const handleParishClick = (parish: typeof jamaicaParishes[0]) => {
    setSelectedParishData(parish);
    onParishSelect(parish.name);
    
    // Generate street-level data for the parish
    const streets = parish.areas.map((area, i) => ({
      name: area,
      energy: Math.floor(parish.energy * 0.7 + Math.random() * parish.energy * 0.3)
    }));
    setStreetData(streets);
  };

  // Reset to Jamaica view
  const handleReset = () => {
    setSelectedParishData(null);
    onParishSelect(null);
    setStreetData([]);
  };

  const jamaicaCenter: [number, number] = [18.1096, -77.2975];

  return (
    <div className="w-full">
      {/* Map Container */}
      <div className="relative w-full h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700 fade-in-up">
        <MapContainer
          center={jamaicaCenter}
          zoom={selectedParishData ? 11 : 9}
          scrollWheelZoom={true}
          className="w-full h-full"
          key={selectedParishData?.name || 'jamaica'}
        >
          {/* OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Parish Markers with Heatmap Circles */}
          {jamaicaParishes.map((parish) => (
            <CircleMarker
              key={parish.name}
              center={[parish.lat, parish.lng]}
              radius={selectedParishData?.name === parish.name ? 25 : 18}
              pathOptions={{
                color: getEnergyColor(parish.energy),
                fillColor: getEnergyColor(parish.energy),
                fillOpacity: getEnergyOpacity(parish.energy),
                weight: selectedParishData?.name === parish.name ? 4 : 2,
              }}
              eventHandlers={{
                click: () => handleParishClick(parish),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{parish.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: getEnergyColor(parish.energy) }}
                    />
                    <span className="font-semibold" style={{ color: getEnergyColor(parish.energy) }}>
                      {parish.energy}% Energy Usage
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Click to view streets</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Street-level markers when parish is selected */}
          {selectedParishData && streetData.map((street, i) => {
            // Generate slightly offset positions around parish center
            const offsetLat = selectedParishData.lat + (Math.random() - 0.5) * 0.15;
            const offsetLng = selectedParishData.lng + (Math.random() - 0.5) * 0.15;
            
            return (
              <CircleMarker
                key={street.name}
                center={[offsetLat, offsetLng]}
                radius={12}
                pathOptions={{
                  color: getEnergyColor(street.energy),
                  fillColor: getEnergyColor(street.energy),
                  fillOpacity: 0.7,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[150px]">
                    <h4 className="font-bold text-gray-900 mb-1">{street.name}</h4>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getEnergyColor(street.energy) }}
                      />
                      <span className="font-semibold text-sm" style={{ color: getEnergyColor(street.energy) }}>
                        {street.energy}% Usage
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Click handler to reset view */}
          <MapClickHandler onMapClick={() => {}} />
        </MapContainer>

        {/* Back Button (when parish is selected) */}
        {selectedParishData && (
          <button
            onClick={handleReset}
            className="absolute top-4 left-4 z-[1000] px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-200 dark:border-gray-700"
          >
            ← Back to Jamaica
          </button>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-gray-800/95 rounded-xl p-3 shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Energy Usage</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22c55e' }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">Low (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#facc15' }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">Medium (40-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f97316' }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">High (60-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">Very High (&gt;80%)</span>
            </div>
          </div>
        </div>

        {/* Info Badge */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-gray-800/95 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇯🇲</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedParishData ? `${selectedParishData.name} Parish` : 'Jamaica'}
            </span>
          </div>
        </div>
      </div>

      {/* Street List (when parish selected) */}
      {selectedParishData && streetData.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 fade-in-up">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📍 {selectedParishData.name} - Street Level Energy Data
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streetData.map((street, i) => (
              <div 
                key={street.name}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-l-4 hover:shadow-lg transition-all"
                style={{ borderLeftColor: getEnergyColor(street.energy) }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{street.name}</h4>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getEnergyColor(street.energy) }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${street.energy}%`,
                        backgroundColor: getEnergyColor(street.energy)
                      }}
                    />
                  </div>
                  <span className="font-bold text-sm" style={{ color: getEnergyColor(street.energy) }}>
                    {street.energy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
