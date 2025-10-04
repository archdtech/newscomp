#!/usr/bin/env python3
"""
Test script to verify news scraper functionality
"""

import requests
import json
from datetime import datetime

def test_api_connection():
    """Test if we can connect to the Next.js API"""
    try:
        # Test with a simple article
        test_article = {
            'title': 'Test Compliance Alert from News Scraper',
            'description': 'This is a test article to verify the news scraper integration is working properly.',
            'source': 'News Scraper Test',
            'category': 'Regulatory',
            'riskLevel': 'Medium',
            'severity': 'Info',
            'status': 'Active',
            'priority': 3,
            'publishedAt': datetime.now().isoformat(),
            'tags': ['test', 'news-scraper', 'integration']
        }
        
        response = requests.post(
            'http://localhost:3000/api/news/process',
            json={'articles': [test_article]},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"API Response Status: {response.status_code}")
        print(f"API Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ API connection successful!")
            return True
        else:
            print("❌ API connection failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error connecting to API: {e}")
        return False

def test_feed_scraping():
    """Test scraping a single RSS feed"""
    try:
        import feedparser
        
        # Test with SEC RSS feed
        feed_url = "https://www.sec.gov/news/pressreleases.rss"
        print(f"Testing RSS feed: {feed_url}")
        
        feed = feedparser.parse(feed_url)
        
        if feed.entries:
            print(f"✅ Successfully scraped {len(feed.entries)} articles")
            
            # Show first article
            first_article = feed.entries[0]
            print(f"Sample article: {first_article.get('title', 'No Title')}")
            return True
        else:
            print("❌ No articles found in feed")
            return False
            
    except Exception as e:
        print(f"❌ Error scraping feed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing News Scraper Components...")
    print()
    
    print("1. Testing RSS Feed Scraping...")
    feed_test = test_feed_scraping()
    print()
    
    print("2. Testing API Connection...")
    api_test = test_api_connection()
    print()
    
    if feed_test and api_test:
        print("🎉 All tests passed! News scraper should work correctly.")
    else:
        print("⚠️ Some tests failed. Check the errors above.")
