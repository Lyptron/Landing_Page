'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingMobileProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  floatOffset?: number
}

export default function FloatingMobile({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  floatOffset = 1.8
}: FloatingMobileProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    
    // Y oscillation (frame-rate independent)
    groupRef.current.position.y = position[1] + Math.sin(t * 0.28 + floatOffset) * 0.25
    
    // Rotation X sway
    groupRef.current.rotation.x = rotation[0] + Math.sin(t * 0.2) * 0.05
    groupRef.current.rotation.y = rotation[1] + Math.cos(t * 0.4) * 0.02
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Phone Chassis */}
      <mesh>
        <boxGeometry args={[1.0, 2.0, 0.08]} />
        <meshPhysicalMaterial
          color="#18181c"
          roughness={0.1}
          metalness={0.8}
          clearcoat={1.0}
        />
      </mesh>

      {/* Screen Inset */}
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[0.92, 1.9]} />
        <meshPhysicalMaterial
          color="#0a0a0b"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Speaker / Notch */}
      <mesh position={[0, 0.88, 0.046]}>
        <boxGeometry args={[0.3, 0.04, 0.01]} />
        <meshBasicMaterial color="#111" />
      </mesh>

      {/* Screen Mockup Content (UI) */}
      <group position={[0, 0, 0.045]}>
        {/* Status bar mock */}
        <mesh position={[-0.3, 0.82, 0]}>
          <planeGeometry args={[0.15, 0.03]} />
          <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
        </mesh>
        <mesh position={[0.3, 0.82, 0]}>
          <planeGeometry args={[0.15, 0.03]} />
          <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
        </mesh>
        
        {/* Cards on Screen */}
        <mesh position={[0, 0.4, 0]}>
          <planeGeometry args={[0.76, 0.45]} />
          <meshBasicMaterial color="#1d7ef5" opacity={0.4} transparent />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <planeGeometry args={[0.76, 0.45]} />
          <meshBasicMaterial color="#22c55e" opacity={0.3} transparent />
        </mesh>
        <mesh position={[0, -0.65, 0]}>
          <planeGeometry args={[0.76, 0.3]} />
          <meshBasicMaterial color="#c0c0cc" opacity={0.2} transparent />
        </mesh>
      </group>
    </group>
  )
}
