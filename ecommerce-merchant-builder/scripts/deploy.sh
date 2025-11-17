#!/bin/bash

# E-Commerce Merchant Builder - Production Deployment Script
# This script helps deploy the application to production

set -e

echo "🚀 Deploying E-Commerce Merchant Builder to Production..."

# Check environment
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set!"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET environment variable is not set!"
    exit 1
fi

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Build Next.js application
echo "🏗️  Building Next.js application..."
npm run build

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🎯 To start the production server, run:"
echo "   npm run start"
echo ""
