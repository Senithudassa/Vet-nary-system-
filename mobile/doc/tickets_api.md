# Support Tickets API Documentation

This document describes Support Tickets endpoints, request bodies, and response structures.

## Authentication

All endpoints require **Bearer JWT** authentication.

## Roles

- **CUSTOMER**
- **VET**
- **MAIN_ADMIN**
- **MINOR_ADMIN**

---

## Base URL

`/`

---

## Endpoints

### 1) Create Support Ticket

**POST** `/support-tickets`

**Roles:** `CUSTOMER`, `VET`  
**Description:** Creates a new support ticket.  
**Notes:**

- Customer must provide `assignedVetId` and cannot assign an admin.
- Vet can create tickets for themselves and optionally assign an admin.
- If `targetClinicId` is provided, the assigned vet must belong to that clinic.

**Request Body**

```/dev/null/tickets_api.md#L1-L7
{
  "subject": "Bug report",
  "description": "I cannot see my pet list",
  "targetClinicId": "clinic-uuid (optional)",
  "assignedVetId": "vet-uuid (required for CUSTOMER)",
  "assignedAdminId": "admin-uuid (optional, VET only)"
}
```

**Response: 201**

```/dev/null/tickets_api.md#L9-L33
{
  "id": "ticket-uuid",
  "ownerId": "owner-uuid",
  "targetClinicId": "clinic-uuid",
  "assignedVetId": "vet-uuid",
  "assignedAdminId": null,
  "subject": "Bug report",
  "description": "I cannot see my pet list",
  "status": "OPEN",
  "createdAt": "2024-05-11T12:00:00.000Z",
  "updatedAt": "2024-05-11T12:00:00.000Z",
  "owner": { "firstName": "Sam", "lastName": "Perera", "email": "sam@example.com" },
  "assignedVet": { "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com" },
  "assignedAdmin": null,
  "targetClinic": { "id": "clinic-uuid", "name": "Happy Paws Clinic" }
}
```

**Errors**

- `400 Bad Request` — Missing vet for customer / vet not in clinic
- `403 Forbidden` — Not authorized to assign admin (CUSTOMER)

---

### 2) List All Tickets (Admin Only)

**GET** `/support-tickets`

**Roles:** `MAIN_ADMIN`, `MINOR_ADMIN`  
**Description:** Returns all tickets.

**Response: 200**

```/dev/null/tickets_api.md#L35-L59
[
  {
    "id": "ticket-uuid",
    "ownerId": "owner-uuid",
    "targetClinicId": "clinic-uuid",
    "assignedVetId": "vet-uuid",
    "assignedAdminId": "admin-uuid",
    "subject": "Bug report",
    "description": "I cannot see my pet list",
    "status": "IN_PROGRESS",
    "createdAt": "2024-05-11T12:00:00.000Z",
    "updatedAt": "2024-05-11T12:00:00.000Z",
    "owner": { "firstName": "Sam", "lastName": "Perera", "email": "sam@example.com" },
    "assignedVet": { "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com" },
    "assignedAdmin": { "firstName": "Alex", "lastName": "Silva", "email": "alex@example.com" },
    "targetClinic": { "id": "clinic-uuid", "name": "Happy Paws Clinic" }
  }
]
```

---

### 3) List My Tickets

**GET** `/support-tickets/me`

**Roles:** `CUSTOMER`, `VET`  
**Description:** Returns tickets created by the current user.

**Response: 200**

```/dev/null/tickets_api.md#L61-L78
[
  {
    "id": "ticket-uuid",
    "ownerId": "owner-uuid",
    "assignedVetId": "vet-uuid",
    "assignedAdminId": null,
    "subject": "Bug report",
    "description": "I cannot see my pet list",
    "status": "OPEN",
    "createdAt": "2024-05-11T12:00:00.000Z",
    "updatedAt": "2024-05-11T12:00:00.000Z",
    "assignedVet": { "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com" },
    "assignedAdmin": null,
    "targetClinic": { "id": "clinic-uuid", "name": "Happy Paws Clinic" }
  }
]
```

---

### 4) List Assigned Tickets

**GET** `/support-tickets/assigned`

**Roles:** `VET`, `MAIN_ADMIN`, `MINOR_ADMIN`  
**Description:** Returns tickets assigned to the current vet/admin.

**Response: 200**

```/dev/null/tickets_api.md#L80-L100
[
  {
    "id": "ticket-uuid",
    "ownerId": "owner-uuid",
    "assignedVetId": "vet-uuid",
    "assignedAdminId": "admin-uuid",
    "subject": "Bug report",
    "description": "I cannot see my pet list",
    "status": "IN_PROGRESS",
    "createdAt": "2024-05-11T12:00:00.000Z",
    "updatedAt": "2024-05-11T12:00:00.000Z",
    "owner": { "firstName": "Sam", "lastName": "Perera", "email": "sam@example.com" },
    "targetClinic": { "id": "clinic-uuid", "name": "Happy Paws Clinic" }
  }
]
```

---

### 5) Update Ticket Status or Assignment

**PATCH** `/support-tickets/:id`

**Roles:** `VET`, `MAIN_ADMIN`, `MINOR_ADMIN`  
**Description:** Updates ticket status and/or assignments.  
**Notes:**

- Vet can only update tickets they own or are assigned to.
- Vet cannot reassign to another vet.
- Admin can reassign vet/admin (vet must be in clinic if clinic is set).

**Path Params**

- `id` (string, required) — Ticket ID

**Request Body**

```/dev/null/tickets_api.md#L102-L111
{
  "status": "IN_PROGRESS",
  "assignedVetId": "vet-uuid (optional, admin only)",
  "assignedAdminId": "admin-uuid (optional)"
}
```

**Response: 200**

```/dev/null/tickets_api.md#L113-L135
{
  "id": "ticket-uuid",
  "ownerId": "owner-uuid",
  "assignedVetId": "vet-uuid",
  "assignedAdminId": "admin-uuid",
  "subject": "Bug report",
  "description": "I cannot see my pet list",
  "status": "IN_PROGRESS",
  "createdAt": "2024-05-11T12:00:00.000Z",
  "updatedAt": "2024-05-11T12:10:00.000Z",
  "owner": { "firstName": "Sam", "lastName": "Perera", "email": "sam@example.com" },
  "assignedVet": { "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com" },
  "assignedAdmin": { "firstName": "Alex", "lastName": "Silva", "email": "alex@example.com" },
  "targetClinic": { "id": "clinic-uuid", "name": "Happy Paws Clinic" }
}
```

**Errors**

- `400 Bad Request` — Empty update payload or invalid role/clinic assignment
- `403 Forbidden` — Not authorized to update

---

### 6) Escalate Ticket to Admin (Vet Only)

**PATCH** `/support-tickets/:id/escalate`

**Roles:** `VET`  
**Description:** Escalates a ticket to an admin and sets status to `IN_PROGRESS`.

**Path Params**

- `id` (string, required) — Ticket ID

**Request Body**

```/dev/null/tickets_api.md#L137-L142
{
  "assignedAdminId": "admin-uuid"
}
```

**Response: 200**

```/dev/null/tickets_api.md#L144-L166
{
  "id": "ticket-uuid",
  "ownerId": "owner-uuid",
  "assignedVetId": "vet-uuid",
  "assignedAdminId": "admin-uuid",
  "subject": "Bug report",
  "description": "I cannot see my pet list",
  "status": "IN_PROGRESS",
  "createdAt": "2024-05-11T12:00:00.000Z",
  "updatedAt": "2024-05-11T12:20:00.000Z",
  "owner": { "firstName": "Sam", "lastName": "Perera", "email": "sam@example.com" },
  "assignedVet": { "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com" },
  "assignedAdmin": { "firstName": "Alex", "lastName": "Silva", "email": "alex@example.com" },
  "targetClinic": { "id": "clinic-uuid", "name": "Happy Paws Clinic" }
}
```

**Errors**

- `403 Forbidden` — Vet not assigned to this ticket

---

## Schemas

### SupportTicket (response shape)

```/dev/null/tickets_api.md#L168-L184
{
  "id": "string",
  "ownerId": "string",
  "targetClinicId": "string | null",
  "assignedVetId": "string | null",
  "assignedAdminId": "string | null",
  "subject": "string",
  "description": "string",
  "status": "OPEN | IN_PROGRESS | RESOLVED",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```

### User (partial)

```/dev/null/tickets_api.md#L186-L191
{
  "firstName": "string",
  "lastName": "string",
  "email": "string"
}
```

### Clinic (partial)

```/dev/null/tickets_api.md#L193-L198
{
  "id": "string",
  "name": "string"
}
```
