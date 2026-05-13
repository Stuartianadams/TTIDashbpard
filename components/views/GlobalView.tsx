'use client'

import { useState } from 'react'
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
  onDataChange: () => void
}

export default function GlobalView({ globalStats, regionStats, deployments, modules, onRegionClick, onDataChange }: Props) {
  const maxUsers = Math.max(...modules.map(m => m.totalUsers), 1)
  const [showAddRegion, setShowAddRegion] = useState(false)

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>Click to drill in</div>
            <button className="btn sm primary" onClick={() => setShowAddRegion(true)}>+ Add Region</button>
          </div>
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

      {showAddRegion && (
        <AddRegionModal
          onClose={() => setShowAddRegion(false)}
          onSaved={() => { setShowAddRegion(false); onDataChange() }}
        />
      )}
    </>
  )
}

function AddRegionModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [flag, setFlag] = useState('')
  const [color, setColor] = useState('#4f8ef7')
  const [totalUsers, setTotalUsers] = useState('0')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!code.trim() || !name.trim() || !flag.trim()) {
      setError('Code, name and flag are required')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/regions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase().trim(), name: name.trim(), flag: flag.trim(), color, totalUsers: parseInt(totalUsers) || 0 }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to create region')
      setSaving(false)
      return
    }
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Add Region</h3>
        {error && (
          <div style={{ color: 'var(--coral)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 12, padding: '8px 10px', background: 'rgba(240,96,96,0.08)', borderRadius: 6, border: '1px solid rgba(240,96,96,0.2)' }}>
            {error}
          </div>
        )}
        <div className="form-grid" style={{ marginBottom: 12 }}>
          <div className="form-group">
            <label>Code</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. AU" maxLength={10} />
          </div>
          <div className="form-group">
            <label>Flag Emoji</label>
            <input value={flag} onChange={e => setFlag(e.target.value)} placeholder="🇦🇺" />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Country Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Australia" />
        </div>
        <div className="form-grid" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Accent Color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                style={{ width: 36, height: 36, padding: 2, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg3)', cursor: 'pointer' }} />
              <input value={color} onChange={e => setColor(e.target.value)} style={{ flex: 1, fontFamily: 'var(--font-mono)' }} />
            </div>
          </div>
          <div className="form-group">
            <label>Total Service Users</label>
            <input type="number" value={totalUsers} onChange={e => setTotalUsers(e.target.value)} min={0} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn sm" onClick={onClose}>Cancel</button>
          <button className="btn sm primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Add Region'}</button>
        </div>
      </div>
    </div>
  )
}
