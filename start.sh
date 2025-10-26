#!/bin/bash

# Start script for Medical Assistant Application
# This script starts both the backend Flask server and frontend Next.js app

echo "🚀 Starting Medical Assistant Application..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ to continue."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found."
    echo "Please create a .env file with your API keys."
    echo "See ENV_SETUP.md for instructions."
    echo ""
    echo "Press Ctrl+C to cancel, or Enter to continue..."
    read
fi

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
echo ""

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo ""

echo "✅ Starting backend server on http://localhost:5000"
python3 app_api.py &
BACKEND_PID=$!

echo "✅ Starting frontend server on http://localhost:3000"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Application is running!"
echo "📍 Backend: http://localhost:5000"
echo "📍 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
