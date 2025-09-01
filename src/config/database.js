const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenvResult = require('dotenv').config();

if (dotenvResult.error) {
  console.error('Error loading .env file:', dotenvResult.error);
} else {
  console.log('Successfully loaded .env file. Variables:', dotenvResult.parsed);
}

const isProduction = process.env.NODE_ENV === 'production';
const useProxy = process.env.USE_CLOUD_SQL_PROXY === 'true';

const poolConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20,
  allowExitOnIdle: true
};

if (isProduction) {
  poolConfig.host = '/cloudsql/iqol-crm:us-central1:restack-maps';
} else if (useProxy) {
  // Local development with Cloud SQL Proxy
  poolConfig.host = 'localhost';
  poolConfig.port = 5432;
} else {
  // Local development with TCP connection (requires public IP)
  poolConfig.host = process.env.DB_HOST || 'your-cloud-sql-public-ip';
  poolConfig.port = process.env.DB_PORT || 5432;
  poolConfig.ssl = {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, '../../server-ca.pem')).toString(),
  };
}

console.log(`Attempting to connect with user: '${poolConfig.user}'`);
const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;
