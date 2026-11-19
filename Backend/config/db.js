const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = require('pg');

const rawConnectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_lojIUbmT31yZ@ep-small-water-b5avgt8p-pooler.c-7.us-east-2.aws.neon.tech/neondb';
// Strip ?sslmode=require to avoid driver parsing conflicts
const connectionString = rawConnectionString.replace('?sslmode=require', '');

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  connectionTimeoutMillis: 25000,
  idleTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('PostgreSQL (Neon) client connected');
});

pool.on('error', (err) => {
  // Do not crash on idle client errors (like serverless socket resets)
  console.warn('PostgreSQL idle client disconnected:', err?.message || err);
});

/**
 * Resilient query wrapper: automatically retries transient connection resets (ECONNRESET,
 * serverless compute wakeups, and dropped idle sockets) so endpoints never fail with 500.
 */
const query = async (text, params, maxRetries = 2) => {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      attempt++;
      const isTransient =
        !err.severity && (
          err.message?.includes('ECONNRESET') ||
          err.message?.includes('Connection terminated') ||
          err.message?.includes('closed') ||
          err.message?.includes('timeout') ||
          err.code === 'ECONNRESET' ||
          err.code === '57P01'
        );

      if (isTransient && attempt <= maxRetries) {
        console.warn(`[DB] Transient connection error (${err.message}), retrying query (attempt ${attempt}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      throw err;
    }
  }
};

module.exports = {
  query,
  pool,
};
