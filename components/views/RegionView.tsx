'use client'

import { useState, useEffect } from 'react'
import { TypeBadge, VersionBadge, BackupBadge } from '@/components/ui/Badge'
import { fmt, type Region, type Module, type Deployment } from '@/lib/types'

interface Props {
  code: string
  modules: Module[]
  onBack: () => void
  onDataChange: () => void
}

export default function RegionView({ code, modules, onBack, onDataChange }: Props) {
  const [region, setRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editFields, setEditFields] = useState<{ name: string; flag: string; totalUsers: string }>({ name: '', flag: '', totalUsers: '' })

  const loadRegion = async () => {
    setLoading(true)
    const res = await fetch(`/api/regions/${code}`)
    const data = await res.json()
    setRegion(data)
    setEditFields({ name: data.name, flag: data.flag, totalUsers: String(data.totalUsers) })
    setLoading(false)
  }

  useEffect(() => { loadRegion() }, [code])

  const saveRegion = async () => {
    if (!region) return
    setSaving(true)
    await fetch(`/api/regions/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editFields.name, flag: editFields.flag, totalUsers: parseInt(editFields.totalUsers) || 0 }),
    })
    await loadRegion()
    onDataChange()
    setSaving(false)
  }

  const updateDeploymentVersion = async (depId: string, version: string) => {
    await fetch(`/api/deployments/${depId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version }),
    })
    await loadRegion()
    onDataChange()
  }

  if (loading) return <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13, padding: '40px 0' }}>Loading region...</div>
  if (!region) return <div style={{ color: 'var(--coral)' }}>Region not found</div>

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <button className="btn sm" onClick={onBack}>← Back to Global</button>
      </div>

      {/* Region Settings */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-header">
          <div className="section-title" style={{ fontFamily: 'var(--font-head)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{region.flag}</span>
            {region.name}
          </div>
          <button className="btn sm primary" onClick={saveRegion} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Country Name</label>
            <input value={editFields.name} onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Flag Emoji</label>
            <input value={editFields.flag} onChange={e => setEditFields(f => ({ ...f, flag: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Total Service Users</label>
            <input type="number" value={editFields.totalUsers} onChange={e => setEditFields(f => ({ ...f, totalUsers: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Regional Modules */}
      {region.regionalModules && region.regionalModules.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-title">Regional Modules</div>
          {region.regionalModules.map(rm => (
            <div key={rm.id} className="regional-module-item">
              <div className="rm-info">
                <div className="rm-name">{rm.name}</div>
                <div className="rm-desc">{rm.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deployments */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">Deployments</div>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {region.deployments?.length ?? 0} total · {fmt(region.deployments?.reduce((s, d) => s + d.users, 0) ?? 0)} users
          </span>
        </div>

        {region.deployments?.map((dep) => (
          <DeploymentPanel key={dep.id} dep={dep} modules={modules} onVersionChange={v => updateDeploymentVersion(dep.id, v)} />
        ))}
      </div>
    </>
  )
}

function DeploymentPanel({ dep, modules, onVersionChange }: { dep: Deployment; modules: Module[]; onVersionChange: (v: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [editVersion, setEditVersion] = useState(dep.version)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await onVersionChange(editVersion)
    setSaving(false)
  }

  return (
    <div className="deployment-item" style={{ marginBottom: 10 }}>
      <div className="section-header" style={{ marginBottom: expanded ? 14 : 0, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div className="dep-row" style={{ marginBottom: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{dep.instance}</span>
          <TypeBadge type={dep.type} />
          <VersionBadge version={dep.version} />
          <BackupBadge backup={dep.backup} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{fmt(dep.users)} users</span>
          {dep.cti > 0 && <span style={{ fontSize: 10, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>CTI ×{dep.cti}</span>}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <>
          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label>Version</label>
              <input value={editVersion} onChange={e => setEditVersion(e.target.value)} />
            </div>
          </div>
          <button className="btn sm primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>

          {dep.modules && dep.modules.length > 0 && (
            <>
              <div className="divider" />
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Module Users</div>
              <div className="modules-grid">
                {dep.modules.filter(m => m.userCount > 0).map(dm => (
                  <div key={dm.id} className="module-input">
                    <label style={{ color: dm.module.color }}>{dm.module.label}</label>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', padding: '5px 8px', background: 'var(--bg4)', borderRadius: 6, border: '1px solid var(--border)' }}>
                      {fmt(dm.userCount)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
