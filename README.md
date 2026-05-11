# TTI Dashboard — Phase 1: Database

Prisma schema and seed script for the TTI Dashboard.

## Files

| File | Purpose |
|------|---------|
| `schema.prisma` | Full Prisma schema — all models, enums, relations |
| `seed.ts` | One-time seed — migrates all hardcoded dashboard data into the DB |
| `package.json` | Dependencies and npm scripts |

## Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or hosted)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in this directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/tti_dashboard"
```

For Railway:
```env
DATABASE_URL="${{Postgres.DATABASE_URL}}"
```

### 4. Run migrations

```bash
npm run db:migrate
```

This creates all tables, enums, indexes and constraints.

### 5. Seed the database

```bash
npm run db:seed
```

This populates every table with the existing dashboard data:
- 12 platform modules
- 9 regions (UK, Spain, Sweden, Denmark, France, Germany, Netherlands, Australia, Finland)
- 23 deployments with per-module user counts
- Regional modules (Sigma, EVA, AVA, Utförarapp, PNC365, etc.)
- 14 roadmap features with region assignments
- 10 releases with component breakdowns
- Platform versions, external systems

Expected output:
```
🌱  Seeding TTI Dashboard database...

  → Seeding modules...
     ✓ 12 modules
  → Seeding platform versions...
     ✓ 6 versions
  → Seeding regions and deployments...
     ✓ 9 regions, 23 deployments
  → Seeding roadmap features...
     ✓ 14 roadmap features
  → Seeding releases...
     ✓ 10 releases
  → Seeding external systems...
     ✓ 2 external systems

✅  Seed complete.
```

### 6. Explore the database

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555

---

## Schema overview

```
Module              — 12 platform modules (ARC, Service Manager, etc.)
Region              — 9 geographic regions
  └─ Deployment     — individual platform instances per region
       └─ DeploymentModule   — per-module user counts per deployment
  └─ RegionalModule — bespoke apps per region (Sigma, Utförarapp, etc.)
RoadmapFeature      — product roadmap items
  └─ RoadmapFeatureRegion    — many-to-many: features ↔ regions
PlatformVersion     — known release versions (1.3, 1.5, 2.1, etc.)
Release             — staircase chart entries
  └─ ReleaseComponent        — features added per module per release
ValueStreamStage    — customer value stream stages
  └─ ValueStreamModule       — which modules appear in which stages
  └─ ValueStreamFunctionality — detailed function items per stage
ExternalSystem      — WFM, third-party, etc.
AuditLog            — change history
```

---

## Next steps (Phase 2)

Once seeded, Phase 2 builds the Express/Fastify API on top of this schema:

```
GET  /api/regions
GET  /api/regions/:code
POST /api/regions
PUT  /api/regions/:code
...
GET  /api/roadmap
POST /api/roadmap
...
GET  /api/stats/global
```

See the deployment plan document for the full API surface.
