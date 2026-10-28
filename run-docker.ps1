Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting UK Wind Power Forecast Dashboard with Docker" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check if Docker CLI is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "`n[ERROR] Docker was not found in your system PATH." -ForegroundColor Red
    Write-Host "`nTo install Docker Desktop on Windows, run:" -ForegroundColor Yellow
    Write-Host "  winget install Docker.DockerDesktop" -ForegroundColor White
    Write-Host "Or download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Read-Host "`nPress Enter to exit"
    exit 1
}

# 2. Check if Docker Daemon is running
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[WARNING] Docker engine is not running." -ForegroundColor Yellow
    Write-Host "Please start Docker Desktop from your Start menu and wait until it indicates 'Engine running'." -ForegroundColor White
    Read-Host "`nPress Enter to exit"
    exit 1
}

# 3. Run docker compose
Write-Host "`nBuilding and starting containers via docker compose..." -ForegroundColor Green

$hasComposeV2 = (docker compose version 2>&1 | Out-String) -match "version"
if ($hasComposeV2) {
    docker compose up --build
} else {
    docker-compose up --build
}
