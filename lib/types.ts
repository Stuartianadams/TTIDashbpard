export type DeploymentType = 'Hosted' | 'OnPremise'
export type BackupStrategy = 'AAG' | 'Replication'
export type RoadmapStatus = 'planned' | 'in_progress' | 'delivered' | 'cancelled'
export type RoadmapCategory = 'Product_Software' | 'Product_Hardware' | 'Product_Data' | 'Engineering' | 'Innovation'
export type FiscalYear = 'FY26' | 'FY27' | 'FY28' | 'FY29'

export const CATEGORY_LABELS: Record<RoadmapCategory, string> = {
  Product_Software: 'Product - Software',
  Product_Hardware: 'Product - Hardware',
  Product_Data: 'Product - Data',
  Engineering: 'Engineering',
  Innovation: 'Innovation',
}

export const CATEGORY_COLORS: Record<RoadmapCategory, string> = {
  Product_Software: '#4f8ef7',
  Product_Hardware: '#2ec4a0',
  Product_Data: '#5bc4ef',
  Engineering: '#f5a623',
  Innovation: '#9b7af5',
}

export const FY_COLORS: Record<FiscalYear, string> = {
  FY26: '#4f8ef7',
  FY27: '#2ec4a0',
  FY28: '#9b7af5',
  FY29: '#f5a623',
}

export interface Module {
  id: string
  key: string
  label: string
  color: string
  sortOrder: number
  totalUsers: number
}

export interface RegionalModule {
  id: string
  name: string
  description: string
  sortOrder: number
}

export interface DeploymentModuleEntry {
  id: string
  moduleId: string
  userCount: number
  module: { key: string; label: string; color: string; sortOrder?: number }
}

export interface Deployment {
  id: string
  regionId: string
  instance: string
  type: DeploymentType
  version: string
  users: number
  backup: BackupStrategy
  cti: number
  modules?: DeploymentModuleEntry[]
  region?: { code: string; name: string; flag: string; color?: string }
}

export interface Region {
  id: string
  code: string
  name: string
  flag: string
  color: string
  totalUsers: number
  deployments?: Deployment[]
  regionalModules?: RegionalModule[]
  _count?: { deployments: number; regionalModules: number }
}

export interface RoadmapFeatureRegion {
  id: string
  region: { code: string; name: string; flag: string }
}

export interface RoadmapFeature {
  id: string
  name: string
  description: string
  category: RoadmapCategory
  fiscalYear: FiscalYear
  status: RoadmapStatus
  userImpact?: number | null
  module?: { key: string; label: string; color: string } | null
  regions: RoadmapFeatureRegion[]
}

export interface ReleaseComponent {
  id: string
  count: number
  areaLabel?: string | null
  module?: { key: string; label: string; color: string } | null
}

export interface Release {
  id: string
  label: string
  sortOrder: number
  isBaseline: boolean
  baselineCount?: number | null
  releasedAt?: string | null
  components: ReleaseComponent[]
}

export interface GlobalStats {
  totalUsers: number
  totalRegions: number
  totalDeployments: number
  hostedCount: number
  onPremiseCount: number
  moduleStats: Module[]
  roadmapByStatus: Record<string, number>
}

export interface RegionStats {
  id: string
  code: string
  name: string
  flag: string
  color: string
  totalUsers: number
  deploymentUserSum: number
  deploymentCount: number
  hostedCount: number
  onPremiseCount: number
  regionalModuleCount: number
  versions: string[]
  moduleStats: Array<{ key: string; label: string; color: string; totalUsers: number }>
}

export function fmt(n: number): string {
  return n.toLocaleString()
}

export function pct(a: number, b: number): number {
  if (b === 0) return 0
  return Math.round((a / b) * 100)
}
