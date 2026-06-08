'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
}

export default function ParticleField({ count = 800 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const posArr = new Float32Array(count * 3)
    const colArr = new Float32Array(count * 3)

    const colorPalette = [
      new THREE.Color('#1d7ef5'), // Blue
      new THREE.Color('#c0c0cc'), // Silver
      new THREE.Color('#ffffff'), // White
    ]

    for (let i = 0; i < count; i++) {
      const idx = i * 3

      // Spherical trigonometric distribution
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 6 + Math.random() * 14

      posArr[idx] = r * Math.sin(phi) * Math.cos(theta)
      posArr[idx + 1] = r * Math.sin(phi) * Math.sin(theta)
      posArr[idx + 2] = r * Math.cos(phi) - 2 // Pushed back in Z

      // Color selection & brightness mix
      const selectedColor = colorPalette[Math.floor(Math.random() * colorPalette.length)].clone()
      const brightness = 0.15 + Math.random() * 0.4
      selectedColor.multiplyScalar(brightness)

      colArr[idx] = selectedColor.r
      colArr[idx + 1] = selectedColor.g
      colArr[idx + 2] = selectedColor.b
    }

    return [posArr, colArr]
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    
    const t = state.clock.getElapsedTime()
    const mouse = state.mouse

    // Time-based slow rotation + direct mouse parallax (drift-free, rate-independent)
    pointsRef.current.rotation.y = t * 0.02 + mouse.x * 0.12
    pointsRef.current.rotation.x = t * 0.01 + mouse.y * 0.08

    // Global camera parallax (lerped smoothly, consolidated here to avoid multi-instance conflicts)
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.x * 1.6, 0.03)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mouse.y * 1.6, 0.03)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
