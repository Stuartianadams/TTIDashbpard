import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const deployments = await prisma.deployment.findMany({
      orderBy: [{ region: { name: 'asc' } }, { instance: 'asc' }],
      include: {
        region: { select: { code: true, name: true, flag: true, color: true } },
        modules: {
          include: { module: { select: { key: true, label: true, color: true, sortOrder: true } } },
          orderBy: { module: { sortOrder: 'asc' } },
        },
      },
    })
    return NextResponse.json(deployments)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 })
  }
}
