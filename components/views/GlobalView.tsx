'use client'

import dynamic from 'next/dynamic'
import StatCard from '@/components/ui/StatCard'
import ModuleBar from '@/components/ui/ModuleBar'
import { TypeBadge, VersionBadge, BackupBadge } from '@/components/ui/Badge'
import { fmt, pct, type GlobalStats, type RegionStats, type Module, type Deployment } from '@/lib/types'

const UsersBarChart = dynamic(() => import('@/components/charts/UsersBarChart'), { ssr: false })

interface Props {
  globalStats: GlobalStats | null
  regionStats: RegionStats[]
  deployments: Deployment[]
  modules: Module[]
  onRegionClick: (code: string) => void
}

export default function GlobalView({ globalStats, regionStats, deployments, modules, onRegionClick }: Props) {
  const maxUsers = Math.max(...modules.map(m => m.totalUsers), 1)

  return (
    <>
      {globalStats && (
        <div className="grid-4">
          <StatCard label="Total Service Users" value={globalStats.totalUsers} sub="Across all regions" />
          <StatCard label="Total Regions" value={globalStats.totalRegions} sub="Active deployments" color="var(--teal)" format={false} />
          <StatCard label="Total Deployments" value={globalStats.totalDeployments} sub={`${globalStats.hostedCount} hosted · ${globalStats.onPremiseCount} on-prem`} color="var(--purple)" format={false} />
          <StatCard
            label="Roadmap Features"
            value={(globalStats.roadmapByStatus.planned ?? 0) + (globalStats.roadmapByStatus.in_progress ?? 0)}
            sub={`${globalStats.roadmapByStatus.in_progress ?? 0} in progress`}
            color="var(--amber)"
            format={false}
          />
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Service Users by Region</div>
          <div className="chart-wrap" style={{ height: 240 }}>
            <UsersBarChart regionStats={regionStats} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Module Adoption (Global)</div>
          {modules.map(m => (
            <ModuleBar key={m.key} label={m.label} color={m.color} value={m.totalUsers} max={maxUsers} />
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>Region Cards</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>Click to drill in</div>
        </div>
        <div className="world-grid">
          {regionStats.map(r => (
            <div
              key={r.code}
              className="country-card"
              data-region={r.code}
              style={{ ['--region-color' as string]: r.color }}
              onClick={() => onRegionClick(r.code)}
            >
              <style>{`.country-card[data-region="${r.code}"]::before { background: ${r.color}; }`}</style>
              <div className="flag">{r.flag}</div>
              <div className="name">{r.name}</div>
              <div className="users">{fmt(r.totalUsers)} users</div>
              <div className="dep-count">{r.deploymentCount} deployment{r.deploymentCount !== 1 ? 's' : ''}</div>
              {r.versions.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  {r.versions.map(v => (
                    <span key={v} className="ver-chip">v{v}</span>
                  ))}
                </div>
              )}
              <div className="cti-dots" style={{ marginTop: 6 }}>
                {r.hostedCount > 0 && <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{r.hostedCount} hosted</span>}
                {r.onPremiseCount > 0 && <span style={{ fontSize: 10, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{r.onPremiseCount > 0 ? ' · ' : ''}{r.onPremiseCount} on-prem</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Deployment Summary</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Instance</th>
              <th>Region</th>
              <th>Type</th>
              <th>Version</th>
              <th>Service Users</th>
              <th>Backup</th>
              <th>CTI Servers</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map(d => (
              <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => d.region && onRegionClick(d.region.code)}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{d.instance}</td>
                <td>
                  {d.region && (
                    <span>
                      <span style={{ marginRight: 6 }}>{d.region.flag}</span>
                      {d.region.name}
                    </span>
                  )}
                </td>
                <td><TypeBadge type={d.type} /></td>
                <td><VersionBadge version={d.version} /></td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{fmt(d.users)}</td>
                <td><BackupBadge backup={d.backup} /></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: Math.min(d.cti, 6) }).map((_, i) => (
                        <div key={i} className="cti-dot" />
                      ))}
                    </div>
                    {d.cti > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>×{d.cti}</span>}
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
