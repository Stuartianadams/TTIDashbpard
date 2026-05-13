'use client'

import { useState, useEffect } from 'react'
import { TypeBadge, VersionBadge, BackupBadge } from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { fmt, type Region, type Module, type Deployment, type DeploymentType, type BackupStrategy } from '@/lib/types'

interface Props {
  code: string
  modules: Module[]
  onBack: () => void
  onDataChange: () => void
}

const DEPLOYMENT_TYPES: DeploymentType[] = ['Hosted', 'OnPremise']
const BACKUP_STRATEGIES: BackupStrategy[] = ['AAG', 'Replication']

export default function RegionView({ code, modules, onBack, onDataChange }: Props) {
  const [region, setRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editFields, setEditFields] = useState<{ name: string; flag: string; totalUsers: string }>({ name: '', flag: '', totalUsers: '' })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showAddDep, setShowAddDep] = useState(false)

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

  const deleteRegion = async () => {
    await fetch(`/api/regions/${code}`, { method: 'DELETE' })
    onDataChange()
    onBack()
  }

  const updateDeployment = async (depId: string, updates: Record<string, unknown>) => {
    await fetch(`/api/deployments/${depId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    await loadRegion()
    onDataChange()
  }

  const deleteDeployment = async (depId: string) => {
    await fetch(`/api/deployments/${depId}`, { method: 'DELETE' })
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm" style={{ color: 'var(--coral)', borderColor: 'rgba(240,96,96,0.3)' }} onClick={() => setConfirmDelete(true)}>
              Delete Region
            </button>
            <button className="btn sm primary" onClick={saveRegion} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              {region.deployments?.length ?? 0} total · {fmt(region.deployments?.reduce((s, d) => s + d.users, 0) ?? 0)} users
            </span>
            <button className="btn sm primary" onClick={() => setShowAddDep(true)}>+ Add Deployment</button>
          </div>
        </div>

        {region.deployments?.map((dep) => (
          <DeploymentPanel
            key={dep.id}
            dep={dep}
            modules={modules}
            onSave={updates => updateDeployment(dep.id, updates)}
            onDelete={() => deleteDeployment(dep.id)}
          />
        ))}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete region "${region.name}"? This will also delete all associated deployments and data. This cannot be undone.`}
          confirmLabel="Delete Region"
          danger
          onConfirm={deleteRegion}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {showAddDep && (
        <AddDeploymentModal
          regionCode={code}
          modules={modules}
          onClose={() => setShowAddDep(false)}
          onSaved={() => { setShowAddDep(false); loadRegion(); onDataChange() }}
        />
      )}
    </>
  )
}

interface DeploymentPanelProps {
  dep: Deployment
  modules: Module[]
  onSave: (updates: Record<string, unknown>) => Promise<void>
  onDelete: () => Promise<void>
}

function DeploymentPanel({ dep, modules, onSave, onDelete }: DeploymentPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [editInstance, setEditInstance] = useState(dep.instance)
  const [editType, setEditType] = useState<DeploymentType>(dep.type)
  const [editVersion, setEditVersion] = useState(dep.version)
  const [editUsers, setEditUsers] = useState(String(dep.users))
  const [editBackup, setEditBackup] = useState<BackupStrategy>(dep.backup)
  const [editCti, setEditCti] = useState(String(dep.cti))
  const [moduleInputs, setModuleInputs] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    modules.forEach(mod => {
      const found = dep.modules?.find(dm => dm.module.key === mod.key)
      m[mod.key] = String(found?.userCount ?? 0)
    })
    return m
  })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = async () => {
    setSaving(true)
    const modulePayload: Record<string, number> = {}
    modules.forEach(m => { modulePayload[m.key] = parseInt(moduleInputs[m.key]) || 0 })
    await onSave({
      instance: editInstance,
      type: editType,
      version: editVersion,
      users: parseInt(editUsers) || 0,
      backup: editBackup,
      cti: parseInt(editCti) || 0,
      modules: modulePayload,
    })
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
          <div className="form-grid" style={{ marginBottom: 12 }}>
            <div className="form-group">
              <label>Instance</label>
              <input value={editInstance} onChange={e => setEditInstance(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={editType} onChange={e => setEditType(e.target.value as DeploymentType)}>
                {DEPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Version</label>
              <input value={editVersion} onChange={e => setEditVersion(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Service Users</label>
              <input type="number" value={editUsers} onChange={e => setEditUsers(e.target.value)} min={0} />
            </div>
            <div className="form-group">
              <label>Backup Strategy</label>
              <select value={editBackup} onChange={e => setEditBackup(e.target.value as BackupStrategy)}>
                {BACKUP_STRATEGIES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>CTI Servers</label>
              <input type="number" value={editCti} onChange={e => setEditCti(e.target.value)} min={0} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Module Users</div>
            <div className="modules-grid">
              {modules.map(mod => (
                <div key={mod.key} className="module-input">
                  <label style={{ color: mod.color }}>{mod.label}</label>
                  <input
                    type="number"
                    value={moduleInputs[mod.key] ?? '0'}
                    onChange={e => setModuleInputs(prev => ({ ...prev, [mod.key]: e.target.value }))}
                    min={0}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn sm" style={{ color: 'var(--coral)', borderColor: 'rgba(240,96,96,0.3)' }} onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          </div>
        </>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete deployment "${dep.instance}"? This cannot be undone.`}
          confirmLabel="Delete Deployment"
          danger
          onConfirm={onDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

interface AddDeploymentModalProps {
  regionCode: string
  modules: Module[]
  onClose: () => void
  onSaved: () => void
}

function AddDeploymentModal({ regionCode, modules, onClose, onSaved }: AddDeploymentModalProps) {
  const [instance, setInstance] = useState('')
  const [type, setType] = useState<DeploymentType>('Hosted')
  const [version, setVersion] = useState('')
  const [users, setUsers] = useState('0')
  const [backup, setBackup] = useState<BackupStrategy>('AAG')
  const [cti, setCti] = useState('0')
  const [moduleInputs, setModuleInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(modules.map(m => [m.key, '0']))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!instance.trim() || !version.trim()) {
      setError('Instance and version are required')
      return
    }
    setSaving(true)
    setError('')
    const modulePayload: Record<string, number> = {}
    modules.forEach(m => { modulePayload[m.key] = parseInt(moduleInputs[m.key]) || 0 })

    const res = await fetch(`/api/regions/${regionCode}/deployments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instance: instance.trim(),
        type,
        version: version.trim(),
        users: parseInt(users) || 0,
        backup,
        cti: parseInt(cti) || 0,
        modules: modulePayload,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to create deployment')
      setSaving(false)
      return
    }
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <h3>Add Deployment</h3>
        {error && (
          <div style={{ color: 'var(--coral)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 12, padding: '8px 10px', background: 'rgba(240,96,96,0.08)', borderRadius: 6, border: '1px solid rgba(240,96,96,0.2)' }}>
            {error}
          </div>
        )}
        <div className="form-grid" style={{ marginBottom: 12 }}>
          <div className="form-group">
            <label>Instance Name</label>
            <input value={instance} onChange={e => setInstance(e.target.value)} placeholder="e.g. AU-PROD-01" />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value as DeploymentType)}>
              {DEPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Version</label>
            <input value={version} onChange={e => setVersion(e.target.value)} placeholder="e.g. 6.3.2" />
          </div>
          <div className="form-group">
            <label>Service Users</label>
            <input type="number" value={users} onChange={e => setUsers(e.target.value)} min={0} />
          </div>
          <div className="form-group">
            <label>Backup Strategy</label>
            <select value={backup} onChange={e => setBackup(e.target.value as BackupStrategy)}>
              {BACKUP_STRATEGIES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>CTI Servers</label>
            <input type="number" value={cti} onChange={e => setCti(e.target.value)} min={0} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Module Users (optional)</div>
          <div className="modules-grid">
            {modules.map(mod => (
              <div key={mod.key} className="module-input">
                <label style={{ color: mod.color }}>{mod.label}</label>
                <input
                  type="number"
                  value={moduleInputs[mod.key] ?? '0'}
                  onChange={e => setModuleInputs(prev => ({ ...prev, [mod.key]: e.target.value }))}
                  min={0}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn sm" onClick={onClose}>Cancel</button>
          <button className="btn sm primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Add Deployment'}</button>
        </div>
      </div>
    </div>
  )
}
