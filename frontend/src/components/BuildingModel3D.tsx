"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Html, Environment, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import { getResourceColor } from "@/lib/colorScales";
import type { ResourceKey } from "@/lib/colorScales";

export interface FloorData {
  floor: number;
  name: string;
  efficiency: number;
  occupancy: number;
  maxOccupancy: number;
  resources: {
    electricity: number;
    hvac: number;
    water: number;
    lighting: number;
    airQuality: number;
    internet?: number;
  };
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  alerts: number;
  status: "optimal" | "warning" | "critical";
}

interface BuildingModelProps {
  floors: FloorData[];
  selectedResource: ResourceKey;
  selectedFloor: number | null;
  onFloorClick: (floor: number) => void;
  isPlaying: boolean;
}

interface FloorMeshProps {
  floor: FloorData;
  index: number;
  totalFloors: number;
  selectedResource: ResourceKey;
  isSelected: boolean;
  onClick: () => void;
  isPlaying: boolean;
}

function FloorMesh({ floor, index, totalFloors, selectedResource, isSelected, onClick, isPlaying }: FloorMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Calculate floor dimensions based on floor number
  const floorWidth = 4 + (totalFloors - floor.floor) * 0.3;
  const floorDepth = 2.5 + (totalFloors - floor.floor) * 0.2;
  const floorHeight = 0.4;
  const yPosition = index * 0.5;
  
  // Get color based on resource and efficiency
  const resourceValue = (selectedResource !== "internet" ? floor.resources[selectedResource] : floor.resources.internet) || floor.efficiency;
  const baseColor = getResourceColor(selectedResource, resourceValue);
  
  // Convert hex color to THREE.Color
  const color = useMemo(() => {
    return new THREE.Color(baseColor);
  }, [baseColor]);
  
  // Animate color on hover and selection
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.08 : hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Subtle floating animation when playing
      if (isPlaying && !isSelected) {
        meshRef.current.position.y = yPosition + Math.sin(state.clock.elapsedTime * 2 + index) * 0.02;
      }
    }
  });
  
  // Status indicator color
  const statusColor = floor.status === "critical" ? "#ef4444" : 
                      floor.status === "warning" ? "#f59e0b" : "#10b981";
  
  return (
    <group position={[0, yPosition, 0]}>
      {/* Main floor mesh */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[floorWidth, floorHeight, floorDepth]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.95 : hovered ? 0.9 : 0.85}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Floor number label */}
      <Text
        position={[floorWidth / 2 + 0.3, 0, 0]}
        fontSize={0.3}
        color="white"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {floor.floor}F
      </Text>
      
      {/* Resource value label */}
      <Text
        position={[-floorWidth / 2 - 0.3, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="right"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {resourceValue.toFixed(1)}
      </Text>
      
      {/* Status indicator */}
      <mesh position={[0, floorHeight / 2 + 0.15, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Alert indicator if there are alerts */}
      {floor.alerts > 0 && (
        <Float speed={5} rotationIntensity={2} floatIntensity={0.5}>
          <mesh position={[floorWidth / 2, floorHeight / 2 + 0.1, floorDepth / 2]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={1}
            />
          </mesh>
        </Float>
      )}
      
      {/* Selection highlight ring */}
      {isSelected && (
        <mesh position={[0, -floorHeight / 2 - 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[floorWidth * 0.6, floorWidth * 0.65, 32]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function BuildingBase({ totalFloors }: { totalFloors: number }) {
  return (
    <group position={[0, -0.3, 0]}>
      {/* Building foundation */}
      <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.3, 3.5]} />
        <meshStandardMaterial color="#374151" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}

function BuildingEntrance({ totalFloors }: { totalFloors: number }) {
  return (
    <group position={[0, 0, 2]}>
      {/* Entrance canopy */}
      <mesh position={[0, 0.2, 0.5]} castShadow>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.5} />
      </mesh>
      
      {/* Entrance columns */}
      <mesh position={[-0.8, 0.1, 0.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.8, 0.1, 0.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.3} />
      </mesh>
      
      {/* Glass doors */}
      <mesh position={[0, 0.2, 0.55]}>
        <boxGeometry args={[1.2, 0.35, 0.05]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
        />
      </mesh>
    </group>
  );
}

function BuildingRoof({ totalFloors, buildingHeight }: { totalFloors: number; buildingHeight: number }) {
  const roofY = buildingHeight - 0.2;
  
  return (
    <group position={[0, roofY, 0]}>
      {/* Main roof */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[4.5, 0.2, 3]} />
        <meshStandardMaterial color="#4b5563" roughness={0.6} metalness={0.4} />
      </mesh>
      
      {/* HVAC units on roof */}
      <mesh position={[1, 0.35, 0.8]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <meshStandardMaterial color="#6b7280" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[-1, 0.35, 0.8]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <meshStandardMaterial color="#6b7280" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Antenna */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} metalness={0.5} />
      </mesh>
      
      {/* Red warning light */}
      <Float speed={3} rotationIntensity={0} floatIntensity={0.3}>
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
        </mesh>
      </Float>
    </group>
  );
}

export default function BuildingModel({ floors, selectedResource, selectedFloor, onFloorClick, isPlaying }: BuildingModelProps) {
  const [showTooltip, setShowTooltip] = useState<{ floor: number; x: number; y: number } | null>(null);
  
  const totalFloors = floors.length;
  const buildingHeight = totalFloors * 0.5 + 0.5;
  
  const handleFloorClick = (floorNum: number) => {
    onFloorClick(floorNum);
  };
  
  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        shadows
        camera={{ position: [8, 5, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -5]} intensity={0.5} />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Building group */}
        <group position={[0, 0, 0]}>
          {/* Base and entrance */}
          <BuildingBase totalFloors={totalFloors} />
          <BuildingEntrance totalFloors={totalFloors} />
          
          {/* Floors */}
          {floors.map((floor, index) => (
            <FloorMesh
              key={floor.floor}
              floor={floor}
              index={index}
              totalFloors={totalFloors}
              selectedResource={selectedResource}
              isSelected={selectedFloor === floor.floor}
              onClick={() => handleFloorClick(floor.floor)}
              isPlaying={isPlaying}
            />
          ))}
          
          {/* Roof */}
          <BuildingRoof totalFloors={totalFloors} buildingHeight={buildingHeight} />
        </group>
        
        {/* Shadows */}
        <ContactShadows
          position={[0, -0.6, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={4}
        />
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          target={[0, buildingHeight / 2 - 1, 0]}
        />
      </Canvas>
      
      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-xl p-4 border shadow-lg max-w-xs">
        <h3 className="font-bold text-sm mb-2">3D Building View</h3>
        <p className="text-xs text-muted-foreground">
          Click on any floor to view details. Drag to rotate. Scroll to zoom.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
