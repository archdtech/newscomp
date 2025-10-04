import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface NewsArticle {
  title: string
  description: string
  url?: string
  source: string
  category: string
  riskLevel?: string
  severity?: string
  status?: string
  priority?: number
  publishedAt?: string
  tags: string[]
  // Legacy fields for backward compatibility
  content?: string
  published_date?: string
  scraped_date?: string
  sentiment_score?: number
  relevance_score?: number
  entities?: string[]
  summary?: string
}

interface ProcessNewsRequest {
  articles: NewsArticle[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessNewsRequest = await request.json()
    const { articles } = body

    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected articles array.' },
        { status: 400 }
      )
    }

    console.log(`Processing ${articles.length} news articles...`)

    let processedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const article of articles) {
      try {
        // Check if article already exists
        const existingArticle = await db.complianceAlert.findFirst({
          where: {
            OR: [
              { title: article.title },
              ...(article.url ? [{ source: article.url }] : [])
            ]
          }
        })

        if (existingArticle) {
          skippedCount++
          continue
        }

        // Determine risk level based on content and tags
        const riskLevel = article.riskLevel || determineRiskLevel(article)
        
        // Determine severity based on sentiment and content
        const severity = article.severity || determineSeverity(article)

        // Create compliance alert from news article
        await db.complianceAlert.create({
          data: {
            title: article.title,
            description: article.description || article.summary || (article.content ? article.content.substring(0, 500) + '...' : 'No description available'),
            source: article.source,
            category: article.category,
            riskLevel,
            severity,
            status: article.status || 'Active',
            priority: article.priority || calculatePriority(article),
            publishedAt: new Date(article.publishedAt || article.published_date || Date.now()),
            tags: article.tags,
            // Store additional metadata in a structured way
            metadata: {
              type: 'news_scraping',
              original_url: article.url,
              scraped_date: article.scraped_date,
              sentiment_score: article.sentiment_score,
              relevance_score: article.relevance_score,
              entities: article.entities,
              full_content: article.content
            }
          }
        })

        processedCount++

        // Send real-time notification if high-risk article
        if (riskLevel === 'Critical' || riskLevel === 'High') {
          await sendHighRiskNotification(article, riskLevel)
        }

      } catch (error) {
        console.error('Error processing article:', error)
        errorCount++
      }
    }

    // Create processing log
    await db.monitoringLog.create({
      data: {
        source: 'news_scraper',
        sourceId: 'news-scraper-service',
        status: 'success',
        message: `Processed ${processedCount} articles, skipped ${skippedCount}, errors: ${errorCount}`,
        responseTime: 0,
        metadata: {
          processed: processedCount,
          skipped: skippedCount,
          errors: errorCount
        }
      }
    })

    return NextResponse.json({
      success: true,
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      message: `Successfully processed ${processedCount} news articles`
    })

  } catch (error) {
    console.error('Error processing news articles:', error)
    
    // Log error
    await db.monitoringLog.create({
      data: {
        source: 'news_scraper',
        sourceId: 'news-scraper-service',
        status: 'error',
        message: `Error processing news: ${error}`,
        responseTime: 0,
        metadata: {
          error: String(error)
        }
      }
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function determineRiskLevel(article: NewsArticle): string {
  const title = article.title.toLowerCase()
  const content = ((article.content || '') + ' ' + (article.summary || '') + ' ' + (article.description || '')).toLowerCase()
  const tags = article.tags.map(tag => tag.toLowerCase())

  // High-risk keywords
  const criticalKeywords = [
    'breach', 'hack', 'cyberattack', 'data breach', 'security breach',
    'violation', 'fine', 'penalty', 'investigation', 'lawsuit',
    'outage', 'downtime', 'critical', 'emergency'
  ]

  const highKeywords = [
    'vulnerability', 'threat', 'risk', 'compliance', 'regulatory',
    'audit', 'warning', 'alert', 'issue', 'problem'
  ]

  // Check for critical keywords
  if (criticalKeywords.some(keyword => 
    title.includes(keyword) || content.includes(keyword) || tags.includes(keyword)
  )) {
    return 'Critical'
  }

  // Check for high keywords
  if (highKeywords.some(keyword => 
    title.includes(keyword) || content.includes(keyword) || tags.includes(keyword)
  )) {
    return 'High'
  }

  // Check sentiment score
  if (article.sentiment_score && article.sentiment_score < -0.5) {
    return 'High'
  }

  // Default to medium for news articles
  return 'Medium'
}

function determineSeverity(article: NewsArticle): string {
  const title = article.title.toLowerCase()
  const content = ((article.content || '') + ' ' + (article.summary || '') + ' ' + (article.description || '')).toLowerCase()

  // High severity keywords
  if (title.includes('critical') || title.includes('emergency') || 
      content.includes('critical') || content.includes('emergency')) {
    return 'Critical'
  }

  // High severity
  if (title.includes('high') || title.includes('urgent') ||
      content.includes('high') || content.includes('urgent')) {
    return 'High'
  }

  // Medium severity
  if (title.includes('medium') || title.includes('moderate') ||
      content.includes('medium') || content.includes('moderate')) {
    return 'Medium'
  }

  return 'Low'
}

function calculatePriority(article: NewsArticle): number {
  let priority = 1

  // Increase priority based on risk level
  if (article.category === 'compliance_news') priority += 2
  if (article.category === 'cybersecurity_news') priority += 2
  if (article.category === 'vendor_news') priority += 1

  // Increase priority based on tags
  const highPriorityTags = ['sec', 'fca', 'gdpr', 'hipaa', 'sox']
  if (article.tags.some(tag => highPriorityTags.includes(tag.toLowerCase()))) {
    priority += 2
  }

  // Increase priority based on sentiment
  if (article.sentiment_score && article.sentiment_score < -0.3) {
    priority += 1
  }

  return Math.min(priority, 10) // Cap at 10
}

async function sendHighRiskNotification(article: NewsArticle, riskLevel: string) {
  try {
    // Create email delivery record for notification
    await db.emailDelivery.create({
      data: {
        type: 'critical-alert',
        recipient: 'compliance-team@company.com',
        subject: `High-Risk News Alert: ${article.title}`,
        status: 'pending',
        createdAt: new Date()
      }
    })

    console.log(`High-risk notification queued for: ${article.title}`)
  } catch (error) {
    console.error('Error sending high-risk notification:', error)
  }
}