# Docker Run Script for Beacon Compliance Intelligence Platform

Write-Host "🚀 Starting Beacon Compliance Intelligence Platform..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Build and start the Docker containers
Write-Host "🔨 Building and starting Docker containers..." -ForegroundColor Yellow
docker-compose up --build -d

# Check if containers are running
$containersRunning = $true
try {
    $app = docker-compose ps app | Select-String "Up"
    $scraper = docker-compose ps news-scraper | Select-String "Up"
    
    if (-not $app -or -not $scraper) {
        $containersRunning = $false
    }
} catch {
    $containersRunning = $false
}

if ($containersRunning) {
    Write-Host "✅ All containers are running!" -ForegroundColor Green
    Write-Host "📊 Beacon application is available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Container Status:" -ForegroundColor Yellow
    docker-compose ps
} else {
    Write-Host "❌ Some containers failed to start. Check the logs with 'docker-compose logs'" -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Magenta
Write-Host "  - View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  - Stop containers: docker-compose down" -ForegroundColor White
Write-Host "  - Restart containers: docker-compose restart" -ForegroundColor White
