'use client'

export default function Lighting() {
  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={0.08} />

      {/* Point Light - Key (Top Center) */}
      <pointLight 
        position={[0, 8, 4]} 
        color="#1d7ef5" 
        intensity={2.0} 
        decay={1.5}
      />

      {/* Point Light - Fill (Left) */}
      <pointLight 
        position={[-6, 2, 2]} 
        color="#1d4ef5" 
        intensity={1.2} 
        decay={1.5}
      />

      {/* Point Light - Fill (Right) */}
      <pointLight 
        position={[6, 2, 2]} 
        color="#3060dd" 
        intensity={0.8} 
        decay={1.5}
      />

      {/* Spotlight (Cinematic Top) */}
      <spotLight
        position={[0, 10, 5]}
        color="#1d7ef5"
        intensity={8.0}
        angle={0.4}
        penumbra={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
    </>
  )
}
