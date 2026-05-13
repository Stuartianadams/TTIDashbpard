import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FiscalYear, RoadmapStatus, RoadmapCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const fiscalYear = searchParams.get('fiscalYear') as FiscalYear | null
    const status = searchParams.get('status') as RoadmapStatus | null
    const regionCode = searchParams.get('region')

    const features = await prisma.roadmapFeature.findMany({
      where: {
        ...(fiscalYear && { fiscalYear }),
        ...(status && { status }),
        ...(regionCode && {
          regions: { some: { region: { code: regionCode } } },
        }),
      },
      orderBy: [{ fiscalYear: 'asc' }, { name: 'asc' }],
      include: {
        module: { select: { key: true, label: true, color: true } },
        regions: {
          include: { region: { select: { code: true, name: true, flag: true } } },
        },
      },
    })

    return NextResponse.json(features)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch roadmap features' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, moduleId, fiscalYear, status = 'planned', userImpact, regionCodes = [] } = body

    if (!name || !description || !category || !fiscalYear) {
      return NextResponse.json(
        { error: 'name, description, category and fiscalYear are required' },
        { status: 400 },
      )
    }

    if (!Object.values(RoadmapCategory).includes(category)) {
      return NextResponse.json({ error: `category must be one of: ${Object.values(RoadmapCategory).join(', ')}` }, { status: 400 })
    }
    if (!Object.values(FiscalYear).includes(fiscalYear)) {
      return NextResponse.json({ error: `fiscalYear must be one of: ${Object.values(FiscalYear).join(', ')}` }, { status: 400 })
    }

    // Resolve region codes to IDs
    const regions = regionCodes.length > 0
      ? await prisma.region.findMany({ where: { code: { in: regionCodes } } })
      : []

    const feature = await prisma.roadmapFeature.create({
      data: {
        name,
        description,
        category: category as RoadmapCategory,
        moduleId: moduleId ?? null,
        fiscalYear: fiscalYear as FiscalYear,
        status: status as RoadmapStatus,
        userImpact: userImpact ?? null,
        regions: {
          create: regions.map(r => ({ regionId: r.id })),
        },
      },
      include: {
        module: { select: { key: true, label: true, color: true } },
        regions: {
          include: { region: { select: { code: true, name: true, flag: true } } },
        },
      },
    })

    return NextResponse.json(feature, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create roadmap feature' }, { status: 500 })
  }
}
