import requests
import feedparser
import time
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
from newspaper import Article
import json
from database import NewsDatabase, NewsArticle

class NewsScraper:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.db = NewsDatabase(config['database']['path'])
        self.logger = logging.getLogger(__name__)
        
        # Configure requests session
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': config['scraping']['user_agent']
        })
        
        # Initialize sources
        self.initialize_sources()
    
    def initialize_sources(self):
        """Initialize news sources from configuration"""
        sources = []
        
        for category, source_list in self.config['sources'].items():
            for source_config in source_list:
                self.db.add_source(
                    name=source_config['name'],
                    url=source_config['url'],
                    source_type=source_config['type'],
                    category=category,
                    tags=source_config['tags']
                )
                sources.append(source_config)
        
        self.logger.info(f"Initialized {len(sources)} news sources")
    
    def scrape_all_sources(self) -> Dict[str, Any]:
        """Scrape all configured news sources"""
        results = {
            'total_sources': 0,
            'successful_sources': 0,
            'failed_sources': 0,
            'total_articles': 0,
            'errors': []
        }
        
        sources = self.db.get_active_sources()
        results['total_sources'] = len(sources)
        
        for source in sources:
            try:
                start_time = time.time()
                self.logger.info(f"Scraping source: {source['name']}")
                
                if source['type'] == 'rss':
                    articles = self.scrape_rss_source(source)
                elif source['type'] == 'web':
                    articles = self.scrape_web_source(source)
                else:
                    raise ValueError(f"Unknown source type: {source['type']}")
                
                # Process and save articles
                saved_articles = 0
                for article in articles:
                    if self.save_article(article, source):
                        saved_articles += 1
                
                duration = time.time() - start_time
                
                # Log successful scraping
                self.db.log_scraping_session(
                    source_name=source['name'],
                    status='success',
                    articles_scraped=saved_articles,
                    scraping_duration=duration
                )
                
                self.db.update_source_last_scraped(source['name'])
                
                results['successful_sources'] += 1
                results['total_articles'] += saved_articles
                
                self.logger.info(f"Successfully scraped {saved_articles} articles from {source['name']} in {duration:.2f}s")
                
                # Rate limiting
                time.sleep(self.config['scraping']['delay_between_requests'])
                
            except Exception as e:
                error_msg = f"Error scraping {source['name']}: {str(e)}"
                self.logger.error(error_msg)
                results['errors'].append(error_msg)
                results['failed_sources'] += 1
                
                # Log failed scraping
                self.db.log_scraping_session(
                    source_name=source['name'],
                    status='failed',
                    error_message=str(e)
                )
        
        return results
    
    def scrape_rss_source(self, source: Dict[str, Any]) -> List[NewsArticle]:
        """Scrape articles from an RSS feed"""
        articles = []
        
        try:
            response = self.session.get(source['url'], timeout=self.config['scraping']['request_timeout'])
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            
            if feed.bozo:
                self.logger.warning(f"RSS feed parsing warning for {source['name']}: {feed.bozo_exception}")
            
            max_articles = self.config['scraping']['max_articles_per_source']
            
            for entry in feed.entries[:max_articles]:
                try:
                    article = self.parse_rss_entry(entry, source)
                    if article and self.is_article_relevant(article):
                        articles.append(article)
                except Exception as e:
                    self.logger.warning(f"Error parsing RSS entry from {source['name']}: {e}")
                    continue
            
        except Exception as e:
            self.logger.error(f"Error scraping RSS source {source['name']}: {e}")
            raise
        
        return articles
    
    def scrape_web_source(self, source: Dict[str, Any]) -> List[NewsArticle]:
        """Scrape articles from a web page"""
        articles = []
        
        try:
            response = self.session.get(source['url'], timeout=self.config['scraping']['request_timeout'])
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            article_elements = soup.select(source['selector'])
            
            max_articles = self.config['scraping']['max_articles_per_source']
            
            for element in article_elements[:max_articles]:
                try:
                    article = self.parse_web_element(element, source, response.url)
                    if article and self.is_article_relevant(article):
                        articles.append(article)
                except Exception as e:
                    self.logger.warning(f"Error parsing web element from {source['name']}: {e}")
                    continue
            
        except Exception as e:
            self.logger.error(f"Error scraping web source {source['name']}: {e}")
            raise
        
        return articles
    
    def parse_rss_entry(self, entry, source: Dict[str, Any]) -> Optional[NewsArticle]:
        """Parse an RSS feed entry into a NewsArticle"""
        try:
            # Extract basic information
            title = entry.get('title', '').strip()
            link = entry.get('link', '').strip()
            
            if not title or not link:
                return None
            
            # Extract content
            content = ''
            if hasattr(entry, 'content'):
                content = entry.content[0].value if entry.content else ''
            elif hasattr(entry, 'summary'):
                content = entry.summary
            elif hasattr(entry, 'description'):
                content = entry.description
            
            # Clean HTML tags from content
            if content:
                soup = BeautifulSoup(content, 'html.parser')
                content = soup.get_text().strip()
            
            # Extract publication date
            published_date = None
            if hasattr(entry, 'published_parsed'):
                published_date = datetime(*entry.published_parsed[:6])
            elif hasattr(entry, 'updated_parsed'):
                published_date = datetime(*entry.updated_parsed[:6])
            
            # Create article object
            article = NewsArticle(
                title=title,
                content=content,
                url=link,
                source=source['name'],
                published_date=published_date,
                tags=source['tags'],
                category=source['category']
            )
            
            return article
            
        except Exception as e:
            self.logger.error(f"Error parsing RSS entry: {e}")
            return None
    
    def parse_web_element(self, element, source: Dict[str, Any], base_url: str) -> Optional[NewsArticle]:
        """Parse a web element into a NewsArticle"""
        try:
            # Extract title
            title_element = element.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            if not title_element:
                title_element = element.find('a')
            
            title = title_element.get_text().strip() if title_element else ''
            
            # Extract link
            link_element = element.find('a')
            link = link_element.get('href', '').strip() if link_element else ''
            
            if link:
                link = urljoin(base_url, link)
            
            if not title or not link:
                return None
            
            # Extract content
            content = element.get_text().strip()
            
            # Create article object
            article = NewsArticle(
                title=title,
                content=content,
                url=link,
                source=source['name'],
                tags=source['tags'],
                category=source['category']
            )
            
            return article
            
        except Exception as e:
            self.logger.error(f"Error parsing web element: {e}")
            return None
    
    def save_article(self, article: NewsArticle, source: Dict[str, Any]) -> bool:
        """Save an article to the database"""
        try:
            # Check if article already exists
            existing_articles = self.db.get_articles(limit=1, source=article.source)
            for existing in existing_articles:
                if existing.url == article.url:
                    self.logger.debug(f"Article already exists: {article.title}")
                    return False
            
            # Process article content if enabled
            if self.config['processing']['enable_nlp']:
                article = self.process_article_content(article)
            
            # Save to database
            article_id = self.db.add_article(article)
            return article_id is not None
            
        except Exception as e:
            self.logger.error(f"Error saving article '{article.title}': {e}")
            return False
    
    def process_article_content(self, article: NewsArticle) -> NewsArticle:
        """Process article content with NLP"""
        try:
            # Use newspaper3k for better content extraction and analysis
            if article.url:
                news_article = Article(article.url)
                news_article.download()
                news_article.parse()
                
                # Update content with better extraction
                if news_article.text and len(news_article.text) > len(article.content):
                    article.content = news_article.text[:self.config['scraping']['max_content_length']]
                
                # Generate summary
                if news_article.summary:
                    article.summary = news_article.summary
                
                # Extract keywords
                if news_article.keywords:
                    article.tags.extend(news_article.keywords)
                
                # Extract authors
                if news_article.authors:
                    article.entities.extend(news_article.authors)
            
            # Remove duplicate tags
            article.tags = list(set(article.tags))
            
            # Remove duplicate entities
            article.entities = list(set(article.entities))
            
            # Limit content length
            if len(article.content) > self.config['scraping']['max_content_length']:
                article.content = article.content[:self.config['scraping']['max_content_length']] + "..."
            
            return article
            
        except Exception as e:
            self.logger.warning(f"Error processing article content: {e}")
            return article
    
    def is_article_relevant(self, article: NewsArticle) -> bool:
        """Check if an article is relevant based on filtering rules"""
        try:
            # Check exclude keywords
            exclude_keywords = self.config['filtering']['exclude_keywords']
            title_lower = article.title.lower()
            content_lower = article.content.lower()
            
            for keyword in exclude_keywords:
                if keyword.lower() in title_lower or keyword.lower() in content_lower:
                    return False
            
            # Check if article matches any relevant keywords
            all_keywords = []
            for category_keywords in self.config['filtering']['keywords'].values():
                all_keywords.extend(category_keywords)
            
            for keyword in all_keywords:
                if keyword.lower() in title_lower or keyword.lower() in content_lower:
                    return True
            
            # If no keywords match, check if it's from a trusted source
            if article.source in ['SEC News', 'FCA News', 'AWS Status', 'Microsoft Azure Status']:
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error checking article relevance: {e}")
            return True  # Default to true if there's an error
    
    def get_articles_by_vendor(self, vendor_name: str) -> List[NewsArticle]:
        """Get articles related to a specific vendor"""
        vendor_keywords = {
            'aws': ['aws', 'amazon web services', 'amazon'],
            'azure': ['azure', 'microsoft azure', 'microsoft cloud'],
            'google': ['google cloud', 'gcp', 'google'],
            'microsoft': ['microsoft', 'msft', 'azure'],
            'oracle': ['oracle', 'oracle cloud'],
            'salesforce': ['salesforce', 'crm'],
            'ibm': ['ibm', 'ibm cloud'],
            'adobe': ['adobe', 'creative cloud']
        }
        
        keywords = vendor_keywords.get(vendor_name.lower(), [vendor_name])
        return self.db.get_articles_by_tags(keywords)
    
    def get_articles_by_category(self, category: str, limit: int = 50) -> List[NewsArticle]:
        """Get articles by category"""
        return self.db.get_articles(limit=limit, category=category)
    
    def get_recent_articles(self, hours: int = 24) -> List[NewsArticle]:
        """Get recent articles"""
        return self.db.get_recent_articles(hours)
    
    def get_scraping_stats(self) -> Dict[str, Any]:
        """Get scraping statistics"""
        return self.db.get_scraping_stats()
    
    def cleanup_old_data(self, days: int = 30):
        """Clean up old data"""
        return self.db.cleanup_old_articles(days)