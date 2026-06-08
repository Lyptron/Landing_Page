'use client'
import { useFrame } from '@react-three/fiber'

export default function CameraRig() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    state.camera.position.x = Math.sin(t * 0.08) * 0.8
    state.camera.position.y = 1.2 + Math.cos(t * 0.05) * 0.25
    state.camera.lookAt(0, 0.2, 0)
  })
  return null
}
