#!/bin/bash

# AgentOps Setup Script

echo "🚀 Setting up AgentOps platform..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd apps/api && pip install -r requirements.txt && cd ../..
cd apps/agents && pip install -r requirements.txt && cd ../..

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
cd packages/database && npm run db:generate && cd ../..

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Start services: docker-compose up -d"
echo "3. Run migrations: npm run db:migrate"
echo "4. Start development: npm run dev"
