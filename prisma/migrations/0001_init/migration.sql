-- CreateEnum
CREATE TYPE "DeploymentType" AS ENUM ('Hosted', 'OnPremise');

-- CreateEnum
CREATE TYPE "BackupStrategy" AS ENUM ('AAG', 'Replication');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('planned', 'in_progress', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "RoadmapCategory" AS ENUM ('Product_Software', 'Product_Hardware', 'Product_Data', 'Engineering', 'Innovation');

-- CreateEnum
CREATE TYPE "FiscalYear" AS ENUM ('FY26', 'FY27', 'FY28', 'FY29');

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "instance" TEXT NOT NULL,
    "type" "DeploymentType" NOT NULL,
    "version" TEXT NOT NULL,
    "users" INTEGER NOT NULL DEFAULT 0,
    "backup" "BackupStrategy" NOT NULL,
    "cti" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployment_modules" (
    "id" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployment_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regional_modules" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regional_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "RoadmapCategory" NOT NULL,
    "moduleId" TEXT,
    "fiscalYear" "FiscalYear" NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'planned',
    "userImpact" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_feature_regions" (
    "id" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "roadmap_feature_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_versions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,
    "baselineCount" INTEGER,
    "releasedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_components" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "moduleId" TEXT,
    "areaLabel" TEXT,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "release_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_stream_stages" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRoadmap" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "value_stream_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_stream_modules" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "stageStartId" TEXT NOT NULL,
    "stageEndId" TEXT NOT NULL,
    "rowOrder" INTEGER NOT NULL DEFAULT 0,
    "isRoadmap" BOOLEAN NOT NULL DEFAULT false,
    "segmentIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "value_stream_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_stream_functionality" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "colorClass" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "value_stream_functionality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_systems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#9b7af5',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modules_key_key" ON "modules"("key");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "deployments_regionId_instance_key" ON "deployments"("regionId", "instance");

-- CreateIndex
CREATE UNIQUE INDEX "deployment_modules_deploymentId_moduleId_key" ON "deployment_modules"("deploymentId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_feature_regions_featureId_regionId_key" ON "roadmap_feature_regions"("featureId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_versions_version_key" ON "platform_versions"("version");

-- CreateIndex
CREATE UNIQUE INDEX "releases_label_key" ON "releases"("label");

-- CreateIndex
CREATE UNIQUE INDEX "release_components_releaseId_moduleId_key" ON "release_components"("releaseId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "value_stream_stages_key_key" ON "value_stream_stages"("key");

-- CreateIndex
CREATE UNIQUE INDEX "external_systems_name_key" ON "external_systems"("name");

-- CreateIndex
CREATE INDEX "audit_log_entity_entityId_idx" ON "audit_log"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_modules" ADD CONSTRAINT "deployment_modules_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "deployments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_modules" ADD CONSTRAINT "deployment_modules_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regional_modules" ADD CONSTRAINT "regional_modules_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_features" ADD CONSTRAINT "roadmap_features_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_feature_regions" ADD CONSTRAINT "roadmap_feature_regions_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "roadmap_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_feature_regions" ADD CONSTRAINT "roadmap_feature_regions_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_components" ADD CONSTRAINT "release_components_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_components" ADD CONSTRAINT "release_components_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_stream_modules" ADD CONSTRAINT "value_stream_modules_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_stream_modules" ADD CONSTRAINT "value_stream_modules_stageStartId_fkey" FOREIGN KEY ("stageStartId") REFERENCES "value_stream_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_stream_functionality" ADD CONSTRAINT "value_stream_functionality_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "value_stream_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

