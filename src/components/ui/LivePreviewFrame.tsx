'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { isLowPerfDevice } from '@/hooks/useLowPerfMode'

interface LivePreviewFrameProps {
  url: string
  title: string
  // The real viewport size to render the live site at, before scaling down
  // to fit the mockup frame. Rendering at a genuine viewport width (rather
  // than the mockup's own — often much narrower — pixel width) means the
  // site's own responsive breakpoints kick in correctly instead of its
  // layout overflowing a viewport far smaller than any real device.
  baseWidth: number
  baseHeight: number
  className?: string
  // When true, don't mount the iframe from an IntersectionObserver — wait
  // for the user to hover/tap the container. Use on hero cards where
  // multiple embeds sit on screen at once: three concurrently-composited
  // iframes were pinning scroll to ~18fps on integrated GPUs. With this
  // on, cost is zero until the user asks for a preview.
  deferUntilHover?: boolean
  // Optional preview screenshot shown as the default surface (instead of
  // the domain caption). Next/Image handles avif/webp conversion + sizing.
  // The iframe still mounts on hover and takes over once loaded.
  previewImage?: string
}

// Several LivePreviewFrames exist on the page (three in the hero alone, one
// per project in Work). Each embed is a complete external app — letting them
// all initialize the moment they cross the 400px preload line means multiple
// full sites parse + execute at once, right in the middle of a scroll. This
// module-level queue serializes mounts and defers each one to browser idle
// time, so an embed never steals a scroll frame and never loads alongside
// its neighbours.
let mountQueue: Promise<void> = Promise.resolve()
function enqueueMount(fn: () => void): void {
  mountQueue = mountQueue.then(
    () =>
      new Promise<void>((resolve) => {
        const go = () => {
          fn()
          // Breathing room before the next embed starts initializing.
          setTimeout(resolve, 400)
        }
        if (typeof (window as any).requestIdleCallback === 'function') {
          ;(window as any).requestIdleCallback(go, { timeout: 2500 })
        } else {
          setTimeout(go, 250)
        }
      })
  )
}

// Scales a full-size iframe down (via ResizeObserver + CSS transform) to
// exactly fill whatever container it's dropped into, so live embeds work
// inside both desktop browser-chrome mockups and narrow phone frames.
export default function LivePreviewFrame({ url, title, baseWidth, baseHeight, className = '', deferUntilHover = false, previewImage }: LivePreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  // mounted: iframe exists in the DOM (one-way latch, queued + idle-deferred).
  // onScreen: frame is close to the viewport. Off-screen iframes get
  // display:none, which makes the browser stop their rAF loops entirely —
  // an embed only burns CPU/GPU while it's actually visible. The iframe
  // stays loaded, so scrolling back to it shows it again instantly.
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [onScreen, setOnScreen] = useState(false)
  // hovered gates whether the iframe actually gets display:block. A mounted
  // iframe with display:none has its rendering paused by the browser, so
  // three loaded-but-hidden embeds cost basically zero — the compositor
  // only pays for the one card the pointer is over. Only used when
  // deferUntilHover is on.
  const [hovered, setHovered] = useState(false)
  // Each live embed is a complete external site running its own JS inside
  // this page. On a low-RAM laptop those compete with the main page for
  // CPU/GPU/memory — render a static styled placeholder there instead.
  const [lowPerf, setLowPerf] = useState(false)

  useEffect(() => {
    // Client-only check; SSR can't know device capabilities.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLowPerf(isLowPerfDevice())
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setScale(el.clientWidth / baseWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [baseWidth])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let cancelled = false

    // deferUntilHover skips the IntersectionObserver mount trigger entirely
    // — the iframe stays unmounted until the container's onPointerEnter
    // handler fires. Only the visibility toggle is still worth wiring up
    // (so if the user does load it, it stops burning cycles off-screen).
    let mountIo: IntersectionObserver | null = null
    if (!deferUntilHover) {
      // Mount latch — starts loading a bit before the frame is on screen so
      // the preview is ready by the time the user reaches it.
      mountIo = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            mountIo?.disconnect()
            mountIo = null
            enqueueMount(() => {
              if (!cancelled) setMounted(true)
            })
          }
        },
        { rootMargin: '400px' }
      )
      mountIo.observe(el)
    }

    // Visibility toggle — keeps observing for the component's lifetime.
    const screenIo = new IntersectionObserver(
      (entries) => {
        setOnScreen(entries.some((e) => e.isIntersecting))
      },
      { rootMargin: '150px' }
    )
    screenIo.observe(el)

    return () => {
      cancelled = true
      mountIo?.disconnect()
      screenIo.disconnect()
    }
  }, [deferUntilHover])

  const handleWakeup = () => {
    setHovered(true)
    if (mounted) return
    enqueueMount(() => setMounted(true))
  }
  const handleSleep = () => setHovered(false)

  if (lowPerf) {
    // On phones/low-spec devices, running the iframe is too expensive.
    // Same surface as desktop-idle: preview image if we have one (else
    // domain caption) with the whole card acting as a link to the real
    // site — tapping anywhere opens it in a new tab.
    const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${domain} in a new tab`}
        className={`absolute inset-0 overflow-hidden block ${className}`}
      >
        {previewImage ? (
          <Image
            src={previewImage}
            alt={`${domain} preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,0.035) 0%, transparent 70%)' }}
            />
            <span className="relative font-mono text-[10px] tracking-[0.18em] uppercase text-white/30">
              {domain}
            </span>
          </div>
        )}
      </a>
    )
  }

  const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      // Isolate the embed's layout/paint from the rest of the page so the
      // browser never has to consider it when compositing scroll frames.
      style={{ contain: 'strict' }}
      onPointerEnter={deferUntilHover ? handleWakeup : undefined}
      onPointerLeave={deferUntilHover ? handleSleep : undefined}
    >
      {/* React 19 hoists <link> to <head>. Preconnect warms the TLS
          handshake; prefetch fetches the embed's HTML at browser idle
          priority so the first hover mounts a cache-hit iframe instead
          of a cold network request. */}
      <link rel="preconnect" href={new URL(url).origin} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={new URL(url).origin} />
      <link rel="prefetch" href={url} as="document" />
      {/* Click-through overlay: iframes have pointer-events:none so users
          can't interact with the live site directly (would trap scroll
          and cursor). This absolute-positioned anchor sits over the whole
          card and opens the site in a new tab on click. */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${domain} in a new tab`}
        className="absolute inset-0 z-10"
      />
      {/* Placeholder is the default surface. It stays visible until the
          iframe is mounted + loaded, and (when deferUntilHover) reappears
          whenever the pointer leaves — a display:none'd iframe stays
          mounted for instant re-hover but stops burning cycles. */}
      {(!mounted || !loaded || (deferUntilHover && !hovered)) && (
        previewImage ? (
          <Image
            src={previewImage}
            alt={`${domain} preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover object-top pointer-events-none"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,0.035) 0%, transparent 70%)' }}
            />
            <span className="relative font-mono text-[10px] tracking-[0.18em] uppercase text-white/30">
              {domain}
            </span>
          </div>
        )
      )}
      {mounted && scale > 0 && (
        <iframe
          src={url}
          title={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="pointer-events-none"
          style={{
            width: baseWidth,
            height: baseHeight,
            border: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            display: onScreen && (!deferUntilHover || hovered) ? 'block' : 'none',
            // visibility: hidden during load skips paint entirely — the
            // compositor doesn't blend a mid-load iframe over the parent,
            // so parent scroll stays smooth while the embed hydrates.
            visibility: loaded ? 'visible' : 'hidden',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </div>
  )
}
