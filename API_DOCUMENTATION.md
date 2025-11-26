# Courier Track API Documentation

## Overview

RESTful API for managing courier shipments, users, and tracking.

**Base URL:** `http://localhost:3000/api`

## Authentication

### Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "admin@couriertrack.com",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@couriertrack.com",
    "fullName": "System Admin",
    "phone": "+1234567890",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Profile

**Endpoint:** `GET /auth/profile`

**Description:** Get current authenticated user's profile

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):** User object

---

## Users Management

All user endpoints require **Admin** role.

### List All Users

**Endpoint:** `GET /users`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "role": "operator",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get User by ID

**Endpoint:** `GET /users/:id`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):** User object

### Create User

**Endpoint:** `POST /users`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "fullName": "Jane Smith",
  "phone": "+1234567890",
  "role": "operator"
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Minimum 6 characters, required
- `fullName`: Non-empty string, required
- `phone`: Optional
- `role`: One of `admin`, `operator`, `viewer`

**Success Response (201):** Created user object

### Update User

**Endpoint:** `PUT /users/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "updated@example.com",
  "fullName": "Updated Name",
  "phone": "+9876543210",
  "role": "viewer",
  "isActive": false
}
```

**Success Response (200):** Updated user object

### Delete User

**Endpoint:** `DELETE /users/:id`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Note:** Cannot delete your own account

### Update User Password

**Endpoint:** `PATCH /users/:id/password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

---

## Shipments Management

### List Shipments

**Endpoint:** `GET /shipments`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate`: ISO date string (e.g., `2024-01-01`)
- `endDate`: ISO date string
- `destination`: Filter by receiver country
- `service`: Filter by service type
- `status`: Filter by shipment status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Example:** `GET /shipments?status=pending&page=1&limit=20`

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "consigneeNumber": "CN1732654321000",
      "service": "express",
      "status": "pending",
      "companyName": "ABC Corp",
      "shipperName": "John Shipper",
      "shipperPhone": "+1234567890",
      "shipperAddress": "123 Shipper St",
      "shipperCountry": "US",
      "shipperCity": "New York",
      "shipperPostal": "10001",
      "consigneeCompanyName": "XYZ Ltd",
      "receiverName": "Jane Receiver",
      "receiverEmail": "jane@xyz.com",
      "receiverPhone": "+9876543210",
      "receiverAddress": "456 Receiver Ave",
      "receiverCountry": "GB",
      "receiverCity": "London",
      "receiverZip": "SW1A 1AA",
      "accountNo": "ACC1001",
      "shipmentType": "nonDocsBox",
      "pieces": 5,
      "description": "Electronics",
      "fragile": true,
      "currency": "usd",
      "shipperReference": "REF001",
      "comments": "Handle with care",
      "totalVolumetricWeight": 15.5,
      "dimensions": "30x20x10",
      "weight": 12.3,
      "invoiceType": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Get Shipment by ID

**Endpoint:** `GET /shipments/:id`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):** Shipment object

### Create Shipment

**Endpoint:** `POST /shipments`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Admin, Operator

**Request Body:**
```json
{
  "service": "express",
  "companyName": "ABC Corp",
  "shipperName": "John Shipper",
  "shipperPhone": "+1234567890",
  "shipperAddress": "123 Shipper St",
  "shipperCountry": "US",
  "shipperCity": "New York",
  "shipperPostal": "10001",
  "consigneeCompanyName": "XYZ Ltd",
  "receiverName": "Jane Receiver",
  "receiverEmail": "jane@xyz.com",
  "receiverPhone": "+9876543210",
  "receiverAddress": "456 Receiver Ave",
  "receiverCountry": "GB",
  "receiverCity": "London",
  "receiverZip": "SW1A 1AA",
  "accountNo": "ACC1001",
  "shipmentType": "nonDocsBox",
  "pieces": 5,
  "description": "Electronics",
  "fragile": true,
  "currency": "usd",
  "shipperReference": "REF001",
  "comments": "Handle with care",
  "totalVolumetricWeight": 15.5,
  "dimensions": "30x20x10",
  "weight": 12.3
}
```

**Field Constraints:**
- `service`: `express`, `standard`, `economy`, `overnight`, `international`
- `shipmentType`: `docs`, `nonDocsFlyer`, `nonDocsBox`
- `currency`: `usd`, `eur`, `gbp`, `aed`, `pkr`
- `pieces`: Integer >= 1
- `receiverEmail`: Valid email format
- Box dimensions fields (`totalVolumetricWeight`, `dimensions`, `weight`) are optional, typically used with `nonDocsBox`

**Success Response (201):** Created shipment with auto-generated `consigneeNumber`

### Update Shipment

**Endpoint:** `PUT /shipments/:id`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Admin, Operator

**Request Body:** Same as create, all fields optional

**Success Response (200):** Updated shipment object

### Delete Shipment

**Endpoint:** `DELETE /shipments/:id`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Admin only

**Success Response (200):**
```json
{
  "message": "Shipment deleted successfully"
}
```

### Duplicate Shipment

**Endpoint:** `POST /shipments/:id/duplicate`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Admin, Operator

**Description:** Duplicates an existing shipment with a new consignee number and optional invoice type

**Request Body:**
```json
{
  "invoiceType": "commercial"
}
```

**Invoice Types:** `commercial`, `gift`, `performance`, `sample`

**Success Response (201):** New shipment object

### Track Shipment

**Endpoint:** `GET /shipments/track/:consigneeNumber`

**Headers:** `Authorization: Bearer <token>`

**Description:** Track shipment by consignee number and get status history

**Success Response (200):**
```json
{
  "shipment": { /* shipment object */ },
  "statusHistory": [
    {
      "id": "uuid",
      "shipmentId": "uuid",
      "status": "pending",
      "location": null,
      "notes": "Shipment created",
      "createdBy": "uuid",
      "createdByName": "Admin User",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "shipmentId": "uuid",
      "status": "inTransit",
      "location": "New York Hub",
      "notes": "Departed from origin",
      "createdBy": "uuid",
      "createdByName": "Operator User",
      "createdAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

### Get Status History

**Endpoint:** `GET /shipments/:id/status-history`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):** Array of status history objects

### Add Status Update

**Endpoint:** `POST /shipments/:id/status`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Admin, Operator

**Description:** Update shipment status and add to history

**Request Body:**
```json
{
  "status": "inTransit",
  "location": "Dubai Hub",
  "notes": "In transit to destination"
}
```

**Status Values:** `pending`, `inTransit`, `delivered`, `cancelled`, `returned`, `onHold`

**Success Response (201):** Status history object

---

## Health Check

**Endpoint:** `GET /health`

**Description:** Check API health status

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Error Responses

All endpoints may return error responses:

**400 Bad Request:**
```json
{
  "error": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error message"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding it for production.

## Pagination

All list endpoints support pagination:
- Default: 10 items per page
- Maximum: 100 items per page
- Response includes pagination metadata

## Data Formats

- **Dates:** ISO 8601 format (`2024-01-01T00:00:00.000Z`)
- **UUIDs:** Standard UUID v4 format
- **Phone Numbers:** String, any format
- **Currencies:** 3-letter lowercase codes
- **Countries:** String (consider using ISO country codes)

## Best Practices

1. Always include `Authorization` header for protected routes
2. Use pagination for large datasets
3. Validate data on client-side before sending
4. Handle errors gracefully
5. Store JWT token securely (not in localStorage in production)
6. Implement token refresh mechanism for long sessions
7. Use HTTPS in production
