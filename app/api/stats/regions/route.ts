import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DeploymentType } from '@prisma/client'

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' },
      include: {
        deployments: {
          select: {
            id: true,
            type: true,
            version: true,
            users: true,
            modules: {
              select: { userCount: true, module: { select: { key: true, label: true, color: true } } },
            },
          },
        },
        _count: { select: { regionalModules: true } },
      },
    })

    const result = regions.map(region => {
      const totalDeploymentUsers = region.deployments.reduce((sum, d) => sum + d.users, 0)
      const hostedCount = region.deployments.filter(d => d.type === DeploymentType.Hosted).length
      const onPremiseCount = region.deployments.filter(d => d.type === DeploymentType.OnPremise).length

      // Aggregate module users across all deployments in this region
      const moduleMap = new Map<string, { key: string; label: string; color: string; totalUsers: number }>()
      for (const dep of region.deployments) {
        for (const dm of dep.modules) {
          const existing = moduleMap.get(dm.module.key)
          if (existing) {
            existing.totalUsers += dm.userCount
          } else {
            moduleMap.set(dm.module.key, { ...dm.module, totalUsers: dm.userCount })
          }
        }
      }

      // Unique versions deployed in this region
      const versions = Array.from(new Set(region.deployments.map(d => d.version))).sort()

      return {
        id: region.id,
        code: region.code,
        name: region.name,
        flag: region.flag,
        color: region.color,
        totalUsers: region.totalUsers,
        deploymentUserSum: totalDeploymentUsers,
        deploymentCount: region.deployments.length,
        hostedCount,
        onPremiseCount,
        regionalModuleCount: region._count.regionalModules,
        versions,
        moduleStats: Array.from(moduleMap.values()).filter(m => m.totalUsers > 0),
      }
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch region stats' }, { status: 500 })
  }
}
