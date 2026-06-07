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
echo ""
echo "🔍 Network diagnostics:"
echo "   Checking if 'db' host resolves..."
if nslookup db >/dev/null 2>&1; then
  echo "   ✅ DNS resolution for 'db' works"
  DB_IP=$(nslookup db | grep 'Address:' | tail -1 | awk '{print $2}')
  echo "   📍 DB IP: $DB_IP"
else
  echo "   ❌ Cannot resolve 'db' hostname"
  echo "   ⚠️  Both containers must be in the same network!"
fi

echo ""
echo "   Checking if port 5432 is reachable..."
if nc -zv db 5432 2>&1 | grep -q succeeded; then
  echo "   ✅ Port 5432 on 'db' is reachable"
else
  echo "   ❌ Port 5432 on 'db' is NOT reachable"
  echo "   ⚠️  DB container might not be running or not ready yet"
fi

echo ""
echo "🔄 Attempting database connection..."
until echo "SELECT 1" | npx prisma db execute --stdin 2>/dev/null; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

echo ""
echo "✅ Database connected!"
echo ""

echo "📊 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed!"
echo ""

echo "🎯 Starting Next.js server..."
exec node server.js
