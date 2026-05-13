import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { code: string } }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const region = await prisma.region.findUnique({
      where: { code: params.code },
      include: {
        deployments: {
          orderBy: { instance: 'asc' },
          include: {
            modules: {
              include: { module: { select: { key: true, label: true, color: true } } },
            },
          },
        },
        regionalModules: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { deployments: true } },
      },
    })

    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 })
    }
    return NextResponse.json(region)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch region' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { name, flag, color, totalUsers } = body

    const region = await prisma.region.update({
      where: { code: params.code },
      data: {
        ...(name !== undefined && { name }),
        ...(flag !== undefined && { flag }),
        ...(color !== undefined && { color }),
        ...(totalUsers !== undefined && { totalUsers }),
      },
    })
    return NextResponse.json(region)
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update region' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await prisma.region.delete({ where: { code: params.code } })
    return new NextResponse(null, { status: 204 })
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete region' }, { status: 500 })
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
