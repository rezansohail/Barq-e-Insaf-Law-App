const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = require('pg');

const rawConnectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_lojIUbmT31yZ@ep-small-water-b5avgt8p-pooler.c-7.us-east-2.aws.neon.tech/neondb';
// Strip ?sslmode=require to avoid pg-connection-string driver warnings/conflicts
const connectionString = rawConnectionString.replace('?sslmode=require', '');

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
});

pool.on('connect', () => {
  console.log('PostgreSQL (Neon) client connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err?.message || err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
