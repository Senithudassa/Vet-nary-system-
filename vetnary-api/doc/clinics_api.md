# Clinics API

This document describes all clinic-related endpoints, authentication/authorization requirements, and request/response schemas.

## Base URL
```
/clinics
```

## Authentication
- Uses Bearer JWT (`Authorization: Bearer <token>`).
- Role-based access enforced.

## Roles
- `MAIN_ADMIN`
- `VET`

## Enums

### `ClinicStatus`
- `PENDING`
- `APPROVED`
- `REJECTED`

---

## Data Schemas

### Clinic (public listing)
```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "latitude": 0,
  "longitude": 0,
  "phone": "string",
  "operatingHours": "string"
}
```

### Clinic (full details)
```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "latitude": 0,
  "longitude": 0,
  "phone": "string",
  "operatingHours": "string",
  "status": "PENDING | APPROVED | REJECTED",
  "ownerId": "string | null",
  "createdAt": "string (ISO datetime)",
  "updatedAt": "string (ISO datetime)",
  "owner": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "MAIN_ADMIN | MINOR_ADMIN | VET | CUSTOMER",
    "phone": "string | null",
    "accountNumber": "string | null",
    "licenseNumber": "string | null",
    "isActive": true,
    "createdAt": "string (ISO datetime)",
    "updatedAt": "string (ISO datetime)"
  },
  "staff": [
    {
      "id": "string",
      "clinicId": "string",
      "userId": "string",
      "createdAt": "string (ISO datetime)",
      "user": {
        "id": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "role": "MAIN_ADMIN | MINOR_ADMIN | VET | CUSTOMER",
        "phone": "string | null",
        "accountNumber": "string | null",
        "licenseNumber": "string | null",
        "isActive": true,
        "createdAt": "string (ISO datetime)",
        "updatedAt": "string (ISO datetime)"
      }
    }
  ]
}
```

> Note: If the clinic owner is also listed in staff, they are filtered out from the `staff` array in the response.

### Clinic Staff (listing)
```json
[
  {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "MAIN_ADMIN | MINOR_ADMIN | VET | CUSTOMER",
    "phone": "string | null"
  }
]
```

### Clinic Staff Record (add staff response)
```json
{
  "id": "string",
  "clinicId": "string",
  "userId": "string",
  "createdAt": "string (ISO datetime)"
}
```

---

## Endpoints

### 1) List all approved clinics (Public)
**GET** `/clinics`

**Auth:** None  
**Roles:** Public

**Response 200**
```json
[
  {
    "id": "string",
    "name": "string",
    "address": "string",
    "latitude": 0,
    "longitude": 0,
    "phone": "string",
    "operatingHours": "string"
  }
]
```

---

### 2) List all clinics (Main Admin only)
**GET** `/clinics/admin/all`

**Auth:** Bearer JWT  
**Roles:** `MAIN_ADMIN`

**Response 200**
```json
[
  {
    "id": "string",
    "name": "string",
    "address": "string",
    "latitude": 0,
    "longitude": 0,
    "phone": "string",
    "operatingHours": "string",
    "status": "PENDING | APPROVED | REJECTED",
    "ownerId": "string | null",
    "createdAt": "string (ISO datetime)",
    "updatedAt": "string (ISO datetime)"
  }
]
```

---

### 3) Get clinic details (Public)
**GET** `/clinics/:id`

**Auth:** None  
**Roles:** Public

**Path Params**
- `id` (string) — Clinic ID

**Response 200**
```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "latitude": 0,
  "longitude": 0,
  "phone": "string",
  "operatingHours": "string",
  "status": "PENDING | APPROVED | REJECTED",
  "ownerId": "string | null",
  "createdAt": "string (ISO datetime)",
  "updatedAt": "string (ISO datetime)",
  "owner": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "MAIN_ADMIN | MINOR_ADMIN | VET | CUSTOMER",
    "phone": "string | null",
    "accountNumber": "string | null",
    "licenseNumber": "string | null",
    "isActive": true,
    "createdAt": "string (ISO datetime)",
    "updatedAt": "string (ISO datetime)"
  },
  "staff": [
    {
      "id": "string",
      "clinicId": "string",
      "userId": "string",
      "createdAt": "string (ISO datetime)",
      "user": {
        "id": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "role": "MAIN_ADMIN | MINOR_ADMIN | VET | CUSTOMER",
        "phone": "string | null",
        "accountNumber": "string | null",
        "licenseNumber": "string | null",
        "isActive": true,
        "createdAt": "string (ISO datetime)",
        "updatedAt": "string (ISO datetime)"
      }
    }
  ]
}
```

**Error 404**
```json
{
  "statusCode": 404,
  "message": "Clinic not found",
  "error": "Not Found"
}
```

---

### 4) Approve or reject a clinic (Main Admin only)
**PATCH** `/clinics/:id/status`

**Auth:** Bearer JWT  
**Roles:** `MAIN_ADMIN`

**Path Params**
- `id` (string) — Clinic ID

**Request Body**
```json
{
  "status": "PENDING | APPROVED | REJECTED"
}
```

**Response 200**

---

### 5) Update clinic details (Vet or Main Admin only)
**PATCH** `/clinics/:id`

**Auth:** Bearer JWT
**Roles:** `VET`, `MAIN_ADMIN`

**Path Params**
- `id` (string) — Clinic ID

**Request Body**
```json
{
  "name": "New Name",
  "address": "123 Pet St",
  "latitude": 40.7128,
  "longitude": -74.006,
  "phone": "0123456789",
  "operatingHours": "09:00 - 18:00"
}
```

**Response 200**
```json
{
  "id": "string",
  "name": "New Name",
  "address": "123 Pet St",
  "latitude": 40.7128,
  "longitude": -74.006,
  "phone": "0123456789",
  "operatingHours": "09:00 - 18:00",
  "status": "PENDING | APPROVED | REJECTED",
  "ownerId": "string | null",
  "createdAt": "string (ISO datetime)",
  "updatedAt": "string (ISO datetime)"
}
```

---

### 6) List clinic staff (Vet only)
**GET** `/clinics/:id/staff`

**Auth:** Bearer JWT
**Roles:** `VET`

**Path Params**
- `id` (string) — Clinic ID

**Response 200**
```json
[
  {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "MAIN_ADMIN | MINOR_ADMIN | VET | CUSTOMER",
    "phone": "string | null"
  }
]
```

---

### 7) Add staff to clinic (Vet only)
**POST** `/clinics/:id/staff`

**Auth:** Bearer JWT
**Roles:** `VET`

**Path Params**
- `id` (string) — Clinic ID

**Request Body**
```json
{
  "userId": "user-uuid"
}
```

**Response 201**
```json
{
  "id": "string",
  "clinicId": "string",
  "userId": "user-uuid",
  "createdAt": "string (ISO datetime)"
}
```
```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "latitude": 0,
  "longitude": 0,
  "phone": "string",
  "operatingHours": "string",
  "status": "PENDING | APPROVED | REJECTED",
  "ownerId": "string | null",
  "createdAt": "string (ISO datetime)",
  "updatedAt": "string (ISO datetime)"
}
```

**Error 404**
```json
{
  "statusCode": 404,
  "message": "Clinic not found",
  "error": "Not Found"
}
```

---

### 5) Update clinic details (Vet or Main Admin only)
**PATCH** `/clinics/:id`

**Auth:** Bearer JWT  
**Roles:** `VET`, `MAIN_ADMIN`

**Path Params**
- `id` (string) — Clinic ID

**Request Body** (all fields optional)
```json
{
  "name": "string",
  "address": "string",
  "latitude": 0,
  "longitude": 0,
  "phone": "string",
  "operatingHours": "string"
}
```

**Response 200**
```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "latitude": 0,
  "longitude": 0,
  "phone": "string",
  "operatingHours": "string",
  "status": "PENDING | APPROVED | REJECTED",
  "ownerId": "string | null",
  "createdAt": "string (ISO datetime)",
  "updatedAt": "string (ISO datetime)"
}
```

**Errors**
- 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Clinic not found",
  "error": "Not Found"
}
```
- 403 Forbidden (if vet is not staff)
```json
{
  "statusCode": 403,
  "message": "Not authorized to update this clinic",
  "error": "Forbidden"
}
```

---

### 6) List clinic staff (Vet only)
**GET** `/clinics/:id/staff`

**Auth:** Bearer JWT  
**Roles:** `VET`

**Path Params**
- `id` (string) — Clinic ID

**Response 200**
```json
[
  {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "MAIN_ADMIN | MINOR_ADMIN | VET | CUSTOMER",
    "phone": "string | null"
  }
]
```

---

### 7) Add staff to clinic (Vet only)
**POST** `/clinics/:id/staff`

**Auth:** Bearer JWT  
**Roles:** `VET`

**Path Params**
- `id` (string) — Clinic ID

**Request Body**
```json
{
  "userId": "string"
}
```

**Response 201**
```json
{
  "id": "string",
  "clinicId": "string",
  "userId": "string",
  "createdAt": "string (ISO datetime)"
}
```

**Error 404**
```json
{
  "statusCode": 404,
  "message": "Clinic not found",
  "error": "Not Found"
}
```
