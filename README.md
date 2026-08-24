# Last-Mile Delivery Tracker

A production-quality full-stack logistics SaaS platform for managing end-to-end parcel delivery operations. Built with React, Node.js, PostgreSQL, and Prisma.

🚀 **[Live Demo: last-mile-delivery-tracker-sigma.vercel.app](https://last-mile-delivery-tracker-sigma.vercel.app)** 🚀

---

## Features

### Core Business Features
- **Multi-role system** — Customer, Delivery Agent, Admin with full RBAC
- **Configurable zone detection** — Map pincodes/areas to delivery zones (no hardcoding)
- **Rate calculation engine** — Volumetric weight, billable weight, B2B/B2C rate cards, intra/inter-zone pricing, COD surcharge — all DB-driven
- **Price preview** — Customers see complete pricing breakdown before confirming
- **Intelligent auto-assignment** — Haversine-formula nearest-agent selection with fallback
- **Agent availability model** — AVAILABLE / BUSY / OFFLINE state machine
- **Immutable tracking history** — Every status change appended as a new record, never overwritten
- **Complete order lifecycle** — CREATED → ASSIGNED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED / FAILED → RESCHEDULED
- **Failed delivery + rescheduling** — End-to-end flow with new delivery attempt creation
- **Notification system** — Email (Nodemailer) and SMS (mock/Twilio) with DB records

### Admin Features
- Dashboard with real-time metrics
- Order management with filters (status, zone, agent, date)
- Manual and auto agent assignment with reasoning display
- Status override with audit trail
- Zone and area management
- Rate card configuration (B2B/B2C, intra/inter-zone)
- COD surcharge configuration
- Agent management
- Notification monitoring

### Customer Features
- Multi-step order creation wizard
- Real-time zone detection from pincode
- Live pricing breakdown
- Order tracking timeline
- Failed delivery rescheduling
- Notification center

### Agent Features
- Availability toggle
- Assigned deliveries view
- Status update with transition validation
- Failure reason capture
- Delivery history

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│         (Vite + TypeScript + Tailwind CSS)           │
└─────────────────────┬───────────────────────────────┘
                      │ REST API / JSON
┌─────────────────────▼───────────────────────────────┐
│               Express Backend                        │
│                                                     │
│  Routes → Controllers → Services → Repositories    │
│                                                     │
│  Services:                                          │
│  ├── rateCalculationService  (pricing engine)       │
│  ├── zoneService             (zone detection)       │
│  ├── assignmentService       (Haversine auto-assign)│
│  ├── orderService            (order lifecycle)      │
│  ├── trackingService         (immutable history)    │
│  ├── notificationService     (email + SMS)          │
│  └── rescheduleService       (failed → rescheduled) │
└─────────────────────┬───────────────────────────────┘
                      │ Prisma ORM
┌─────────────────────▼───────────────────────────────┐
│               PostgreSQL Database                    │
│                                                     │
│  14 models: User, Zone, Area, RateCard,             │
│  CodSurcharge, Order, TrackingEvent,                │
│  DeliveryAssignment, DeliveryAttempt,               │
│  RescheduleRequest, Notification, ...               │
└─────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 18 |
| Frontend | TypeScript | 5 |
| Frontend | Vite | 5 |
| Frontend | Tailwind CSS | 3 |
| Frontend | React Router | 6 |
| Frontend | React Hook Form | 7 |
| Backend | Node.js | 20+ |
| Backend | TypeScript | 5 |
| Backend | Express | 4 |
| ORM | Prisma | 5 |
| Database | PostgreSQL | 15+ |
| Auth | JWT + bcryptjs | — |
| Email | Nodemailer | 6 |
| Testing | Jest + ts-jest | 29 |

---

## Folder Structure

```
LastMile_Delivery_Tracker/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route-level pages
│       ├── layouts/           # Role-specific layouts
│       ├── hooks/             # Custom React hooks
│       ├── services/          # API service layer
│       ├── types/             # TypeScript types
│       ├── utils/             # Helpers
│       └── contexts/          # React contexts
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/            # Env + Prisma singleton
│   │   ├── middleware/        # Auth, RBAC, error handler
│   │   ├── routes/            # Route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   ├── utils/             # Haversine, JWT, status machine
│   │   ├── validators/        # Zod schemas
│   │   └── types/             # Shared types
│   └── __tests__/             # Jest unit tests
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Demo data seed
├── docs/
│   ├── system-design.md
│   ├── api-documentation.md
│   └── database-schema.md
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd LastMile_Delivery_Tracker
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
```

### 3. Install server dependencies

```bash
cd server
npm install
```

### 4. Install client dependencies

```bash
cd client
npm install
```

---

## Database Setup

### 1. Create the database

```sql
CREATE DATABASE lastmile_db;
```

### 2. Configure DATABASE_URL in .env

```env
DATABASE_URL=postgresql://username:password@localhost:5432/lastmile_db
```

### 3. Run migrations

```bash
cd server
npx prisma migrate dev --name init
```

Or use the npm script:

```bash
npm run db:migrate
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

Or:

```bash
npm run db:generate
```

### 5. Seed demo data

```bash
npm run db:seed
```

This creates all demo users, zones, rate cards, and sample orders.

---

## Local Development

### Start backend (from /server)

```bash
npm run dev
# Server runs on http://localhost:5000
```

### Start frontend (from /client)

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

The Vite dev server proxies `/api` requests to the backend automatically.

---

## Demo Credentials

> **Never use these credentials in production**

| Role | Email | Password |
|---|---|---|
| Admin | admin@lastmile.com | Admin@123 |
| Customer 1 | customer1@test.com | Customer@123 |
| Customer 2 | customer2@test.com | Customer@123 |
| Customer 3 | customer3@test.com | Customer@123 |
| Agent 1 (Available, Zone A) | agent1@lastmile.com | Agent@123 |
| Agent 2 (Available, Zone B) | agent2@lastmile.com | Agent@123 |
| Agent 3 (Busy, Zone A) | agent3@lastmile.com | Agent@123 |
| Agent 4 (Offline, Zone C) | agent4@lastmile.com | Agent@123 |
| Agent 5 (Available, Zone B) | agent5@lastmile.com | Agent@123 |

---

## Rate Calculation Logic

### Formulas

```
volumetricWeight = (length × breadth × height) / 5000
billableWeight   = MAX(actualWeight, volumetricWeight)
```

### Rate Selection

1. Detect pickup zone from pincode → Area table → Zone
2. Detect drop zone from pincode → Area table → Zone
3. If pickupZone == dropZone → INTRA_ZONE, else INTER_ZONE
4. Select RateCard by: orderType (B2B/B2C) + routeType (INTRA/INTER)
5. `weightCharge = MAX(0, billableWeight - minWeight) × perKgRate`
6. `baseCharge = baseRate + weightCharge`
7. If COD: `codFee = MAX(flatAmount, codAmount × percentage / 100)`
8. `totalCharge = baseCharge + codFee`

### Returned Breakdown

```json
{
  "actualWeight": 4.0,
  "volumetricWeight": 6.0,
  "billableWeight": 6.0,
  "pickupZone": "Zone A",
  "dropZone": "Zone B",
  "routeType": "INTER_ZONE",
  "orderType": "B2C",
  "paymentType": "COD",
  "baseRate": 100.00,
  "weightCharge": 82.50,
  "codSurcharge": 25.00,
  "totalCharge": 207.50
}
```

---

## Zone Detection

Zones are configured by Admin in the database. Each zone has one or more Areas (pincode + name + city).

**Detection flow:**
1. Extract pincode from address
2. Query `Area` table: `WHERE pincode = $1 AND isActive = true`
3. If found, return zone
4. If not found, throw: `"No zone found for pickup pincode: {pincode}"`

Admin can add/remove areas and pincodes via the admin UI without any code changes.

---

## Auto-Assignment Algorithm

```
1. Get all agents WHERE availability = AVAILABLE AND isActive = true
2. Filter agents in same zone as order pickup zone (preferred)
3. For agents with lat/lng: sort by Haversine distance from pickup
4. For agents without coords: sort by zone match
5. Select the top candidate
6. Assign: update order.assignedAgentId, agent.availability = BUSY
7. Create DeliveryAssignment with method = AUTO and reasoning
8. Create DeliveryAttempt
9. Create TrackingEvent (ASSIGNED)
10. Notify agent
```

**Haversine Formula:**
```
a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
c = 2·atan2(√a, √(1-a))
d = R·c   (R = 6371 km)
```

---

## Failed Delivery & Rescheduling Flow

```
1. Agent marks order as FAILED (with failure reason)
2. TrackingEvent created: OUT_FOR_DELIVERY → FAILED
3. Customer notified (email + SMS)
4. Customer sees "Reschedule" button in UI
5. Customer picks new date + reason
6. RescheduleRequest saved
7. Order status: FAILED → RESCHEDULED (TrackingEvent created)
8. Current DeliveryAttempt marked FAILED (NOT deleted)
9. Current agent released: BUSY → AVAILABLE
10. Auto-assignment triggered → new agent
11. New DeliveryAttempt created (attemptNumber: 2)
12. TrackingEvent: RESCHEDULED → ASSIGNED
13. Customer notified of rescheduling
```

**Both attempts are preserved in the database for audit/display.**

---

## Notification Architecture

```typescript
notificationService.sendOrderStatusNotification(order, newStatus, actorRole)
```

- Creates a `Notification` record in DB
- Determines message based on status
- Sends via configured provider

**Email:** Nodemailer (real SMTP if configured, console mock otherwise)
**SMS:** Twilio if credentials set, mock logger otherwise

All notifications stored in DB with status (PENDING/SENT/FAILED), channel, event, message, timestamp.

---

## API Documentation

See [`docs/api-documentation.md`](docs/api-documentation.md) for complete endpoint documentation.

Key endpoints:

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

POST /api/orders
GET  /api/orders
GET  /api/orders/:id
POST /api/orders/calculate
POST /api/orders/:id/confirm
POST /api/orders/:id/status
POST /api/orders/:id/assign
POST /api/orders/:id/auto-assign
POST /api/orders/:id/reschedule
GET  /api/orders/:id/tracking
GET  /api/orders/:id/attempts

GET    /api/zones
POST   /api/zones
PATCH  /api/zones/:id
POST   /api/zones/:id/areas

GET    /api/rates
POST   /api/rates
PATCH  /api/rates/:id
GET    /api/rates/cod
POST   /api/rates/cod

GET    /api/agents
PATCH  /api/agents/:id/availability
GET    /api/admin/dashboard
GET    /api/admin/orders
```

---

## Database Schema

See [`docs/database-schema.md`](docs/database-schema.md) for full documentation.

Key entities: User, DeliveryAgent, Zone, Area, RateCard, CodSurcharge, Order, TrackingEvent, DeliveryAssignment, DeliveryAttempt, RescheduleRequest, Notification.

---

## Testing

```bash
cd server
npm test
```

Tests cover:
- Volumetric weight calculation
- Billable weight selection (both cases)
- Intra/inter-zone pricing
- B2B/B2C rate card selection
- COD surcharge calculation
- Missing rate card error
- Zone detection
- Haversine nearest-agent selection
- Agent availability filtering
- Status transition validation
- Immutable tracking event creation
- Failed delivery flow
- Reschedule with new attempt

---

## Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Deploy dist/ to Vercel
```

Set environment variable: `VITE_API_URL=https://your-backend.railway.app`

### Backend → Railway / Render

```bash
cd server
npm run build
# Deploy to Railway/Render
```

Required environment variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Strong random string (32+ chars)
- `PORT` — 5000 (or platform-provided)
- `FRONTEND_URL` — Your Vercel frontend URL
- `SMTP_*` — Optional email config
- `TWILIO_*` — Optional SMS config

### Database → Supabase / Neon / Railway PostgreSQL

```bash
npx prisma migrate deploy
npm run db:seed
```

---

## Migration Commands Reference

```bash
# Create migration
npx prisma migrate dev --name <name>

# Apply in production
npx prisma migrate deploy

# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
npm run db:seed
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| DATABASE_URL | ✅ | PostgreSQL connection string |
| JWT_SECRET | ✅ | JWT signing secret (32+ chars) |
| JWT_EXPIRES_IN | ❌ | Token expiry (default: 7d) |
| PORT | ❌ | Server port (default: 5000) |
| NODE_ENV | ❌ | development/production |
| FRONTEND_URL | ❌ | For CORS (default: http://localhost:5173) |
| SMTP_HOST | ❌ | Email SMTP host |
| SMTP_PORT | ❌ | Email SMTP port |
| SMTP_USER | ❌ | Email username |
| SMTP_PASS | ❌ | Email password/app password |
| SMTP_FROM | ❌ | From address |
| SMS_PROVIDER | ❌ | mock or twilio |
| TWILIO_ACCOUNT_SID | ❌ | Twilio credentials |
| TWILIO_AUTH_TOKEN | ❌ | Twilio credentials |
| TWILIO_FROM_NUMBER | ❌ | Twilio phone number |
