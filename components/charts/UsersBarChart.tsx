'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js'
import type { RegionStats } from '@/lib/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Props { regionStats: RegionStats[] }

export default function UsersBarChart({ regionStats }: Props) {
  const data = {
    labels: regionStats.map(r => `${r.flag} ${r.name}`),
    datasets: [{
      label: 'Service Users',
      data: regionStats.map(r => r.totalUsers),
      backgroundColor: regionStats.map(r => r.color + 'cc'),
      borderColor: regionStats.map(r => r.color),
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${(ctx.parsed.y ?? 0).toLocaleString()} users` } } },
        scales: {
          x: { ticks: { color: '#9098b0', font: { family: 'DM Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#9098b0', font: { family: 'DM Mono', size: 10 }, callback: (v: string | number) => Number(v).toLocaleString() }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
      }}
    />
  )
}
