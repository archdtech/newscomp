# Beacon Compliance News Scraper

A comprehensive Python-based news scraping system designed to automatically collect, process, and analyze compliance-related news from various sources. The system integrates seamlessly with the Beacon Compliance Intelligence Platform to provide real-time news intelligence.

## 🚀 Features

### **News Scraping**
- **Multi-source Support**: RSS feeds, web scraping, and API integrations
- **Intelligent Filtering**: Keyword-based filtering to ensure relevance
- **Content Processing**: NLP-powered content analysis and summarization
- **Duplicate Detection**: Automatic deduplication of articles
- **Real-time Processing**: Near real-time article processing and alerting

### **Sources Covered**
- **Compliance News**: Reuters, WSJ, Financial Times
- **Regulatory Updates**: SEC, FCA, EU regulatory bodies
- **Vendor Status**: AWS, Azure, Google Cloud status feeds
- **Cybersecurity**: Krebs on Security, The Hacker News, Security Week

### **Smart Analysis**
- **Sentiment Analysis**: AI-powered sentiment scoring
- **Entity Extraction**: Automatic extraction of organizations, people, and locations
- **Risk Assessment**: Automatic risk level assignment based on content
- **Category Classification**: Intelligent categorization of articles
- **Tag Generation**: Automatic tag generation for better organization

### **Integration & Automation**
- **API Integration**: Seamless integration with Beacon frontend
- **Scheduled Scraping**: Daily and weekly automated scraping
- **Real-time Alerts**: Immediate alerts for high-risk articles
- **Data Export**: Multiple export formats for analysis
- **Health Monitoring**: System health and performance monitoring

## 📋 Prerequisites

- **Python 3.8+**: Required for running the scraper
- **SQLite3**: Database for storing articles and metadata
- **pip**: Python package manager
- **systemd/cron**: For automated scheduling (Linux)

## 🛠️ Installation

### **1. Quick Setup**
```bash
# Navigate to the news scraper directory
cd news-scraper

# Run the setup script
python setup.py
```

### **2. Manual Setup**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p data logs config

# Setup database
python src/database.py

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

### **3. Configuration**
Edit `config/config.yaml` to customize:
- News sources and URLs
- Scraping schedules
- Filtering keywords
- API endpoints
- Processing options

## 🔧 Usage

### **Command Line Interface**
```bash
# Run scraping once
python src/scheduler.py --run-once

# Run with specific category
python src/scheduler.py --category compliance_news

# Get scheduler status
python src/scheduler.py --status

# Run cleanup
python src/scheduler.py --cleanup

# Start continuous scheduler
python src/scheduler.py
```

### **Systemd Service**
```bash
# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable beacon-news-scraper
sudo systemctl start beacon-news-scraper

# Check status
sudo systemctl status beacon-news-scraper

# View logs
sudo journalctl -u beacon-news-scraper -f
```

### **Cron Job**
```bash
# Edit crontab
crontab -e

# Add daily scraping at 9 AM
0 9 * * * /path/to/news-scraper/venv/bin/python /path/to/news-scraper/src/scheduler.py --run-once
```

## 📊 Configuration

### **Sources Configuration**
```yaml
sources:
  compliance_news:
    - name: "Reuters Compliance"
      url: "https://www.reuters.com/markets/compliance/"
      type: "web"
      selector: "article.story__article"
      tags: ["compliance", "regulatory", "financial"]
```

### **Scraping Settings**
```yaml
scraping:
  max_articles_per_source: 50
  max_content_length: 5000
  user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  request_timeout: 30
  retry_attempts: 3
  delay_between_requests: 2
```

### **Filtering Configuration**
```yaml
filtering:
  keywords:
    compliance: ["compliance", "regulatory", "governance", "audit", "risk"]
    security: ["cybersecurity", "data breach", "security", "privacy", "gdpr"]
    financial: ["financial", "banking", "fintech", "sec", "fca"]
    vendor: ["aws", "azure", "google cloud", "microsoft", "amazon"]
  
  exclude_keywords:
    - "advertisement"
    - "sponsored"
    - "press release"
```

## 🔌 API Integration

### **Processing Endpoint**
```
POST /api/news/process
Content-Type: application/json

{
  "articles": [
    {
      "title": "Article Title",
      "content": "Article content...",
      "url": "https://example.com/article",
      "source": "Source Name",
      "published_date": "2024-01-01T00:00:00Z",
      "tags": ["compliance", "regulatory"],
      "category": "compliance_news",
      "sentiment_score": -0.2,
      "entities": ["SEC", "FCA"],
      "summary": "Article summary..."
    }
  ]
}
```

### **News Retrieval**
```
GET /api/news?limit=50&category=compliance_news&hours=24
GET /api/news/stats
```

## 🌐 Frontend Integration

### **News Feed Page**
Access the news feed at: `http://localhost:3000/news`

Features:
- Real-time article display
- Advanced filtering and search
- Sentiment analysis visualization
- Risk level indicators
- Source tracking
- Analytics dashboard

### **Dashboard Integration**
News articles are automatically integrated into the main compliance dashboard:
- High-risk articles appear as critical alerts
- Vendor-specific news appears in vendor monitoring
- Regulatory updates appear in regulatory tracking
- Analytics include news sentiment trends

## 📈 Monitoring & Analytics

### **Scraping Statistics**
- Total articles scraped
- Articles by category and source
- Processing success rates
- Error tracking and logging
- Performance metrics

### **Content Analytics**
- Sentiment distribution
- Risk level breakdown
- Tag frequency analysis
- Source reliability metrics
- Trend analysis over time

### **System Health**
- Database connection status
- API endpoint health
- Memory and CPU usage
- Network connectivity
- Error rate monitoring

## 🚨 Troubleshooting

### **Common Issues**

#### **Scraping Failures**
```bash
# Check logs
tail -f logs/news_scraper.log

# Test individual source
python src/scraper.py --test-source "Source Name"

# Check network connectivity
curl -I https://example.com/news-feed
```

#### **Database Issues**
```bash
# Check database file
ls -la data/news_database.db

# Repair database
sqlite3 data/news_database.db ".dump" | sqlite3 data/news_database_fixed.db

# Check database integrity
sqlite3 data/news_database.db "PRAGMA integrity_check;"
```

#### **API Integration Issues**
```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/news/process -H "Content-Type: application/json" -d '{"test": true}'

# Check Next.js logs
tail -f ../.next/server.log
```

### **Performance Optimization**

#### **Database Optimization**
```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_published_date ON news_articles(published_date);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_tags ON news_articles(tags);
```

#### **Memory Management**
```python
# Process articles in batches
batch_size = 100
for i in range(0, len(articles), batch_size):
    batch = articles[i:i + batch_size]
    process_batch(batch)
```

## 🔒 Security Considerations

### **Data Privacy**
- No personal data collection
- Anonymized processing
- Secure storage of articles
- Regular data cleanup

### **API Security**
- Request validation
- Rate limiting
- Authentication tokens
- HTTPS encryption

### **Source Reliability**
- Trusted source verification
- Content validation
- Spam filtering
- Malware scanning

## 📝 License

This project is part of the Beacon Compliance Intelligence Platform and is subject to the same license terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the logs
- Open an issue on the repository
- Contact the development team

---

**Note**: This news scraper is designed specifically for compliance intelligence purposes. Ensure that your use of this tool complies with the terms of service of the news sources being scraped and applicable data protection regulations.