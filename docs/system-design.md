# System Design — Last-Mile Delivery Tracker

*Assignment submission document. Word count: ~760 words.*

---

## Overview

The Last-Mile Delivery Tracker is a multi-tenant logistics platform with three roles: Customer, Delivery Agent, and Admin. It manages the complete parcel lifecycle from order creation through zone detection, dynamic rate calculation, intelligent agent assignment, real-time tracking, and failed-delivery handling.

---

## Rate Calculation Engine

The rate engine is implemented as a dedicated `rateCalculationService` with no hardcoded values. Every rate comes from the database.

**Step 1: Volumetric Weight**
```
volumetricWeight = (length × breadth × height) / 5000
```

**Step 2: Billable Weight**
```
billableWeight = MAX(actualWeight, volumetricWeight)
```
This ensures dimensional pricing applies when a light but bulky package occupies more cargo space than its weight suggests.

**Step 3: Rate Card Lookup**
The engine queries the `RateCard` table using three keys:
1. `orderType` — B2B or B2C
2. `routeType` — INTRA_ZONE or INTER_ZONE (determined by zone detection)
3. Optional `zoneId` — zone-specific override rates take priority over generic rates

**Step 4: Charge Calculation**
```
weightCharge = MAX(0, billableWeight − minWeight) × perKgRate
baseCharge   = baseRate + weightCharge
```

**Step 5: COD Surcharge**
When `paymentType = COD`, the engine queries `CodSurcharge` by `orderType`:
```
codFee = MAX(flatAmount, codAmount × percentage / 100)
```
Separate surcharge rows for B2B and B2C allow independent configuration.

**Step 6: Total**
```
totalCharge = baseCharge + codFee
```

The engine returns a complete `RateBreakdown` object (actual weight, volumetric weight, billable weight, pickup zone, drop zone, route type, base rate, weight charge, COD surcharge, total) which is displayed to the customer before confirmation.

---

## Zone Detection Approach

Zones are stored in the `Zone` table. Each zone has one or more `Area` records, each with a pincode, area name, and city. This is a purely database-driven approach — no zone logic exists in the frontend.

**Detection flow:**
1. Extract pincode from the address field
2. Query `Area WHERE pincode = $pincode AND isActive = true`
3. Return the associated zone
4. If no match, throw a descriptive error: *"No zone found for pincode: 560034"*

The `zoneService` exposes `findZoneByPincode(pincode)` and `getRouteType(pickupZoneId, dropZoneId)`. Admin can add, edit, or deactivate areas at any time without a code deployment.

---

## Auto-Assignment Logic

The `assignmentService` implements a tiered nearest-agent selection algorithm when Admin triggers auto-assignment:

**Tier 1 — Availability filter:**
Select all agents where `availability = AVAILABLE` and `isActive = true`. Agents in BUSY or OFFLINE state are excluded unconditionally.

**Tier 2 — Zone preference:**
Agents in the same zone as the order's pickup zone are promoted to the top of the candidate list.

**Tier 3 — Geographic distance (Haversine):**
For agents with stored `latitude` and `longitude`, distance from the pickup location is calculated using the Haversine formula:
```
a = sin²(Δlat/2) + cos(lat₁)·cos(lat₂)·sin²(Δlon/2)
d = 2R · atan2(√a, √(1−a))   [R = 6371 km]
```
Candidates are sorted ascending by distance. The nearest eligible agent is selected.

**Tier 4 — Fallback:**
If no coordinates exist, the algorithm falls back to zone-based proximity only.

**Post-assignment:**
- `order.assignedAgentId` is updated
- `agent.availability` transitions to BUSY
- A `DeliveryAssignment` record is created with `method = AUTO` and a `reasoning` string (e.g., *"Nearest available agent in pickup zone: 1.4 km away"*)
- A `DeliveryAttempt` is created (incrementing `attemptNumber`)
- A `TrackingEvent` is appended with the ASSIGNED status

If no available agent exists, the API returns an error and the order remains unassigned.

---

## Failed Delivery Handling

The failed delivery flow is modelled as distinct database records to preserve full history:

1. **Agent marks FAILED:** Agent sets `OUT_FOR_DELIVERY → FAILED` with a failure reason. A `TrackingEvent` is appended (prev = OUT_FOR_DELIVERY, new = FAILED). The current `DeliveryAttempt.status` is set to FAILED. The attempt record is never deleted.

2. **Notification:** `notificationService` sends an email and SMS to the customer, logging a `Notification` record.

3. **Customer reschedules:** Customer submits a `RescheduleRequest` with a new date. The service transitions the order to RESCHEDULED and creates a `TrackingEvent`.

4. **New attempt:** The previous agent is released (`BUSY → AVAILABLE`). `autoAssign` is called, creating a new `DeliveryAttempt` with `attemptNumber = 2`. Both attempts are visible in the order detail UI.

5. **Audit:** The full chain — original assignment, failure reason, reschedule date, new assignment — is queryable and displayed in the admin and customer UIs.

This design prevents data loss, enables audit trails, and satisfies the requirement that rescheduling creates a genuinely new delivery attempt without overwriting history.

---

## Notification Architecture

Notifications use a provider abstraction in `notificationService`:

```
sendOrderStatusNotification(order, newStatus)
  └── emailProvider.send(...)  ← Nodemailer or MockProvider
  └── smsProvider.send(...)    ← Twilio or MockProvider
  └── DB: INSERT INTO Notification (channel, event, status, message, ...)
```

In development (no SMTP credentials), `MockEmailProvider` logs to console and writes a `SENT` record to the database. In production, real SMTP or Twilio credentials activate live delivery. This means the notification flow is always exercisable and testable without real credentials.
