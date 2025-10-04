#!/usr/bin/env python3
"""
News Scraper Setup Script
This script sets up the news scraping environment and dependencies.
"""

import os
import sys
import subprocess
import sqlite3
import logging
from pathlib import Path

def setup_logging():
    """Setup logging for the setup process"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('setup.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger(__name__)

def check_python_version():
    """Check if Python version is compatible"""
    logger = setup_logging()
    if sys.version_info < (3, 8):
        logger.error("Python 3.8 or higher is required")
        sys.exit(1)
    logger.info(f"Python version {sys.version_info.major}.{sys.version_info.minor} is compatible")

def install_dependencies():
    """Install required Python packages"""
    logger = setup_logging()
    logger.info("Installing Python dependencies...")
    
    try:
        # Install from requirements.txt
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
        ], check=True, capture_output=True, text=True)
        
        logger.info("Dependencies installed successfully")
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install dependencies: {e}")
        logger.error(f"Error output: {e.stderr}")
        sys.exit(1)

def create_directories():
    """Create necessary directories"""
    logger = setup_logging()
    directories = [
        'data',
        'logs',
        'config'
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        logger.info(f"Created directory: {directory}")

def setup_database():
    """Setup the SQLite database"""
    logger = setup_logging()
    
    try:
        # Import database module
        sys.path.append('src')
        from database import NewsDatabase
        
        # Initialize database
        db_path = 'data/news_database.db'
        db = NewsDatabase(db_path)
        
        logger.info("Database setup completed successfully")
        
    except Exception as e:
        logger.error(f"Failed to setup database: {e}")
        sys.exit(1)

def download_nltk_data():
    """Download required NLTK data"""
    logger = setup_logging()
    
    try:
        import nltk
        
        # Download required NLTK data
        nltk_data = [
            'punkt',
            'stopwords',
            'wordnet',
            'vader_lexicon',
            'averaged_perceptron_tagger'
        ]
        
        for data in nltk_data:
            try:
                nltk.download(data, quiet=True)
                logger.info(f"Downloaded NLTK data: {data}")
            except Exception as e:
                logger.warning(f"Failed to download NLTK data {data}: {e}")
        
        logger.info("NLTK data download completed")
        
    except ImportError:
        logger.warning("NLTK not available, skipping NLTK data download")
    except Exception as e:
        logger.warning(f"Error downloading NLTK data: {e}")

def create_systemd_service():
    """Create systemd service file for automatic scraping"""
    logger = setup_logging()
    
    service_content = f"""[Unit]
Description=Beacon News Scraper Service
After=network.target

[Service]
Type=simple
User={os.getenv('USER', 'root')}
WorkingDirectory={os.getcwd()}
ExecStart={sys.executable} src/scheduler.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
"""
    
    service_file = '/etc/systemd/system/beacon-news-scraper.service'
    
    try:
        with open(service_file, 'w') as f:
            f.write(service_content)
        
        logger.info(f"Systemd service file created: {service_file}")
        logger.info("To enable the service, run:")
        logger.info("sudo systemctl daemon-reload")
        logger.info("sudo systemctl enable beacon-news-scraper")
        logger.info("sudo systemctl start beacon-news-scraper")
        
    except PermissionError:
        logger.warning("Permission denied. Create service file manually:")
        logger.warning(f"Create {service_file} with the following content:")
        logger.warning(service_content)
    except Exception as e:
        logger.error(f"Failed to create systemd service: {e}")

def create_cron_job():
    """Create cron job for scheduled scraping"""
    logger = setup_logging()
    
    # Add cron job to run scraper daily at 9 AM
    cron_job = "0 9 * * * cd {} && {} src/scheduler.py --run-once >> /var/log/beacon-news-scraper.log 2>&1\n".format(
        os.getcwd(), sys.executable
    )
    
    try:
        # Export current crontab
        result = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
        current_crontab = result.stdout
        
        # Check if job already exists
        if 'beacon-news-scraper' not in current_crontab:
            # Add new job
            new_crontab = current_crontab + '\n' + cron_job
            subprocess.run(['crontab', '-'], input=new_crontab, text=True, check=True)
            logger.info("Cron job added successfully")
        else:
            logger.info("Cron job already exists")
            
    except subprocess.CalledProcessError as e:
        logger.warning(f"Failed to setup cron job: {e}")
        logger.info("Manual cron setup required:")
        logger.info("Add the following line to your crontab:")
        logger.info(cron_job)

def run_initial_scrape():
    """Run initial scraping to test the setup"""
    logger = setup_logging()
    
    try:
        logger.info("Running initial scraping test...")
        
        # Import scheduler
        sys.path.append('src')
        from scheduler import NewsScheduler
        
        # Run once
        scheduler = NewsScheduler('config/config.yaml')
        results = scheduler.run_once()
        
        if results:
            logger.info(f"Initial scraping completed: {results}")
        else:
            logger.warning("Initial scraping returned no results")
            
    except Exception as e:
        logger.error(f"Initial scraping failed: {e}")
        logger.info("Setup completed but initial scraping failed. Check logs for details.")

def main():
    """Main setup function"""
    logger = setup_logging()
    logger.info("Starting Beacon News Scraper setup...")
    
    try:
        # Check Python version
        check_python_version()
        
        # Create directories
        create_directories()
        
        # Install dependencies
        install_dependencies()
        
        # Setup database
        setup_database()
        
        # Download NLTK data
        download_nltk_data()
        
        # Create systemd service
        create_systemd_service()
        
        # Create cron job
        create_cron_job()
        
        # Run initial scrape
        run_initial_scrape()
        
        logger.info("Setup completed successfully!")
        logger.info("")
        logger.info("Next steps:")
        logger.info("1. Review the configuration in config/config.yaml")
        logger.info("2. Test the scraper: python src/scheduler.py --run-once")
        logger.info("3. Start the service: sudo systemctl start beacon-news-scraper")
        logger.info("4. Check logs: tail -f logs/news_scraper.log")
        logger.info("5. Access the news feed at: http://localhost:3000/news")
        
    except Exception as e:
        logger.error(f"Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()