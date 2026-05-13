import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const releases = await prisma.release.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        components: {
          include: { module: { select: { key: true, label: true, color: true } } },
          orderBy: { count: 'desc' },
        },
      },
    })
    return NextResponse.json(releases)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { label, sortOrder = 0, isBaseline = false, baselineCount, releasedAt, notes } = body

    if (!label) {
      return NextResponse.json({ error: 'label is required' }, { status: 400 })
    }

    const release = await prisma.release.create({
      data: {
        label,
        sortOrder,
        isBaseline,
        baselineCount: baselineCount ?? null,
        releasedAt: releasedAt ? new Date(releasedAt) : null,
        notes: notes ?? null,
      },
      include: {
        components: { include: { module: { select: { key: true, label: true, color: true } } } },
      },
    })
    return NextResponse.json(release, { status: 201 })
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: 'A release with that label already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create release' }, { status: 500 })
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
