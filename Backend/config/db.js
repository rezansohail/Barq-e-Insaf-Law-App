const path = require('path');
const dotenv = require('dotenv');

// Check Backend/.env first, then root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = require('pg');

const DEFAULT_DB_URL = 'postgresql://neondb_owner:npg_lojIUbmT31yZ@ep-small-water-b5avgt8p-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
const connectionString = process.env.DATABASE_URL || DEFAULT_DB_URL;

if (!process.env.DATABASE_URL) {
  console.log('Using default Neon cloud PostgreSQL database');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log('PostgreSQL (Neon) client connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
