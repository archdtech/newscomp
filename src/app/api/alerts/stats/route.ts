import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get basic counts
    const [
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      highRiskAlerts,
      recentAlerts
    ] = await Promise.all([
      db.complianceAlert.count(),
      db.complianceAlert.count({ where: { status: 'Active' } }),
      db.complianceAlert.count({ where: { riskLevel: 'Critical' } }),
      db.complianceAlert.count({ where: { riskLevel: 'High' } }),
      db.complianceAlert.count({ 
        where: { 
          publishedAt: { gte: startDate } 
        } 
      })
    ]);

    // Get alerts by category
    const alertsByCategory = await db.complianceAlert.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      orderBy: {
        category: 'asc'
      }
    });

    // Get alerts by risk level
    const alertsByRiskLevel = await db.complianceAlert.groupBy({
      by: ['riskLevel'],
      _count: {
        id: true
      },
      orderBy: {
        riskLevel: 'desc'
      }
    });

    // Get alerts by status
    const alertsByStatus = await db.complianceAlert.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Get recent trends (last 30 days by day)
    const trendsData = await db.complianceAlert.groupBy({
      by: ['publishedAt'],
      where: {
        publishedAt: { gte: startDate }
      },
      _count: {
        id: true
      },
      orderBy: {
        publishedAt: 'asc'
      }
    });

    // Process trends data for charting
    const trends = [];
    const trendMap = new Map();
    
    trendsData.forEach(item => {
      const date = new Date(item.publishedAt).toISOString().split('T')[0];
      trendMap.set(date, (trendMap.get(date) || 0) + item._count.id);
    });

    // Fill in missing dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      trends.push({
        date: dateStr,
        count: trendMap.get(dateStr) || 0
      });
    }

    // Get top sources
    const topSources = await db.complianceAlert.groupBy({
      by: ['source'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Get alerts requiring attention (high priority, not resolved)
    const requiringAttention = await db.complianceAlert.count({
      where: {
        AND: [
          { riskLevel: { in: ['Critical', 'High'] } },
          { status: 'Active' }
        ]
      }
    });

    // Get resolution rate
    const resolvedThisWeek = await db.complianceAlert.count({
      where: {
        status: 'Resolved',
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const resolutionRate = totalAlerts > 0 ? (resolvedThisWeek / totalAlerts * 100).toFixed(1) : '0';

    return NextResponse.json({
      summary: {
        totalAlerts,
        activeAlerts,
        criticalAlerts,
        highRiskAlerts,
        recentAlerts,
        requiringAttention,
        resolutionRate: parseFloat(resolutionRate)
      },
      breakdown: {
        byCategory: alertsByCategory.map(item => ({
          category: item.category,
          count: item._count.id
        })),
        byRiskLevel: alertsByRiskLevel.map(item => ({
          riskLevel: item.riskLevel,
          count: item._count.id
        })),
        byStatus: alertsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        }))
      },
      trends,
      topSources: topSources.map(item => ({
        source: item.source,
        count: item._count.id
      })),
      metadata: {
        days,
        period: `${days} days`,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching alert stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert statistics' },
      { status: 500 }
    );
  }
}