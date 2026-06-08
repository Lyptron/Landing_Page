'use client'
import { useEffect, useState } from 'react'

interface Token {
  text: string
  type: 'comment' | 'keyword' | 'function' | 'text' | 'type' | 'string'
}

const tokens: Token[] = [
  { text: '// NexusFlow API handler\n', type: 'comment' },
  { text: 'export ', type: 'keyword' },
  { text: 'async ', type: 'keyword' },
  { text: 'function ', type: 'keyword' },
  { text: 'POST', type: 'function' },
  { text: '(\n  req: ', type: 'text' },
  { text: 'Request', type: 'type' },
  { text: '\n): ', type: 'text' },
  { text: 'Promise', type: 'type' },
  { text: '<', type: 'text' },
  { text: 'Response', type: 'type' },
  { text: '> {\n  ', type: 'text' },
  { text: 'const', type: 'keyword' },
  { text: ' { userId, plan } = \n    ', type: 'text' },
  { text: 'await', type: 'keyword' },
  { text: ' req.json()\n  \n  ', type: 'text' },
  { text: 'const', type: 'keyword' },
  { text: ' session = ', type: 'text' },
  { text: 'await', type: 'keyword' },
  { text: ' stripe\n    .checkout.sessions.create({\n      customer: userId,\n      mode: ', type: 'text' },
  { text: "'subscription'", type: 'string' },
  { text: ',\n    })\n  \n  ', type: 'text' },
  { text: 'return', type: 'keyword' },
  { text: ' Response.json({\n    url: session.url\n  })\n}', type: 'text' }
]

// Map token type to CSS color style
const getColor = (type: Token['type']) => {
  switch (type) {
    case 'keyword':   return '#818cf8'
    case 'function':  return '#67e8f9'
    case 'string':    return '#86efac'
    case 'comment':   return 'rgba(255,255,255,0.25)'
    case 'type':      return '#f0abfc'
    default:          return 'rgba(240,240,245,0.7)'
  }
}

export default function CodeScreen() {
  const [charCount, setCharCount] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Total characters to type
  const totalLength = tokens.reduce((acc, token) => acc + token.text.length, 0)

  // 1. Typewriter loop
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const runTypewriter = () => {
      let currentCount = 0
      
      const tick = () => {
        if (!isMounted) return
        
        if (currentCount < totalLength) {
          currentCount++
          setCharCount(currentCount)
          timeoutId = setTimeout(tick, 35) // 35ms per character
        } else {
          // Pause 2000ms at end, then clear and restart
          timeoutId = setTimeout(() => {
            if (!isMounted) return
            setCharCount(0)
            timeoutId = setTimeout(runTypewriter, 300)
          }, 2000)
        }
      }

      tick()
    }

    runTypewriter()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [totalLength])

  // 2. Cursor blinking loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  // Render highlighted spans
  let currentAbsoluteIdx = 0
  const renderedContent = tokens.map((token, idx) => {
    const tokenStart = currentAbsoluteIdx
    const tokenEnd = currentAbsoluteIdx + token.text.length
    currentAbsoluteIdx = tokenEnd

    if (charCount < tokenStart) return null

    const visibleText = token.text.substring(0, charCount - tokenStart)
    if (!visibleText) return null

    return (
      <span key={idx} style={{ color: getColor(token.type) }}>
        {visibleText}
      </span>
    )
  })

  return (
    <div className="w-full h-full bg-[#080810] text-[#f0f0f5] flex flex-col select-none overflow-hidden no-scrollbar box-border pointer-events-none max-w-[320px]">
      {/* Tab bar */}
      <div className="h-[22px] bg-[#0d0d18] flex items-center justify-between px-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-1">
          {/* Traffic lights */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f57] mr-0.5" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e] mr-0.5" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex gap-1.5">
          <div className="px-2 py-0.5 bg-white/[0.06] rounded-sm text-[8px] font-mono text-white select-none">
            api.ts
          </div>
          <div className="px-2 py-0.5 text-[8px] font-mono text-[rgba(240,240,245,0.4)] select-none">
            schema.ts
          </div>
        </div>
      </div>

      {/* Code window */}
      <pre className="flex-1 p-3 font-mono text-[8.5px] leading-[1.65] m-0 overflow-y-auto no-scrollbar whitespace-pre-wrap select-none text-left">
        {renderedContent}
        <span 
          style={{ 
            color: '#1d7ef5', 
            opacity: cursorVisible ? 1 : 0,
            transition: 'opacity 0.08s ease'
          }}
          className="font-bold ml-[1px]"
        >
          |
        </span>
      </pre>
    </div>
  )
}
