'use client'

import dynamic from 'next/dynamic'
import { TypeBadge, BackupBadge } from '@/components/ui/Badge'
import { fmt, type Deployment, type Region } from '@/lib/types'

const VersionsBarChart = dynamic(() => import('@/components/charts/VersionsBarChart'), { ssr: false })
const BackupDoughnutChart = dynamic(() => import('@/components/charts/BackupDoughnutChart'), { ssr: false })

interface Props {
  deployments: Deployment[]
  regions: Region[]
}

export default function VersionsView({ deployments, regions }: Props) {
  const versions = Array.from(new Set(deployments.map(d => d.version))).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  )

  const regionCodes = Array.from(new Set(deployments.map(d => d.region?.code).filter(Boolean))) as string[]

  return (
    <>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Platform Version Distribution</div>
        <div className="chart-wrap" style={{ height: 260 }}>
          <VersionsBarChart deployments={deployments} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Version × Region Matrix</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Version</th>
                {regionCodes.map(code => {
                  const reg = deployments.find(d => d.region?.code === code)?.region
                  return <th key={code}>{reg?.flag} {reg?.name?.slice(0, 3)}</th>
                })}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {versions.map(ver => {
                const verDeps = deployments.filter(d => d.version === ver)
                return (
                  <tr key={ver}>
                    <td><span className="ver-chip">v{ver}</span></td>
                    {regionCodes.map(code => {
                      const count = verDeps.filter(d => d.region?.code === code).length
                      return (
                        <td key={code} style={{ textAlign: 'center' }}>
                          {count > 0
                            ? <span style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{count}</span>
                            : <span style={{ color: 'var(--text3)' }}>—</span>
                          }
                        </td>
                      )
                    })}
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>{verDeps.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="divider" />

        <div style={{ marginTop: 16 }}>
          <div className="card-title">Deployments by Version</div>
          {versions.map(ver => {
            const verDeps = deployments.filter(d => d.version === ver)
            return (
              <div key={ver} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="ver-chip" style={{ fontSize: 13 }}>v{ver}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{verDeps.length} deployment{verDeps.length !== 1 ? 's' : ''} · {fmt(verDeps.reduce((s, d) => s + d.users, 0))} users</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {verDeps.map(d => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: 'var(--bg3)', borderRadius: 6, border: '1px solid var(--border)' }}>
                      {d.region && <span>{d.region.flag}</span>}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{d.instance}</span>
                      <TypeBadge type={d.type} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Backup Method Distribution</div>
        <div className="grid-2" style={{ marginBottom: 0 }}>
          <div className="chart-wrap" style={{ height: 200 }}>
            <BackupDoughnutChart deployments={deployments} />
          </div>
          <div>
            <table className="data-table">
              <thead>
                <tr><th>Instance</th><th>Region</th><th>Backup</th><th>Type</th></tr>
              </thead>
              <tbody>
                {deployments.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{d.instance}</td>
                    <td>{d.region?.flag} {d.region?.name?.slice(0, 6)}</td>
                    <td><BackupBadge backup={d.backup} /></td>
                    <td><TypeBadge type={d.type} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
