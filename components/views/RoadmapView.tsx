'use client'

import { useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import {
  fmt, pct, CATEGORY_LABELS, CATEGORY_COLORS, FY_COLORS,
  type RoadmapFeature, type Region, type Module,
  type FiscalYear, type RoadmapStatus, type RoadmapCategory,
} from '@/lib/types'

const FYS: FiscalYear[] = ['FY26', 'FY27', 'FY28', 'FY29']
const STATUSES: RoadmapStatus[] = ['planned', 'in_progress', 'delivered', 'cancelled']
const STATUS_LABELS: Record<RoadmapStatus, string> = {
  planned: 'Planned', in_progress: 'In Progress', delivered: 'Delivered', cancelled: 'Cancelled',
}

interface Props {
  features: RoadmapFeature[]
  regions: Region[]
  modules: Module[]
  onDataChange: () => void
}

export default function RoadmapView({ features, regions, modules, onDataChange }: Props) {
  const [activeFYs, setActiveFYs] = useState<Set<FiscalYear>>(new Set(['FY26', 'FY27', 'FY28'] as FiscalYear[]))
  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set(regions.map(r => r.code)))
  const [editingFeature, setEditingFeature] = useState<RoadmapFeature | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const visible = features.filter(f => {
    if (!activeFYs.has(f.fiscalYear)) return false
    if (activeRegions.size < regions.length) {
      const featureRegions = new Set(f.regions.map(r => r.region.code))
      if (!Array.from(activeRegions).some(rc => featureRegions.has(rc))) return false
    }
    return true
  })

  const toggleFY = (fy: FiscalYear) => {
    setActiveFYs(prev => {
      const next = new Set(prev)
      if (next.has(fy)) { if (next.size > 1) next.delete(fy) } else next.add(fy)
      return next
    })
  }

  const toggleRegion = (code: string) => {
    setActiveRegions(prev => {
      if (prev.size === regions.length) return new Set([code])
      if (prev.has(code) && prev.size === 1) return new Set(regions.map(r => r.code))
      const next = new Set(prev)
      if (next.has(code)) next.delete(code); else next.add(code)
      return next
    })
  }

  const openCreate = () => {
    setEditingFeature(null)
    setIsCreating(true)
    setShowModal(true)
  }

  const openEdit = (f: RoadmapFeature) => {
    setEditingFeature(f)
    setIsCreating(false)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingFeature(null)
    setIsCreating(false)
  }

  const affectedUsers = (() => {
    const codes = new Set(visible.flatMap(f => f.regions.map(r => r.region.code)))
    return regions.filter(r => codes.has(r.code)).reduce((s, r) => s + r.totalUsers, 0)
  })()

  const inProgress = visible.filter(f => f.status === 'in_progress').length

  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>Planning Periods</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {FYS.map(fy => (
              <button key={fy} className={`fy-btn${activeFYs.has(fy) ? ' active' : ''}`} onClick={() => toggleFY(fy)}
                style={activeFYs.has(fy) ? { background: FY_COLORS[fy] + '26', borderColor: FY_COLORS[fy] + '66', color: FY_COLORS[fy] } : {}}>
                {fy}
              </button>
            ))}
            <button className="btn sm primary" onClick={openCreate} style={{ marginLeft: 6 }}>+ New Feature</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {regions.map(r => (
            <button key={r.code} className={`region-filter-btn${activeRegions.has(r.code) ? ' active' : ''}`} onClick={() => toggleRegion(r.code)}>
              {r.flag} {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Visible Features" value={visible.length} sub="Matching filters" color="var(--accent)" format={false} />
        <StatCard label="In Progress" value={inProgress} sub="Active development" color="var(--amber)" format={false} />
        <StatCard label="Affected Users" value={affectedUsers} sub="Across filtered regions" color="var(--teal)" />
        <StatCard label="Regions" value={activeRegions.size} sub="In current filter" color="var(--purple)" format={false} />
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {FYS.filter(fy => activeFYs.has(fy)).map(fy => {
          const fyFeatures = visible.filter(f => f.fiscalYear === fy)
          return (
            <div key={fy} className="fy-column">
              <div className="fy-column-header" style={{ borderTop: `2px solid ${FY_COLORS[fy]}` }}>
                <span style={{ color: FY_COLORS[fy] }}>{fy}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{fyFeatures.length}</span>
              </div>
              <div className="fy-column-body">
                {fyFeatures.map(f => (
                  <FeatureCard key={f.id} feature={f} regions={regions} onClick={() => openEdit(f)} />
                ))}
                {fyFeatures.length === 0 && (
                  <div style={{ color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '20px 0', textAlign: 'center' }}>
                    No features
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (isCreating || editingFeature) && (
        <FeatureModal
          feature={isCreating ? null : editingFeature}
          regions={regions}
          modules={modules}
          onClose={closeModal}
          onSaved={() => { closeModal(); onDataChange() }}
        />
      )}
    </>
  )
}

function FeatureCard({ feature: f, regions, onClick }: { feature: RoadmapFeature; regions: Region[]; onClick: () => void }) {
  const catColor = CATEGORY_COLORS[f.category]
  const affectedUsers = (() => {
    const codes = new Set(f.regions.map(r => r.region.code))
    return regions.filter(r => codes.has(r.code)).reduce((s, r) => s + r.totalUsers, 0)
  })()
  const totalUsers = regions.reduce((s, r) => s + r.totalUsers, 0)

  return (
    <div className="feature-card" style={{ borderLeftColor: catColor }} onClick={onClick}>
      <div className="feat-name">{f.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span className={`status-dot status-${f.status}`} />
        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{STATUS_LABELS[f.status]}</span>
        {f.module && (
          <span className="feat-module-badge" style={{ borderColor: f.module.color + '66', color: f.module.color }}>
            {f.module.label}
          </span>
        )}
      </div>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: catColor, marginBottom: 6 }}>
        {CATEGORY_LABELS[f.category]}
      </div>
      <div className="feat-regions">
        {f.regions.map(r => (
          <span key={r.id} className="feat-region-chip">{r.region.flag} {r.region.name.slice(0, 8)}</span>
        ))}
      </div>
      {f.description && <div className="feat-desc-text">{f.description}</div>}
      {affectedUsers > 0 && (
        <div className="users-summary-bar">
          <span>{fmt(affectedUsers)}</span>
          <div className="ubar-track">
            <div className="ubar-fill" style={{ width: `${pct(affectedUsers, totalUsers)}%`, background: catColor }} />
          </div>
          <span>{pct(affectedUsers, totalUsers)}%</span>
        </div>
      )}
    </div>
  )
}

interface ModalProps {
  feature: RoadmapFeature | null
  regions: Region[]
  modules: Module[]
  onClose: () => void
  onSaved: () => void
}

function FeatureModal({ feature, regions, modules, onClose, onSaved }: ModalProps) {
  const [name, setName] = useState(feature?.name ?? '')
  const [description, setDescription] = useState(feature?.description ?? '')
  const [status, setStatus] = useState<RoadmapStatus>(feature?.status ?? 'planned')
  const [fiscalYear, setFiscalYear] = useState<FiscalYear>(feature?.fiscalYear ?? 'FY26')
  const [category, setCategory] = useState<RoadmapCategory>(feature?.category ?? 'Product_Software')
  const [moduleId, setModuleId] = useState(feature?.module?.key ?? '')
  const [selectedRegions, setSelectedRegions] = useState(new Set(feature?.regions.map(r => r.region.code) ?? []))
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isEdit = feature !== null

  const toggleReg = (code: string) => {
    setSelectedRegions(prev => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code); else next.add(code)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const mod = modules.find(m => m.key === moduleId)
    const payload = { name, description, status, fiscalYear, category, moduleId: mod?.id ?? null, regionCodes: Array.from(selectedRegions) }

    if (isEdit) {
      await fetch(`/api/roadmap/${feature.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    setSaving(false)
    onSaved()
  }

  const handleDelete = async () => {
    await fetch(`/api/roadmap/${feature!.id}`, { method: 'DELETE' })
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{isEdit ? 'Edit Feature' : 'New Feature'}</h3>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
        </div>
        <div className="form-grid" style={{ marginBottom: 12 }}>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as RoadmapStatus)}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Fiscal Year</label>
            <select value={fiscalYear} onChange={e => setFiscalYear(e.target.value as FiscalYear)}>
              {FYS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as RoadmapCategory)}>
              {(Object.keys(CATEGORY_LABELS) as RoadmapCategory[]).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Module</label>
            <select value={moduleId} onChange={e => setModuleId(e.target.value)}>
              <option value="">— None —</option>
              {modules.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Regions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {regions.map(r => (
              <div
                key={r.code}
                onClick={() => toggleReg(r.code)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 6, border: `1px solid ${selectedRegions.has(r.code) ? 'rgba(79,142,247,0.4)' : 'var(--border)'}`, background: selectedRegions.has(r.code) ? 'rgba(79,142,247,0.08)' : 'var(--bg3)', cursor: 'pointer', fontSize: 12, color: selectedRegions.has(r.code) ? 'var(--text)' : 'var(--text2)' }}
              >
                {r.flag} {r.name}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {isEdit && (
              <button className="btn sm" style={{ color: 'var(--coral)', borderColor: 'rgba(240,96,96,0.3)' }} onClick={() => setConfirmDelete(true)}>
                Delete Feature
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn sm" onClick={onClose}>Cancel</button>
            <button className="btn sm primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete feature "${feature!.name}"? This cannot be undone.`}
          confirmLabel="Delete Feature"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
