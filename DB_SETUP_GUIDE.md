# Database Setup Guide

Multiple ways to set up the PostgreSQL database for Courier Track.

## Quick Setup (Recommended)

### Option 1: Node.js Script (Cross-platform)

From the **backend** directory:
```bash
npm run db:setup
```

Or directly:
```bash
node setup-db.js
```

From the **root** directory:
```bash
node setup-db.js
```

### Option 2: Shell Script (macOS/Linux)

From the **backend** directory:
```bash
./setup-db.sh
```

Or using npm:
```bash
npm run db:setup:bash
```

From the **root** directory:
```bash
./setup-db.sh
```

## What the Scripts Do

The setup scripts will:

1. ✅ Check if PostgreSQL is installed
2. ✅ Check if PostgreSQL is running
3. ✅ Load configuration from `.env` file
4. ✅ Check if database already exists
5. ✅ Ask for confirmation before dropping existing database
6. ✅ Create the database
7. ✅ Run the schema.sql file
8. ✅ Create default admin user
9. ✅ Display success message with next steps

## Interactive Features

### If Database Already Exists

The script will ask:
```
⚠️  Database 'courier_track' already exists
Do you want to drop and recreate it? (y/N):
```

- **Yes (y):** Drops the existing database and creates a new one
- **No (N):** Asks if you want to re-run the schema on the existing database

### Re-run Schema Only

If you choose not to drop the database:
```
Do you want to re-run the schema? (y/N):
```

- **Yes (y):** Runs the schema.sql file on the existing database (useful for updates)
- **No (N):** Exits without making changes

## Manual Setup

If you prefer to set up manually:

### 1. Create Database
```bash
createdb courier_track
```

### 2. Run Schema
```bash
psql -U postgres -d courier_track -f database/schema.sql
```

### 3. Verify
```bash
psql -U postgres -d courier_track -c "\dt"
```

## Configuration

The scripts read configuration from `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=courier_track
DB_USER=postgres
DB_PASSWORD=your_password
```

**Note:** If `.env` doesn't exist, it uses default values.

## Default Credentials

After setup, you can login with:
- **Email:** `admin@couriertrack.com`
- **Password:** `admin123`

⚠️ **Important:** Change this password in production!

## Troubleshooting

### PostgreSQL Not Installed

**Error:**
```
✗ PostgreSQL is not installed or not in PATH
```

**Solution:**
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### PostgreSQL Not Running

**Error:**
```
⚠️  PostgreSQL is not running
```

**Solution:**
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check status
pg_isready
```

### Permission Denied

**Error:**
```
psql: FATAL: role "postgres" does not exist
```

**Solution:**

Option 1: Create postgres user
```bash
createuser -s postgres
```

Option 2: Use your system user
```bash
# Update .env
DB_USER=your_username
```

### Authentication Failed

**Error:**
```
psql: FATAL: password authentication failed
```

**Solution:**

1. Set password in `.env`:
   ```env
   DB_PASSWORD=your_password
   ```

2. Or modify PostgreSQL auth:
   ```bash
   # Edit pg_hba.conf
   # Change 'md5' to 'trust' for local connections (development only!)
   ```

### Schema File Not Found

**Error:**
```
✗ Schema file not found: database/schema.sql
```

**Solution:**

Make sure you're running the script from the correct directory:
```bash
cd backend
npm run db:setup
```

### Database Already Exists (Non-interactive)

If running in CI/CD and need to force recreate:

```bash
# Drop manually first
dropdb courier_track

# Then run setup
npm run db:setup
```

## Advanced Usage

### Custom Database Name

Update `.env`:
```env
DB_NAME=my_custom_db_name
```

Then run setup script.

### Remote PostgreSQL Server

Update `.env`:
```env
DB_HOST=192.168.1.100
DB_PORT=5432
DB_USER=remote_user
DB_PASSWORD=secure_password
```

### Reset Database

To completely reset:
```bash
# Drop database
dropdb courier_track

# Run setup again
npm run db:setup
```

Or use the script interactively and choose "yes" to drop.

## Verify Setup

After running the setup, verify everything works:

### 1. Check Tables
```bash
psql -U postgres -d courier_track -c "\dt"
```

Expected output:
```
                List of relations
 Schema |           Name           | Type  |  Owner
--------+--------------------------+-------+----------
 public | shipment_status_history  | table | postgres
 public | shipments                | table | postgres
 public | users                    | table | postgres
```

### 2. Check Admin User
```bash
psql -U postgres -d courier_track -c "SELECT email, role FROM users WHERE role='admin';"
```

Expected output:
```
         email          | role
-----------------------+-------
 admin@couriertrack.com | admin
```

### 3. Test Backend Connection

Start the server:
```bash
npm run dev
```

Expected output:
```
✓ Database connected successfully
🚀 Server running on port 3000
```

### 4. Test API
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-01T12:00:00.000Z"}
```

## Next Steps

After successful database setup:

1. ✅ Database is created
2. ✅ Schema is initialized
3. ✅ Admin user is created
4. 📝 Update default password
5. 🚀 Start the server: `npm run dev`
6. 🧪 Test the API
7. 📱 Connect the Flutter app

## Backup & Restore

### Backup Database
```bash
pg_dump -U postgres courier_track > backup.sql
```

### Restore Database
```bash
psql -U postgres -d courier_track < backup.sql
```

## Production Deployment

For production:

1. Use strong passwords
2. Configure firewall rules
3. Enable SSL/TLS
4. Set up regular backups
5. Configure proper user permissions
6. Use connection pooling
7. Monitor database performance

## Support

If you encounter issues:

1. Check PostgreSQL logs
2. Verify `.env` configuration
3. Ensure PostgreSQL service is running
4. Check PostgreSQL version (12+)
5. Review error messages carefully

For detailed API documentation, see `API_DOCUMENTATION.md`.
