#!/bin/bash

# Evangelism App Backend Startup Script

echo "🚀 Starting Evangelism App Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until npx prisma db push --accept-data-loss; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "📊 Running database migrations..."
npx prisma db push

# Seed the database (only in development)
if [ "$NODE_ENV" = "development" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed
fi

# Start the application
echo "🎉 Starting application..."
exec npx tsx src/index.ts
