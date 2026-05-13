// ─────────────────────────────────────────────────────────────────────────────
// prisma/seed.ts
// One-time seed script — migrates all hardcoded dashboard data into the DB.
//
// Run: npm run db:seed
// Or:  npx prisma db seed
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, DeploymentType, BackupStrategy, RoadmapStatus, RoadmapCategory, FiscalYear } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE DATA  (extracted directly from tsp-dashboard.html)
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_MODULES = [
  { key: 'arc',             label: 'ARC',                     color: '#4f8ef7', sortOrder: 0 },
  { key: 'service_manager', label: 'Service Manager',          color: '#7b5ef8', sortOrder: 1 },
  { key: 'tsp_portal',      label: 'TSP Portal',               color: '#2ec4a0', sortOrder: 2 },
  { key: 'proactive',       label: 'Proactive Service',        color: '#f5a623', sortOrder: 3 },
  { key: 'service_hooks',   label: 'Service Hooks',            color: '#f06060', sortOrder: 4 },
  { key: 'notifications',   label: 'Notifications',            color: '#5bbf72', sortOrder: 5 },
  { key: 'ies',             label: 'IES (API Gateway)',        color: '#9b7af5', sortOrder: 6 },
  { key: 'bulk_importer',   label: 'Bulk Importer',            color: '#f06fa0', sortOrder: 7 },
  { key: 'wallboards',      label: 'Wallboards',               color: '#5bc4ef', sortOrder: 8 },
  { key: 'tdp',             label: 'Tunstall Data Platform',   color: '#e8a87c', sortOrder: 9 },
  { key: 'dmp',             label: 'DMP',                      color: '#98d98e', sortOrder: 10 },
  { key: 'identity',        label: 'Identity',                 color: '#e879a0', sortOrder: 11 },
];

const SOURCE_REGIONS = [
  {
    code: 'uk', name: 'United Kingdom', flag: '🇬🇧', color: '#4f8ef7', totalUsers: 375463,
    regionalModules: [],
    deployments: [
      { instance: 'SAAS3',          type: 'Hosted',    version: '1.5', users: 221281, backup: 'AAG',         cti: 4, modules: { arc:221281, service_manager:0,      tsp_portal:0,     proactive:0,    service_hooks:0,      notifications:0,    ies:0,     bulk_importer:0,    wallboards:0,    tdp:0,   dmp:60000,  identity:250 } },
      { instance: 'SAAS4',          type: 'Hosted',    version: '1.5', users: 94894,  backup: 'AAG',         cti: 4, modules: { arc:94894,  service_manager:94894,  tsp_portal:0,     proactive:0,    service_hooks:0,      notifications:0,    ies:0,     bulk_importer:0,    wallboards:0,    tdp:0,   dmp:30000,  identity:250 } },
      { instance: 'UK On Prem',     type: 'OnPremise', version: '1.5', users: 3034,   backup: 'AAG',         cti: 4, modules: { arc:3034,   service_manager:0,      tsp_portal:0,     proactive:0,    service_hooks:0,      notifications:0,    ies:0,     bulk_importer:0,    wallboards:0,    tdp:0,   dmp:1000,   identity:25 } },
      { instance: 'Ireland On Prem',type: 'OnPremise', version: '1.5', users: 56254,  backup: 'AAG',         cti: 4, modules: { arc:56254,  service_manager:0,      tsp_portal:0,     proactive:0,    service_hooks:0,      notifications:0,    ies:0,     bulk_importer:0,    wallboards:0,    tdp:0,   dmp:4000,   identity:25 } },
    ],
  },
  {
    code: 'es', name: 'Spain', flag: '🇪🇸', color: '#f06060', totalUsers: 988659,
    regionalModules: [
      { name: 'Sigma',     description: 'Spain-specific telecare management platform' },
      { name: 'EVA',       description: 'Spain-specific emergency voice assistant application' },
      { name: 'AVA',       description: 'Spain-specific alarm and voice analytics platform' },
      { name: 'PNC Mobile',description: 'Spain-specific mobile application for PNC365 service users' },
      { name: 'Savi',      description: 'Smart Habits — Spain-specific activity and wellness monitoring application' },
      { name: 'PGP App',   description: 'Staff Scheduling — Spain-specific workforce planning and shift management tool' },
      { name: 'Pex IP',    description: 'Video Calls — Spain-specific video call integration for remote care consultations' },
      { name: 'Excally',   description: 'Auto Dialler — Spain-specific automated outbound calling solution' },
    ],
    deployments: [
      { instance: 'ASSDA',           type: 'OnPremise', version: '2.3', users: 320147, backup: 'Replication', cti: 6, modules: { arc:320147, service_manager:0,       tsp_portal:0,      proactive:0,    service_hooks:0,      notifications:0,    ies:0,     bulk_importer:0,    wallboards:0,    tdp:0,   dmp:0,      identity:0 } },
      { instance: 'Centel',          type: 'Hosted',    version: '1.5', users: 2222,   backup: 'AAG',         cti: 3, modules: { arc:2222,   service_manager:2222,    tsp_portal:2222,   proactive:2222, service_hooks:2222,   notifications:2222, ies:2222,  bulk_importer:2222, wallboards:2222, tdp:0,   dmp:2222,   identity:15 } },
      { instance: 'Televida',        type: 'Hosted',    version: '1.5', users: 273321, backup: 'AAG',         cti: 3, modules: { arc:273321, service_manager:0,       tsp_portal:0,      proactive:0,    service_hooks:0,      notifications:0,    ies:0,     bulk_importer:0,    wallboards:0,    tdp:0,   dmp:0,      identity:150 } },
      { instance: 'Ilunion',         type: 'OnPremise', version: '1.5', users: 78422,  backup: 'AAG',         cti: 3, modules: { arc:78422,  service_manager:0,       tsp_portal:0,      proactive:0,    service_hooks:0,      notifications:0,    ies:0,     bulk_importer:0,    wallboards:0,    tdp:0,   dmp:0,      identity:0 } },
      { instance: 'Cruz Roja Espana',type: 'Hosted',    version: '1.3', users: 127928, backup: 'AAG',         cti: 3, modules: { arc:127928, service_manager:127928,  tsp_portal:127928, proactive:0,    service_hooks:127928, notifications:0,    ies:127928,bulk_importer:0,    wallboards:0,    tdp:0,   dmp:0,      identity:0 } },
      { instance: 'Atzenia',         type: 'Hosted',    version: '1.5', users: 186619, backup: 'AAG',         cti: 3, modules: { arc:186619, service_manager:0,       tsp_portal:0,      proactive:0,    service_hooks:0,      notifications:0,    ies:0,     bulk_importer:0,    wallboards:0,    tdp:0,   dmp:0,      identity:0 } },
    ],
  },
  {
    code: 'se', name: 'Sweden', flag: '🇸🇪', color: '#2ec4a0', totalUsers: 42800,
    regionalModules: [
      { name: 'Utförarapp', description: 'First responders app for Sweden — field staff alarm response and care coordination' },
    ],
    deployments: [
      { instance: 'TSP-SE-PROD-01', type: 'Hosted', version: '2.4', users: 42800, backup: 'AAG', cti: 2, modules: { arc:42800, service_manager:42800, tsp_portal:42800, proactive:0, service_hooks:42800, notifications:42800, ies:42800, bulk_importer:42800, wallboards:42800, tdp:0, dmp:42800, identity:400 } },
    ],
  },
  {
    code: 'dk', name: 'Denmark', flag: '🇩🇰', color: '#f5a623', totalUsers: 13479,
    regionalModules: [],
    deployments: [
      { instance: 'TSP-DK-PROD-01', type: 'OnPremise', version: '1.5', users: 13479, backup: 'Replication', cti: 2, modules: { arc:13479, service_manager:13479, tsp_portal:13479, proactive:0, service_hooks:13479, notifications:13479, ies:13479, bulk_importer:13479, wallboards:13479, tdp:0, dmp:13479, identity:50 } },
    ],
  },
  {
    code: 'fr', name: 'France', flag: '🇫🇷', color: '#9b7af5', totalUsers: 277200,
    regionalModules: [],
    deployments: [
      { instance: 'France',    type: 'Hosted', version: '1.5', users: 235000, backup: 'AAG', cti: 3, modules: { arc:235000, service_manager:0, tsp_portal:0, proactive:0, service_hooks:0, notifications:0, ies:0, bulk_importer:0, wallboards:0, tdp:0, dmp:0, identity:0 } },
      { instance: 'Luxembourg',type: 'Hosted', version: '1.5', users: 2200,   backup: 'AAG', cti: 3, modules: { arc:2200,   service_manager:0, tsp_portal:0, proactive:0, service_hooks:0, notifications:0, ies:0, bulk_importer:0, wallboards:0, tdp:0, dmp:0, identity:0 } },
      { instance: 'Belgium',   type: 'Hosted', version: '1.5', users: 40000,  backup: 'AAG', cti: 3, modules: { arc:40000,  service_manager:0, tsp_portal:0, proactive:0, service_hooks:0, notifications:0, ies:0, bulk_importer:0, wallboards:0, tdp:0, dmp:0, identity:0 } },
    ],
  },
  {
    code: 'de', name: 'Germany', flag: '🇩🇪', color: '#5bbf72', totalUsers: 450000,
    regionalModules: [
      { name: 'PNC365', description: 'Germany-specific PNC365 platform integration' },
    ],
    deployments: [
      { instance: 'PNC365',        type: 'Hosted',    version: '2.1', users: 200000, backup: 'Replication', cti: 3, modules: { arc:200000, service_manager:0, tsp_portal:0, proactive:0, service_hooks:0, notifications:0, ies:0, bulk_importer:0, wallboards:0, tdp:0, dmp:0, identity:0 } },
      { instance: 'Malteser',      type: 'OnPremise', version: '2.1', users: 210000, backup: 'Replication', cti: 2, modules: { arc:210000, service_manager:0, tsp_portal:0, proactive:0, service_hooks:0, notifications:0, ies:0, bulk_importer:0, wallboards:0, tdp:0, dmp:0, identity:0 } },
      { instance: 'Germany OnPrem',type: 'OnPremise', version: '1.5', users: 40000,  backup: 'Replication', cti: 2, modules: { arc:40000,  service_manager:0, tsp_portal:0, proactive:0, service_hooks:0, notifications:0, ies:0, bulk_importer:0, wallboards:0, tdp:0, dmp:0, identity:0 } },
    ],
  },
  {
    code: 'nl', name: 'Netherlands', flag: '🇳🇱', color: '#f06fa0', totalUsers: 12000,
    regionalModules: [],
    deployments: [
      { instance: 'TSP-NL-PROD-01', type: 'Hosted', version: '2.4', users: 12000, backup: 'AAG', cti: 1, modules: { arc:12000, service_manager:0, tsp_portal:0, proactive:0, service_hooks:0, notifications:0, ies:0, bulk_importer:0, wallboards:0, tdp:0, dmp:0, identity:0 } },
    ],
  },
  {
    code: 'au', name: 'Australia', flag: '🇦🇺', color: '#5bc4ef', totalUsers: 53000,
    regionalModules: [],
    deployments: [
      { instance: 'TSP-AU-PROD-01', type: 'Hosted', version: '2.1', users: 53000, backup: 'Replication', cti: 2, modules: { arc:53000, service_manager:0, tsp_portal:0, proactive:0, service_hooks:0, notifications:0, ies:0, bulk_importer:0, wallboards:0, tdp:0, dmp:0, identity:0 } },
    ],
  },
  {
    code: 'fi', name: 'Finland', flag: '🇫🇮', color: '#38b6ff', totalUsers: 20700,
    regionalModules: [],
    deployments: [
      { instance: 'FI-HOSTED-01', type: 'Hosted',    version: '2.1', users: 11400, backup: 'AAG', cti: 2, modules: { arc:11400, service_manager:11400, tsp_portal:11400, proactive:11400, service_hooks:11400, notifications:11400, ies:11400, bulk_importer:11400, wallboards:11400, tdp:11400, dmp:11400, identity:11400 } },
      { instance: 'FI-HOSTED-02', type: 'Hosted',    version: '2.1', users: 4300,  backup: 'AAG', cti: 2, modules: { arc:4300,  service_manager:4300,  tsp_portal:4300,  proactive:4300,  service_hooks:4300,  notifications:4300,  ies:4300,  bulk_importer:4300,  wallboards:4300,  tdp:4300,  dmp:4300,  identity:4300 } },
      { instance: 'FI-ONPREM-01', type: 'OnPremise', version: '2.1', users: 5000,  backup: 'AAG', cti: 2, modules: { arc:5000,  service_manager:5000,  tsp_portal:5000,  proactive:5000,  service_hooks:5000,  notifications:5000,  ies:5000,  bulk_importer:5000,  wallboards:5000,  tdp:5000,  dmp:5000,  identity:5000 } },
    ],
  },
];

const SOURCE_ROADMAP = [
  { name: 'Ready Not Ready',                                  desc: 'Operator availability toggle with automatic call routing adjustment',     module: 'arc',             fy: 'FY26', status: 'in_progress', category: 'Product_Software', regions: ['uk','es','de','fr','se','au','fi','dk','nl'] },
  { name: 'Life Line Digital Core',                           desc: 'LifeLine Digital Core hardware platform update',                          module: 'tsp_portal',      fy: 'FY26', status: 'in_progress', category: 'Product_Hardware', regions: ['uk','es','de','fr','se','au','fi','dk','nl'] },
  { name: '.net 10 Core Upgrade',                             desc: 'Upgrade all .net core repos to .net 10',                                  module: 'identity',        fy: 'FY26', status: 'in_progress', category: 'Engineering',      regions: ['uk','es','de','fr','se','au','fi','dk','nl'] },
  { name: 'Activity Monitoring MVP',                          desc: 'Activity Monitoring MVP',                                                  module: 'tdp',             fy: 'FY26', status: 'planned',     category: 'Product_Data',     regions: ['uk','es','se'] },
  { name: 'Features for Televida Business Process',           desc: 'Features for Televida Business Process',                                  module: 'service_manager', fy: 'FY26', status: 'planned',     category: 'Product_Software', regions: ['es'] },
  { name: 'Centralised Audit Service in TSP',                 desc: 'Centralised audit logging service across TSP platform',                   module: 'service_manager', fy: 'FY26', status: 'planned',     category: 'Product_Software', regions: ['uk','es','de','fr','se','au','fi','dk','nl'] },
  { name: 'Digital Only TSP — Multiple HMP, No CTI',         desc: 'Redundancy via multiple HMP servers without CTI dependency',               module: 'arc',             fy: 'FY26', status: 'planned',     category: 'Product_Software', regions: ['uk','es','de','fr','se','au','fi','dk','nl'] },
  { name: 'Friends & Family App',                             desc: 'Full localisation of ARC interface for non-English operators',             module: 'service_manager', fy: 'FY27', status: 'planned',     category: 'Product_Software', regions: ['es','fr','de','nl'] },
  { name: 'Data Insight Services',                            desc: 'Data insight services available via TDP',                                  module: 'tdp',             fy: 'FY27', status: 'planned',     category: 'Product_Data',     regions: ['uk','au'] },
  { name: 'Integration Layer into TSP',                       desc: 'Business process APIs available for external integration',                 module: 'service_manager', fy: 'FY27', status: 'planned',     category: 'Product_Software', regions: ['uk','es','de','fr','se','au','fi','dk','nl'] },
  { name: 'Multiple Alarm-Capable Devices per Dwelling',      desc: 'Support for more than one piece of equipment per dwelling',               module: 'arc',             fy: 'FY27', status: 'planned',     category: 'Product_Software', regions: ['uk','es','de','fr','se','au','fi','dk','nl'] },
  { name: 'Intelligent Alarm Queues — Skills-Based Routing',  desc: 'Calls provided to agents based on skills and experience',                 module: 'arc',             fy: 'FY27', status: 'planned',     category: 'Product_Software', regions: ['uk','es','de','fr','se','au','fi','dk','nl'] },
  { name: 'AI Call Handling Assistant',                       desc: 'AI-assisted call handling for operators during alarm response',            module: 'arc',             fy: 'FY28', status: 'planned',     category: 'Product_Software', regions: ['uk','es','se','au'] },
  { name: 'DMP Third Party Device Integration',               desc: 'Integration of non-Tunstall devices into DMP',                            module: 'dmp',             fy: 'FY28', status: 'planned',     category: 'Product_Hardware', regions: ['uk','es','de','fr','se','au','fi','dk','nl'] },
];

const SOURCE_RELEASES = [
  { label: 'v1.0',   isBaseline: true, baselineCount: 1000, sortOrder: 0 },
  { label: 'v1.6',   sortOrder: 1,  components: { 'PNC':5, 'Proactive Services':2, 'Service Manager':2, 'TSP Portal':1 } },
  { label: 'v2.0',   sortOrder: 2,  components: { 'PNC':5, 'Data':1, 'Identity':1, 'Proactive Services':1, 'Service Manager':8, 'TSP Portal':1 } },
  { label: 'v2.1',   sortOrder: 3,  components: { 'PNC':3, 'Proactive Services':3, 'Service Manager':5, 'TSP Portal':4 } },
  { label: 'v2.1.3', sortOrder: 4,  components: { 'Engineering':3, 'Identity':1, 'PNC':6, 'Proactive Services':2, 'Service Manager':3, 'TSP Portal':1 } },
  { label: 'v2.2',   sortOrder: 5,  components: { 'Portal':1, 'Service Manager':4 } },
  { label: 'v2.3',   sortOrder: 6,  components: { 'PNC':6, 'Service Manager':3 } },
  { label: 'v2.4',   sortOrder: 7,  components: { 'Bulk Importer':1, 'Engineering':5, 'Identity':1, 'PNC':4, 'Service Manager':3 } },
  { label: 'v2.5',   sortOrder: 8,  components: { 'Bulk Importer':2, 'Data':1, 'Engineering':2, 'Gateway':2, 'Identity':1, 'PNC':3, 'Portal':5, 'Service Manager':3, 'SMS Proxy':1, 'Notifications':1 } },
  { label: 'v2.6',   sortOrder: 9,  components: { 'Data':7, 'Engineering':2, 'Identity':2, 'PNC':7, 'Service Manager':4, 'TSP Portal':1, 'Wallboards':1 } },
];

const SOURCE_PLATFORM_VERSIONS = [
  { version: '1.3', sortOrder: 0 },
  { version: '1.5', sortOrder: 1 },
  { version: '2.1', sortOrder: 2 },
  { version: '2.3', sortOrder: 3 },
  { version: '2.4', sortOrder: 4 },
  { version: '2.5', sortOrder: 5 },
];

const SOURCE_EXTERNAL_SYSTEMS = [
  { name: 'WFM',         description: 'Workforce Management',  color: '#9b7af5', sortOrder: 0 },
  { name: 'Third-party', description: 'Partner platforms',     color: '#a0a8c0', sortOrder: 1 },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function mapCategory(raw: string): RoadmapCategory {
  const map: Record<string, RoadmapCategory> = {
    'Product_Software': RoadmapCategory.Product_Software,
    'Product_Hardware': RoadmapCategory.Product_Hardware,
    'Product_Data':     RoadmapCategory.Product_Data,
    'Engineering':      RoadmapCategory.Engineering,
    'Innovation':       RoadmapCategory.Innovation,
  };
  return map[raw] ?? RoadmapCategory.Product_Software;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Seeding TTI Dashboard database...\n');

  // ── 1. Modules ──────────────────────────────────────────────────────────────
  console.log('  → Seeding modules...');
  const moduleMap = new Map<string, string>();

  for (const m of SOURCE_MODULES) {
    const record = await prisma.module.upsert({
      where: { key: m.key },
      update: { label: m.label, color: m.color, sortOrder: m.sortOrder },
      create: m,
    });
    moduleMap.set(m.key, record.id);
  }
  console.log(`     ✓ ${SOURCE_MODULES.length} modules`);

  // ── 2. Platform versions ────────────────────────────────────────────────────
  console.log('  → Seeding platform versions...');
  for (const v of SOURCE_PLATFORM_VERSIONS) {
    await prisma.platformVersion.upsert({
      where: { version: v.version },
      update: { sortOrder: v.sortOrder },
      create: v,
    });
  }
  console.log(`     ✓ ${SOURCE_PLATFORM_VERSIONS.length} versions`);

  // ── 3. Regions, Deployments, DeploymentModules, RegionalModules ─────────────
  console.log('  → Seeding regions and deployments...');
  const regionMap = new Map<string, string>();

  for (const r of SOURCE_REGIONS) {
    const region = await prisma.region.upsert({
      where: { code: r.code },
      update: { name: r.name, flag: r.flag, color: r.color, totalUsers: r.totalUsers },
      create: {
        code: r.code, name: r.name, flag: r.flag,
        color: r.color, totalUsers: r.totalUsers,
      },
    });
    regionMap.set(r.code, region.id);

    await prisma.regionalModule.deleteMany({ where: { regionId: region.id } });
    for (let i = 0; i < r.regionalModules.length; i++) {
      await prisma.regionalModule.create({
        data: { regionId: region.id, sortOrder: i, ...r.regionalModules[i] },
      });
    }

    for (const dep of r.deployments) {
      const deployment = await prisma.deployment.upsert({
        where: { regionId_instance: { regionId: region.id, instance: dep.instance } },
        update: {
          type: dep.type as DeploymentType,
          version: dep.version,
          users: dep.users,
          backup: dep.backup as BackupStrategy,
          cti: dep.cti,
        },
        create: {
          regionId: region.id,
          instance: dep.instance,
          type: dep.type as DeploymentType,
          version: dep.version,
          users: dep.users,
          backup: dep.backup as BackupStrategy,
          cti: dep.cti,
        },
      });

      for (const [moduleKey, userCount] of Object.entries(dep.modules)) {
        const moduleId = moduleMap.get(moduleKey);
        if (!moduleId) continue;
        await prisma.deploymentModule.upsert({
          where: { deploymentId_moduleId: { deploymentId: deployment.id, moduleId } },
          update: { userCount: userCount as number },
          create: { deploymentId: deployment.id, moduleId, userCount: userCount as number },
        });
      }
    }
  }
  console.log(`     ✓ ${SOURCE_REGIONS.length} regions, ${SOURCE_REGIONS.reduce((s,r) => s + r.deployments.length, 0)} deployments`);

  // ── 4. Roadmap features ─────────────────────────────────────────────────────
  console.log('  → Seeding roadmap features...');
  await prisma.roadmapFeatureRegion.deleteMany();
  await prisma.roadmapFeature.deleteMany();

  for (const f of SOURCE_ROADMAP) {
    const moduleId = f.module ? moduleMap.get(f.module) : undefined;
    const feature = await prisma.roadmapFeature.create({
      data: {
        name: f.name,
        description: f.desc,
        category: mapCategory(f.category),
        moduleId: moduleId ?? null,
        fiscalYear: f.fy as FiscalYear,
        status: f.status as RoadmapStatus,
      },
    });

    for (const regionCode of f.regions) {
      const regionId = regionMap.get(regionCode);
      if (!regionId) continue;
      await prisma.roadmapFeatureRegion.create({
        data: { featureId: feature.id, regionId },
      });
    }
  }
  console.log(`     ✓ ${SOURCE_ROADMAP.length} roadmap features`);

  // ── 5. Releases ─────────────────────────────────────────────────────────────
  console.log('  → Seeding releases...');
  await prisma.releaseComponent.deleteMany();
  await prisma.release.deleteMany();

  for (const rel of SOURCE_RELEASES) {
    const release = await prisma.release.create({
      data: {
        label: rel.label,
        sortOrder: rel.sortOrder,
        isBaseline: rel.isBaseline ?? false,
        baselineCount: rel.baselineCount ?? null,
      },
    });

    if (!rel.isBaseline && rel.components) {
      for (const [areaLabel, count] of Object.entries(rel.components)) {
        const matchedModule = SOURCE_MODULES.find(
          m => m.label.toLowerCase() === areaLabel.toLowerCase()
        );
        const moduleId = matchedModule ? moduleMap.get(matchedModule.key) : undefined;

        await prisma.releaseComponent.create({
          data: {
            releaseId: release.id,
            moduleId: moduleId ?? null,
            areaLabel: moduleId ? null : areaLabel,
            count: count as number,
          },
        });
      }
    }
  }
  console.log(`     ✓ ${SOURCE_RELEASES.length} releases`);

  // ── 6. External systems ─────────────────────────────────────────────────────
  console.log('  → Seeding external systems...');
  for (const es of SOURCE_EXTERNAL_SYSTEMS) {
    await prisma.externalSystem.upsert({
      where: { name: es.name },
      update: { description: es.description, color: es.color, sortOrder: es.sortOrder },
      create: es,
    });
  }
  console.log(`     ✓ ${SOURCE_EXTERNAL_SYSTEMS.length} external systems`);

  // ── 7. Summary ──────────────────────────────────────────────────────────────
  console.log('\n✅  Seed complete.\n');
  const counts = await Promise.all([
    prisma.module.count(),
    prisma.region.count(),
    prisma.deployment.count(),
    prisma.deploymentModule.count(),
    prisma.regionalModule.count(),
    prisma.roadmapFeature.count(),
    prisma.release.count(),
  ]);
  console.log('  Modules:            ', counts[0]);
  console.log('  Regions:            ', counts[1]);
  console.log('  Deployments:        ', counts[2]);
  console.log('  Deployment modules: ', counts[3]);
  console.log('  Regional modules:   ', counts[4]);
  console.log('  Roadmap features:   ', counts[5]);
  console.log('  Releases:           ', counts[6]);
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
