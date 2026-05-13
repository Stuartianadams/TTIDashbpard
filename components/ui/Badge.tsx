import type { DeploymentType, BackupStrategy } from '@/lib/types'

export function TypeBadge({ type }: { type: DeploymentType }) {
  return (
    <span className={`badge ${type === 'Hosted' ? 'hosted' : 'onprem'}`}>
      {type === 'OnPremise' ? 'On-Prem' : type}
    </span>
  )
}

export function VersionBadge({ version }: { version: string }) {
  return <span className="badge version">v{version}</span>
}

export function BackupBadge({ backup }: { backup: BackupStrategy }) {
  return (
    <span className={`badge ${backup === 'AAG' ? 'backup-aag' : 'backup-rep'}`}>
      {backup}
    </span>
  )
}
