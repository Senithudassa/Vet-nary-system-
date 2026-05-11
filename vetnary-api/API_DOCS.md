# VetNary API Documentation

This document provides a comprehensive overview of the VetNary Backend API endpoints, request structures, and response details.

**Base URL**: `http://localhost:3001/api/v1`

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Clinic Operations](#3-clinic-operations)
4. [Pet Management](#4-pet-management)
5. [Appointments & Queue Management](#5-appointments--queue-management)
6. [Invoicing & Billing](#6-invoicing--billing)
7. [VetBook & Medical Records](#7-vetbook--medical-records)
8. [Support & Admin](#8-support--admin)
9. [AI Features](#9-ai-features)

---

## 1. Authentication

### Register Customer
Registers a new customer account.
- **Route**: `POST /auth/register/customer`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0123456789"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com"
  }
  ```

### Register Doctor
Registers a new doctor (Vet role).
- **Route**: `POST /auth/register/doctor`
- **Request Body**:
  ```json
  {
    "email": "vet@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Vet",
    "phone": "0123456789",
    "licenseNumber": "VET-12345"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "name": "Jane Vet",
    "email": "vet@example.com"
  }
  ```

### Register Clinic
Registers a new clinic (linked to an existing doctor).
- **Route**: `POST /auth/register/clinic`
- **Request Body**:
  ```json
  {
    "ownerId": "doctor-uuid",
    "clinicName": "Happy Paws Clinic",
    "clinicAddress": "123 Pet St, Animal City",
    "operatingHours": "09:00 - 18:00"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "message": "Clinic registered successfully",
    "clinic": {
      "id": "uuid",
      "status": "PENDING"
    }
  }
  ```

### Login (General)
Authenticates a user and returns access/refresh tokens.
- **Route**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "jwt_token_here",
    "refresh_token": "jwt_token_here"
  }
  ```

### Login (Clinic Owner)
- **Route**: `POST /auth/login/clinic`
- **Request Body**: same as `/auth/login`
- **Response**: `200 OK` (tokens)

### Login (Admin)
- **Route**: `POST /auth/login/admin`
- **Request Body**: same as `/auth/login`
- **Response**: `200 OK` (tokens)

### Refresh Token
Refreshes an expired access token.
- **Route**: `POST /auth/refresh`
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response**: `200 OK` (tokens)

### Logout
- **Route**: `POST /auth/logout`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### Get My Profile
- **Route**: `GET /auth/me`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`
  - **Example (Customer)**:
    ```json
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER",
      "phone": "0123456789",
      "isActive": true
    }
    ```
  - **Example (Vet)**:
    ```json
    {
      "id": "uuid",
      "email": "vet@example.com",
      "firstName": "Jane",
      "lastName": "Vet",
      "role": "VET",
      "phone": "0123456789",
      "isActive": true,
      "vetId": "uuid"
    }
    ```
  - `vetId` is included only for users with the `VET` role.

---

## 2. User Management (Main Admin Only)

### List All Users
- **Route**: `GET /users`
- **Auth**: Bearer Token required.
- **Query Params**: `search`, `role`, `page`, `limit`
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-04-26T10:00:00Z"
      }
    ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
  ```

### Update User Role
- **Route**: `PATCH /users/:id/role`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  { "role": "VET" }
  ```
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "role": "VET"
  }
  ```

---

## 3. Clinic Operations

### List Approved Clinics (Public)
- **Route**: `GET /clinics`
- **Response**: `200 OK`

### Get Clinic Details (Public)
- **Route**: `GET /clinics/:id`
- **Response**: `200 OK`

### Update Status (Main Admin)
- **Route**: `PATCH /clinics/:id/status`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  { "status": "APPROVED" }
  ```
- **Response**: `200 OK`

### Update Clinic (Vet/Main Admin)
- **Route**: `PATCH /clinics/:id`
- **Auth**: Bearer Token required.
- **Request Body** (any of):
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
- **Response**: `200 OK`

### List Clinic Staff (Vet Only)
- **Route**: `GET /clinics/:id/staff`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### Add Staff (Vet Only)
- **Route**: `POST /clinics/:id/staff`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  { "userId": "user-uuid" }
  ```
- **Response**: `201 Created`

---

## 4. Pet Management (Customer/Vet)

### List My Pets (Customer)
- **Route**: `GET /pets`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### Add Pet (Customer)
- **Route**: `POST /pets`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "name": "Buddy",
    "species": "Dog",
    "breed": "Golden Retriever",
    "weight": 15.5,
    "microchip": "900123456789"
  }
  ```
- **Response**: `201 Created`

### Get Pet Details (Customer/Vet)
- **Route**: `GET /pets/:id`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### Update Pet (Customer)
- **Route**: `PATCH /pets/:id`
- **Auth**: Bearer Token required.
- **Request Body**: same fields as create, all optional
- **Response**: `200 OK`

### Delete Pet (Customer)
Soft-delete.
- **Route**: `DELETE /pets/:id`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

---

## 5. Appointments & Queue Management

### Book Appointment (Customer)
- **Route**: `POST /appointments`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "clinicId": "clinic-uuid",
    "petId": "pet-uuid",
    "date": "2026-04-26T10:00:00Z",
    "reason": "Regular checkup"
  }
  ```
- **Response**: `201 Created`

### List My Appointments (Customer)
- **Route**: `GET /appointments/me`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### List Clinic Appointments (Vet)
- **Route**: `GET /clinics/:clinicId/appointments`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### Update Appointment Status (Customer/Vet)
- **Route**: `PATCH /appointments/:id/status`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  { "status": "CONFIRMED" }
  ```
- **Response**: `200 OK`

### Get Queue (Vet)
- **Route**: `GET /clinics/:clinicId/queue`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### Add to Queue (Vet)
- **Route**: `POST /clinics/:clinicId/queue`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "petId": "pet-uuid",
    "appointmentId": "appointment-uuid"
  }
  ```
- **Response**: `201 Created`

---

## 6. Invoicing & Billing

### Generate Invoice (Vet)
- **Route**: `POST /invoices`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "clinicId": "clinic-uuid",
    "ownerId": "owner-uuid",
    "appointmentId": "appointment-uuid",
    "amount": 75.0
  }
  ```
- **Response**: `201 Created`

### List Clinic Invoices (Vet)
- **Route**: `GET /clinics/:clinicId/invoices`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### List My Invoices (Customer)
- **Route**: `GET /invoices/me`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### Mark Paid (Customer/Vet)
- **Route**: `PATCH /invoices/:id/pay`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

---

## 7. VetBook & Medical Records

### Medical Timeline (Customer/Vet)
- **Route**: `GET /vetbook/:petId`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### Add Medical Record (Vet)
- **Route**: `POST /vetbook/:petId/medical`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "clinicId": "clinic-uuid",
    "diagnosis": "Gastroenteritis",
    "treatment": "Dietary restriction",
    "prescription": "Probiotics",
    "notes": "Keep hydrated"
  }
  ```
- **Response**: `201 Created`

### Add Vaccination Record (Vet)
- **Route**: `POST /vetbook/:petId/vaccine`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "clinicId": "clinic-uuid",
    "vaccineName": "Rabies",
    "batchNumber": "BATCH12345",
    "nextDueDate": "2027-04-26T00:00:00Z"
  }
  ```
- **Response**: `201 Created`

### Clinic Records (Vet)
- **Route**: `GET /clinics/:clinicId/records`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

---

## 8. Support & Admin

### Submit Ticket (Customer/Vet)
- **Route**: `POST /support-tickets`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "subject": "Bug report",
    "description": "I cannot see my pet list",
    "targetClinicId": "clinic-uuid"
  }
  ```
- **Response**: `201 Created`

### List Support Tickets (Admin)
- **Route**: `GET /support-tickets`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

### Update Ticket Status (Minor Admin)
- **Route**: `PATCH /support-tickets/:id`
- **Auth**: Bearer Token required.
- **Request Body**:
  ```json
  { "status": "IN_PROGRESS" }
  ```
- **Response**: `200 OK`

### Platform Stats (Main Admin)
- **Route**: `GET /admin/stats`
- **Auth**: Bearer Token required.
- **Response**: `200 OK`

---

## 9. AI Features

> **Auth**: All AI endpoints require a Bearer Token (`Authorization: Bearer <access_token>`).

### Scan Pet Skin
Upload a pet skin image for AI-powered disease detection. Returns the identified condition, confidence score, clinical recommendation, and the bounding box of the affected area.

- **Route**: `POST /ai/scan-skin`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:

  | Field   | Type   | Required | Description                                      |
  |---------|--------|----------|--------------------------------------------------|
  | `image` | File   | ✅ Yes   | The pet skin image (JPEG, PNG, WEBP, HEIC, HEIF) |

- **Response**: `201 Created`
  ```json
  {
    "condition": "Ringworm (Dermatophytosis)",
    "confidence": 87,
    "recommendation": "Apply antifungal cream twice daily and consult a vet within 48 hours.",
    "affectedArea": {
      "x": 0.3,
      "y": 0.25,
      "width": 0.4,
      "height": 0.35
    },
    "imageDimensions": {
      "width": 1280,
      "height": 960
    }
  }
  ```

- **Error Responses**:

  | Status | Description                          |
  |--------|--------------------------------------|
  | `400`  | No image file provided               |
  | `401`  | Unauthorized – missing/invalid token |
  | `500`  | AI analysis failed                   |

> **`affectedArea` coordinates** are expressed as **fractions** of the full image dimensions (0.0 – 1.0).
> Multiply by `imageDimensions.width` / `imageDimensions.height` to get pixel values.

---

### Veterinary Chat
Chat with VetBot, an AI assistant specialising exclusively in veterinary medicine and pet health. Off-topic questions are politely refused.

- **Route**: `POST /ai/chat`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "message": "My dog has been scratching a lot. What could it be?"
  }
  ```

- **Response**: `201 Created`
  ```json
  {
    "reply": "Excessive scratching in dogs can be caused by allergies (food or environmental), fleas, or dry skin. I recommend checking for visible parasites and consulting your vet if the scratching persists."
  }
  ```

- **Error Responses**:

  | Status | Description                          |
  |--------|--------------------------------------|
  | `401`  | Unauthorized – missing/invalid token |
  | `500`  | Chat generation failed               |