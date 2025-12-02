#!/bin/bash
# AREA Project - Quick Setup Script
# This script helps set up the development environment

set -e

echo "🚀 AREA Project Setup"
echo "===================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo "❌ Docker is not installed. Please install Docker first."; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose is not installed. Please install Docker Compose first."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "⚠️  Node.js is not installed. Install it for local development."; }
command -v flutter >/dev/null 2>&1 || { echo "⚠️  Flutter is not installed. Install it for mobile development."; }

echo "✅ Docker found: $(docker --version)"
echo "✅ Docker Compose found: $(docker compose version)"
[ -x "$(command -v node)" ] && echo "✅ Node.js found: $(node --version)"
[ -x "$(command -v flutter)" ] && echo "✅ Flutter found: $(flutter --version | head -1)"

echo ""
echo "📝 Setting up environment..."

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit .env with your configuration"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🐳 Docker Compose Commands:"
echo "  Start services:     docker compose up -d"
echo "  Stop services:      docker compose down"
echo "  View logs:          docker compose logs -f"
echo "  Rebuild:            docker compose up -d --build"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Start all services with Docker Compose"
echo "2) Install backend dependencies"
echo "3) Install web dependencies"
echo "4) Install mobile dependencies"
echo "5) Show project structure"
echo "6) Exit"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting services with Docker Compose..."
        docker compose up -d
        echo ""
        echo "✅ Services started!"
        echo ""
        echo "Access the services at:"
        echo "  Backend:  http://localhost:8080"
        echo "  Frontend: http://localhost:8081"
        echo "  Database: localhost:5432"
        echo ""
        echo "To view logs: docker compose logs -f"
        ;;
    2)
        echo ""
        echo "📦 Installing backend dependencies..."
        cd backend
        npm install
        echo "✅ Backend dependencies installed"
        echo ""
        echo "Next steps:"
        echo "  cd backend"
        echo "  npm run prisma:generate"
        echo "  npm run start:dev"
        ;;
    3)
        echo ""
        echo "📦 Installing web dependencies..."
        cd web
        npm install
        echo "✅ Web dependencies installed"
        echo ""
        echo "Next steps:"
        echo "  cd web"
        echo "  npm run dev"
        ;;
    4)
        echo ""
        echo "📦 Installing mobile dependencies..."
        cd mobile
        flutter pub get
        echo "✅ Mobile dependencies installed"
        echo ""
        echo "Next steps:"
        echo "  cd mobile"
        echo "  flutter run"
        ;;
    5)
        echo ""
        echo "📁 Project Structure:"
        tree -L 2 -I 'node_modules|build|dist|.dart_tool' || ls -la
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✨ Setup complete! Happy coding!"
