import requests
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from database import NewsArticle

class NewsAPIClient:
    def __init__(self, api_config: Dict[str, Any]):
        self.api_config = api_config
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        
        # Setup headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Beacon-News-Scraper/1.0'
        })
        
        if api_config.get('api_key'):
            self.session.headers.update({
                'Authorization': f"Bearer {api_config['api_key']}"
            })
    
    def send_articles_to_frontend(self, articles: List[NewsArticle]) -> bool:
        """Send scraped articles to the frontend API"""
        try:
            api_endpoint = self.api_config.get('api_endpoint')
            if not api_endpoint:
                self.logger.warning("No API endpoint configured")
                return False
            
            # Convert articles to API format
            api_articles = []
            for article in articles:
                api_article = {
                    'title': article.title,
                    'content': article.content,
                    'url': article.url,
                    'source': article.source,
                    'published_date': article.published_date.isoformat() if article.published_date else None,
                    'scraped_date': article.scraped_date.isoformat() if article.scraped_date else None,
                    'tags': article.tags,
                    'category': article.category,
                    'sentiment_score': article.sentiment_score,
                    'relevance_score': article.relevance_score,
                    'entities': article.entities,
                    'summary': article.summary
                }
                api_articles.append(api_article)
            
            # Send in batches
            batch_size = self.api_config.get('batch_size', 100)
            success_count = 0
            error_count = 0
            
            for i in range(0, len(api_articles), batch_size):
                batch = api_articles[i:i + batch_size]
                
                try:
                    response = self.session.post(
                        api_endpoint,
                        json={'articles': batch},
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        success_count += len(batch)
                        self.logger.info(f"Successfully sent batch {i//batch_size + 1} with {len(batch)} articles")
                    else:
                        error_count += len(batch)
                        self.logger.error(f"Failed to send batch {i//batch_size + 1}: {response.status_code} - {response.text}")
                
                except requests.exceptions.RequestException as e:
                    error_count += len(batch)
                    self.logger.error(f"Error sending batch {i//batch_size + 1}: {e}")
            
            self.logger.info(f"Sent {success_count} articles successfully, {error_count} failed")
            return error_count == 0
            
        except Exception as e:
            self.logger.error(f"Error sending articles to frontend: {e}")
            return False
    
    def send_real_time_alert(self, article: NewsArticle, alert_type: str = 'breaking_news') -> bool:
        """Send real-time alert for important articles"""
        try:
            alert_endpoint = f"{self.api_config.get('api_endpoint', '')}/alert"
            
            alert_data = {
                'type': alert_type,
                'article': {
                    'title': article.title,
                    'content': article.content,
                    'url': article.url,
                    'source': article.source,
                    'published_date': article.published_date.isoformat() if article.published_date else None,
                    'tags': article.tags,
                    'category': article.category,
                    'sentiment_score': article.sentiment_score,
                    'relevance_score': article.relevance_score
                },
                'timestamp': datetime.now().isoformat()
            }
            
            response = self.session.post(
                alert_endpoint,
                json=alert_data,
                timeout=10
            )
            
            if response.status_code == 200:
                self.logger.info(f"Real-time alert sent for article: {article.title}")
                return True
            else:
                self.logger.error(f"Failed to send real-time alert: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error sending real-time alert: {e}")
            return False
    
    def get_frontend_config(self) -> Optional[Dict[str, Any]]:
        """Get configuration from frontend"""
        try:
            config_endpoint = f"{self.api_config.get('api_endpoint', '')}/config"
            
            response = self.session.get(config_endpoint, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"Failed to get frontend config: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error getting frontend config: {e}")
            return None
    
    def test_connection(self) -> bool:
        """Test connection to frontend API"""
        try:
            health_endpoint = f"{self.api_config.get('api_endpoint', '')}/health"
            
            response = self.session.get(health_endpoint, timeout=10)
            
            if response.status_code == 200:
                self.logger.info("Frontend API connection test successful")
                return True
            else:
                self.logger.error(f"Frontend API connection test failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error testing frontend connection: {e}")
            return False
    
    def send_scraping_report(self, report_data: Dict[str, Any]) -> bool:
        """Send scraping report to frontend"""
        try:
            report_endpoint = f"{self.api_config.get('api_endpoint', '')}/report"
            
            response = self.session.post(
                report_endpoint,
                json=report_data,
                timeout=30
            )
            
            if response.status_code == 200:
                self.logger.info("Scraping report sent successfully")
                return True
            else:
                self.logger.error(f"Failed to send scraping report: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error sending scraping report: {e}")
            return False
    
    def get_vendor_keywords(self) -> List[str]:
        """Get vendor keywords from frontend for targeted scraping"""
        try:
            keywords_endpoint = f"{self.api_config.get('api_endpoint', '')}/vendor-keywords"
            
            response = self.session.get(keywords_endpoint, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('keywords', [])
            else:
                self.logger.error(f"Failed to get vendor keywords: {response.status_code}")
                return []
                
        except Exception as e:
            self.logger.error(f"Error getting vendor keywords: {e}")
            return []
    
    def get_compliance_keywords(self) -> List[str]:
        """Get compliance keywords from frontend for targeted scraping"""
        try:
            keywords_endpoint = f"{self.api_config.get('api_endpoint', '')}/compliance-keywords"
            
            response = self.session.get(keywords_endpoint, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('keywords', [])
            else:
                self.logger.error(f"Failed to get compliance keywords: {response.status_code}")
                return []
                
        except Exception as e:
            self.logger.error(f"Error getting compliance keywords: {e}")
            return []