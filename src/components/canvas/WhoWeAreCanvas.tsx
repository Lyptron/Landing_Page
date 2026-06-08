'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function IcosahedronMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[3, 1]} />
      <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.55} />
    </mesh>
  )
}

export default function WhoWeAreCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <IcosahedronMesh />
    </Canvas>
  )
}
