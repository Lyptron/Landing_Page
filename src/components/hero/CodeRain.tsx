'use client'

import { useMemo, useState, useEffect } from 'react'

const CODE_TOKENS = [
  // Syntax
  '{', '}', '[', ']', '(', ')', ';', ':', '.', ',',
  '=>', '!==', '===', '&&', '||', '??', '?.', '...',
  // Operators
  '+', '-', '*', '/', '%', '=', '<', '>', '!', '&',
  // Keywords
  'const', 'let', 'async', 'await', 'return',
  'export', 'import', 'function', 'type', 'interface',
  'extends', 'implements', 'default', 'from', 'of',
  // Values
  'true', 'false', 'null', 'undefined', '0', '1',
  // JSX
  '<div>', '</>', 'React.FC', 'useState', 'useEffect',
  'props', 'ref', 'key', 'className', 'onClick',
]

function generateTokens(count: number): Array<{ char: string; color: string }> {
  const syntax = [
    '{', '}', '[', ']', '(', ')', ';', ':', '.', ',',
    '=>', '!==', '===', '&&', '||', '??', '?.', '...',
    '+', '-', '*', '/', '%', '=', '<', '>', '!', '&',
    '<div>', '</>', 'React.FC', 'useState', 'useEffect',
    'props', 'ref', 'key', 'className', 'onClick'
  ]
  const keywords = [
    'const', 'let', 'async', 'await', 'return',
    'export', 'import', 'function', 'type', 'interface',
    'extends', 'implements', 'default', 'from', 'of'
  ]
  const values = ['true', 'false', 'null', 'undefined', '0', '1']

  return Array.from({ length: count }).map(() => {
    const rand = Math.random()
    let char = ''
    let color = 'rgba(240,240,245,0.9)' // White default

    if (rand < 0.20) {
      // 20% blue keywords
      char = keywords[Math.floor(Math.random() * keywords.length)]
      color = 'rgba(29,126,245,0.9)'
    } else if (rand < 0.30) {
      // 10% green values
      char = values[Math.floor(Math.random() * values.length)]
      color = 'rgba(34,197,94,0.9)'
    } else {
      // 70% white syntax/JSX/others
      char = syntax[Math.floor(Math.random() * syntax.length)]
      color = 'rgba(240,240,245,0.9)'
    }

    return { char, color }
  })
}

export default function CodeRain() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate 18 columns data (client-only via useMemo to avoid hydration mismatches)
  const columns = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const left = `${i * 5.88}%`
      const delay = -(Math.random() * 20)
      
      // Parallax Depth categories
      const speedType = i % 3
      let duration = 16
      let fontSize = '11px'
      let blur = '0px'
      let depthOpacity = 0.07

      if (speedType === 0) {
        // Fast / Close — more visible
        duration = 8 + Math.random() * 3
        fontSize = '13px'
        depthOpacity = 0.18
      } else if (speedType === 1) {
        // Medium / Mid
        duration = 13 + Math.random() * 5
        fontSize = '11px'
        depthOpacity = 0.12
      } else {
        // Slow / Far
        duration = 22 + Math.random() * 8
        fontSize = '9.5px'
        blur = '0.5px'
        depthOpacity = 0.06
      }

      // Opacity rules
      const isCenter = i >= 7 && i <= 10  // 40% to 60% band (index 7 = 41.16%, index 10 = 58.8%)
      const opacity = isCenter ? 0 : depthOpacity

      return {
        left,
        duration,
        delay,
        opacity,
        fontSize,
        blur,
        tokens: generateTokens(120),
      }
    })
  }, [])

  // Generate static line paddings once
  const linePaddings = useMemo(() => {
    return Array.from({ length: 8 }).map(() => `${2 + Math.random() * 6}%`)
  }, [])

  if (!mounted) {
    return <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none" />
  }

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      {/* LAYER A — Falling Code Columns */}
      {columns.map((col, idx) => (
        <div
          key={idx}
          className="absolute top-0 h-full w-[14px] flex flex-col gap-[2px] font-mono pointer-events-none select-none overflow-hidden"
          style={{
            left: col.left,
            opacity: col.opacity,
            fontSize: col.fontSize,
            lineHeight: 1.8,
            filter: col.blur !== '0px' ? `blur(${col.blur})` : 'none',
            animation: `codeRain ${col.duration}s linear ${col.delay}s infinite`,
          }}
        >
          {col.tokens.map((token, tIdx) => (
            <span
              key={tIdx}
              className="display-block text-center w-full"
              style={{ color: token.color }}
            >
              {token.char}
            </span>
          ))}
        </div>
      ))}

      {/* LAYER B — Horizontal Code Lines (Static) */}
      
      {/* Line 1 (top: 8%) */}
      <div 
        style={{ top: '8%', left: 0, paddingLeft: linePaddings[0] }} 
        className="absolute w-full whitespace-nowrap font-mono text-[10px] pointer-events-none select-none opacity-[0.10] leading-none text-[rgba(240,240,245,0.7)]"
      >
        <span style={{ color: '#818cf8', textShadow: '0 0 8px rgba(129, 140, 248, 0.22)' }}>export</span> <span style={{ color: '#818cf8', textShadow: '0 0 8px rgba(129, 140, 248, 0.22)' }}>async</span> <span style={{ color: '#818cf8', textShadow: '0 0 8px rgba(129, 140, 248, 0.22)' }}>function</span> buildProduct(config: ProjectConfig): Promise{"<"}Launch{">"} {"{"}
      </div>

      {/* Line 2 (top: 18%) */}
      <div 
        style={{ top: '18%', left: 0, paddingLeft: linePaddings[1] }} 
        className="absolute w-full whitespace-nowrap font-mono text-[10px] pointer-events-none select-none opacity-[0.10] leading-none text-[rgba(240,240,245,0.7)]"
      >
        &nbsp;&nbsp;<span style={{ color: '#818cf8', textShadow: '0 0 8px rgba(129, 140, 248, 0.22)' }}>const</span> stack = <span style={{ color: '#818cf8', textShadow: '0 0 8px rgba(129, 140, 248, 0.22)' }}>await</span> selectStack({"{"} <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>frontend:</span> <span style={{ color: 'rgba(134,239,172,0.8)', textShadow: '0 0 8px rgba(134, 239, 172, 0.22)' }}>'Next.js'</span>, <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>backend:</span> <span style={{ color: 'rgba(134,239,172,0.8)', textShadow: '0 0 8px rgba(134, 239, 172, 0.22)' }}>'Node'</span>, <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>ai:</span> <span style={{ color: 'rgba(134,239,172,0.8)', textShadow: '0 0 8px rgba(134, 239, 172, 0.22)' }}>'LangChain'</span> {"}"})
      </div>

      {/* Line 3 (top: 28%) */}
      <div 
        style={{ top: '28%', left: 0, paddingLeft: linePaddings[2] }} 
        className="absolute w-full whitespace-nowrap font-mono text-[10px] pointer-events-none select-none opacity-[0.10] leading-none text-[rgba(240,240,245,0.7)]"
      >
        &nbsp;&nbsp;<span style={{ color: '#818cf8', textShadow: '0 0 8px rgba(129, 140, 248, 0.22)' }}>const</span> design = useDesignSystem({"{"} <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>tokens:</span> lyptronTheme, <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>components:</span> <span style={{ color: 'rgba(134,239,172,0.8)', textShadow: '0 0 8px rgba(134, 239, 172, 0.22)' }}>'radix+tailwind'</span> {"}"})
      </div>

      {/* Line 4 (top: 38% - Hidden) */}
      <div 
        style={{ top: '38%', left: 0, paddingLeft: linePaddings[3] }} 
        className="absolute w-full whitespace-nowrap font-mono text-[10px] pointer-events-none select-none opacity-0 leading-none text-[rgba(240,240,245,0.7)]"
      >
        &nbsp;&nbsp;if (client.budget {">="} 5000 {"&&"} client.vision === <span style={{ color: 'rgba(134,239,172,0.8)' }}>'ambitious'</span>) <span style={{ color: '#818cf8' }}>return</span> ship({"{"} <span style={{ color: 'rgba(103,232,249,0.8)' }}>fast:</span> true {"}"})
      </div>

      {/* Line 5 (top: 62% - Hidden) */}
      <div 
        style={{ top: '62%', left: 0, paddingLeft: linePaddings[4] }} 
        className="absolute w-full whitespace-nowrap font-mono text-[10px] pointer-events-none select-none opacity-0 leading-none text-[rgba(240,240,245,0.7)]"
      >
        &nbsp;&nbsp;<span style={{ color: '#818cf8' }}>const</span> metrics = {"{"} <span style={{ color: 'rgba(103,232,249,0.8)' }}>performance:</span> 98, <span style={{ color: 'rgba(134,239,172,0.8)' }}>uptime:</span> <span style={{ color: 'rgba(134,239,172,0.8)' }}>'99.99%'</span>, <span style={{ color: 'rgba(103,232,249,0.8)' }}>satisfaction:</span> <span style={{ color: 'rgba(134,239,172,0.8)' }}>'100%'</span>, <span style={{ color: 'rgba(103,232,249,0.8)' }}>speed:</span> <span style={{ color: 'rgba(134,239,172,0.8)' }}>'&lt;1s'</span> {"}"}
      </div>

      {/* Line 6 (top: 72%) */}
      <div 
        style={{ top: '72%', left: 0, paddingLeft: linePaddings[5] }} 
        className="absolute w-full whitespace-nowrap font-mono text-[10px] pointer-events-none select-none opacity-[0.10] leading-none text-[rgba(240,240,245,0.7)]"
      >
        &nbsp;&nbsp;<span style={{ color: '#818cf8', textShadow: '0 0 8px rgba(129, 140, 248, 0.22)' }}>await</span> deploy({"{"} <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>platform:</span> <span style={{ color: 'rgba(134,239,172,0.8)', textShadow: '0 0 8px rgba(134, 239, 172, 0.22)' }}>'Vercel'</span>, <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>cdn:</span> <span style={{ color: 'rgba(134,239,172,0.8)', textShadow: '0 0 8px rgba(134, 239, 172, 0.22)' }}>'edge'</span>, <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>monitoring:</span> <span style={{ color: 'rgba(134,239,172,0.8)', textShadow: '0 0 8px rgba(134, 239, 172, 0.22)' }}>'Datadog'</span>, <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>env:</span> <span style={{ color: 'rgba(134,239,172,0.8)', textShadow: '0 0 8px rgba(134, 239, 172, 0.22)' }}>'production'</span> {"}"})
      </div>

      {/* Line 7 (top: 82%) */}
      <div 
        style={{ top: '82%', left: 0, paddingLeft: linePaddings[6] }} 
        className="absolute w-full whitespace-nowrap font-mono text-[10px] pointer-events-none select-none opacity-[0.10] leading-none text-[rgba(240,240,245,0.7)]"
      >
        &nbsp;&nbsp;<span style={{ color: '#818cf8', textShadow: '0 0 8px rgba(129, 140, 248, 0.22)' }}>return</span> {"{"} <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>product:</span> live, <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>client:</span> happy, <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>agency:</span> lyptron, <span style={{ color: 'rgba(103,232,249,0.8)', textShadow: '0 0 8px rgba(103, 232, 249, 0.22)' }}>result:</span> <span style={{ color: 'rgba(134,239,172,0.8)', textShadow: '0 0 8px rgba(134, 239, 172, 0.22)' }}>'exceptional'</span> {"}"}
      </div>

      {/* Line 8 (top: 92%) */}
      <div 
        style={{ top: '92%', left: 0, paddingLeft: linePaddings[7] }} 
        className="absolute w-full whitespace-nowrap font-mono text-[10px] pointer-events-none select-none opacity-[0.10] leading-none text-[rgba(240,240,245,0.7)]"
      >
        {"}"} <span style={{ color: 'rgba(240,240,245,0.4)', textShadow: 'none' }}>// Built by Lyptron · Bengaluru · Est. 2024 · lyptron.com</span>
      </div>
    </div>
  )
}
