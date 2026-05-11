# Invoices API Documentation

This document describes the Invoicing & Billing endpoints, request bodies, and response structures.

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

### 1) Generate Invoice
**POST** `/invoices`

**Roles:** `VET`  
**Description:** Generates a new invoice for a customer.

**Request Body**
```json
{
  "clinicId": "clinic-uuid",
  "ownerId": "owner-uuid",
  "appointmentId": "appointment-uuid", // Optional
  "amount": 75.0
}
```

**Response: 201**
```json
{
  "id": "invoice-uuid",
  "clinicId": "clinic-uuid",
  "ownerId": "owner-uuid",
  "appointmentId": "appointment-uuid",
  "amount": 75.0,
  "status": "PENDING",
  "issuedAt": "2024-05-01T10:00:00.000Z",
  "paidAt": null
}
```

**Errors**
- `403 Forbidden` — Vet role required

---

### 2) List Clinic Invoices
**GET** `/clinics/:clinicId/invoices`

**Roles:** `VET`  
**Description:** Retrieves all invoices for a specific clinic.

**Path Params**
- `clinicId` (string, required) — Clinic ID (UUID)

**Response: 200**
```json
[
  {
    "id": "invoice-uuid",
    "clinicId": "clinic-uuid",
    "ownerId": "owner-uuid",
    "appointmentId": "appointment-uuid",
    "amount": 75.0,
    "status": "PAID",
    "issuedAt": "2024-05-01T10:00:00.000Z",
    "paidAt": "2024-05-02T14:30:00.000Z"
  }
]
```

**Errors**
- `403 Forbidden` — Vet role required

---

### 3) List Customer Billing History
**GET** `/invoices/me`

**Roles:** `CUSTOMER`  
**Description:** Retrieves all invoices belonging to the authenticated customer.

**Response: 200**
```json
[
  {
    "id": "invoice-uuid",
    "clinicId": "clinic-uuid",
    "ownerId": "owner-uuid",
    "appointmentId": "appointment-uuid",
    "amount": 75.0,
    "status": "PENDING",
    "issuedAt": "2024-05-01T10:00:00.000Z",
    "paidAt": null
  }
]
```

**Errors**
- `403 Forbidden` — Customer role required

---

### 4) Mark Invoice as Paid
**PATCH** `/invoices/:id/pay`

**Roles:** `CUSTOMER`, `VET`  
**Description:** Marks a pending invoice as paid. Customers can only pay their own invoices.

**Path Params**
- `id` (string, required) — Invoice ID (UUID)

**Response: 200**
```json
{
  "id": "invoice-uuid",
  "clinicId": "clinic-uuid",
  "ownerId": "owner-uuid",
  "appointmentId": "appointment-uuid",
  "amount": 75.0,
  "status": "PAID",
  "issuedAt": "2024-05-01T10:00:00.000Z",
  "paidAt": "2024-05-02T14:30:00.000Z"
}
```

**Errors**
- `403 Forbidden` — Not authorized to update this invoice
- `404 Not Found` — Invoice not found

---

## Schemas

### Invoice
```json
{
  "id": "string",
  "clinicId": "string",
  "ownerId": "string",
  "appointmentId": "string | null",
  "amount": "number",
  "status": "PENDING | PAID",
  "issuedAt": "string (date-time)",
  "paidAt": "string (date-time) | null"
}
```

### CreateInvoiceRequest
```json
{
  "clinicId": "string",
  "ownerId": "string",
  "appointmentId": "string | null",
  "amount": "number"
}
```
