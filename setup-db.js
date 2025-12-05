#!/usr/bin/env node

/**
 * Courier Track Database Setup Script (Cross-platform)
 * This script creates and initializes the PostgreSQL database using Node.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// Load environment variables
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'courier_track',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

console.log(`${colors.cyan}🚀 Courier Track - Database Setup${colors.reset}`);
console.log('==================================\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log(`${colors.yellow}⚠️  No .env file found. Using default values.${colors.reset}`);
  console.log(`${colors.yellow}   Consider copying .env.example to .env${colors.reset}\n`);
}

console.log('Database Configuration:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  Database: ${config.database}`);
console.log(`  User: ${config.user}\n`);

// Helper function to execute shell commands
function execCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (config.password) {
      env.PGPASSWORD = config.password;
    }

    const proc = spawn(command, args, {
      ...options,
      env,
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    if (proc.stdout) {
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Command failed with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// Helper function to ask yes/no questions
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Check if PostgreSQL is installed
async function checkPostgreSQL() {
  try {
    await execCommand('psql', ['--version']);
    console.log(`${colors.green}✓${colors.reset} PostgreSQL is installed`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ PostgreSQL is not installed or not in PATH${colors.reset}\n`);
    console.log('Please install PostgreSQL:');
    console.log('  macOS:   brew install postgresql');
    console.log('  Ubuntu:  sudo apt-get install postgresql');
    console.log('  Windows: Download from https://www.postgresql.org/download/windows/\n');
    return false;
  }
}

// Check if PostgreSQL is running
async function checkPostgreSQLRunning() {
  try {
    await execCommand('pg_isready', [
      '-h', config.host,
      '-p', config.port,
    ]);
    console.log(`${colors.green}✓${colors.reset} PostgreSQL is running`);
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠️  PostgreSQL is not running${colors.reset}`);
    console.log('Please start PostgreSQL and run this script again\n');
    return false;
  }
}

// Check if database exists
async function databaseExists() {
  try {
    const result = await execCommand('psql', [
      '-h', config.host,
      '-p', config.port,
      '-U', config.user,
      '-lqt',
    ]);

    return result.split('\n').some(line => {
      const dbName = line.split('|')[0].trim();
      return dbName === config.database;
    });
  } catch (error) {
    return false;
  }
}

// Drop database
async function dropDatabase() {
  try {
    await execCommand('dropdb', [
      '-h', config.host,
      '-p', config.port,
      '-U', config.user,
      '--if-exists',
      config.database,
    ]);
    console.log(`${colors.green}✓${colors.reset} Database dropped`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to drop database: ${error.message}${colors.reset}`);
    return false;
  }
}

// Create database
async function createDatabase() {
  try {
    await execCommand('createdb', [
      '-h', config.host,
      '-p', config.port,
      '-U', config.user,
      config.database,
    ]);
    console.log(`${colors.green}✓${colors.reset} Database created`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to create database: ${error.message}${colors.reset}`);
    return false;
  }
}

// Run schema
async function runSchema() {
  const schemaPath = path.join(__dirname, 'database', 'schema.sql');

  if (!fs.existsSync(schemaPath)) {
    console.log(`${colors.red}✗ Schema file not found: ${schemaPath}${colors.reset}`);
    return false;
  }

  try {
    await execCommand('psql', [
      '-h', config.host,
      '-p', config.port,
      '-U', config.user,
      '-d', config.database,
      '-f', schemaPath,
    ]);
    console.log(`${colors.green}✓${colors.reset} Schema initialized`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to run schema: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main setup function
async function setup() {
  try {
    // Check PostgreSQL installation
    const psqlInstalled = await checkPostgreSQL();
    if (!psqlInstalled) {
      process.exit(1);
    }

    // Check if PostgreSQL is running
    const psqlRunning = await checkPostgreSQLRunning();
    if (!psqlRunning) {
      process.exit(1);
    }

    console.log('');

    // Check if database exists
    const dbExists = await databaseExists();

    if (dbExists) {
      console.log(`${colors.yellow}⚠️  Database '${config.database}' already exists${colors.reset}`);
      const shouldDrop = await askQuestion('Do you want to drop and recreate it? (y/N): ');

      if (shouldDrop) {
        console.log('Dropping existing database...');
        const dropped = await dropDatabase();
        if (!dropped) {
          process.exit(1);
        }
      } else {
        const shouldRerunSchema = await askQuestion('Do you want to re-run the schema? (y/N): ');

        if (shouldRerunSchema) {
          console.log('Running schema on existing database...');
          const schemaRan = await runSchema();
          if (schemaRan) {
            console.log(`\n${colors.green}✓✓✓ Schema updated successfully! ✓✓✓${colors.reset}\n`);
          }
          process.exit(schemaRan ? 0 : 1);
        } else {
          console.log('Exiting without changes');
          process.exit(0);
        }
      }
    }

    // Create database
    console.log(`Creating database '${config.database}'...`);
    const created = await createDatabase();
    if (!created) {
      process.exit(1);
    }

    // Run schema
    console.log('Initializing database schema...');
    const schemaRan = await runSchema();
    if (!schemaRan) {
      process.exit(1);
    }

    // Success message
    console.log(`\n${colors.green}✓✓✓ Database setup completed successfully! ✓✓✓${colors.reset}\n`);
    console.log('Database Details:');
    console.log(`  Name: ${config.database}`);
    console.log(`  Host: ${config.host}:${config.port}`);
    console.log(`  User: ${config.user}\n`);
    console.log('Default Login Credentials:');
    console.log('  Email: admin@couriertrack.com');
    console.log('  Password: admin123\n');
    console.log(`${colors.yellow}⚠️  Remember to change the default password!${colors.reset}\n`);
    console.log('Next steps:');
    console.log('  1. Start the server: npm run dev');
    console.log('  2. Test the API: curl http://localhost:3000/api/health\n');

    process.exit(0);
  } catch (error) {
    console.log(`\n${colors.red}✗ Setup failed: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// Run setup
setup();
