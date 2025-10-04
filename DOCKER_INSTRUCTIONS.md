# Running Beacon Compliance Intelligence Platform with Docker

## Overview

This document provides step-by-step instructions for running the Beacon Compliance Intelligence Platform using Docker. Docker containerizes the application, making it easy to run in any environment without worrying about dependencies or configuration.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- At least 4GB of RAM allocated to Docker
- At least 10GB of free disk space

## Quick Start Guide

### Step 1: Start Docker Desktop

Ensure Docker Desktop is running on your system.

### Step 2: Open PowerShell

Open PowerShell in the project root directory:

```
c:\Users\artec\Downloads\newscomp-master\newscomp-master
```

### Step 3: Run the Docker Setup Script

Execute the provided PowerShell script:

```powershell
.\docker-run.ps1
```

This script will:
- Check if Docker is running
- Build and start the Docker containers
- Verify that all containers are running properly
- Display the URL to access the application

### Step 4: Access the Application

Once the containers are running, access the application at:

[http://localhost:3000](http://localhost:3000)

## What's Included

The Docker setup includes:

1. **Main Application Container**
   - Next.js application with React frontend
   - API endpoints for compliance intelligence
   - Database for storing compliance data

2. **News Scraper Container**
   - Python-based news scraping service
   - Monitors regulatory bodies, vendor status, and compliance news
   - Integrates with the main application

## Stopping the Application

To stop the application, run:

```powershell
docker-compose down
```

## Viewing Logs

To view logs from the containers:

```powershell
# View all logs
docker-compose logs -f

# View logs from a specific container
docker-compose logs -f app
docker-compose logs -f news-scraper
```

## Troubleshooting

### Container Fails to Start

If a container fails to start:

1. Check the logs:
   ```powershell
   docker-compose logs -f
   ```

2. Ensure ports are not in use:
   ```powershell
   netstat -ano | findstr :3000
   ```

3. Restart Docker Desktop and try again

### Application Not Accessible

If you cannot access the application:

1. Verify containers are running:
   ```powershell
   docker-compose ps
   ```

2. Check for any errors in the logs:
   ```powershell
   docker-compose logs -f app
   ```

3. Ensure your firewall is not blocking access to port 3000

## Advanced Configuration

For advanced configuration options, refer to the `DOCKER_SETUP.md` file, which includes:

- Production deployment considerations
- Database configuration options
- Performance tuning
- Security recommendations

## Need Help?

If you encounter any issues with the Docker setup, please refer to the following resources:

- Docker Documentation: https://docs.docker.com/
- Next.js Documentation: https://nextjs.org/docs
- Project Documentation: See `BEACON_COMPLETE_DOCUMENTATION.md`
