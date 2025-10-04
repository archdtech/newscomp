Write-Host "🚀 Starting Beacon Compliance Intelligence Platform..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Run the application in Docker
Write-Host "🔨 Running the application in Docker..." -ForegroundColor Yellow

# Create a network if it doesn't exist
docker network create beacon-network 2>$null

# Run the Next.js application
docker run --rm -d `
    --name beacon-app `
    --network beacon-network `
    -p 3000:3000 `
    -v ${PWD}:/app `
    -w /app `
    node:20-alpine `
    sh -c "npm install && npm run dev"

# Check if container is running
$containerRunning = $true
try {
    $container = docker ps | Select-String "beacon-app"
    if (-not $container) {
        $containerRunning = $false
    }
} catch {
    $containerRunning = $false
}

if ($containerRunning) {
    Write-Host "✅ Application container is running!" -ForegroundColor Green
    Write-Host "📊 Beacon application is available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Container Status:" -ForegroundColor Yellow
    docker ps --filter "name=beacon-app"
} else {
    Write-Host "❌ Container failed to start. Check the logs with 'docker logs beacon-app'" -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Magenta
Write-Host "  - View logs: docker logs -f beacon-app" -ForegroundColor White
Write-Host "  - Stop container: docker stop beacon-app" -ForegroundColor White
Write-Host "  - Restart container: docker restart beacon-app" -ForegroundColor White
