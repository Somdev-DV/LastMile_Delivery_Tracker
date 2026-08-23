# Last-Mile Delivery Tracker — Database Schema Documentation

This document describes the PostgreSQL database schema modeled via Prisma ORM.

---

## Entity Relationship Overview

```
User (1) ──── (0..1) CustomerProfile
User (1) ──── (0..1) DeliveryAgent ──── (1..*) Zone
User (1) ──── (0..*) Order (as Customer)
User (1) ──── (0..*) TrackingEvent (as Actor)
User (1) ──── (0..*) Notification

Zone (1) ──── (0..*) Area (Pincode Mappings)
Zone (1) ──── (0..*) RateCard
Zone (1) ──── (0..*) Order (as PickupZone)
Zone (1) ──── (0..*) Order (as DropZone)

Order (1) ──── (0..*) TrackingEvent (Append-only)
Order (1) ──── (0..*) DeliveryAttempt (Attempt History)
Order (1) ──── (0..*) DeliveryAssignment (Assignment History)
Order (1) ──── (0..*) RescheduleRequest
Order (1) ──── (0..*) Notification
```

---

## Core Entities

### 1. `User`
- Central identity store with hashed passwords (bcrypt).
- **Roles**: `CUSTOMER`, `DELIVERY_AGENT`, `ADMIN`.

### 2. `DeliveryAgent`
- Represents courier drivers.
- Tracks `availability`: `AVAILABLE`, `BUSY`, `OFFLINE`.
- Stores real-time `latitude` and `longitude` coordinates for Haversine nearest-agent assignment.
- Linked to a primary operating `Zone`.

### 3. `Zone` & `Area`
- `Zone`: High-level operational delivery hub (e.g. "Zone A - Bangalore Central").
- `Area`: Pincode and location mapping that links customer addresses to zones.

### 4. `RateCard` & `CodSurcharge`
- Configurable pricing rules without hardcoded values.
- Differentiates `OrderType` (`B2B`, `B2C`) and `RouteType` (`INTRA_ZONE`, `INTER_ZONE`).
- `baseRate`, `perKgRate`, `minWeight`.
- `CodSurcharge`: Percentage fee and minimum flat charge per order type.

### 5. `Order`
- Core transactional record holding package dimensions (`length`, `breadth`, `height`), weights (`actualWeight`, `volumetricWeight`, `billableWeight`), zones, pricing breakdown, payment type (`PREPAID`, `COD`), and current `status`.

### 6. `TrackingEvent` (Immutable)
- **Append-only** audit trail.
- Records `prevStatus`, `newStatus`, `actorId`, `actorRole`, `timestamp`, and `remarks`.

### 7. `DeliveryAttempt`
- Preserves distinct delivery attempts across reschedules.
- Stores `attemptNumber`, `status` (`ACTIVE`, `COMPLETED`, `FAILED`), and `failureReason`.
