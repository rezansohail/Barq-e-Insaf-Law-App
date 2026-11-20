const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = require('pg');

const rawConnectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_lojIUbmT31yZ@ep-small-water-b5avgt8p-pooler.c-7.us-east-2.aws.neon.tech/neondb';
// Strip ?sslmode=require to avoid driver parsing conflicts with explicit ssl config
const connectionString = rawConnectionString.replace('?sslmode=require', '');

// Fallback to direct compute host if pooler host fails DNS resolution
const directConnectionString = connectionString.includes('-pooler')
  ? connectionString.replace('-pooler', '')
  : connectionString;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  keepAlive: true,
  connectionTimeoutMillis: 10000,
});

let fallbackPool = null;
function getFallbackPool() {
  if (!fallbackPool) {
    fallbackPool = new Pool({
      connectionString: directConnectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      keepAlive: true,
      connectionTimeoutMillis: 10000,
    });
    fallbackPool.on('error', (err) => {
      console.warn('PostgreSQL fallback pool error:', err?.message || err);
    });
  }
  return fallbackPool;
}

pool.on('connect', (client) => {
  console.log('PostgreSQL (Neon) client connected');
  client.query(`
    DO $$ 
    BEGIN 
      BEGIN
        ALTER TABLE appointments ALTER COLUMN appointment_time TYPE VARCHAR(100) USING appointment_time::text;
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
      BEGIN
        ALTER TABLE appointments ALTER COLUMN appointment_date TYPE VARCHAR(100) USING appointment_date::text;
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END $$;
  `).catch(() => {});
});

pool.on('error', (err) => {
  console.warn('PostgreSQL idle client disconnected:', err?.message || err);
});

/**
 * Resilient query wrapper: automatically retries transient connection resets and DNS hiccups
 * (ENOTFOUND, EAI_AGAIN, ECONNRESET, dropped idle sockets) so endpoints never fail with 500.
 */
const query = async (text, params, maxRetries = 3) => {
  let attempt = 0;
  let useFallback = false;

  while (attempt <= maxRetries) {
    try {
      const activePool = useFallback ? getFallbackPool() : pool;
      return await activePool.query(text, params);
    } catch (err) {
      attempt++;
      const isDnsOrNetwork =
        err.code === 'ENOTFOUND' ||
        err.code === 'EAI_AGAIN' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNREFUSED' ||
        err.message?.includes('ENOTFOUND') ||
        err.message?.includes('getaddrinfo') ||
        err.message?.includes('EAI_AGAIN') ||
        err.message?.includes('ETIMEDOUT') ||
        err.message?.includes('ECONNREFUSED');

      const isTransient =
        isDnsOrNetwork ||
        !err.severity && (
          err.message?.includes('ECONNRESET') ||
          err.message?.includes('Connection terminated') ||
          err.message?.includes('closed') ||
          err.code === 'ECONNRESET' ||
          err.code === '57P01'
        );

      if (isDnsOrNetwork && !useFallback) {
        useFallback = true;
        console.warn(`[DB] Primary Neon DNS/Network hiccup (${err.message}), switching to direct compute endpoint...`);
      }

      if (isTransient && attempt <= maxRetries) {
        console.warn(`[DB] Transient connection error (${err.message}), retrying query (${attempt}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, 1000));
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
