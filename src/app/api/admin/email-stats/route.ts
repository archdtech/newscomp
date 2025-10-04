import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get email delivery statistics
    const [total, sent, failed, recent] = await Promise.all([
      db.emailDelivery.count(),
      db.emailDelivery.count({
        where: { status: 'sent' }
      }),
      db.emailDelivery.count({
        where: { status: 'failed' }
      }),
      db.emailDelivery.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ])

    // Get email delivery by type
    const byType = await db.emailDelivery.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    })

    // Get recent email deliveries
    const recentDeliveries = await db.emailDelivery.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        recipient: true,
        status: true,
        subject: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      total,
      sent,
      failed,
      recent,
      successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type
        return acc
      }, {} as Record<string, number>),
      recentDeliveries
    })

  } catch (error) {
    console.error('Error fetching email stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
