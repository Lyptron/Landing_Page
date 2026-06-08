'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingBrowserProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  floatOffset?: number
}

export default function FloatingBrowser({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  floatOffset = 0
}: FloatingBrowserProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const clock = state.clock
    const t = clock.getElapsedTime()
    
    // Y oscillation (frame-rate independent)
    groupRef.current.position.y = position[1] + Math.sin(t * 0.28 + floatOffset) * 0.25
    
    // Gentle Z sway
    groupRef.current.rotation.z = Math.sin(t * 0.28 + floatOffset) * 0.008
    groupRef.current.rotation.y = rotation[1] + Math.cos(t * 0.4) * 0.02
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Browser Card Frame */}
      <mesh>
        <boxGeometry args={[3, 1.8, 0.08]} />
        <meshPhysicalMaterial
          color="#18181c"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.85}
          transmission={0.3}
          thickness={0.5}
        />
      </mesh>
      
      {/* Browser Screen Glass (inset) */}
      <mesh position={[0, -0.1, 0.045]}>
        <planeGeometry args={[2.8, 1.4]} />
        <meshPhysicalMaterial
          color="#111114"
          roughness={0.1}
          metalness={0.8}
          clearcoat={1.0}
        />
      </mesh>

      {/* Title bar dots */}
      <mesh position={[-1.2, 0.72, 0.05]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#ff5f56" />
      </mesh>
      <mesh position={[-1.05, 0.72, 0.05]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#ffbd2e" />
      </mesh>
      <mesh position={[-0.9, 0.72, 0.05]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#27c93f" />
      </mesh>

      {/* Grid Lines inside browser representing a UI */}
      <gridHelper args={[2.5, 8, '#1d7ef5', '#222226']} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0.05]} />
    </group>
  )
}
