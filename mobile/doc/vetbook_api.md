# VetBook API Documentation

This document describes VetBook (medical records & vaccinations) endpoints, request bodies, and response structures.

## Authentication
All endpoints require **Bearer JWT** authentication.

## Roles
- **CUSTOMER**
- **VET**

---

## Base URL
`/`

---

## Endpoints

### 1) Get Pet Medical Timeline
**GET** `/vetbook/:petId`

**Roles:** `CUSTOMER`, `VET`  
**Description:** Returns a merged, sorted timeline of medical records and vaccinations for a pet.

**Path Params**
- `petId` (string, required) — Pet ID (UUID)

**Response: 200**
Returns an array of timeline items (sorted by `recordDate` desc). Each item includes a `type` field.

**Response Body**
```/dev/null/vetbook_api.md#L1-59
[
  {
    "id": "medical-record-uuid",
    "petId": "pet-uuid",
    "vetId": "vet-user-uuid",
    "clinicId": "clinic-uuid",
    "diagnosis": "Gastroenteritis",
    "treatment": "Dietary restriction",
    "prescription": "Probiotics",
    "notes": "Keep hydrated",
    "recordDate": "2024-04-10T10:00:00.000Z",
    "createdAt": "2024-04-10T10:00:00.000Z",
    "clinic": {
      "id": "clinic-uuid",
      "name": "Happy Paws Clinic",
      "address": "123 Main St",
      "latitude": 6.9271,
      "longitude": 79.8612,
      "phone": "+94112345678",
      "operatingHours": "Mon-Fri 9am-6pm",
      "status": "APPROVED",
      "ownerId": "owner-uuid",
      "createdAt": "2024-03-01T09:00:00.000Z",
      "updatedAt": "2024-03-01T09:00:00.000Z"
    },
    "vet": {
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "type": "MEDICAL"
  },
  {
    "id": "vaccination-uuid",
    "petId": "pet-uuid",
    "clinicId": "clinic-uuid",
    "administeredById": "vet-user-uuid",
    "vaccineName": "Rabies",
    "batchNumber": "BATCH12345",
    "nextDueDate": "2027-04-26T00:00:00.000Z",
    "recordDate": "2024-04-01T08:30:00.000Z",
    "createdAt": "2024-04-01T08:30:00.000Z",
    "clinic": {
      "id": "clinic-uuid",
      "name": "Happy Paws Clinic",
      "address": "123 Main St",
      "latitude": 6.9271,
      "longitude": 79.8612,
      "phone": "+94112345678",
      "operatingHours": "Mon-Fri 9am-6pm",
      "status": "APPROVED",
      "ownerId": "owner-uuid",
      "createdAt": "2024-03-01T09:00:00.000Z",
      "updatedAt": "2024-03-01T09:00:00.000Z"
    },
    "administeredBy": {
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "type": "VACCINE"
  }
]
```

**Errors**
- `404 Not Found` — Pet not found
- `403 Forbidden` — Not authorized to view this pet history

---

### 2) Add Medical Record (Vet Only)
**POST** `/vetbook/:petId/medical`

**Roles:** `VET`  
**Description:** Creates a medical record for a pet.

**Path Params**
- `petId` (string, required)

**Request Body**
```/dev/null/vetbook_api.md#L61-74
{
  "clinicId": "clinic-uuid",
  "diagnosis": "Gastroenteritis",
  "treatment": "Dietary restriction",
  "prescription": "Probiotics",
  "notes": "Keep hydrated"
}
```

**Response: 201**
```/dev/null/vetbook_api.md#L76-92
{
  "id": "medical-record-uuid",
  "petId": "pet-uuid",
  "vetId": "vet-user-uuid",
  "clinicId": "clinic-uuid",
  "diagnosis": "Gastroenteritis",
  "treatment": "Dietary restriction",
  "prescription": "Probiotics",
  "notes": "Keep hydrated",
  "recordDate": "2024-04-10T10:00:00.000Z",
  "createdAt": "2024-04-10T10:00:00.000Z"
}
```

**Errors**
- `403 Forbidden` — Vet role required

---

### 3) Add Vaccination Record (Vet Only)
**POST** `/vetbook/:petId/vaccine`

**Roles:** `VET`  
**Description:** Creates a vaccination record for a pet.

**Path Params**
- `petId` (string, required)

**Request Body**
```/dev/null/vetbook_api.md#L94-106
{
  "clinicId": "clinic-uuid",
  "vaccineName": "Rabies",
  "batchNumber": "BATCH12345",
  "nextDueDate": "2027-04-26T00:00:00Z"
}
```

**Response: 201**
```/dev/null/vetbook_api.md#L108-123
{
  "id": "vaccination-uuid",
  "petId": "pet-uuid",
  "clinicId": "clinic-uuid",
  "administeredById": "vet-user-uuid",
  "vaccineName": "Rabies",
  "batchNumber": "BATCH12345",
  "nextDueDate": "2027-04-26T00:00:00.000Z",
  "recordDate": "2024-04-01T08:30:00.000Z",
  "createdAt": "2024-04-01T08:30:00.000Z"
}
```

**Errors**
- `403 Forbidden` — Vet role required

---

### 4) Get Clinic Records (Vet Only)
**GET** `/clinics/:clinicId/records`

**Roles:** `VET`  
**Description:** Returns all medical records and vaccination records for a clinic.

**Path Params**
- `clinicId` (string, required)

**Response: 200**
```/dev/null/vetbook_api.md#L125-169
{
  "medicalRecords": [
    {
      "id": "medical-record-uuid",
      "petId": "pet-uuid",
      "vetId": "vet-user-uuid",
      "clinicId": "clinic-uuid",
      "diagnosis": "Gastroenteritis",
      "treatment": "Dietary restriction",
      "prescription": "Probiotics",
      "notes": "Keep hydrated",
      "recordDate": "2024-04-10T10:00:00.000Z",
      "createdAt": "2024-04-10T10:00:00.000Z",
      "pet": {
        "id": "pet-uuid",
        "ownerId": "owner-uuid",
        "name": "Buddy",
        "species": "Dog",
        "breed": "Golden Retriever",
        "weight": 15.5,
        "microchip": "900123456789",
        "isActive": true,
        "createdAt": "2024-03-01T09:00:00.000Z",
        "updatedAt": "2024-03-01T09:00:00.000Z"
      },
      "vet": {
        "firstName": "Jane",
        "lastName": "Doe"
      }
    }
  ],
  "vaccinations": [
    {
      "id": "vaccination-uuid",
      "petId": "pet-uuid",
      "clinicId": "clinic-uuid",
      "administeredById": "vet-user-uuid",
      "vaccineName": "Rabies",
      "batchNumber": "BATCH12345",
      "nextDueDate": "2027-04-26T00:00:00.000Z",
      "recordDate": "2024-04-01T08:30:00.000Z",
      "createdAt": "2024-04-01T08:30:00.000Z",
      "pet": {
        "id": "pet-uuid",
        "ownerId": "owner-uuid",
        "name": "Buddy",
        "species": "Dog",
        "breed": "Golden Retriever",
        "weight": 15.5,
        "microchip": "900123456789",
        "isActive": true,
        "createdAt": "2024-03-01T09:00:00.000Z",
        "updatedAt": "2024-03-01T09:00:00.000Z"
      },
      "administeredBy": {
        "firstName": "Jane",
        "lastName": "Doe"
      }
    }
  ]
}
```

**Errors**
- `403 Forbidden` — Not authorized to view records for this clinic

---

## Schemas

### MedicalRecord
```/dev/null/vetbook_api.md#L171-187
{
  "id": "string",
  "petId": "string",
  "vetId": "string",
  "clinicId": "string",
  "diagnosis": "string",
  "treatment": "string | null",
  "prescription": "string | null",
  "notes": "string | null",
  "recordDate": "string (date-time)",
  "createdAt": "string (date-time)"
}
```

### Vaccination
```/dev/null/vetbook_api.md#L189-204
{
  "id": "string",
  "petId": "string",
  "clinicId": "string",
  "administeredById": "string",
  "vaccineName": "string",
  "batchNumber": "string",
  "nextDueDate": "string (date-time) | null",
  "recordDate": "string (date-time)",
  "createdAt": "string (date-time)"
}
```

### Clinic (partial)
```/dev/null/vetbook_api.md#L206-224
{
  "id": "string",
  "name": "string",
  "address": "string",
  "latitude": "number | null",
  "longitude": "number | null",
  "phone": "string | null",
  "operatingHours": "string | null",
  "status": "PENDING | APPROVED | REJECTED",
  "ownerId": "string | null",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```

### User (partial, vet)
```/dev/null/vetbook_api.md#L226-231
{
  "firstName": "string",
  "lastName": "string"
}
```

### Pet (partial)
```/dev/null/vetbook_api.md#L233-246
{
  "id": "string",
  "ownerId": "string",
  "name": "string",
  "species": "string",
  "breed": "string | null",
  "weight": "number | null",
  "microchip": "string | null",
  "isActive": "boolean",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```
