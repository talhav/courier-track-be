# Courier Track Backend API

A comprehensive Node.js + Express + PostgreSQL backend for the Courier Track System.

## Features

- 🔐 JWT-based authentication
- 👥 User management with role-based access control
- 📦 Complete shipment CRUD operations
- 🔍 Advanced filtering, pagination, and search
- 📊 Shipment tracking with status history
- 🚀 RESTful API design
- 🛡️ Security best practices (Helmet, CORS)
- ✅ Input validation
- 📝 Comprehensive logging

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, bcrypt, CORS
- **Validation:** express-validator

## Project Structure

```
backend/
├── database/
│   └── schema.sql          # Database schema
├── src/
│   ├── config/
│   │   ├── database.js     # Database connection
│   │   └── constants.js    # Application constants
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── shipmentController.js
│   ├── middleware/
│   │   ├── auth.js         # Authentication & authorization
│   │   ├── errorHandler.js # Global error handling
│   │   └── validator.js    # Request validation
│   ├── models/
│   │   ├── User.js
│   │   └── Shipment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── shipmentRoutes.js
│   │   └── index.js
│   ├── utils/
│   │   └── helpers.js      # Utility functions
│   └── server.js           # Application entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the values:
   ```
   PORT=3000
   NODE_ENV=development

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=courier_track
   DB_USER=postgres
   DB_PASSWORD=your_password

   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=7d

   ALLOWED_ORIGINS=http://localhost:8080
   ```

4. **Create PostgreSQL database**
   ```bash
   createdb courier_track
   ```

5. **Initialize database schema**
   ```bash
   psql -U postgres -d courier_track -f database/schema.sql
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All endpoints except `/auth/login` require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication

**POST /auth/login**
- Login and get JWT token
- Body: `{ email, password }`
- Response: `{ token, user }`

**GET /auth/profile**
- Get current user profile
- Requires: Authentication
- Response: User object

#### Users (Admin only)

**GET /users**
- Get all users
- Requires: Admin role
- Response: Array of users

**GET /users/:id**
- Get user by ID
- Requires: Admin role
- Response: User object

**POST /users**
- Create new user
- Requires: Admin role
- Body: `{ email, password, fullName, phone, role }`
- Response: Created user

**PUT /users/:id**
- Update user
- Requires: Admin role
- Body: `{ email, fullName, phone, role, isActive }`
- Response: Updated user

**DELETE /users/:id**
- Delete user
- Requires: Admin role
- Response: Success message

**PATCH /users/:id/password**
- Update user password
- Requires: Admin role
- Body: `{ password }`
- Response: Success message

#### Shipments

**GET /shipments**
- Get all shipments with filtering and pagination
- Query params: `startDate, endDate, destination, service, status, page, limit`
- Response: `{ data: [], pagination: {} }`

**GET /shipments/:id**
- Get shipment by ID
- Response: Shipment object

**POST /shipments**
- Create new shipment
- Requires: Admin or Operator role
- Body: Shipment data (see schema)
- Response: Created shipment

**PUT /shipments/:id**
- Update shipment
- Requires: Admin or Operator role
- Body: Shipment data
- Response: Updated shipment

**DELETE /shipments/:id**
- Delete shipment
- Requires: Admin role
- Response: Success message

**POST /shipments/:id/duplicate**
- Duplicate existing shipment
- Requires: Admin or Operator role
- Body: `{ invoiceType }`
- Response: New shipment

**GET /shipments/track/:consigneeNumber**
- Track shipment by consignee number
- Response: `{ shipment, statusHistory }`

**GET /shipments/:id/status-history**
- Get status history for shipment
- Response: Array of status updates

**POST /shipments/:id/status**
- Add status update
- Requires: Admin or Operator role
- Body: `{ status, location, notes }`
- Response: Status update

### User Roles

- **admin**: Full access to all features
- **operator**: Can manage shipments, cannot manage users
- **viewer**: Read-only access

### Data Models

#### User
```json
{
  "id": "uuid",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "role": "admin|operator|viewer",
  "isActive": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Shipment
```json
{
  "id": "uuid",
  "consigneeNumber": "string",
  "service": "express|standard|economy|overnight|international",
  "status": "pending|inTransit|delivered|cancelled|returned|onHold",
  "companyName": "string",
  "shipperName": "string",
  "shipperPhone": "string",
  "shipperAddress": "string",
  "shipperCountry": "string",
  "shipperCity": "string",
  "shipperPostal": "string",
  "consigneeCompanyName": "string",
  "receiverName": "string",
  "receiverEmail": "string",
  "receiverPhone": "string",
  "receiverAddress": "string",
  "receiverCountry": "string",
  "receiverCity": "string",
  "receiverZip": "string",
  "accountNo": "string",
  "shipmentType": "docs|nonDocsFlyer|nonDocsBox",
  "pieces": "integer",
  "description": "string",
  "fragile": "boolean",
  "currency": "usd|eur|gbp|aed|pkr",
  "shipperReference": "string",
  "comments": "string",
  "totalVolumetricWeight": "decimal",
  "dimensions": "string",
  "weight": "decimal",
  "invoiceType": "commercial|gift|performance|sample",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Default Credentials

After running the database schema, you can login with:
- **Email:** admin@couriertrack.com
- **Password:** admin123

⚠️ **Important:** Change the default password immediately in production!

## Development

```bash
# Install nodemon globally (optional)
npm install -g nodemon

# Run in development mode
npm run dev
```

## Testing

Use tools like Postman, Insomnia, or curl to test the API endpoints.

Example login request:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@couriertrack.com","password":"admin123"}'
```

## Security Considerations

- Always use HTTPS in production
- Set strong `JWT_SECRET` in environment variables
- Regularly update dependencies
- Implement rate limiting for production
- Use database connection pooling
- Sanitize all user inputs
- Enable CORS only for trusted origins

## Error Handling

The API returns consistent error responses:
```json
{
  "error": "Error message here",
  "stack": "Stack trace (only in development)"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## License

MIT
