import sqlite3
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class NewsArticle:
    id: Optional[int] = None
    title: str = ""
    content: str = ""
    url: str = ""
    source: str = ""
    published_date: Optional[datetime] = None
    scraped_date: Optional[datetime] = None
    tags: List[str] = None
    category: str = ""
    sentiment_score: Optional[float] = None
    relevance_score: Optional[float] = None
    entities: List[str] = None
    summary: str = ""
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.entities is None:
            self.entities = []
        if self.scraped_date is None:
            self.scraped_date = datetime.now()

class NewsDatabase:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.logger = logging.getLogger(__name__)
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Create news articles table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS news_articles (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        content TEXT,
                        url TEXT UNIQUE NOT NULL,
                        source TEXT NOT NULL,
                        published_date DATETIME,
                        scraped_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                        tags TEXT,  -- JSON array
                        category TEXT,
                        sentiment_score REAL,
                        relevance_score REAL,
                        entities TEXT,  -- JSON array
                        summary TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Create sources table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS sources (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT UNIQUE NOT NULL,
                        url TEXT NOT NULL,
                        type TEXT NOT NULL,
                        category TEXT NOT NULL,
                        tags TEXT,  -- JSON array
                        is_active BOOLEAN DEFAULT 1,
                        last_scraped DATETIME,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Create scraping logs table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS scraping_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        source_name TEXT NOT NULL,
                        status TEXT NOT NULL,
                        articles_scraped INTEGER DEFAULT 0,
                        error_message TEXT,
                        scraping_duration REAL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Create indexes for better performance
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_news_articles_url ON news_articles(url)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_news_articles_published_date ON news_articles(published_date)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category)')
                cursor.execute('CREATE INDEX IF NOT EXISTS idx_news_articles_tags ON news_articles(tags)')
                
                conn.commit()
                self.logger.info("Database initialized successfully")
                
        except sqlite3.Error as e:
            self.logger.error(f"Database initialization error: {e}")
            raise
    
    def add_source(self, name: str, url: str, source_type: str, category: str, tags: List[str]):
        """Add a new news source to the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO sources (name, url, type, category, tags)
                    VALUES (?, ?, ?, ?, ?)
                ''', (name, url, source_type, category, json.dumps(tags)))
                conn.commit()
                self.logger.info(f"Source '{name}' added successfully")
                
        except sqlite3.Error as e:
            self.logger.error(f"Error adding source '{name}': {e}")
    
    def get_active_sources(self) -> List[Dict[str, Any]]:
        """Get all active news sources"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT name, url, type, category, tags
                    FROM sources
                    WHERE is_active = 1
                ''')
                
                sources = []
                for row in cursor.fetchall():
                    sources.append({
                        'name': row[0],
                        'url': row[1],
                        'type': row[2],
                        'category': row[3],
                        'tags': json.loads(row[4]) if row[4] else []
                    })
                
                return sources
                
        except sqlite3.Error as e:
            self.logger.error(f"Error getting active sources: {e}")
            return []
    
    def add_article(self, article: NewsArticle) -> int:
        """Add a news article to the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT OR REPLACE INTO news_articles 
                    (title, content, url, source, published_date, tags, category, 
                     sentiment_score, relevance_score, entities, summary)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    article.title,
                    article.content,
                    article.url,
                    article.source,
                    article.published_date,
                    json.dumps(article.tags),
                    article.category,
                    article.sentiment_score,
                    article.relevance_score,
                    json.dumps(article.entities),
                    article.summary
                ))
                
                article_id = cursor.lastrowid
                conn.commit()
                self.logger.info(f"Article '{article.title}' added successfully with ID {article_id}")
                return article_id
                
        except sqlite3.Error as e:
            self.logger.error(f"Error adding article '{article.title}': {e}")
            return None
    
    def get_articles(self, limit: int = 100, offset: int = 0, 
                    category: str = None, tags: List[str] = None, 
                    source: str = None) -> List[NewsArticle]:
        """Get news articles with optional filtering"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                query = "SELECT * FROM news_articles WHERE 1=1"
                params = []
                
                if category:
                    query += " AND category = ?"
                    params.append(category)
                
                if source:
                    query += " AND source = ?"
                    params.append(source)
                
                if tags:
                    for tag in tags:
                        query += " AND tags LIKE ?"
                        params.append(f'%{tag}%')
                
                query += " ORDER BY published_date DESC LIMIT ? OFFSET ?"
                params.extend([limit, offset])
                
                cursor.execute(query, params)
                
                articles = []
                for row in cursor.fetchall():
                    article = NewsArticle(
                        id=row[0],
                        title=row[1],
                        content=row[2],
                        url=row[3],
                        source=row[4],
                        published_date=datetime.fromisoformat(row[5]) if row[5] else None,
                        scraped_date=datetime.fromisoformat(row[6]) if row[6] else None,
                        tags=json.loads(row[7]) if row[7] else [],
                        category=row[8],
                        sentiment_score=row[9],
                        relevance_score=row[10],
                        entities=json.loads(row[11]) if row[11] else [],
                        summary=row[12]
                    )
                    articles.append(article)
                
                return articles
                
        except sqlite3.Error as e:
            self.logger.error(f"Error getting articles: {e}")
            return []
    
    def get_articles_by_tags(self, tags: List[str], limit: int = 50) -> List[NewsArticle]:
        """Get articles that match specific tags"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Build tag search condition
                tag_conditions = []
                params = []
                for tag in tags:
                    tag_conditions.append("tags LIKE ?")
                    params.append(f'%{tag}%')
                
                query = f'''
                    SELECT * FROM news_articles 
                    WHERE {" OR ".join(tag_conditions)}
                    ORDER BY published_date DESC 
                    LIMIT ?
                '''
                params.append(limit)
                
                cursor.execute(query, params)
                
                articles = []
                for row in cursor.fetchall():
                    article = NewsArticle(
                        id=row[0],
                        title=row[1],
                        content=row[2],
                        url=row[3],
                        source=row[4],
                        published_date=datetime.fromisoformat(row[5]) if row[5] else None,
                        scraped_date=datetime.fromisoformat(row[6]) if row[6] else None,
                        tags=json.loads(row[7]) if row[7] else [],
                        category=row[8],
                        sentiment_score=row[9],
                        relevance_score=row[10],
                        entities=json.loads(row[11]) if row[11] else [],
                        summary=row[12]
                    )
                    articles.append(article)
                
                return articles
                
        except sqlite3.Error as e:
            self.logger.error(f"Error getting articles by tags: {e}")
            return []
    
    def get_recent_articles(self, hours: int = 24) -> List[NewsArticle]:
        """Get articles from the last N hours"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cutoff_time = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                
                cursor.execute('''
                    SELECT * FROM news_articles 
                    WHERE scraped_date >= ?
                    ORDER BY published_date DESC
                ''', (cutoff_time,))
                
                articles = []
                for row in cursor.fetchall():
                    article = NewsArticle(
                        id=row[0],
                        title=row[1],
                        content=row[2],
                        url=row[3],
                        source=row[4],
                        published_date=datetime.fromisoformat(row[5]) if row[5] else None,
                        scraped_date=datetime.fromisoformat(row[6]) if row[6] else None,
                        tags=json.loads(row[7]) if row[7] else [],
                        category=row[8],
                        sentiment_score=row[9],
                        relevance_score=row[10],
                        entities=json.loads(row[11]) if row[11] else [],
                        summary=row[12]
                    )
                    articles.append(article)
                
                return articles
                
        except sqlite3.Error as e:
            self.logger.error(f"Error getting recent articles: {e}")
            return []
    
    def log_scraping_session(self, source_name: str, status: str, 
                           articles_scraped: int = 0, 
                           error_message: str = None,
                           scraping_duration: float = None):
        """Log a scraping session"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO scraping_logs 
                    (source_name, status, articles_scraped, error_message, scraping_duration)
                    VALUES (?, ?, ?, ?, ?)
                ''', (source_name, status, articles_scraped, error_message, scraping_duration))
                conn.commit()
                
        except sqlite3.Error as e:
            self.logger.error(f"Error logging scraping session: {e}")
    
    def update_source_last_scraped(self, source_name: str):
        """Update the last scraped timestamp for a source"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE sources 
                    SET last_scraped = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    WHERE name = ?
                ''', (source_name,))
                conn.commit()
                
        except sqlite3.Error as e:
            self.logger.error(f"Error updating source last scraped: {e}")
    
    def get_scraping_stats(self) -> Dict[str, Any]:
        """Get scraping statistics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Total articles
                cursor.execute("SELECT COUNT(*) FROM news_articles")
                total_articles = cursor.fetchone()[0]
                
                # Articles by category
                cursor.execute('''
                    SELECT category, COUNT(*) 
                    FROM news_articles 
                    GROUP BY category
                ''')
                articles_by_category = dict(cursor.fetchall())
                
                # Articles by source
                cursor.execute('''
                    SELECT source, COUNT(*) 
                    FROM news_articles 
                    GROUP BY source
                ''')
                articles_by_source = dict(cursor.fetchall())
                
                # Recent scraping sessions
                cursor.execute('''
                    SELECT source_name, status, articles_scraped, created_at
                    FROM scraping_logs
                    ORDER BY created_at DESC
                    LIMIT 10
                ''')
                recent_sessions = cursor.fetchall()
                
                return {
                    'total_articles': total_articles,
                    'articles_by_category': articles_by_category,
                    'articles_by_source': articles_by_source,
                    'recent_sessions': recent_sessions
                }
                
        except sqlite3.Error as e:
            self.logger.error(f"Error getting scraping stats: {e}")
            return {}
    
    def cleanup_old_articles(self, days_to_keep: int = 30):
        """Clean up articles older than specified days"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cutoff_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                cutoff_date = cutoff_date.replace(day=cutoff_date.day - days_to_keep)
                
                cursor.execute('''
                    DELETE FROM news_articles 
                    WHERE scraped_date < ?
                ''', (cutoff_date,))
                
                deleted_count = cursor.rowcount
                conn.commit()
                
                self.logger.info(f"Cleaned up {deleted_count} old articles")
                return deleted_count
                
        except sqlite3.Error as e:
            self.logger.error(f"Error cleaning up old articles: {e}")
            return 0