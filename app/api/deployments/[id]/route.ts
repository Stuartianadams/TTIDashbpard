import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DeploymentType, BackupStrategy } from '@prisma/client'

type Params = { params: { id: string } }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        region: { select: { code: true, name: true, flag: true } },
        modules: {
          include: { module: { select: { key: true, label: true, color: true, sortOrder: true } } },
          orderBy: { module: { sortOrder: 'asc' } },
        },
      },
    })
    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    }
    return NextResponse.json(deployment)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch deployment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { instance, type, version, users, backup, cti, modules } = body

    if (type && !Object.values(DeploymentType).includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${Object.values(DeploymentType).join(', ')}` }, { status: 400 })
    }
    if (backup && !Object.values(BackupStrategy).includes(backup)) {
      return NextResponse.json({ error: `backup must be one of: ${Object.values(BackupStrategy).join(', ')}` }, { status: 400 })
    }

    const deployment = await prisma.deployment.update({
      where: { id: params.id },
      data: {
        ...(instance !== undefined && { instance }),
        ...(type !== undefined && { type: type as DeploymentType }),
        ...(version !== undefined && { version }),
        ...(users !== undefined && { users }),
        ...(backup !== undefined && { backup: backup as BackupStrategy }),
        ...(cti !== undefined && { cti }),
      },
    })

    // Update module user counts if provided
    if (modules && typeof modules === 'object') {
      const moduleEntries = Object.entries(modules as Record<string, number>)
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

    const updated = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        region: { select: { code: true, name: true, flag: true } },
        modules: { include: { module: { select: { key: true, label: true, color: true } } } },
      },
    })
    return NextResponse.json(updated)
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update deployment' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await prisma.deployment.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete deployment' }, { status: 500 })
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
