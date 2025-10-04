#!/usr/bin/env python3
"""
Simple News Scraper for Beacon Compliance Intelligence Platform
Scrapes compliance news and sends it to the Next.js application
"""

import requests
import feedparser
import json
import sqlite3
import os
from datetime import datetime, timedelta
from urllib.parse import urljoin
import time

class BeaconNewsScraper:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.db_path = os.path.join(os.path.dirname(__file__), "data", "news.db")
        self.ensure_data_directory()
        self.init_database()
        
        # RSS feeds for compliance news
        self.feeds = [
            {
                "name": "SEC News",
                "url": "https://www.sec.gov/news/pressreleases.rss",
                "category": "Regulatory",
                "tags": ["SEC", "regulatory", "financial"]
            },
            {
                "name": "CISA Alerts",
                "url": "https://www.cisa.gov/news.xml",
                "category": "Cybersecurity", 
                "tags": ["CISA", "cybersecurity", "alerts"]
            },
            {
                "name": "FTC News",
                "url": "https://www.ftc.gov/news-events/news/rss",
                "category": "Regulatory",
                "tags": ["FTC", "consumer protection", "regulatory"]
            }
        ]
    
    def ensure_data_directory(self):
        """Ensure the data directory exists"""
        data_dir = os.path.dirname(self.db_path)
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
    
    def init_database(self):
        """Initialize SQLite database for storing scraped news"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS news_articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                url TEXT UNIQUE,
                source TEXT,
                category TEXT,
                published_date TEXT,
                scraped_date TEXT,
                tags TEXT,
                sent_to_api BOOLEAN DEFAULT FALSE
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def scrape_feed(self, feed_config):
        """Scrape a single RSS feed"""
        try:
            print(f"Scraping {feed_config['name']}...")
            feed = feedparser.parse(feed_config['url'])
            
            articles = []
            for entry in feed.entries[:10]:  # Limit to 10 most recent
                article = {
                    'title': entry.get('title', 'No Title'),
                    'description': entry.get('summary', entry.get('description', 'No Description')),
                    'url': entry.get('link', ''),
                    'source': feed_config['name'],
                    'category': feed_config['category'],
                    'published_date': entry.get('published', ''),
                    'scraped_date': datetime.now().isoformat(),
                    'tags': json.dumps(feed_config['tags'])
                }
                articles.append(article)
            
            return articles
            
        except Exception as e:
            print(f"Error scraping {feed_config['name']}: {e}")
            return []
    
    def save_articles(self, articles):
        """Save articles to local database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        saved_count = 0
        for article in articles:
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO news_articles 
                    (title, description, url, source, category, published_date, scraped_date, tags)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    article['title'],
                    article['description'],
                    article['url'],
                    article['source'],
                    article['category'],
                    article['published_date'],
                    article['scraped_date'],
                    article['tags']
                ))
                if cursor.rowcount > 0:
                    saved_count += 1
            except Exception as e:
                print(f"Error saving article: {e}")
        
        conn.commit()
        conn.close()
        return saved_count
    
    def send_to_nextjs_api(self, articles):
        """Send articles to Next.js API for processing"""
        try:
            # Transform articles for the API
            api_articles = []
            for article in articles:
                api_article = {
                    'title': article['title'],
                    'description': article['description'],
                    'source': article['source'],
                    'category': article['category'],
                    'riskLevel': self.assess_risk_level(article),
                    'severity': self.assess_severity(article),
                    'status': 'Active',
                    'priority': self.assess_priority(article),
                    'publishedAt': article['published_date'] or datetime.now().isoformat(),
                    'tags': json.loads(article['tags']) if article['tags'] else []
                }
                api_articles.append(api_article)
            
            # Send to Next.js API
            response = requests.post(
                f"{self.base_url}/api/news/process",
                json={'articles': api_articles},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                print(f"Successfully sent {len(api_articles)} articles to Next.js API")
                return True
            else:
                print(f"Failed to send articles to API: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Error sending to Next.js API: {e}")
            return False
    
    def assess_risk_level(self, article):
        """Assess risk level based on article content"""
        title_lower = article['title'].lower()
        desc_lower = article['description'].lower()
        
        critical_keywords = ['breach', 'violation', 'penalty', 'fine', 'enforcement']
        high_keywords = ['warning', 'alert', 'investigation', 'compliance']
        
        if any(keyword in title_lower or keyword in desc_lower for keyword in critical_keywords):
            return 'Critical'
        elif any(keyword in title_lower or keyword in desc_lower for keyword in high_keywords):
            return 'High'
        else:
            return 'Medium'
    
    def assess_severity(self, article):
        """Assess severity based on article content"""
        risk_level = self.assess_risk_level(article)
        if risk_level == 'Critical':
            return 'Critical'
        elif risk_level == 'High':
            return 'Warning'
        else:
            return 'Info'
    
    def assess_priority(self, article):
        """Assess priority based on risk level"""
        risk_level = self.assess_risk_level(article)
        if risk_level == 'Critical':
            return 1
        elif risk_level == 'High':
            return 2
        else:
            return 3
    
    def get_unsent_articles(self):
        """Get articles that haven't been sent to the API yet"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT title, description, url, source, category, published_date, scraped_date, tags
            FROM news_articles 
            WHERE sent_to_api = FALSE
            ORDER BY scraped_date DESC
        ''')
        
        articles = []
        for row in cursor.fetchall():
            articles.append({
                'title': row[0],
                'description': row[1],
                'url': row[2],
                'source': row[3],
                'category': row[4],
                'published_date': row[5],
                'scraped_date': row[6],
                'tags': row[7]
            })
        
        conn.close()
        return articles
    
    def mark_articles_sent(self, articles):
        """Mark articles as sent to API"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for article in articles:
            cursor.execute('''
                UPDATE news_articles 
                SET sent_to_api = TRUE 
                WHERE url = ?
            ''', (article['url'],))
        
        conn.commit()
        conn.close()
    
    def run_scraping_cycle(self):
        """Run a complete scraping cycle"""
        print("🚀 Starting news scraping cycle...")
        
        all_articles = []
        
        # Scrape all feeds
        for feed_config in self.feeds:
            articles = self.scrape_feed(feed_config)
            all_articles.extend(articles)
        
        if all_articles:
            # Save to local database
            saved_count = self.save_articles(all_articles)
            print(f"💾 Saved {saved_count} new articles to database")
            
            # Get unsent articles and send to API
            unsent_articles = self.get_unsent_articles()
            if unsent_articles:
                if self.send_to_nextjs_api(unsent_articles):
                    self.mark_articles_sent(unsent_articles)
                    print(f"✅ Sent {len(unsent_articles)} articles to Next.js application")
                else:
                    print("❌ Failed to send articles to Next.js application")
            else:
                print("ℹ️ No new articles to send")
        else:
            print("ℹ️ No articles found in this scraping cycle")
        
        print("✅ Scraping cycle completed")

def main():
    scraper = BeaconNewsScraper()
    scraper.run_scraping_cycle()

if __name__ == "__main__":
    main()
