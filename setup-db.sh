#!/bin/bash

# Courier Track Database Setup Script
# This script creates and initializes the PostgreSQL database

set -e  # Exit on error

echo "🚀 Courier Track - Database Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "${YELLOW}⚠️  No .env file found. Using default values.${NC}"
fi

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-courier_track}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-}

echo ""
echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "${RED}✗ PostgreSQL is not installed or not in PATH${NC}"
    echo ""
    echo "Please install PostgreSQL:"
    echo "  macOS:   brew install postgresql"
    echo "  Ubuntu:  sudo apt-get install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

echo "${GREEN}✓${NC} PostgreSQL is installed"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
    echo "${YELLOW}⚠️  PostgreSQL is not running${NC}"
    echo ""
    echo "Starting PostgreSQL..."

    # Try to start PostgreSQL based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew services start postgresql@15 2>/dev/null || brew services start postgresql 2>/dev/null || true
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null || true
    fi

    # Wait a bit for PostgreSQL to start
    sleep 2

    # Check again
    if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        echo "${RED}✗ Failed to start PostgreSQL${NC}"
        echo "Please start PostgreSQL manually and run this script again"
        exit 1
    fi
fi

echo "${GREEN}✓${NC} PostgreSQL is running"

# Set PGPASSWORD for non-interactive authentication
if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD=$DB_PASSWORD
fi

# Check if database exists
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo ""
    echo "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER --if-exists $DB_NAME
        echo "${GREEN}✓${NC} Database dropped"
    else
        echo "Skipping database creation..."
        echo ""
        read -p "Do you want to re-run the schema? (y/N): " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Running schema on existing database..."
            psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/schema.sql
            echo ""
            echo "${GREEN}✓${NC} Schema updated successfully"
            exit 0
        else
            echo "Exiting without changes"
            exit 0
        fi
    fi
fi

# Create database
echo "Creating database '$DB_NAME'..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
echo "${GREEN}✓${NC} Database created"

# Run schema
echo "Initializing database schema..."
if [ ! -f database/schema.sql ]; then
    echo "${RED}✗ Schema file not found: database/schema.sql${NC}"
    exit 1
fi

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/schema.sql

echo ""
echo "${GREEN}✓✓✓ Database setup completed successfully! ✓✓✓${NC}"
echo ""
echo "Database Details:"
echo "  Name: $DB_NAME"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  User: $DB_USER"
echo ""
echo "Default Login Credentials:"
echo "  Email: admin@couriertrack.com"
echo "  Password: admin123"
echo ""
echo "${YELLOW}⚠️  Remember to change the default password!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the server: npm run dev"
echo "  2. Test the API: curl http://localhost:3000/api/health"
echo ""
