import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DeploymentType } from '@prisma/client'

export async function GET() {
  try {
    const [
      totalRegions,
      deployments,
      modules,
      roadmapCounts,
    ] = await Promise.all([
      prisma.region.count(),
      prisma.deployment.findMany({
        select: { users: true, type: true },
      }),
      prisma.module.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { deploymentModules: { select: { userCount: true } } },
      }),
      prisma.roadmapFeature.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ])

    const totalUsers = deployments.reduce((sum, d) => sum + d.users, 0)
    const totalDeployments = deployments.length
    const hostedCount = deployments.filter(d => d.type === DeploymentType.Hosted).length
    const onPremiseCount = deployments.filter(d => d.type === DeploymentType.OnPremise).length

    const moduleStats = modules.map(m => ({
      id: m.id,
      key: m.key,
      label: m.label,
      color: m.color,
      sortOrder: m.sortOrder,
      totalUsers: m.deploymentModules.reduce((sum, dm) => sum + dm.userCount, 0),
    }))

    const roadmapByStatus = Object.fromEntries(
      roadmapCounts.map(r => [r.status, r._count._all])
    )

    return NextResponse.json({
      totalUsers,
      totalRegions,
      totalDeployments,
      hostedCount,
      onPremiseCount,
      moduleStats,
      roadmapByStatus,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch global stats' }, { status: 500 })
  }
}
