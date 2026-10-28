@echo off
setlocal EnableDelayedExpansion

echo ==========================================================
echo Starting UK Wind Power Forecast Dashboard with Docker
echo ==========================================================

REM 1. Check if docker command is available
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Docker command was not found in your system PATH.
    echo.
    echo If Docker Desktop is not installed, install it using:
    echo   winget install Docker.DockerDesktop
    echo Or download it from:
    echo   https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

REM 2. Check if Docker daemon is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] Docker engine is not running.
    echo Please launch Docker Desktop from the Start menu and wait until it is running.
    echo.
    pause
    exit /b 1
)

REM 3. Determine docker compose command (compose v2 vs legacy docker-compose)
docker compose version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Building and starting containers via 'docker compose up --build'...
    docker compose up --build
) else (
    echo Building and starting containers via 'docker-compose up --build'...
    docker-compose up --build
)

pause
