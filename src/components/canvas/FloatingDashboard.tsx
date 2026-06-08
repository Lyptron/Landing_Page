'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingDashboardProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  floatOffset?: number
}

export default function FloatingDashboard({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  floatOffset = 2.1
}: FloatingDashboardProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    
    // Y oscillation (frame-rate independent)
    groupRef.current.position.y = position[1] + Math.sin(t * 0.28 + floatOffset) * 0.25
    
    // Rotation Y slow drift
    groupRef.current.rotation.y = rotation[1] + t * 0.04
    groupRef.current.rotation.z = (rotation[2] || 0) + Math.cos(t * 0.4) * 0.01
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Card Base */}
      <mesh>
        <boxGeometry args={[2.4, 1.6, 0.06]} />
        <meshPhysicalMaterial
          color="#111114"
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.7}
          transmission={0.4}
          thickness={0.4}
        />
      </mesh>

      {/* Grid line indicator */}
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[2.2, 1.4]} />
        <meshBasicMaterial color="#ffffff" opacity={0.02} transparent />
      </mesh>

      {/* Torus Donut Chart */}
      <group position={[-0.5, 0.1, 0.04]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.3, 0.07, 16, 100]} />
          <meshStandardMaterial color="#1d7ef5" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.305, 0.072, 16, 30]} />
          <meshStandardMaterial color="#22c55e" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>

      {/* Bar Chart bars */}
      <group position={[0.4, -0.4, 0.04]}>
        {/* Bar 1 */}
        <mesh position={[-0.2, 0.2, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.02]} />
          <meshStandardMaterial color="#1d7ef5" />
        </mesh>
        {/* Bar 2 */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.02]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        {/* Bar 3 */}
        <mesh position={[0.2, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.3, 0.02]} />
          <meshStandardMaterial color="#c0c0cc" />
        </mesh>
      </group>
    </group>
  )
}
