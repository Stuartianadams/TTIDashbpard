'use client'

import dynamic from 'next/dynamic'
import { fmt, type Module, type RegionStats } from '@/lib/types'

const BubbleChart = dynamic(() => import('@/components/charts/BubbleChart'), { ssr: false })
const HeatmapChart = dynamic(() => import('@/components/charts/HeatmapChart'), { ssr: false })

interface Props {
  modules: Module[]
  regionStats: RegionStats[]
}

export default function ModulesView({ modules, regionStats }: Props) {
  const maxTotal = Math.max(...modules.map(m => m.totalUsers), 1)

  return (
    <>
      <div className="info-box">
        Module adoption shows service users per module vs. total regional users. Bubble size represents absolute user count.
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Module Adoption — Comparative Bubble Chart</div>
        <div className="chart-wrap" style={{ height: 360 }}>
          <BubbleChart modules={modules} regionStats={regionStats} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Module Coverage by Region (%)</div>
          <div className="chart-wrap" style={{ height: 280 }}>
            <HeatmapChart modules={modules} regionStats={regionStats} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Global Module Totals</div>
          {modules.map(m => (
            <div key={m.key} className="module-bar-row" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>{m.label}</span>
              </div>
              <div className="module-bar-track">
                <div className="module-bar-fill" style={{ width: `${Math.round((m.totalUsers / maxTotal) * 100)}%`, background: m.color }} />
              </div>
              <div className="module-bar-val">{fmt(m.totalUsers)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
