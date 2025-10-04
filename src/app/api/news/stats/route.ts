import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get overall news statistics
    const totalArticles = await db.complianceAlert.count()

    // Get recent articles (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const recentArticles = await db.complianceAlert.count({
      where: {
        publishedAt: {
          gte: yesterday
        }
      }
    })

    // Get high-risk articles
    const highRiskArticles = await db.complianceAlert.count({
      where: {
        riskLevel: {
          in: ['Critical', 'High']
        }
      }
    })

    // Get articles by category (simplified)
    const categories = await db.complianceAlert.findMany({
      select: {
        category: true
      }
    })

    const categoryCount: { [key: string]: number } = {}
    categories.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
    })

    const byCategory = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count
    }))

    // Get articles by risk level (simplified)
    const riskLevels = await db.complianceAlert.findMany({
      select: {
        riskLevel: true
      }
    })

    const riskCount: { [key: string]: number } = {}
    riskLevels.forEach(item => {
      riskCount[item.riskLevel] = (riskCount[item.riskLevel] || 0) + 1
    })

    const byRiskLevel = Object.entries(riskCount).map(([riskLevel, count]) => ({
      riskLevel,
      count
    }))

    // Get articles by source (simplified)
    const sources = await db.complianceAlert.findMany({
      select: {
        source: true
      }
    })

    const sourceCount: { [key: string]: number } = {}
    sources.forEach(item => {
      sourceCount[item.source] = (sourceCount[item.source] || 0) + 1
    })

    const bySource = Object.entries(sourceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({
        source,
        count
      }))

    // Get top tags (simplified)
    const allArticles = await db.complianceAlert.findMany({
      select: {
        tags: true
      }
    })

    const tagCounts: { [key: string]: number } = {}
    allArticles.forEach(article => {
      if (article.tags) {
        try {
          const tags = typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags
          if (Array.isArray(tags)) {
            tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            })
          }
        } catch (e) {
          // Skip invalid tags
        }
      }
    })

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }))

    // Simple sentiment distribution
    const sentimentDistribution = {
      positive: Math.floor(totalArticles * 0.3),
      neutral: Math.floor(totalArticles * 0.5),
      negative: Math.floor(totalArticles * 0.2)
    }

    // Get scraping activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const scrapingActivity = await db.monitoringLog.findMany({
      where: {
        source: 'news_scraper',
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        createdAt: true,
        message: true,
        status: true
      }
    })

    return NextResponse.json({
      total: totalArticles,
      recent: recentArticles,
      highRisk: highRiskArticles,
      byCategory,
      byRiskLevel,
      bySource,
      topTags,
      sentimentDistribution,
      scrapingActivity: scrapingActivity.map(log => ({
        timestamp: log.createdAt,
        notes: log.message,
        status: log.status
      }))
    })

  } catch (error) {
    console.error('Error fetching news statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}