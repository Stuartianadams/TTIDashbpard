'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { Deployment } from '@/lib/types'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props { deployments: Deployment[] }

export default function BackupDoughnutChart({ deployments }: Props) {
  const aag = deployments.filter(d => d.backup === 'AAG').length
  const rep = deployments.filter(d => d.backup === 'Replication').length

  return (
    <Doughnut
      data={{
        labels: ['AAG', 'Replication'],
        datasets: [{
          data: [aag, rep],
          backgroundColor: ['rgba(155,122,245,0.8)', 'rgba(91,191,114,0.8)'],
          borderColor: ['#9b7af5', '#5bbf72'],
          borderWidth: 1,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { labels: { color: '#9098b0', font: { size: 11 } } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} deployments` } },
        },
      }}
    />
  )
}
