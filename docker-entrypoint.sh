#!/bin/sh
set -e

echo "🚀 Starting MK-Ops License Manager..."

echo "⏳ Waiting for database to be ready..."
until node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => { console.log('✅ Database connected'); process.exit(0); })
  .catch(() => { console.log('❌ Database not ready yet'); process.exit(1); });
" 2>/dev/null; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

echo "📊 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed!"

echo "🎯 Starting Next.js server..."
exec node server.js
