'use client'

import { useMemo } from 'react'
import type { Release } from '@/lib/types'

const AREA_COLORS: Record<string, string> = {
  'PNC': '#4f8ef7',
  'Service Manager': '#2ec4a0',
  'Engineering': '#f5a623',
  'Proactive Services': '#9b7af5',
  'TSP Portal': '#f06060',
  'Identity': '#e879a0',
  'Data': '#5bc4ef',
  'Portal': '#5bbf72',
  'Bulk Importer': '#f06fa0',
  'Gateway': '#e8a87c',
  'SMS Proxy': '#98d98e',
  'Notifications': '#c4a0f5',
  'Wallboards': '#ffd166',
}

function getColor(comp: Release['components'][0]): string {
  if (comp.module) return comp.module.color
  if (comp.areaLabel && AREA_COLORS[comp.areaLabel]) return AREA_COLORS[comp.areaLabel]
  return '#666'
}

function getLabel(comp: Release['components'][0]): string {
  return comp.module?.label ?? comp.areaLabel ?? '?'
}

interface Props { releases: Release[] }

export default function ReleasesView({ releases }: Props) {
  const sorted = useMemo(() => [...releases].sort((a, b) => a.sortOrder - b.sortOrder), [releases])

  // Compute cumulative totals for staircase
  const baseline = sorted.find(r => r.isBaseline)
  const baseCount = baseline?.baselineCount ?? 0
  const steps = sorted.filter(r => !r.isBaseline)

  const cumulativeTotals = useMemo(() => {
    let total = baseCount
    return steps.map(rel => {
      const added = rel.components.reduce((s, c) => s + c.count, 0)
      total += added
      return { release: rel, total, added }
    })
  }, [steps, baseCount])

  const maxTotal = Math.max(...cumulativeTotals.map(s => s.total), baseCount)

  // Legend: collect all unique areas
  const allAreas = useMemo(() => {
    const seen = new Map<string, string>()
    for (const rel of steps) {
      for (const c of rel.components) {
        const key = getLabel(c)
        if (!seen.has(key)) seen.set(key, getColor(c))
      }
    }
    return Array.from(seen.entries())
  }, [steps])

  const BAR_W = 72
  const GAP = 24
  const SVG_H = 320
  const PAD_LEFT = 60
  const PAD_BOTTOM = 40

  const chartW = PAD_LEFT + (steps.length + 1) * (BAR_W + GAP) + 20

  const yScale = (val: number) => {
    const usable = SVG_H - PAD_BOTTOM - 20
    return SVG_H - PAD_BOTTOM - (val / maxTotal) * usable
  }

  let runningTotal = baseCount
  const bars = steps.map((rel, i) => {
    const added = rel.components.reduce((s, c) => s + c.count, 0)
    const prevTotal = runningTotal
    runningTotal += added
    const x = PAD_LEFT + (i + 1) * (BAR_W + GAP)
    const yTop = yScale(runningTotal)
    const yPrev = yScale(prevTotal)

    // Build stacked segments
    let segY = yScale(prevTotal)
    const segments = rel.components.map(c => {
      const h = (c.count / maxTotal) * (SVG_H - PAD_BOTTOM - 20)
      const seg = { y: segY - h, h, color: getColor(c), label: getLabel(c), count: c.count }
      segY -= h
      return seg
    })

    return { rel, x, yTop, yPrev, prevTotal, newTotal: runningTotal, added, segments }
  })

  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>Cumulative Feature Adoption</div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {allAreas.map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              {label}
            </div>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <svg width={chartW} height={SVG_H} style={{ display: 'block', fontFamily: 'var(--font-mono)' }}>
            {/* Y-axis gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const val = Math.round(maxTotal * frac)
              const y = yScale(val)
              return (
                <g key={frac}>
                  <line x1={PAD_LEFT} x2={chartW - 10} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  <text x={PAD_LEFT - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#9098b0">{val.toLocaleString()}</text>
                </g>
              )
            })}

            {/* Baseline bar */}
            {(() => {
              const x = PAD_LEFT
              const y = yScale(baseCount)
              const h = SVG_H - PAD_BOTTOM - y
              return (
                <g>
                  <rect x={x} y={y} width={BAR_W} height={h} fill="rgba(79,142,247,0.3)" rx={3} />
                  <text x={x + BAR_W / 2} y={SVG_H - PAD_BOTTOM + 14} textAnchor="middle" fontSize={9} fill="#9098b0">
                    {baseline?.label ?? 'Baseline'}
                  </text>
                  <text x={x + BAR_W / 2} y={y - 5} textAnchor="middle" fontSize={9} fill="#9098b0">{baseCount.toLocaleString()}</text>
                </g>
              )
            })()}

            {/* Step bars */}
            {bars.map(({ rel, x, yTop, segments, newTotal }) => (
              <g key={rel.id}>
                {segments.map((seg, si) => (
                  <rect key={si} x={x} y={seg.y} width={BAR_W} height={Math.max(seg.h, 1)} fill={seg.color + 'cc'} rx={si === segments.length - 1 ? 3 : 0} />
                ))}
                <text x={x + BAR_W / 2} y={SVG_H - PAD_BOTTOM + 14} textAnchor="middle" fontSize={9} fill="#9098b0">{rel.label}</text>
                <text x={x + BAR_W / 2} y={yTop - 5} textAnchor="middle" fontSize={9} fill="#b8c0d8">{newTotal.toLocaleString()}</text>
              </g>
            ))}

            {/* X-axis line */}
            <line x1={PAD_LEFT} x2={chartW - 10} y1={SVG_H - PAD_BOTTOM} y2={SVG_H - PAD_BOTTOM} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          </svg>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Release Breakdown</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Release</th>
              <th>Cumulative</th>
              <th>Added</th>
              <th>Components</th>
            </tr>
          </thead>
          <tbody>
            {baseline && (
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{baseline.label} (baseline)</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{baseCount.toLocaleString()}</td>
                <td>—</td>
                <td>—</td>
              </tr>
            )}
            {cumulativeTotals.map(({ release: rel, total, added }) => (
              <tr key={rel.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{rel.label}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal)' }}>{total.toLocaleString()}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>+{added}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {rel.components.map(c => (
                      <span key={c.id} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 3, background: getColor(c) + '22', border: `1px solid ${getColor(c)}44`, color: getColor(c) }}>
                        {getLabel(c)} ×{c.count}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
