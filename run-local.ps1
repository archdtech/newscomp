Write-Host "🚀 Starting Beacon Compliance Intelligence Platform locally..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Set up the database
Write-Host "🗄️ Setting up the database..." -ForegroundColor Yellow
npm run db:push

# Start the development server
Write-Host "🚀 Starting the development server..." -ForegroundColor Cyan
Write-Host "📊 Beacon application will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
