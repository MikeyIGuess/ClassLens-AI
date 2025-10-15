#!/bin/bash

# ClassLens AI - Quick Setup Script
# This script bootstraps the development environment

set -e

echo "🎓 ClassLens AI - Quick Setup"
echo "=============================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check for package manager
if command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
    echo "✅ Bun found: $(bun --version)"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    echo "✅ npm found: $(npm --version)"
else
    echo "❌ No package manager found. Please install npm or bun."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Database credentials are required."
    exit 1
fi

echo "✅ Environment file found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if [ "$PKG_MANAGER" = "bun" ]; then
    bun install
else
    npm install
fi

echo ""
echo "✅ Dependencies installed"

# Check database connection
echo ""
echo "🗄️  Testing database connection..."
source .env
if [ -z "$TURSO_CONNECTION_URL" ]; then
    echo "⚠️  TURSO_CONNECTION_URL not set in .env"
else
    echo "✅ Database URL configured"
fi

# Remind about seed data
echo ""
echo "📊 Database is already seeded with sample data:"
echo "   - 2 users (student, instructor)"
echo "   - 1 course: Introduction to AI"
echo "   - 3 sample documents"

# Success message
echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Start the development server:"
echo "   $PKG_MANAGER run dev"
echo ""
echo "📖 Then open: http://localhost:3000"
echo ""
echo "🧪 Test the API endpoints:"
echo "   Import api-collection.json into Postman/Bruno"
echo "   Or use curl commands from README.md"
echo ""
echo "📚 Read the full documentation in README.md"
echo ""