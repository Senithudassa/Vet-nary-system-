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
    "access_token": "jwt_token_here",
    "refresh_token": "jwt_token_here"
  }
  ```

### Register Clinic
Registers a new clinic account (Vet role).
- **Route**: `POST /auth/register/clinic`
- **Request Body**:
  ```json
  {
    "email": "clinic@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Vet",
    "clinicName": "Happy Paws Clinic",
    "clinicAddress": "123 Pet St, Animal City",
    "operatingHours": "09:00 - 18:00",
    "phone": "0123456789"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "access_token": "jwt_token_here",
    "refresh_token": "jwt_token_here"
  }
  ```

### Login
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

### Refresh Token
Refresh an expired access token.
- **Route**: `POST /auth/refresh`
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "jwt_token_here",
    "refresh_token": "jwt_token_here"
  }
  ```

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

---

## 2. User Management (Main Admin Only)

### List All Users
- **Route**: `GET /users`
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
- **Request Body**: `{ "role": "VET" }`
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
  ```json
  [
    {
      "id": "uuid",
      "name": "Happy Paws Clinic",
      "address": "123 Pet St, Animal City",
      "phone": "0123456789",
      "operatingHours": "09:00 - 18:00"
    }
  ]
  ```

### Get Clinic Details (Public)
- **Route**: `GET /clinics/:id`
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "name": "Happy Paws Clinic",
    "address": "123 Pet St, Animal City",
    "phone": "0123456789",
    "operatingHours": "09:00 - 18:00",
    "status": "APPROVED"
  }
  ```

### Update Status (Main Admin)
- **Route**: `PATCH /clinics/:id/status`
- **Request Body**: `{ "status": "APPROVED" }`
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "status": "APPROVED"
  }
  ```

### Update Clinic (Vet/Admin)
- **Route**: `PATCH /clinics/:id`
- **Request Body**: `{ "name": "New Name", ... }`
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "name": "New Name",
    "address": "...",
    "updatedAt": "..."
  }
  ```

---

## 4. Pet Management (Customer/Vet)

### List My Pets
- **Route**: `GET /pets`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "uuid",
      "name": "Buddy",
      "species": "Dog",
      "breed": "Golden Retriever",
      "weight": 15.5
    }
  ]
  ```

### Add Pet
- **Route**: `POST /pets`
- **Request Body**: `{ "name": "Buddy", "species": "Dog", ... }`
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "name": "Buddy",
    "ownerId": "uuid",
    "createdAt": "..."
  }
  ```

### Get Pet Details
- **Route**: `GET /pets/:id`
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "name": "Buddy",
    "species": "Dog",
    "owner": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  ```

---

## 5. Appointments & Queue Management

### Book Appointment
- **Route**: `POST /appointments`
- **Request Body**: `{ "clinicId": "uuid", "petId": "uuid", "date": "...", "reason": "..." }`
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "status": "PENDING",
    "date": "2026-04-26T10:00:00Z"
  }
  ```

### Get Queue (Vet)
- **Route**: `GET /clinics/:clinicId/queue`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "uuid",
      "pet": { "name": "Buddy" },
      "owner": { "firstName": "John" },
      "status": "CONFIRMED"
    }
  ]
  ```

---

## 6. Invoicing & Billing

### Generate Invoice (Vet)
- **Route**: `POST /invoices`
- **Request Body**: `{ "clinicId": "uuid", "ownerId": "uuid", "amount": 75.0 }`
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "amount": 75.0,
    "status": "PENDING",
    "issuedAt": "..."
  }
  ```

### Mark Paid
- **Route**: `PATCH /invoices/:id/pay`
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "status": "PAID",
    "paidAt": "..."
  }
  ```

---

## 7. VetBook & Medical Records

### Medical Timeline
- **Route**: `GET /vetbook/:petId`
- **Response**: `200 OK`
  ```json
  {
    "pet": { "name": "Buddy" },
    "records": [
      {
        "type": "MEDICAL",
        "diagnosis": "Checkup",
        "date": "..."
      },
      {
        "type": "VACCINATION",
        "vaccineName": "Rabies",
        "date": "..."
      }
    ]
  }
  ```

---

## 8. Support & Admin

### Submit Ticket
- **Route**: `POST /support-tickets`
- **Request Body**: `{ "subject": "...", "description": "..." }`
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "status": "OPEN",
    "createdAt": "..."
  }
  ```

### Platform Stats (Main Admin)
- **Route**: `GET /admin/stats`
- **Response**: `200 OK`
  ```json
  {
    "usersCount": 150,
    "clinicsCount": 20,
    "appointmentsCount": 500,
    "totalRevenue": 12500.50
  }
  ```
