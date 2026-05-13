'use client'

import { Bubble } from 'react-chartjs-2'
import {
  Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend,
} from 'chart.js'
import type { Module, RegionStats } from '@/lib/types'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

interface Props {
  modules: Module[]
  regionStats: RegionStats[]
}

export default function BubbleChart({ modules, regionStats }: Props) {
  const maxUsers = Math.max(...regionStats.flatMap(r => r.moduleStats.map(m => m.totalUsers)), 1)

  const datasets = modules.map((mod, mi) => {
    const points = regionStats.map((reg, ri) => {
      const ms = reg.moduleStats.find(m => m.key === mod.key)
      const u = ms?.totalUsers ?? 0
      return { x: ri, y: mi, r: Math.max(3, Math.sqrt(u / maxUsers) * 30) }
    }).filter(p => p.r > 3)

    return {
      label: mod.label,
      data: points,
      backgroundColor: mod.color + '99',
      borderColor: mod.color,
      borderWidth: 1,
    }
  })

  return (
    <Bubble
      data={{ datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const mod = modules[ctx.datasetIndex]
                const reg = regionStats[Math.round(ctx.parsed.x ?? 0)]
                const ms = reg?.moduleStats.find(m => m.key === mod?.key)
                return `${mod?.label} / ${reg?.name}: ${(ms?.totalUsers ?? 0).toLocaleString()} users`
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#9098b0', font: { size: 10 }, callback: (v) => regionStats[Number(v)]?.flag ?? '' },
            grid: { color: 'rgba(255,255,255,0.04)' },
            min: -0.5,
            max: regionStats.length - 0.5,
          },
          y: {
            ticks: { color: '#9098b0', font: { family: 'DM Mono', size: 10 }, callback: (v) => modules[Number(v)]?.label ?? '' },
            grid: { color: 'rgba(255,255,255,0.04)' },
            min: -0.5,
            max: modules.length - 0.5,
          },
        },
      }}
    />
  )
}
