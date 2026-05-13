import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const release = await prisma.release.findUnique({
      where: { id: params.id },
      include: {
        components: {
          include: { module: { select: { key: true, label: true, color: true } } },
          orderBy: { count: 'desc' },
        },
      },
    })
    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }
    return NextResponse.json(release)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch release' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { label, sortOrder, isBaseline, baselineCount, releasedAt, notes } = body

    const release = await prisma.release.update({
      where: { id: params.id },
      data: {
        ...(label !== undefined && { label }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isBaseline !== undefined && { isBaseline }),
        ...(baselineCount !== undefined && { baselineCount }),
        ...(releasedAt !== undefined && { releasedAt: releasedAt ? new Date(releasedAt) : null }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        components: {
          include: { module: { select: { key: true, label: true, color: true } } },
          orderBy: { count: 'desc' },
        },
      },
    })
    return NextResponse.json(release)
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update release' }, { status: 500 })
  }
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2025'
  )
}
