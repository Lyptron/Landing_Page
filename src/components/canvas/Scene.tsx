'use client'
import { Canvas } from '@react-three/fiber'
import { Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { Suspense } from 'react'
import FloatingBrowser from './FloatingBrowser'
import FloatingDashboard from './FloatingDashboard'
import FloatingCode from './FloatingCode'
import FloatingMobile from './FloatingMobile'
import ParticleField from './ParticleField'

export default function Scene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 14], fov: 55 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Lighting */}
      <ambientLight intensity={0.4} color="#6677bb" />
      <pointLight position={[5, 6, 10]} intensity={3.5} color="#5566ee" />
      <pointLight position={[-6, -4, 7]} intensity={2.0} color="#3344bb" />
      <pointLight position={[0, 8, -5]}  intensity={1.5} color="#7788cc" />

      <Suspense fallback={null}>
        {/* Browser windows */}
        <FloatingBrowser position={[-4.5, 1.5, -2]} rotation={[0, 0.28, 0]}  floatOffset={0}   />
        <FloatingBrowser position={[ 4.2, 2.0, -4]} rotation={[0, -0.25, 0]} floatOffset={1.4} />

        {/* Dashboard */}
        <FloatingDashboard position={[4.8, -1.0, -1]} rotation={[0, -0.22, 0]} floatOffset={2.1} />

        {/* Code editor */}
        <FloatingCode position={[-5, -1.5, -2]} rotation={[0, 0.24, 0]} floatOffset={3.0} />

        {/* Mobile phones */}
        <FloatingMobile position={[0,    -3.5, -1]} rotation={[0.08,  0.1,  0]} floatOffset={1.8} />
        <FloatingMobile position={[2.5,   3.2, -3]} rotation={[-0.05, -0.15, 0]} floatOffset={0.6} scale={0.75} />

        {/* Atmosphere */}
        <ParticleField count={800} />
      </Suspense>

      <Preload all />
    </Canvas>
  )
}
