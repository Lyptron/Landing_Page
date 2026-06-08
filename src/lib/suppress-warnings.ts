'use client'

if (typeof window !== 'undefined') {
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      (args[0].includes('THREE.Clock') ||
        args[0].includes('THREE.WebGLShadowMap') ||
        args[0].includes('PCFSoftShadowMap'))
    ) {
      return
    }
    originalWarn(...args)
  }
}
