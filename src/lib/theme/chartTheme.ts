'use client'

import { useEffect, useState } from 'react'

export interface ChartTheme {
  /** --cp-chart-1 .. --cp-chart-5, for series fills/strokes/cells */
  series: string[]
  /** --cp-chart-grid, for <CartesianGrid stroke> */
  grid: string
  /** --cp-chart-axis, for <XAxis>/<YAxis> tick + axis color */
  axis: string
  /** --cp-surface-strong, for <Tooltip contentStyle.backgroundColor> */
  tooltipBg: string
  /** --cp-border, for <Tooltip contentStyle.border> */
  tooltipBorder: string
  /** --cp-text-faint, for <Tooltip labelStyle.color> */
  tooltipLabel: string
  /** --cp-text-secondary, for <Tooltip itemStyle.color> and chart labels */
  tooltipItem: string
  /** --cp-surface-strong, for bar/funnel hover <Tooltip cursor.fill> */
  cursorFill: string
}

const SERIES_VARS = ['--cp-chart-1', '--cp-chart-2', '--cp-chart-3', '--cp-chart-4', '--cp-chart-5']

const FALLBACK: ChartTheme = {
  series: ['#4F46E5', '#15803D', '#B45309', '#6D28D9', '#0891B2'],
  grid: 'rgba(27, 27, 31, 0.06)',
  axis: 'rgba(27, 27, 31, 0.45)',
  tooltipBg: '#F1EEE7',
  tooltipBorder: 'rgba(20, 20, 15, 0.08)',
  tooltipLabel: 'rgba(27, 27, 31, 0.30)',
  tooltipItem: 'rgba(27, 27, 31, 0.65)',
  cursorFill: '#F1EEE7',
}

function readChartTheme(): ChartTheme {
  if (typeof window === 'undefined') return FALLBACK
  // Either shell exposes the same `--cp-*` palette — the client portal
  // uses `.client-shell`. Without this fallback, client-side charts
  // always rendered with the hard-coded FALLBACK palette.
  const el = document.querySelector('.admin-shell, .client-shell')
  if (!el) return FALLBACK
  const styles = getComputedStyle(el)
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  return {
    series: SERIES_VARS.map((name, i) => read(name, FALLBACK.series[i])),
    grid: read('--cp-chart-grid', FALLBACK.grid),
    axis: read('--cp-chart-axis', FALLBACK.axis),
    tooltipBg: read('--cp-surface-strong', FALLBACK.tooltipBg),
    tooltipBorder: read('--cp-border', FALLBACK.tooltipBorder),
    tooltipLabel: read('--cp-text-faint', FALLBACK.tooltipLabel),
    tooltipItem: read('--cp-text-secondary', FALLBACK.tooltipItem),
    cursorFill: read('--cp-surface-strong', FALLBACK.cursorFill),
  }
}

/**
 * Resolves the current `.admin-shell` chart palette from CSS custom
 * properties. Re-reads whenever `data-theme` flips on <html> (light /
 * dark / auto switch), so Recharts elements — which take JS color
 * values, not CSS — stay in sync without a page reload.
 */
export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(readChartTheme)

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readChartTheme()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return theme
}

export const tooltipContentStyle = (theme: ChartTheme) => ({
  backgroundColor: theme.tooltipBg,
  border: `1px solid ${theme.tooltipBorder}`,
  borderRadius: '10px',
  padding: '8px 12px',
})

export const tooltipLabelStyle = (theme: ChartTheme) => ({
  color: theme.tooltipLabel,
  fontSize: '9px',
  fontFamily: 'monospace',
})

export const tooltipItemStyle = (theme: ChartTheme) => ({
  color: theme.tooltipItem,
  fontSize: '11px',
})
