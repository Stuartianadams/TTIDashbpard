'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip,
} from 'chart.js'
import type { Deployment } from '@/lib/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface Props { deployments: Deployment[] }

export default function VersionsBarChart({ deployments }: Props) {
  const counts: Record<string, number> = {}
  for (const d of deployments) {
    counts[d.version] = (counts[d.version] ?? 0) + 1
  }
  const sorted = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))

  return (
    <Bar
      data={{
        labels: sorted.map(([v]) => `v${v}`),
        datasets: [{
          label: 'Deployments',
          data: sorted.map(([, c]) => c),
          backgroundColor: 'rgba(79,142,247,0.7)',
          borderColor: '#4f8ef7',
          borderWidth: 1,
          borderRadius: 4,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9098b0', font: { family: 'DM Mono', size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#9098b0', stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
      }}
    />
  )
}
