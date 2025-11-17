#!/bin/bash

# E-Commerce Merchant Builder - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up E-Commerce Merchant Builder..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment variables
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual credentials!"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run db:generate

# Run database migrations
echo "🗄️  Running database migrations..."
read -p "Do you want to run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:push
    echo "✅ Database migrations completed"
else
    echo "⏭️  Skipped database migrations"
fi

# Seed database
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:seed
    echo "✅ Database seeded with sample data"
else
    echo "⏭️  Skipped database seeding"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📚 Next steps:"
echo "   1. Update .env with your actual credentials"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. Visit http://localhost:3000"
echo ""
echo "📧 Default users created (if seeded):"
echo "   Admin: admin@example.com / admin123"
echo "   Merchant: merchant1@example.com / merchant123"
echo "   Buyer: buyer@example.com / buyer123"
echo ""
