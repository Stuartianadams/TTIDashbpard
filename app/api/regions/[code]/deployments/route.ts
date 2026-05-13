import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DeploymentType, BackupStrategy } from '@prisma/client'

type Params = { params: { code: string } }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const region = await prisma.region.findUnique({ where: { code: params.code } })
    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 })
    }

    const deployments = await prisma.deployment.findMany({
      where: { regionId: region.id },
      orderBy: { instance: 'asc' },
      include: {
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

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const region = await prisma.region.findUnique({ where: { code: params.code } })
    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 })
    }

    const body = await request.json()
    const { instance, type, version, users = 0, backup, cti = 0, modules = {} } = body

    if (!instance || !type || !version || !backup) {
      return NextResponse.json(
        { error: 'instance, type, version and backup are required' },
        { status: 400 },
      )
    }

    if (!Object.values(DeploymentType).includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${Object.values(DeploymentType).join(', ')}` }, { status: 400 })
    }
    if (!Object.values(BackupStrategy).includes(backup)) {
      return NextResponse.json({ error: `backup must be one of: ${Object.values(BackupStrategy).join(', ')}` }, { status: 400 })
    }

    const deployment = await prisma.deployment.create({
      data: {
        regionId: region.id,
        instance,
        type: type as DeploymentType,
        version,
        users,
        backup: backup as BackupStrategy,
        cti,
      },
    })

    // Upsert module user counts if provided as { moduleKey: userCount }
    const moduleEntries = Object.entries(modules as Record<string, number>)
    if (moduleEntries.length > 0) {
      const moduleRecords = await prisma.module.findMany({
        where: { key: { in: moduleEntries.map(([k]) => k) } },
      })
      const keyToId = new Map(moduleRecords.map(m => [m.key, m.id]))

      await Promise.all(
        moduleEntries.map(([key, userCount]) => {
          const moduleId = keyToId.get(key)
          if (!moduleId) return null
          return prisma.deploymentModule.upsert({
            where: { deploymentId_moduleId: { deploymentId: deployment.id, moduleId } },
            update: { userCount },
            create: { deploymentId: deployment.id, moduleId, userCount },
          })
        }),
      )
    }

    const created = await prisma.deployment.findUnique({
      where: { id: deployment.id },
      include: {
        modules: { include: { module: { select: { key: true, label: true, color: true } } } },
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: 'An instance with that name already exists in this region' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create deployment' }, { status: 500 })
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
