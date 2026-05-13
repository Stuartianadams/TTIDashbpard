import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        deploymentModules: { select: { userCount: true } },
      },
    })

    const result = modules.map(m => ({
      id: m.id,
      key: m.key,
      label: m.label,
      color: m.color,
      sortOrder: m.sortOrder,
      totalUsers: m.deploymentModules.reduce((sum, dm) => sum + dm.userCount, 0),
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}
