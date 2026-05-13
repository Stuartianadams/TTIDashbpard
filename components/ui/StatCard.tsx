import { fmt } from '@/lib/types'

interface Props {
  label: string
  value: number | string
  sub: string
  color?: string
  format?: boolean
}

export default function StatCard({ label, value, sub, color = 'var(--accent)', format = true }: Props) {
  const display = typeof value === 'number' && format ? fmt(value) : value
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{display}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}
