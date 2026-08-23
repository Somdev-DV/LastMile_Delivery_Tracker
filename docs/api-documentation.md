# Last-Mile Delivery Tracker — API Documentation

This document outlines the RESTful API endpoints available in the system.

Base URL: `http://localhost:5000/api`

---

## Authentication & Profiles

### 1. Register User
- **Method**: `POST`
- **Path**: `/auth/register`
- **Auth**: None
- **Body**:
```json
{
  "name": "Rahul Sharma",
  "email": "customer1@test.com",
  "password": "Customer@123",
  "phone": "+91 91234 56789",
  "role": "CUSTOMER",
  "address": "4th Block, Koramangala",
  "city": "Bangalore",
  "pincode": "560034"
}
```
- **Response `201`**: `{ success: true, data: { token, user }, message: "Registration successful" }`

### 2. Login
- **Method**: `POST`
- **Path**: `/auth/login`
- **Auth**: None
- **Body**: `{ "email": "admin@lastmile.com", "password": "Admin@123" }`
- **Response `200`**: `{ success: true, data: { token, user }, message: "Login successful" }`

### 3. Get Current Profile
- **Method**: `GET`
- **Path**: `/auth/me`
- **Auth**: Bearer JWT

---

## Orders & Pricing

### 4. Pricing Calculation Preview
- **Method**: `POST`
- **Path**: `/orders/calculate`
- **Auth**: None (Public preview)
- **Body**:
```json
{
  "pickupPincode": "560001",
  "pickupCity": "Bangalore",
  "dropPincode": "560066",
  "dropCity": "Bangalore",
  "length": 40,
  "breadth": 30,
  "height": 25,
  "actualWeight": 4.0,
  "orderType": "B2C",
  "paymentType": "COD",
  "codAmount": 1500
}
```
- **Response `200`**:
```json
{
  "success": true,
  "data": {
    "actualWeight": 4.0,
    "volumetricWeight": 6.0,
    "billableWeight": 6.0,
    "pickupZoneName": "Zone A - Bangalore Central",
    "dropZoneName": "Zone B - Bangalore East",
    "routeType": "INTER_ZONE",
    "orderType": "B2C",
    "paymentType": "COD",
    "baseRate": 100.0,
    "weightCharge": 82.5,
    "codSurcharge": 30.0,
    "totalCharge": 212.5,
    "breakdown": "Base: ₹100.00 (0.5kg incl) + Extra Weight: ₹82.50 (5.50kg @ ₹15/kg) + COD Surcharge: ₹30.00 = Total: ₹212.50"
  }
}
```

### 5. Create Order
- **Method**: `POST`
- **Path**: `/orders`
- **Auth**: Bearer JWT (CUSTOMER or ADMIN)
- **Body**: same parameters as calculation + `pickupAddress`, `dropAddress`, optional `remarks`.

### 6. List Orders
- **Method**: `GET`
- **Path**: `/orders?status=IN_TRANSIT&page=1&limit=10`
- **Auth**: Bearer JWT (Role-scoped: Customer sees own, Agent sees assigned, Admin sees all)

### 7. Get Order by ID
- **Method**: `GET`
- **Path**: `/orders/:id`
- **Auth**: Bearer JWT

### 8. Update Delivery Status
- **Method**: `POST`
- **Path**: `/orders/:id/status`
- **Auth**: Bearer JWT (DELIVERY_AGENT or ADMIN)
- **Body**:
```json
{
  "status": "FAILED",
  "failureReason": "Customer phone switched off and door locked",
  "remarks": "Attempted at 3:15 PM"
}
```

### 9. Reschedule Failed Order
- **Method**: `POST`
- **Path**: `/orders/:id/reschedule`
- **Auth**: Bearer JWT (CUSTOMER)
- **Body**:
```json
{
  "requestedDate": "2026-08-25T10:00:00.000Z",
  "reason": "Please deliver after 10 AM on Tuesday"
}
```

### 10. Auto-Assign Nearest Agent
- **Method**: `POST`
- **Path**: `/orders/:id/auto-assign`
- **Auth**: Bearer JWT (ADMIN)

### 11. Manual Assign Agent
- **Method**: `POST`
- **Path**: `/orders/:id/assign`
- **Auth**: Bearer JWT (ADMIN)
- **Body**: `{ "agentId": "uuid-of-agent" }`

### 12. Get Tracking Timeline
- **Method**: `GET`
- **Path**: `/orders/:id/tracking`
- **Auth**: Bearer JWT

---

## Admin Management

### 13. Dashboard Metrics
- **Method**: `GET`
- **Path**: `/admin/dashboard`
- **Auth**: Bearer JWT (ADMIN)

### 14. Zone & Rate Configuration
- `GET /zones` — list all active zones
- `POST /zones` — create new zone
- `POST /zones/:id/areas` — map pincode/area to zone
- `GET /rates` — list rate cards
- `POST /rates` — create or edit rate card
- `GET /rates/cod` — list COD configurations
- `POST /rates/cod` — update COD percentage/flat fee
