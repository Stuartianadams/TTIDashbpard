'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar, { type View } from '@/components/layout/Sidebar'
import GlobalView from '@/components/views/GlobalView'
import ModulesView from '@/components/views/ModulesView'
import VersionsView from '@/components/views/VersionsView'
import RegionView from '@/components/views/RegionView'
import RoadmapView from '@/components/views/RoadmapView'
import ReleasesView from '@/components/views/ReleasesView'
import MarketectureView from '@/components/views/MarketectureView'
import type {
  GlobalStats, Region, Module, RoadmapFeature, Release, RegionStats, Deployment,
} from '@/lib/types'

const VIEW_META: Record<View, { title: string; sub: string }> = {
  global:        { title: 'Global Overview',         sub: 'Tunstall Services Platform — Infrastructure Dashboard' },
  modules:       { title: 'Module Analysis',          sub: 'Platform module adoption across all regions' },
  versions:      { title: 'Version Matrix',           sub: 'Platform version distribution and deployment status' },
  marketecture:  { title: 'Platform Marketecture',    sub: 'Customer value stream and system architecture' },
  roadmap:       { title: 'Roadmap',                  sub: 'Product and engineering planning periods' },
  releases:      { title: 'Releases',                 sub: 'Cumulative feature adoption by release' },
  region:        { title: 'Region',                   sub: 'Deployments and regional configuration' },
}

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('global')
  const [currentRegionCode, setCurrentRegionCode] = useState<string | null>(null)

  const [globalStats, setGlobalStats]   = useState<GlobalStats | null>(null)
  const [regions, setRegions]           = useState<Region[]>([])
  const [regionStats, setRegionStats]   = useState<RegionStats[]>([])
  const [modules, setModules]           = useState<Module[]>([])
  const [roadmap, setRoadmap]           = useState<RoadmapFeature[]>([])
  const [releases, setReleases]         = useState<Release[]>([])
  const [deployments, setDeployments]   = useState<Deployment[]>([])
  const [loading, setLoading]           = useState(true)

  const loadData = useCallback(async () => {
    try {
      const results = await Promise.all([
        fetch('/api/stats/global').then(r => r.json()),
        fetch('/api/regions').then(r => r.json()),
        fetch('/api/stats/regions').then(r => r.json()),
        fetch('/api/modules').then(r => r.json()),
        fetch('/api/roadmap').then(r => r.json()),
        fetch('/api/releases').then(r => r.json()),
        fetch('/api/deployments').then(r => r.json()),
      ])
      setGlobalStats(results[0])
      setRegions(results[1])
      setRegionStats(results[2])
      setModules(results[3])
      setRoadmap(results[4])
      setReleases(results[5])
      setDeployments(results[6])
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const switchView = (view: View, regionCode?: string) => {
    setCurrentView(view)
    if (regionCode) setCurrentRegionCode(regionCode)
  }

  const currentRegion = currentRegionCode ? regions.find(r => r.code === currentRegionCode) : null
  const title = currentView === 'region' && currentRegion ? currentRegion.name : VIEW_META[currentView].title
  const sub = VIEW_META[currentView].sub

  return (
    <div className="shell">
      <Sidebar
        currentView={currentView}
        currentRegionCode={currentRegionCode}
        regions={regions}
        globalStats={globalStats}
        onSwitchView={switchView}
      />

      <div className="main">
        <div className="topbar">
          <div>
            <h2>{title}</h2>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {sub}
            </div>
          </div>
        </div>

        <div className="content">
          {loading ? (
            <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13, paddingTop: 40 }}>
              Loading data…
            </div>
          ) : (
            <>
              {currentView === 'global' && (
                <GlobalView
                  globalStats={globalStats}
                  regionStats={regionStats}
                  deployments={deployments}
                  modules={modules}
                  onRegionClick={code => switchView('region', code)}
                  onDataChange={loadData}
                />
              )}
              {currentView === 'modules' && (
                <ModulesView modules={modules} regionStats={regionStats} />
              )}
              {currentView === 'versions' && (
                <VersionsView deployments={deployments} regions={regions} />
              )}
              {currentView === 'region' && currentRegionCode && (
                <RegionView
                  code={currentRegionCode}
                  modules={modules}
                  onBack={() => switchView('global')}
                  onDataChange={loadData}
                />
              )}
              {currentView === 'marketecture' && (
                <MarketectureView regions={regions} />
              )}
              {currentView === 'roadmap' && (
                <RoadmapView
                  features={roadmap}
                  regions={regions}
                  modules={modules}
                  onDataChange={loadData}
                />
              )}
              {currentView === 'releases' && (
                <ReleasesView releases={releases} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
