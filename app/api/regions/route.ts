import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { deployments: true, regionalModules: true } },
      },
    })
    return NextResponse.json(regions)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, flag, color, totalUsers = 0 } = body

    if (!code || !name || !flag || !color) {
      return NextResponse.json({ error: 'code, name, flag and color are required' }, { status: 400 })
    }

    const region = await prisma.region.create({
      data: { code, name, flag, color, totalUsers },
    })
    return NextResponse.json(region, { status: 201 })
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: 'Region code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create region' }, { status: 500 })
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  )
}
