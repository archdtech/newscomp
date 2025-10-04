# Beacon Compliance Intelligence Platform - Docker Setup

This document provides instructions for running the Beacon Compliance Intelligence Platform using Docker.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually comes with Docker Desktop)

## Quick Start

### Option 1: Using the PowerShell Script (Windows)

1. Open PowerShell in the project root directory
2. Run the provided script:
   ```powershell
   .\docker-run.ps1
   ```
3. Access the application at [http://localhost:3000](http://localhost:3000)

### Option 2: Manual Setup

1. Open a terminal in the project root directory
2. Build and start the Docker containers:
   ```bash
   docker-compose up --build -d
   ```
3. Access the application at [http://localhost:3000](http://localhost:3000)

## Docker Components

The Docker setup includes the following components:

1. **Main Application (Next.js)**
   - Runs on port 3000
   - Contains the frontend and backend API

2. **News Scraper Service**
   - Python-based service for scraping compliance news
   - Integrates with the main application

## Useful Commands

### View Logs
```bash
# View logs from all services
docker-compose logs -f

# View logs from a specific service
docker-compose logs -f app
docker-compose logs -f news-scraper
```

### Stop Containers
```bash
docker-compose down
```

### Restart Containers
```bash
docker-compose restart
```

### Check Container Status
```bash
docker-compose ps
```

## Data Persistence

The following data is persisted using Docker volumes:

- Database files: `app-data` volume
- News scraper data: Mounted from `./news-scraper/data`
- News scraper logs: Mounted from `./news-scraper/logs`
- News scraper configuration: Mounted from `./news-scraper/config`

## Troubleshooting

### Container Fails to Start

1. Check the logs for errors:
   ```bash
   docker-compose logs -f
   ```

2. Ensure Docker has sufficient resources allocated (CPU/Memory)

3. Verify that ports 3000 is not already in use:
   ```bash
   # On Windows
   netstat -ano | findstr :3000
   
   # On Linux/macOS
   lsof -i :3000
   ```

### Database Connection Issues

If the application cannot connect to the database:

1. Ensure the database volume is properly mounted
2. Check database connection settings in the application

### News Scraper Issues

If the news scraper is not working:

1. Check the news scraper logs:
   ```bash
   docker-compose logs -f news-scraper
   ```

2. Verify that the configuration files are properly mounted

## Production Deployment Considerations

For production deployment, consider the following:

1. Use a production-grade database (PostgreSQL, MySQL) instead of SQLite
2. Set up proper environment variables for production
3. Implement SSL/TLS for secure communication
4. Set up monitoring and alerting
5. Configure proper backup strategies

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Python Documentation](https://docs.python.org/3/)
