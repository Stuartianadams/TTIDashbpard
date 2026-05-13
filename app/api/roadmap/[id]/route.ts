import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FiscalYear, RoadmapStatus, RoadmapCategory } from '@prisma/client'

type Params = { params: { id: string } }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const feature = await prisma.roadmapFeature.findUnique({
      where: { id: params.id },
      include: {
        module: { select: { key: true, label: true, color: true } },
        regions: {
          include: { region: { select: { code: true, name: true, flag: true, color: true } } },
        },
      },
    })
    if (!feature) {
      return NextResponse.json({ error: 'Roadmap feature not found' }, { status: 404 })
    }
    return NextResponse.json(feature)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch roadmap feature' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { name, description, category, moduleId, fiscalYear, status, userImpact, regionCodes } = body

    if (category && !Object.values(RoadmapCategory).includes(category)) {
      return NextResponse.json({ error: `category must be one of: ${Object.values(RoadmapCategory).join(', ')}` }, { status: 400 })
    }
    if (fiscalYear && !Object.values(FiscalYear).includes(fiscalYear)) {
      return NextResponse.json({ error: `fiscalYear must be one of: ${Object.values(FiscalYear).join(', ')}` }, { status: 400 })
    }
    if (status && !Object.values(RoadmapStatus).includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${Object.values(RoadmapStatus).join(', ')}` }, { status: 400 })
    }

    // If regionCodes provided, replace the region associations
    if (regionCodes !== undefined) {
      const regions = regionCodes.length > 0
        ? await prisma.region.findMany({ where: { code: { in: regionCodes } } })
        : []

      await prisma.roadmapFeatureRegion.deleteMany({ where: { featureId: params.id } })
      if (regions.length > 0) {
        await prisma.roadmapFeatureRegion.createMany({
          data: regions.map(r => ({ featureId: params.id, regionId: r.id })),
        })
      }
    }

    const feature = await prisma.roadmapFeature.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category: category as RoadmapCategory }),
        ...(moduleId !== undefined && { moduleId }),
        ...(fiscalYear !== undefined && { fiscalYear: fiscalYear as FiscalYear }),
        ...(status !== undefined && { status: status as RoadmapStatus }),
        ...(userImpact !== undefined && { userImpact }),
      },
      include: {
        module: { select: { key: true, label: true, color: true } },
        regions: {
          include: { region: { select: { code: true, name: true, flag: true } } },
        },
      },
    })

    return NextResponse.json(feature)
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Roadmap feature not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update roadmap feature' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await prisma.roadmapFeature.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Roadmap feature not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete roadmap feature' }, { status: 500 })
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
