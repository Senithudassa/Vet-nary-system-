# Users Management API

Base URL: `/`  
Authentication: **Bearer JWT required** for all endpoints in this document.

Roles:
- `MAIN_ADMIN`

---

## Common Enums

### Role
- `MAIN_ADMIN`
- `MINOR_ADMIN`
- `VET`
- `CUSTOMER`

---

## Common Response Structures

### User (base)
Fields returned by list and update endpoints.

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+94-77-1234567",
  "accountNumber": "ACC-001",
  "licenseNumber": null,
  "isActive": true,
  "createdAt": "2026-04-20T08:12:34.000Z",
  "updatedAt": "2026-04-20T08:12:34.000Z"
}
```

---

## 1) List all users (Main Admin only)

**GET** `/users`  
**Auth:** Bearer JWT  
**Roles:** `MAIN_ADMIN`

### Query Parameters — `UserFilterDto`

- `search` (string, optional) — Search string to filter users by details (e.g. name, email)
- `role` (enum `Role`, optional) — Filter users by a specific role
- `page` (number, optional, default: 1) — Pagination page number
- `limit` (number, optional, default: 10) — Number of items per page

### Responses

**200 OK — Users retrieved successfully**

```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+94-77-1234567",
    "accountNumber": "ACC-001",
    "licenseNumber": null,
    "isActive": true,
    "createdAt": "2026-04-20T08:12:34.000Z",
    "updatedAt": "2026-04-20T08:12:34.000Z"
  }
]
```
*(Note: Depending on the implementation, the response may be wrapped in a paginated object structure like `{ data: [...], total, page, limit }`)*

---

## 2) Update user role (Main Admin only)

**PATCH** `/users/:id/role`  
**Auth:** Bearer JWT  
**Roles:** `MAIN_ADMIN`

### Path Parameters
- `id` (string) — User identifier

### Request Body — `UpdateUserRoleDto`

```json
{
  "role": "VET"
}
```

**Field details**
- `role` (enum `Role`, required)

### Responses

**200 OK — Role updated successfully**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "VET",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+94-77-1234567",
  "accountNumber": "ACC-001",
  "licenseNumber": "VET-LIC-890",
  "isActive": true,
  "createdAt": "2026-04-20T08:12:34.000Z",
  "updatedAt": "2026-04-25T10:15:00.000Z"
}
```
