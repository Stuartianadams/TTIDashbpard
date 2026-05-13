'use client'

import type { Region, GlobalStats } from '@/lib/types'
import { fmt } from '@/lib/types'

export type View = 'global' | 'modules' | 'versions' | 'marketecture' | 'roadmap' | 'releases' | 'region'

interface Props {
  currentView: View
  currentRegionCode: string | null
  regions: Region[]
  globalStats: GlobalStats | null
  onSwitchView: (view: View, regionCode?: string) => void
}

const NAV_ITEMS: Array<{ id: View; label: string; icon: React.ReactNode }> = [
  {
    id: 'global', label: 'Global Overview',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="7"/><path d="M8 1c-2.5 2-4 4.5-4 7s1.5 5 4 7"/><path d="M8 1c2.5 2 4 4.5 4 7s-1.5 5-4 7"/><path d="M1 8h14"/></svg>,
  },
  {
    id: 'modules', label: 'Module Analysis',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  },
  {
    id: 'versions', label: 'Version Matrix',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M4 8h8M6 12h4"/></svg>,
  },
  {
    id: 'marketecture', label: 'Platform Marketecture',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="2"/><path d="M5 3v10M11 3v10M1 8h14"/></svg>,
  },
  {
    id: 'roadmap', label: 'Roadmap',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 4h14M1 8h10M1 12h7"/><circle cx="13" cy="12" r="2"/></svg>,
  },
  {
    id: 'releases', label: 'Releases',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 14V6l6-4 6 4v8"/><path d="M6 14v-4h4v4"/><path d="M2 6h12"/></svg>,
  },
]

export default function Sidebar({ currentView, currentRegionCode, regions, globalStats, onSwitchView }: Props) {
  const totalDeps = globalStats?.totalDeployments ?? regions.reduce((s, r) => s + (r._count?.deployments ?? 0), 0)
  const totalUsers = globalStats?.totalUsers ?? regions.reduce((s, r) => s + r.totalUsers, 0)

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>TTI DASHBOARD</h1>
        <p>Global Operations View</p>
      </div>

      <div className="nav-section">
        <div className="nav-label">Views</div>
        {NAV_ITEMS.map(v => (
          <div
            key={v.id}
            className={`nav-item${currentView === v.id && currentView !== 'region' ? ' active' : ''}`}
            onClick={() => onSwitchView(v.id)}
          >
            {v.icon}
            {v.label}
          </div>
        ))}
      </div>

      <div className="nav-section" style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 16 }}>
        <div className="nav-label">Regions</div>
        {regions.map(r => (
          <div
            key={r.code}
            className={`nav-item${currentView === 'region' && currentRegionCode === r.code ? ' active' : ''}`}
            onClick={() => onSwitchView('region', r.code)}
          >
            <span className="flag">{r.flag}</span>
            <span style={{ flex: 1 }}>{r.name}</span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
              {r._count?.deployments ?? 0}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: 14, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#f5c842', background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 5, padding: '5px 8px', marginBottom: 10, lineHeight: 1.4 }}>
          ⚠ Work in Progress
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>
          <div>Total regions: <span style={{ color: 'var(--text2)' }}>{regions.length}</span></div>
          <div>Total deployments: <span style={{ color: 'var(--text2)' }}>{totalDeps}</span></div>
          <div>Total service users: <span style={{ color: 'var(--text2)' }}>{fmt(totalUsers)}</span></div>
        </div>
      </div>
    </aside>
  )
}
