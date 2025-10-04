# How to Run Beacon Compliance Intelligence Platform

This document provides multiple options for running the Beacon Compliance Intelligence Platform.

## Option 1: Run Locally with Node.js

### Prerequisites
- Node.js 18+ installed
- npm 8+ installed

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up the database**
   ```bash
   npm run db:push
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Option 2: Run with Docker Desktop

### Prerequisites
- Docker Desktop installed and running

### Method A: Using Docker Compose

1. **Start the application**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

4. **Stop the application**
   ```bash
   docker-compose down
   ```

### Method B: Using the PowerShell Script

1. **Run the script**
   ```powershell
   .\run-docker.ps1
   ```

2. **Access the application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

3. **View logs**
   ```bash
   docker logs -f beacon-app
   ```

4. **Stop the application**
   ```bash
   docker stop beacon-app
   ```

## Option 3: Run in Production

### Prerequisites
- Node.js 18+ installed
- npm 8+ installed

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Docker Issues

1. **Docker Desktop not starting**
   - Restart Docker Desktop
   - Restart your computer
   - Check Docker Desktop logs for errors

2. **Container fails to start**
   - Check logs: `docker logs beacon-app`
   - Ensure ports are available: `netstat -ano | findstr :3000`

### Node.js Issues

1. **npm install fails**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and try again: `rm -rf node_modules && npm install`

2. **Application doesn't start**
   - Check for errors in the console
   - Ensure port 3000 is not in use
   - Check if Node.js is properly installed: `node --version`

### Database Issues

1. **Database errors**
   - Ensure Prisma schema is up to date: `npm run db:generate`
   - Reset database if needed: `npm run db:reset`

## News Scraper Setup

To run the news scraper component:

1. **Navigate to the news-scraper directory**
   ```bash
   cd news-scraper
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the setup script**
   ```bash
   python setup.py
   ```

5. **Start the scheduler**
   ```bash
   python src/scheduler.py
   ```

## Need Help?

If you encounter any issues, please refer to the following resources:
- Project Documentation: See `BEACON_COMPLETE_DOCUMENTATION.md`
- Docker Documentation: https://docs.docker.com/
- Next.js Documentation: https://nextjs.org/docs
