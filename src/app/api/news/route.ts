import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const vendor = searchParams.get('vendor')
    const hours = parseInt(searchParams.get('hours') || '24')

    // Build where clause - get all compliance alerts (which include news articles)
    const where: any = {}

    if (category) {
      where.category = category
    }

    if (tags && tags.length > 0) {
      where.OR = tags.map(tag => ({
        tags: {
          contains: tag
        }
      }))
    }

    if (vendor) {
      where.OR = [
        {
          metadata: {
            path: ['entities'],
            array_contains: [vendor]
          }
        },
        {
          tags: {
            hasSome: [vendor]
          }
        }
      ]
    }

    if (hours > 0) {
      const cutoffDate = new Date()
      cutoffDate.setHours(cutoffDate.getHours() - hours)
      where.publishedAt = {
        gte: cutoffDate
      }
    }

    // Get news articles
    const articles = await db.complianceAlert.findMany({
      where,
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        description: true,
        source: true,
        category: true,
        riskLevel: true,
        severity: true,
        status: true,
        priority: true,
        publishedAt: true,
        tags: true,
        metadata: true
      }
    })

    // Get total count for pagination
    const total = await db.complianceAlert.count({ where })

    // Transform articles to include news-specific metadata
    const transformedArticles = articles.map(article => {
      let metadata: any = null;
      let tags: any = [];
      
      try {
        metadata = typeof article.metadata === 'string' ? JSON.parse(article.metadata) : article.metadata;
      } catch (e) {
        metadata = null;
      }
      
      try {
        tags = typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags;
      } catch (e) {
        tags = [];
      }
      
      return {
        id: article.id,
        title: article.title,
        description: article.description,
        source: article.source,
        category: article.category,
        riskLevel: article.riskLevel,
        severity: article.severity,
        status: article.status,
        priority: article.priority,
        publishedAt: article.publishedAt,
        tags: tags || [],
        url: (metadata as any)?.original_url || '',
        scrapedDate: (metadata as any)?.scraped_date,
        sentimentScore: (metadata as any)?.sentiment_score,
        relevanceScore: (metadata as any)?.relevance_score,
        entities: (metadata as any)?.entities || [],
        summary: article.description,
        fullContent: (metadata as any)?.full_content
      };
    })

    return NextResponse.json({
      articles: transformedArticles,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching news articles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await db.complianceAlert.deleteMany({
      where: {
        metadata: {
          path: ['type'],
          equals: 'news_scraping'
        },
        publishedAt: {
          lt: cutoffDate
        }
      }
    })

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Deleted ${result.count} old news articles`
    })

  } catch (error) {
    console.error('Error deleting old news articles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}