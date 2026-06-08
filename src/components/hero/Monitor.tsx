'use client'
import React from 'react'
import { Float, Html } from '@react-three/drei'

interface MonitorProps {
  position: [number, number, number]
  rotation: [number, number, number]
  width?: number        // default 2.8
  height?: number       // default 1.7
  glowColor?: string    // default #1d7ef5
  speed?: number        // Float speed, default 0.8
  children: React.ReactNode  // The screen content
}

export default function Monitor({
  position,
  rotation,
  width = 2.8,
  height = 1.7,
  glowColor = '#1d7ef5',
  speed = 0.8,
  children
}: MonitorProps) {
  
  return (
    <Float
      speed={speed}
      rotationIntensity={0.12}
      floatIntensity={0.35}
      floatingRange={[-0.08, 0.08]}
    >
      <group position={position} rotation={rotation}>
        {/* Outer bezel */}
        <mesh castShadow>
          <boxGeometry args={[width + 0.22, height + 0.22, 0.07]} />
          <meshStandardMaterial 
            color="#0c0c10" 
            metalness={0.85} 
            roughness={0.15} 
          />
        </mesh>

        {/* Screen surface */}
        <mesh position={[0, 0, 0.042]}>
          <boxGeometry args={[width, height, 0.005]} />
          <meshStandardMaterial 
            color="#080810" 
            emissive={glowColor} 
            emissiveIntensity={0.06} 
          />
        </mesh>

        {/* Screen content via HTML transform */}
        <Html
          transform
          occlude
          position={[0, 0, 0.048]}
          style={{
            width: `${width * 100}px`,
            height: `${height * 100}px`,
            overflow: 'hidden',
            borderRadius: '2px',
            pointerEvents: 'none'
          }}
        >
          <div className="w-full h-full overflow-hidden select-none">
            {children}
          </div>
        </Html>

        {/* Screen edge glow light */}
        <pointLight
          position={[0, 0, 0.8]}
          color={glowColor}
          intensity={1.8}
          distance={4}
          decay={2}
        />

        {/* Monitor stand (vertical pole) */}
        <mesh position={[0, -(height / 2 + 0.22), 0]}>
          <boxGeometry args={[0.06, 0.35, 0.06]} />
          <meshStandardMaterial 
            color="#080810" 
            metalness={0.9} 
            roughness={0.2}
          />
        </mesh>

        {/* Monitor stand (base plate) */}
        <mesh position={[0, -(height / 2 + 0.38), 0]}>
          <boxGeometry args={[0.7, 0.04, 0.3]} />
          <meshStandardMaterial 
            color="#080810" 
            metalness={0.9} 
            roughness={0.2}
          />
        </mesh>
      </group>
    </Float>
  )
}
