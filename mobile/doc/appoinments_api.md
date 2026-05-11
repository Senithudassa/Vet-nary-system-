# Appointments & Queue Management API

Base URL: `/`  
Authentication: **Bearer JWT required** for all endpoints in this document.

Roles:
- `CUSTOMER`
- `VET`

---

## Common Enums

### AppointmentStatus
- `PENDING`
- `CONFIRMED`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

---

## Common Response Structures

### Appointment (base)
Fields returned by create/update endpoints.

```json
{
  "id": "appointment-uuid",
  "clinicId": "clinic-uuid",
  "ownerId": "owner-uuid",
  "vetId": "vet-uuid-or-null",
  "petId": "pet-uuid",
  "date": "2026-04-26T10:00:00.000Z",
  "status": "PENDING",
  "reason": "Regular checkup",
  "createdAt": "2026-04-20T08:12:34.000Z",
  "updatedAt": "2026-04-20T08:12:34.000Z"
}
```

### Clinic
Included in `GET /appointments/me`.

```json
{
  "id": "clinic-uuid",
  "name": "Happy Paws Vet Clinic",
  "address": "123 Main St",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "phone": "+94-11-1234567",
  "operatingHours": "09:00-18:00",
  "status": "APPROVED",
  "ownerId": "owner-uuid-or-null",
  "createdAt": "2026-04-01T06:00:00.000Z",
  "updatedAt": "2026-04-10T06:00:00.000Z"
}
```

### Pet
Included in `GET /appointments/me`, `GET /clinics/:clinicId/appointments`, `GET /clinics/:clinicId/queue`.

```json
{
  "id": "pet-uuid",
  "ownerId": "owner-uuid",
  "name": "Buddy",
  "species": "Dog",
  "breed": "Labrador",
  "weight": 25.4,
  "microchip": "MC-001122",
  "isActive": true,
  "createdAt": "2026-03-15T10:00:00.000Z",
  "updatedAt": "2026-04-01T10:00:00.000Z"
}
```

### Vet (public view)
Included in `GET /appointments/me`.

```json
{
  "firstName": "Alex",
  "lastName": "Perera"
}
```

### Owner (public view)
Included in `GET /clinics/:clinicId/appointments`.

```json
{
  "firstName": "Nimal",
  "lastName": "Silva",
  "phone": "+94-77-1234567"
}
```

### Owner (queue view)
Included in `GET /clinics/:clinicId/queue`.

```json
{
  "firstName": "Nimal",
  "lastName": "Silva"
}
```

---

## 1) Book a new appointment (Customer only)

**POST** `/appointments`  
**Auth:** Bearer JWT  
**Roles:** `CUSTOMER`

### Request Body — `CreateAppointmentDto`

```json
{
  "clinicId": "clinic-uuid",
  "petId": "pet-uuid",
  "date": "2026-04-26T10:00:00Z",
  "reason": "Regular checkup"
}
```

**Field details**
- `clinicId` (string, required)
- `petId` (string, required)
- `date` (ISO 8601 string, required)
- `reason` (string, optional)

### Responses

**201 Created — Appointment booked successfully**

```json
{
  "id": "appointment-uuid",
  "clinicId": "clinic-uuid",
  "ownerId": "owner-uuid",
  "vetId": null,
  "petId": "pet-uuid",
  "date": "2026-04-26T10:00:00.000Z",
  "status": "PENDING",
  "reason": "Regular checkup",
  "createdAt": "2026-04-20T08:12:34.000Z",
  "updatedAt": "2026-04-20T08:12:34.000Z"
}
```

---

## 2) List customer appointments

**GET** `/appointments/me`  
**Auth:** Bearer JWT  
**Roles:** `CUSTOMER`

### Responses

**200 OK — Appointments retrieved successfully**

```json
[
  {
    "id": "appointment-uuid",
    "clinicId": "clinic-uuid",
    "ownerId": "owner-uuid",
    "vetId": "vet-uuid-or-null",
    "petId": "pet-uuid",
    "date": "2026-04-26T10:00:00.000Z",
    "status": "PENDING",
    "reason": "Regular checkup",
    "createdAt": "2026-04-20T08:12:34.000Z",
    "updatedAt": "2026-04-20T08:12:34.000Z",
    "clinic": {
      "id": "clinic-uuid",
      "name": "Happy Paws Vet Clinic",
      "address": "123 Main St",
      "latitude": 6.9271,
      "longitude": 79.8612,
      "phone": "+94-11-1234567",
      "operatingHours": "09:00-18:00",
      "status": "APPROVED",
      "ownerId": "owner-uuid-or-null",
      "createdAt": "2026-04-01T06:00:00.000Z",
      "updatedAt": "2026-04-10T06:00:00.000Z"
    },
    "pet": {
      "id": "pet-uuid",
      "ownerId": "owner-uuid",
      "name": "Buddy",
      "species": "Dog",
      "breed": "Labrador",
      "weight": 25.4,
      "microchip": "MC-001122",
      "isActive": true,
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-04-01T10:00:00.000Z"
    },
    "vet": {
      "firstName": "Alex",
      "lastName": "Perera"
    }
  }
]
```

---

## 3) List clinic appointments (Vet only)

**GET** `/clinics/:clinicId/appointments`  
**Auth:** Bearer JWT  
**Roles:** `VET`

### Path Parameters
- `clinicId` (string) — Clinic identifier

### Responses

**200 OK — Clinic appointments retrieved successfully**

```json
[
  {
    "id": "appointment-uuid",
    "clinicId": "clinic-uuid",
    "ownerId": "owner-uuid",
    "vetId": "vet-uuid-or-null",
    "petId": "pet-uuid",
    "date": "2026-04-26T10:00:00.000Z",
    "status": "PENDING",
    "reason": "Regular checkup",
    "createdAt": "2026-04-20T08:12:34.000Z",
    "updatedAt": "2026-04-20T08:12:34.000Z",
    "pet": {
      "id": "pet-uuid",
      "ownerId": "owner-uuid",
      "name": "Buddy",
      "species": "Dog",
      "breed": "Labrador",
      "weight": 25.4,
      "microchip": "MC-001122",
      "isActive": true,
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-04-01T10:00:00.000Z"
    },
    "owner": {
      "firstName": "Nimal",
      "lastName": "Silva",
      "phone": "+94-77-1234567"
    }
  }
]
```

---

## 4) Update appointment status

**PATCH** `/appointments/:id/status`  
**Auth:** Bearer JWT  
**Roles:** `CUSTOMER`, `VET`

### Path Parameters
- `id` (string) — Appointment identifier

### Request Body — `UpdateAppointmentStatusDto`

```json
{
  "status": "CONFIRMED"
}
```

**Field details**
- `status` (enum `AppointmentStatus`, required)

### Responses

**200 OK — Status updated successfully**

```json
{
  "id": "appointment-uuid",
  "clinicId": "clinic-uuid",
  "ownerId": "owner-uuid",
  "vetId": "vet-uuid-or-null",
  "petId": "pet-uuid",
  "date": "2026-04-26T10:00:00.000Z",
  "status": "CONFIRMED",
  "reason": "Regular checkup",
  "createdAt": "2026-04-20T08:12:34.000Z",
  "updatedAt": "2026-04-20T10:15:00.000Z"
}
```

---

## 5) Get current daily queue for clinic (Vet only)

**GET** `/clinics/:clinicId/queue`  
**Auth:** Bearer JWT  
**Roles:** `VET`

### Path Parameters
- `clinicId` (string) — Clinic identifier

### Responses

**200 OK — Queue retrieved successfully**

```json
[
  {
    "id": "appointment-uuid",
    "clinicId": "clinic-uuid",
    "ownerId": "owner-uuid",
    "vetId": "vet-uuid-or-null",
    "petId": "pet-uuid",
    "date": "2026-04-26T10:00:00.000Z",
    "status": "PENDING",
    "reason": "Regular checkup",
    "createdAt": "2026-04-20T08:12:34.000Z",
    "updatedAt": "2026-04-20T08:12:34.000Z",
    "pet": {
      "id": "pet-uuid",
      "ownerId": "owner-uuid",
      "name": "Buddy",
      "species": "Dog",
      "breed": "Labrador",
      "weight": 25.4,
      "microchip": "MC-001122",
      "isActive": true,
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-04-01T10:00:00.000Z"
    },
    "owner": {
      "firstName": "Nimal",
      "lastName": "Silva"
    }
  }
]
```

---

## 6) Add arrived patient to live queue (Vet only)

**POST** `/clinics/:clinicId/queue`  
**Auth:** Bearer JWT  
**Roles:** `VET`

### Path Parameters
- `clinicId` (string) — Clinic identifier

### Request Body — `AddToQueueDto`

```json
{
  "petId": "pet-uuid",
  "appointmentId": "appointment-uuid"
}
```

**Field details**
- `petId` (string, required)
- `appointmentId` (string, optional)

### Responses

**201 Created — Added to queue successfully**

> If `appointmentId` is provided, the existing appointment is updated to `CONFIRMED`.  
> Otherwise, a new walk-in appointment is created.

```json
{
  "id": "appointment-uuid",
  "clinicId": "clinic-uuid",
  "ownerId": "owner-uuid",
  "vetId": null,
  "petId": "pet-uuid",
  "date": "2026-04-20T10:30:00.000Z",
  "status": "CONFIRMED",
  "reason": "Walk-in / Queue Arrival",
  "createdAt": "2026-04-20T10:30:00.000Z",
  "updatedAt": "2026-04-20T10:30:00.000Z"
}
```
