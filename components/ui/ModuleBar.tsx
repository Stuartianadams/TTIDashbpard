import { fmt } from '@/lib/types'

interface Props {
  label: string
  color: string
  value: number
  max: number
}

export default function ModuleBar({ label, color, value, max }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="module-bar-row">
      <div className="module-bar-label">{label}</div>
      <div className="module-bar-track">
        <div className="module-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="module-bar-val">{fmt(value)}</div>
    </div>
  )
}
