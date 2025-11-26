# Backend Setup Guide

Step-by-step guide to set up the Courier Track backend.

## Prerequisites

Ensure you have the following installed:

- **Node.js** v14+ ([Download](https://nodejs.org/))
- **PostgreSQL** v12+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** (comes with Node.js)

## Step 1: Install Node.js Dependencies

Navigate to the backend directory and install packages:

```bash
cd backend
npm install
```

Expected output:
```
added 150 packages, and audited 151 packages in 5s
```

## Step 2: Install and Configure PostgreSQL

### Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Verify Installation

```bash
psql --version
```

Should output something like: `psql (PostgreSQL) 15.x`

## Step 3: Create Database

### Option A: Using createdb command

```bash
createdb courier_track
```

### Option B: Using psql

```bash
psql -U postgres
```

Then in psql console:
```sql
CREATE DATABASE courier_track;
\q
```

### Verify Database Creation

```bash
psql -U postgres -l
```

You should see `courier_track` in the list.

## Step 4: Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` file with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=courier_track
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=generate_a_secure_random_string_here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
```

### Generate JWT Secret

You can generate a secure random string for JWT_SECRET:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Using OpenSSL:**
```bash
openssl rand -hex 64
```

## Step 5: Initialize Database Schema

Run the SQL schema file to create tables:

```bash
psql -U postgres -d courier_track -f database/schema.sql
```

Expected output:
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
INSERT 0 1
```

### Verify Tables Creation

```bash
psql -U postgres -d courier_track
```

In psql:
```sql
\dt
```

You should see:
```
                List of relations
 Schema |           Name           | Type  |  Owner
--------+--------------------------+-------+----------
 public | shipment_status_history  | table | postgres
 public | shipments                | table | postgres
 public | users                    | table | postgres
```

## Step 6: Start the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Expected output:
```
✓ Database connected successfully
✓ Database connection verified

🚀 Server running on port 3000
📍 Environment: development
🔗 API URL: http://localhost:3000/api
💚 Health check: http://localhost:3000/api/health
```

## Step 7: Test the API

### Test Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-01T12:00:00.000Z"}
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@couriertrack.com","password":"admin123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@couriertrack.com",
    "fullName": "System Admin",
    "role": "admin"
  }
}
```

### Test Protected Endpoint

First, save the token from login response, then:

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

1. Change `PORT` in `.env` to a different port (e.g., 3001)
2. Or kill the process using port 3000:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### Database Connection Failed

Check:
1. PostgreSQL is running: `pg_isready`
2. Database exists: `psql -U postgres -l`
3. Credentials in `.env` are correct
4. PostgreSQL is accepting connections on port 5432

### Cannot Find Module Error

Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Permission Denied (PostgreSQL)

On Linux, you may need to set a password for postgres user:
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'your_password';
\q
```

Update `DB_PASSWORD` in `.env` accordingly.

### UUID Extension Error

If you get "extension uuid-ossp does not exist":
```bash
psql -U postgres -d courier_track
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

## Common PostgreSQL Commands

```bash
# Start PostgreSQL
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux

# Stop PostgreSQL
brew services stop postgresql@15   # macOS
sudo systemctl stop postgresql     # Linux

# Check status
brew services list                 # macOS
sudo systemctl status postgresql   # Linux

# Connect to database
psql -U postgres -d courier_track

# List databases
psql -U postgres -l

# Drop database (careful!)
dropdb courier_track

# Backup database
pg_dump -U postgres courier_track > backup.sql

# Restore database
psql -U postgres courier_track < backup.sql
```

## Next Steps

1. ✅ Backend is running
2. 📱 Configure Flutter frontend to use this API
3. 🔒 Change default admin password
4. 📊 Start creating shipments
5. 🚀 Deploy to production (see deployment guide)

## Development Tools

### Recommended Tools for Testing API

- **Postman** ([Download](https://www.postman.com/downloads/))
- **Insomnia** ([Download](https://insomnia.rest/download))
- **Thunder Client** (VS Code extension)
- **curl** (command-line)

### Database Management Tools

- **pgAdmin** ([Download](https://www.pgadmin.org/))
- **DBeaver** ([Download](https://dbeaver.io/))
- **TablePlus** ([Download](https://tableplus.com/))
- **psql** (command-line, included with PostgreSQL)

## Production Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Change default admin password
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific `.env` files
- [ ] Enable HTTPS
- [ ] Configure CORS for your frontend domain only
- [ ] Set up database backups
- [ ] Implement rate limiting
- [ ] Set up logging and monitoring
- [ ] Use connection pooling
- [ ] Review security headers
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure proper PostgreSQL user permissions
- [ ] Use process manager (PM2, systemd)
- [ ] Set up reverse proxy (nginx, Apache)

## Support

For issues or questions:
1. Check the logs in console
2. Review PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-15-main.log`
3. Check API documentation: `API_DOCUMENTATION.md`
4. Review code comments

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
