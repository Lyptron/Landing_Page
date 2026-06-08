'use client'
import { MeshReflectorMaterial } from '@react-three/drei'

export default function Floor() {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -2.4, 0]} 
      receiveShadow
    >
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={512}
        mixBlur={1.0}
        mixStrength={12.0}
        depthScale={1.0}
        minDepthThreshold={0.85}
        color="#07070a"
        metalness={0.5}
        roughness={1.0}
        mirror={0}
      />
    </mesh>
  )
}
