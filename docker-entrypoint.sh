#!/bin/sh
set -e

echo "🚀 Starting MK-Ops License Manager..."

echo "⏳ Waiting for database to be ready..."
until node -e "
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

prisma.\$connect()
  .then(() => { 
    console.log('✅ Database connected'); 
    return prisma.\$disconnect();
  })
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch(() => { 
    console.log('❌ Database not ready yet'); 
    pool.end().finally(() => process.exit(1));
  });
" 2>/dev/null; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

echo "📊 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed!"

echo "🎯 Starting Next.js server..."
exec node server.js
