'use client'
import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sparkles, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

import Lighting from './Lighting'
import Monitor from './Monitor'
import Floor from './Floor'
import CameraRig from './CameraRig'

import DashboardScreen from './screens/DashboardScreen'
import CodeScreen from './screens/CodeScreen'
import DesignScreen from './screens/DesignScreen'

export default function CinematicBackground() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-w-768px)')
    setIsMobile(mq.matches)
    
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-[#07070a] pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, 1.2, 8], fov: 52 }}
        shadows="percentage"
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        {/* Quality/Performance optimizations */}
        <AdaptiveDpr />
        <AdaptiveEvents />

        {/* Cinematic Fog */}
        <fog attach="fog" args={['#07070a', 10, 22]} />

        {/* 1. Scene Lights */}
        <Lighting />

        {/* 2. Monitors */}
        {/* Monitor 1 - Left angled */}
        <Monitor
          position={[-3.2, 0.2, -1.5]}
          rotation={[0, 0.35, 0]}
          speed={0.7}
          glowColor="#1d7ef5"
        >
          <DashboardScreen />
        </Monitor>

        {/* Monitor 2 - Center back (largest) */}
        <Monitor
          position={[0, 0.5, -3.2]}
          rotation={[0, 0, 0]}
          width={3.4}
          height={2.1}
          speed={0.5}
          glowColor="#1560c0"
        >
          <CodeScreen />
        </Monitor>

        {/* Monitor 3 - Right angled */}
        <Monitor
          position={[3.2, 0.2, -1.5]}
          rotation={[0, -0.35, 0]}
          speed={0.9}
          glowColor="#1040cc"
        >
          <DesignScreen />
        </Monitor>

        {/* 3. Ambient Sparkles (180 for desktop, 80 for mobile) */}
        <Sparkles
          count={isMobile ? 80 : 180}
          size={0.6}
          speed={0.15}
          opacity={0.4}
          color="#1d7ef5"
          scale={[14, 8, 8]}
          position={[0, 0, -2]}
        />

        {/* 4. Reflective Floor */}
        <Floor />

        {/* 5. Camera Drift Rig */}
        <CameraRig />

        {/* 6. Postprocessing Composer */}
        {isMobile ? (
          <EffectComposer>
            <Vignette
              offset={0.25}
              darkness={0.75}
              eskil={false}
            />
            <Noise
              opacity={0.022}
              blendFunction={BlendFunction.ADD}
              premultiply
            />
          </EffectComposer>
        ) : (
          <EffectComposer>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <Vignette
              offset={0.25}
              darkness={0.75}
              eskil={false}
            />
            <Noise
              opacity={0.022}
              blendFunction={BlendFunction.ADD}
              premultiply
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
