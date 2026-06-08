'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingCodeProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  floatOffset?: number
}

export default function FloatingCode({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  floatOffset = 3.0
}: FloatingCodeProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    
    // Y oscillation (frame-rate independent)
    groupRef.current.position.y = position[1] + Math.sin(t * 0.28 + floatOffset) * 0.25
    
    // Slight rotation on all axes
    groupRef.current.rotation.x = rotation[0] + Math.sin(t * 0.15) * 0.02
    groupRef.current.rotation.y = rotation[1] + Math.cos(t * 0.12) * 0.03
    groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.01
  })

  // Helper arrays to generate code lines
  const lines = [
    { width: 1.2, color: '#1d7ef5', x: -0.4, y: 0.3 },
    { width: 1.8, color: '#22c55e', x: -0.1, y: 0.15 },
    { width: 0.8, color: '#c0c0cc', x: -0.6, y: 0.0 },
    { width: 1.5, color: '#a855f7', x: -0.25, y: -0.15 },
    { width: 1.1, color: '#eab308', x: -0.45, y: -0.3 },
    { width: 0.6, color: '#1d7ef5', x: -0.7, y: -0.45 },
  ]

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Editor Box */}
      <mesh>
        <boxGeometry args={[2.5, 1.5, 0.07]} />
        <meshPhysicalMaterial
          color="#0f0f11"
          roughness={0.4}
          metalness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Editor Screen Glass Inset */}
      <mesh position={[0, -0.05, 0.038]}>
        <planeGeometry args={[2.3, 1.2]} />
        <meshBasicMaterial color="#08080a" />
      </mesh>

      {/* Dots (Window Control) */}
      <mesh position={[-1.0, 0.6, 0.045]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ff5f56" />
      </mesh>
      <mesh position={[-0.88, 0.6, 0.045]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ffbd2e" />
      </mesh>
      <mesh position={[-0.76, 0.6, 0.045]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#27c93f" />
      </mesh>

      {/* Code Lines */}
      {lines.map((line, idx) => (
        <mesh key={idx} position={[line.x, line.y, 0.042]}>
          <planeGeometry args={[line.width, 0.05]} />
          <meshBasicMaterial color={line.color} />
        </mesh>
      ))}
    </group>
  )
}
