'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js'
import type { Module, RegionStats } from '@/lib/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const SHOW_MODULES = ['arc', 'service_manager', 'tsp_portal', 'proactive', 'service_hooks', 'notifications']

interface Props {
  modules: Module[]
  regionStats: RegionStats[]
}

export default function HeatmapChart({ modules, regionStats }: Props) {
  const shownModules = modules.filter(m => SHOW_MODULES.includes(m.key))

  const datasets = shownModules.map(mod => ({
    label: mod.label,
    data: regionStats.map(reg => {
      const ms = reg.moduleStats.find(m => m.key === mod.key)
      if (!ms || reg.totalUsers === 0) return 0
      return Math.round((ms.totalUsers / reg.totalUsers) * 100)
    }),
    backgroundColor: mod.color + 'cc',
    borderColor: mod.color,
    borderWidth: 1,
    borderRadius: 3,
  }))

  return (
    <Bar
      data={{ labels: regionStats.map(r => r.flag), datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#9098b0', font: { size: 10 }, boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } },
        },
        scales: {
          x: { ticks: { color: '#9098b0', font: { size: 12 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { max: 110, ticks: { color: '#9098b0', font: { size: 10 }, callback: v => `${v}%` }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
      }}
    />
  )
}
