import schedule
import time
import logging
import yaml
import os
from datetime import datetime
from typing import Dict, Any
from scraper import NewsScraper
import json

class NewsScheduler:
    def __init__(self, config_path: str = "config/config.yaml"):
        self.config_path = config_path
        self.config = self.load_config()
        self.scraper = None
        self.logger = self.setup_logging()
        
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        try:
            with open(self.config_path, 'r') as file:
                config = yaml.safe_load(file)
            return config
        except Exception as e:
            print(f"Error loading config: {e}")
            return {}
    
    def setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        log_config = self.config.get('logging', {})
        log_level = getattr(logging, log_config.get('level', 'INFO'))
        log_file = log_config.get('file', '../logs/news_scraper.log')
        
        # Create logs directory if it doesn't exist
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        # Setup logger
        logger = logging.getLogger('news_scraper')
        logger.setLevel(log_level)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # File handler
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        return logger
    
    def initialize_scraper(self):
        """Initialize the news scraper"""
        try:
            self.scraper = NewsScraper(self.config)
            self.logger.info("News scraper initialized successfully")
        except Exception as e:
            self.logger.error(f"Error initializing scraper: {e}")
            raise
    
    def scrape_all_sources(self):
        """Scrape all news sources"""
        try:
            self.logger.info("Starting scheduled scraping of all sources")
            
            if not self.scraper:
                self.initialize_scraper()
            
            results = self.scraper.scrape_all_sources()
            
            self.logger.info(f"Scraping completed: {results}")
            
            # Save results to file for monitoring
            self.save_scraping_results(results)
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error in scheduled scraping: {e}")
            return None
    
    def scrape_specific_category(self, category: str):
        """Scrape articles from a specific category"""
        try:
            self.logger.info(f"Starting scheduled scraping for category: {category}")
            
            if not self.scraper:
                self.initialize_scraper()
            
            articles = self.scraper.get_articles_by_category(category)
            
            self.logger.info(f"Found {len(articles)} articles in category: {category}")
            
            return articles
            
        except Exception as e:
            self.logger.error(f"Error scraping category {category}: {e}")
            return []
    
    def cleanup_old_data(self):
        """Clean up old data"""
        try:
            self.logger.info("Starting cleanup of old data")
            
            if not self.scraper:
                self.initialize_scraper()
            
            deleted_count = self.scraper.cleanup_old_data(days=30)
            
            self.logger.info(f"Cleaned up {deleted_count} old articles")
            
            return deleted_count
            
        except Exception as e:
            self.logger.error(f"Error cleaning up old data: {e}")
            return 0
    
    def save_scraping_results(self, results: Dict[str, Any]):
        """Save scraping results to a file"""
        try:
            results_file = '../data/scraping_results.json'
            
            # Load existing results if file exists
            existing_results = []
            if os.path.exists(results_file):
                with open(results_file, 'r') as f:
                    existing_results = json.load(f)
            
            # Add new results with timestamp
            result_entry = {
                'timestamp': datetime.now().isoformat(),
                'results': results
            }
            
            existing_results.append(result_entry)
            
            # Keep only last 100 results
            if len(existing_results) > 100:
                existing_results = existing_results[-100:]
            
            # Save to file
            with open(results_file, 'w') as f:
                json.dump(existing_results, f, indent=2)
            
            self.logger.info("Scraping results saved to file")
            
        except Exception as e:
            self.logger.error(f"Error saving scraping results: {e}")
    
    def setup_schedules(self):
        """Setup scheduled tasks"""
        schedule_config = self.config.get('schedule', {})
        
        if schedule_config.get('enabled', False):
            # Daily scraping
            daily_time = schedule_config.get('daily_time', '09:00')
            schedule.every().day.at(daily_time).do(self.scrape_all_sources)
            self.logger.info(f"Scheduled daily scraping at {daily_time}")
            
            # Weekly scraping
            weekly_day = schedule_config.get('weekly_day', 'monday')
            weekly_time = schedule_config.get('weekly_time', '09:00')
            getattr(schedule.every(), weekly_day).at(weekly_time).do(self.scrape_all_sources)
            self.logger.info(f"Scheduled weekly scraping on {weekly_day} at {weekly_time}")
            
            # Weekly cleanup
            schedule.every().sunday.at('02:00').do(self.cleanup_old_data)
            self.logger.info("Scheduled weekly cleanup on Sunday at 02:00")
        
        else:
            self.logger.info("Scheduling is disabled")
    
    def run_scheduler(self):
        """Run the scheduler"""
        self.logger.info("Starting news scraper scheduler")
        
        # Setup schedules
        self.setup_schedules()
        
        # Initialize scraper
        self.initialize_scraper()
        
        # Run initial scraping
        self.logger.info("Running initial scraping")
        self.scrape_all_sources()
        
        # Run scheduler loop
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
        except KeyboardInterrupt:
            self.logger.info("Scheduler stopped by user")
        except Exception as e:
            self.logger.error(f"Scheduler error: {e}")
            raise
    
    def run_once(self):
        """Run scraping once and exit"""
        self.logger.info("Running scraping once")
        
        try:
            self.initialize_scraper()
            results = self.scrape_all_sources()
            
            self.logger.info("Scraping completed")
            return results
            
        except Exception as e:
            self.logger.error(f"Error in one-time scraping: {e}")
            return None
    
    def get_status(self) -> Dict[str, Any]:
        """Get scheduler status"""
        try:
            if not self.scraper:
                self.initialize_scraper()
            
            stats = self.scraper.get_scraping_stats()
            
            # Get scheduled jobs
            jobs = []
            for job in schedule.jobs:
                jobs.append({
                    'job': str(job.job_func),
                    'next_run': job.next_run.isoformat() if job.next_run else None,
                    'interval': str(job.interval)
                })
            
            return {
                'status': 'running',
                'stats': stats,
                'scheduled_jobs': jobs,
                'config': {
                    'schedule_enabled': self.config.get('schedule', {}).get('enabled', False),
                    'daily_time': self.config.get('schedule', {}).get('daily_time'),
                    'weekly_day': self.config.get('schedule', {}).get('weekly_day'),
                    'weekly_time': self.config.get('schedule', {}).get('weekly_time')
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error getting status: {e}")
            return {'status': 'error', 'error': str(e)}

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='News Scraper Scheduler')
    parser.add_argument('--config', default='config/config.yaml', help='Config file path')
    parser.add_argument('--run-once', action='store_true', help='Run scraping once and exit')
    parser.add_argument('--status', action='store_true', help='Get scheduler status')
    parser.add_argument('--category', help='Scrape specific category')
    parser.add_argument('--cleanup', action='store_true', help='Run cleanup')
    
    args = parser.parse_args()
    
    try:
        scheduler = NewsScheduler(args.config)
        
        if args.run_once:
            results = scheduler.run_once()
            print(f"Scraping completed: {results}")
        
        elif args.status:
            status = scheduler.get_status()
            print(f"Scheduler status: {json.dumps(status, indent=2)}")
        
        elif args.category:
            articles = scheduler.scrape_specific_category(args.category)
            print(f"Found {len(articles)} articles in category '{args.category}'")
        
        elif args.cleanup:
            deleted_count = scheduler.cleanup_old_data()
            print(f"Cleaned up {deleted_count} old articles")
        
        else:
            scheduler.run_scheduler()
            
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())