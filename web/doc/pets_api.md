# Pets API Documentation

This document describes Pet Management endpoints, request bodies, and response structures.

## Authentication
All endpoints require **Bearer JWT** authentication.

## Roles
- **CUSTOMER**
- **VET**

---

## Base URL
`/pets`

---

## Endpoints

### 1) List My Pets (Customer)
**GET** `/pets`

**Roles:** `CUSTOMER`  
**Description:** Returns all active pets belonging to the authenticated customer.

**Response: 200**
```/dev/null/pets_api.md#L1-25
[
  {
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
  }
]
```

**Errors**
- `403 Forbidden` — Customer role required

---

### 2) List Pets for Vet
**GET** `/pets/vet`

**Roles:** `VET`  
**Description:** Returns active pets associated with the vet (via clinic appointments).

**Response: 200**
```/dev/null/pets_api.md#L27-51
[
  {
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
  }
]
```

**Errors**
- `403 Forbidden` — Vet role required

---

### 3) Create Pet
**POST** `/pets`

**Roles:** `CUSTOMER`  
**Description:** Adds a new pet for the authenticated customer.

**Request Body**
```/dev/null/pets_api.md#L53-66
{
  "name": "Buddy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "weight": 15.5,
  "microchip": "900123456789"
}
```

**Response: 201**
```/dev/null/pets_api.md#L68-85
{
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
}
```

**Errors**
- `403 Forbidden` — Customer role required

---

### 4) Get Pet Details
**GET** `/pets/:id`

**Roles:** `CUSTOMER`, `VET`  
**Description:** Returns details for a single pet.  
- Customers can only access their own pets.
- Vets can only access pets linked to their clinic appointments.

**Path Params**
- `id` (string, required) — Pet ID (UUID)

**Response: 200**
```/dev/null/pets_api.md#L87-104
{
  "id": "pet-uuid",
  "ownerId": "owner-uuid",
  "name": "Buddy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "weight": 15.5,
  "microchip": "900123456789",
  "isActive": true,
  "createdAt": "2024-03-01T09:00:00.000Z",
  "updatedAt": "2024-03-01T09:00:00.000Z",
  "owner": {
    "id": "owner-uuid",
    "email": "owner@example.com",
    "role": "CUSTOMER",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+94112345678",
    "accountNumber": "ACC123",
    "licenseNumber": null,
    "isActive": true,
    "createdAt": "2024-02-01T09:00:00.000Z",
    "updatedAt": "2024-02-01T09:00:00.000Z"
  }
}
```

**Errors**
- `404 Not Found` — Pet not found
- `403 Forbidden` — Not authorized to view this pet

---

### 5) Update Pet
**PATCH** `/pets/:id`

**Roles:** `CUSTOMER`  
**Description:** Updates a pet owned by the authenticated customer.

**Path Params**
- `id` (string, required) — Pet ID (UUID)

**Request Body**
```/dev/null/pets_api.md#L106-120
{
  "name": "Buddy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "weight": 16.2,
  "microchip": "900123456789"
}
```

**Response: 200**
```/dev/null/pets_api.md#L122-139
{
  "id": "pet-uuid",
  "ownerId": "owner-uuid",
  "name": "Buddy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "weight": 16.2,
  "microchip": "900123456789",
  "isActive": true,
  "createdAt": "2024-03-01T09:00:00.000Z",
  "updatedAt": "2024-03-02T09:00:00.000Z"
}
```

**Errors**
- `403 Forbidden` — Not authorized to update this pet

---

### 6) Soft-Delete Pet
**DELETE** `/pets/:id`

**Roles:** `CUSTOMER`  
**Description:** Soft-deletes a pet (sets `isActive` to `false`).

**Path Params**
- `id` (string, required) — Pet ID (UUID)

**Response: 200**
```/dev/null/pets_api.md#L141-158
{
  "id": "pet-uuid",
  "ownerId": "owner-uuid",
  "name": "Buddy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "weight": 15.5,
  "microchip": "900123456789",
  "isActive": false,
  "createdAt": "2024-03-01T09:00:00.000Z",
  "updatedAt": "2024-03-03T09:00:00.000Z"
}
```

**Errors**
- `403 Forbidden` — Not authorized to delete this pet

---

## Schemas

### Pet
```/dev/null/pets_api.md#L160-175
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

### CreatePetRequest
```/dev/null/pets_api.md#L177-185
{
  "name": "string",
  "species": "string",
  "breed": "string | null",
  "weight": "number | null",
  "microchip": "string | null"
}
```

### UpdatePetRequest
```/dev/null/pets_api.md#L187-195
{
  "name": "string | null",
  "species": "string | null",
  "breed": "string | null",
  "weight": "number | null",
  "microchip": "string | null"
}
```

### User (partial, owner)
```/dev/null/pets_api.md#L197-210
{
  "id": "string",
  "email": "string",
  "role": "MAIN_ADMIN | MINOR_ADMIN | VET | CUSTOMER",
  "firstName": "string",
  "lastName": "string",
  "phone": "string | null",
  "accountNumber": "string | null",
  "licenseNumber": "string | null",
  "isActive": "boolean",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```
