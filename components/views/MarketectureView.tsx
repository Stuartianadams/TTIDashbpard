'use client'

import { useState } from 'react'
import type { Region } from '@/lib/types'

const MODULES = [
  { key: 'arc',             label: 'ARC',                   color: '#4f8ef7', x: 100,  y: 80  },
  { key: 'service_manager', label: 'Service Manager',        color: '#7b5ef8', x: 300,  y: 80  },
  { key: 'tsp_portal',      label: 'TSP Portal',             color: '#2ec4a0', x: 500,  y: 80  },
  { key: 'proactive',       label: 'Proactive Service',      color: '#f5a623', x: 700,  y: 80  },
  { key: 'service_hooks',   label: 'Service Hooks',          color: '#f06060', x: 100,  y: 220 },
  { key: 'notifications',   label: 'Notifications',          color: '#5bbf72', x: 300,  y: 220 },
  { key: 'ies',             label: 'IES (API Gateway)',      color: '#9b7af5', x: 500,  y: 220 },
  { key: 'bulk_importer',   label: 'Bulk Importer',          color: '#f06fa0', x: 700,  y: 220 },
  { key: 'wallboards',      label: 'Wallboards',             color: '#5bc4ef', x: 100,  y: 360 },
  { key: 'tdp',             label: 'Tunstall Data Platform', color: '#e8a87c', x: 300,  y: 360 },
  { key: 'dmp',             label: 'DMP',                    color: '#98d98e', x: 500,  y: 360 },
  { key: 'identity',        label: 'Identity',               color: '#e879a0', x: 700,  y: 360 },
]

const VSD_STAGES = [
  { key: 'social', label: 'Social Prescribing', color: '#3a3d5c' },
  { key: 'assess', label: 'Assessment', color: '#1e4d3e' },
  { key: 'install', label: 'Installation', color: '#2c3a5c' },
  { key: 'monitoring', label: 'Monitoring', color: '#1e3a4d' },
  { key: 'reactive', label: 'Reactive Care', color: '#2d1e4d' },
  { key: 'proactive', label: 'Proactive Care', color: '#4d2e1e' },
  { key: 'response', label: 'Alarm Response', color: '#3a1e2e' },
  { key: 'dispatch', label: 'Dispatch', color: '#1e3a2e' },
  { key: 'followup', label: 'Follow-up', color: '#3a3320' },
  { key: 'insight', label: 'Insight & Data', color: '#1e2d3a' },
  { key: 'roadmap', label: 'Future (Roadmap)', color: '#2a1a3a' },
]

const VSD_ITEMS: Record<string, Array<{ t: string; c: string }>> = {
  assess: [{ t: 'Design Forms', c: 'green' }, { t: 'Schedule Appointments', c: 'green' }, { t: 'Manage Inventory', c: 'blue' }],
  install: [{ t: 'Install Equipment', c: 'green' }, { t: 'Configure Devices', c: 'green' }, { t: 'Commission Service', c: 'blue' }],
  monitoring: [{ t: 'Monitor Devices', c: 'green' }, { t: 'Detect Events', c: 'green' }, { t: 'Manage Alarms', c: 'blue' }, { t: 'Service Hooks', c: 'yellow' }],
  reactive: [{ t: 'Handle Alarms', c: 'green' }, { t: 'Log Outcomes', c: 'green' }, { t: 'Dispatch Response', c: 'blue' }],
  proactive: [{ t: 'Activity Monitoring', c: 'pink' }, { t: 'Wellness Checks', c: 'pink' }, { t: 'Risk Scoring', c: 'yellow' }],
  response: [{ t: 'ARC Response', c: 'green' }, { t: 'Escalate', c: 'red' }, { t: 'CTI Integration', c: 'blue' }],
  dispatch: [{ t: 'Mobile Response', c: 'blue' }, { t: 'WFM Integration', c: 'yellow' }, { t: 'Track Response', c: 'green' }],
  followup: [{ t: 'Case Management', c: 'green' }, { t: 'Outcome Recording', c: 'blue' }],
  insight: [{ t: 'TDP Analytics', c: 'blue' }, { t: 'Reporting', c: 'blue' }, { t: 'Data Export', c: 'green' }],
  roadmap: [{ t: 'AI Assist', c: 'pink' }, { t: 'Predictive Care', c: 'pink' }, { t: 'Smart Routing', c: 'yellow' }],
}

interface Props { regions: Region[] }

export default function MarketectureView({ regions }: Props) {
  const [mktRegion, setMktRegion] = useState<string | null>(null)

  const displayRegions = mktRegion
    ? regions.filter(r => r.code === mktRegion)
    : regions

  return (
    <>
      {/* Value Stream Diagram */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>Customer Value Stream</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <svg width={1260} height={82} viewBox="0 0 1260 82" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', minWidth: 900 }}>
            {VSD_STAGES.map((stage, i) => {
              const W = 110; const GAP = 4; const x = i * (W + GAP)
              const pts = `${x},0 ${x + W},0 ${x + W + 14},41 ${x + W},82 ${x},82 ${i > 0 ? x + 14 : x},41`
              return (
                <g key={stage.key}>
                  <polygon points={pts} fill={stage.color} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                  <text x={x + W / 2 + (i > 0 ? 7 : 0)} y={35} textAnchor="middle" fontSize={9} fontFamily="Syne,sans-serif" fill="#f2f4fa" fontWeight="600">
                    {stage.label.split(' ').map((w, j) => (
                      <tspan key={j} x={x + W / 2 + (i > 0 ? 7 : 0)} dy={j === 0 ? 0 : 12}>{w}</tspan>
                    ))}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Value Stream Detail */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title">Value Stream Detail</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 900 }}>
            <tbody>
              <tr>
                {VSD_STAGES.map(stage => (
                  <td key={stage.key} className="vsd-cell" style={{ width: 110, background: stage.color + '44' }}>
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text3)', textAlign: 'center', padding: '3px 0 6px', fontWeight: 600 }}>
                      {stage.label}
                    </div>
                    {(VSD_ITEMS[stage.key] ?? []).map((item, j) => (
                      <div key={j} className={`vsd-item ${item.c}`}>{item.t}</div>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        {/* System Architecture */}
        <div className="card">
          <div className="card-title">System Architecture</div>
          <div style={{ overflowX: 'auto' }}>
            <svg viewBox="0 0 900 500" style={{ width: '100%', display: 'block', minWidth: 600 }}>
              {/* Background */}
              <rect width={900} height={500} fill="var(--bg3)" rx={8} />

              {/* Platform label */}
              <text x={450} y={30} textAnchor="middle" fontFamily="Syne,sans-serif" fontSize={12} fill="#9098b0" fontWeight={600}>TSP PLATFORM MODULES</text>

              {/* Module boxes */}
              {MODULES.map(mod => (
                <g key={mod.key}>
                  <rect x={mod.x} y={mod.y} width={160} height={50} rx={6} fill={mod.color + '22'} stroke={mod.color + '66'} strokeWidth={1} />
                  <text x={mod.x + 80} y={mod.y + 22} textAnchor="middle" fontFamily="Syne,sans-serif" fontSize={10} fill={mod.color} fontWeight={600}>{mod.label.split(' ')[0]}</text>
                  {mod.label.includes(' ') && (
                    <text x={mod.x + 80} y={mod.y + 36} textAnchor="middle" fontFamily="Syne,sans-serif" fontSize={9} fill={mod.color + 'aa'}>{mod.label.split(' ').slice(1).join(' ')}</text>
                  )}
                </g>
              ))}

              {/* External systems */}
              <rect x={50} y={430} width={120} height={40} rx={6} fill="rgba(155,122,245,0.15)" stroke="rgba(155,122,245,0.4)" strokeWidth={1} />
              <text x={110} y={454} textAnchor="middle" fontFamily="DM Mono,monospace" fontSize={10} fill="#9b7af5">WFM</text>

              <rect x={200} y={430} width={160} height={40} rx={6} fill="rgba(160,168,192,0.1)" stroke="rgba(160,168,192,0.3)" strokeWidth={1} />
              <text x={280} y={454} textAnchor="middle" fontFamily="DM Mono,monospace" fontSize={10} fill="#a0a8c0">Third-party</text>

              {/* IES connector lines */}
              <line x1={580} y1={295} x2={580} y2={430} stroke="rgba(155,122,245,0.3)" strokeWidth={1} strokeDasharray="4,4" />
              <line x1={580} y1={430} x2={200} y2={450} stroke="rgba(160,168,192,0.2)" strokeWidth={1} strokeDasharray="4,4" />
            </svg>
          </div>
        </div>

        {/* Regional Modules */}
        <div className="card">
          <div className="section-header">
            <div className="card-title" style={{ marginBottom: 0 }}>Regional Modules</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <button
              className={`region-filter-btn${mktRegion === null ? ' active' : ''}`}
              onClick={() => setMktRegion(null)}
            >
              All
            </button>
            {regions.map(r => (
              <button
                key={r.code}
                className={`region-filter-btn${mktRegion === r.code ? ' active' : ''}`}
                onClick={() => setMktRegion(mktRegion === r.code ? null : r.code)}
              >
                {r.flag} {r.name}
              </button>
            ))}
          </div>

          {displayRegions
            .filter(r => r.regionalModules && r.regionalModules.length > 0)
            .map(r => (
              <div key={r.code} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{r.flag}</span>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                </div>
                {r.regionalModules?.map(rm => (
                  <div key={rm.id} className="regional-module-item">
                    <div className="rm-info">
                      <div className="rm-name">{rm.name}</div>
                      <div className="rm-desc">{rm.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          }

          {displayRegions.filter(r => r.regionalModules && r.regionalModules.length > 0).length === 0 && (
            <div style={{ color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '20px 0' }}>
              No regional modules for this selection
            </div>
          )}
        </div>
      </div>
    </>
  )
}
