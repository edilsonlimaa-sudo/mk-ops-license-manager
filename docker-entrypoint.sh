#!/bin/sh
set -e

echo "🚀 Starting MK-Ops License Manager..."
echo ""
echo "📋 Environment Variables:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"
if [ -n "$DATABASE_URL" ]; then
  MASKED_DB_URL=$(echo "$DATABASE_URL" | sed -E 's/:([^:@]+)@/:****@/')
  echo "   DATABASE_URL: $MASKED_DB_URL"
else
  echo "   DATABASE_URL: ❌ NOT SET"
fi
echo ""

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
