import { db } from '@/lib/db'
import { sendEmail } from './resend'
import { generateDailyDigestHTML } from './templates'

interface DigestUser {
  id: string
  name: string | null
  email: string
  timezone?: string
  preferences?: any
}

export async function generateDailyDigest(userId: string) {
  try {
    // Get user details
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        preferences: true
      }
    })

    if (!user || !user.email) {
      throw new Error('User not found or email missing')
    }

    // Get compliance alerts from last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const alerts = await db.complianceAlert.findMany({
      where: {
        publishedAt: {
          gte: yesterday
        },
        status: 'Active'
      },
      orderBy: [
        { priority: 'asc' },
        { publishedAt: 'desc' }
      ],
      take: 50 // Limit to prevent email overload
    })

    // Process and format alerts
    const processedAlerts = alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      source: alert.source,
      category: alert.category,
      riskLevel: alert.riskLevel,
      severity: alert.severity,
      publishedAt: alert.publishedAt.toISOString(),
      tags: typeof alert.tags === 'string' ? JSON.parse(alert.tags) : alert.tags || []
    }))

    // Categorize alerts by risk level
    const categorizedAlerts = {
      critical: processedAlerts.filter(a => a.riskLevel === 'Critical'),
      high: processedAlerts.filter(a => a.riskLevel === 'High'),
      medium: processedAlerts.filter(a => a.riskLevel === 'Medium')
    }

    // Generate stats
    const stats = {
      total: processedAlerts.length,
      critical: categorizedAlerts.critical.length,
      high: categorizedAlerts.high.length,
      sources: [...new Set(processedAlerts.map(a => a.source))].length
    }

    // Generate email content
    const digestData = {
      user: {
        name: user.name || 'Compliance Manager',
        email: user.email
      },
      alerts: categorizedAlerts,
      stats,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const htmlContent = generateDailyDigestHTML(digestData)

    // Send email
    const subject = `🚨 Beacon Daily Digest - ${stats.critical + stats.high} Priority Alerts`
    
    const result = await sendEmail({
      to: [user.email],
      subject,
      html: htmlContent
    })

    // Log email delivery
    await db.emailDelivery.create({
      data: {
        type: 'daily-digest',
        recipient: user.email,
        subject,
        status: result.success ? 'sent' : 'failed',
        metadata: {
          alertCount: stats.total,
          criticalCount: stats.critical,
          highCount: stats.high,
          error: result.error || null
        }
      }
    })

    return {
      success: result.success,
      alertCount: stats.total,
      emailId: result.id
    }

  } catch (error) {
    console.error('Error generating daily digest:', error)
    
    // Log error
    await db.emailDelivery.create({
      data: {
        type: 'daily-digest',
        recipient: userId,
        subject: 'Daily Digest (Failed)',
        status: 'failed',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    throw error
  }
}

export async function sendDigestToAllUsers() {
  try {
    console.log('Starting daily digest generation for all users...')
    
    // Get all active users
    const users = await db.user.findMany({
      where: {
        email: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true
      }
    })

    console.log(`Found ${users.length} users to send digests to`)

    let successCount = 0
    let errorCount = 0

    // Send digest to each user
    for (const user of users) {
      try {
        await generateDailyDigest(user.id)
        successCount++
        console.log(`✅ Sent digest to ${user.email}`)
      } catch (error) {
        errorCount++
        console.error(`❌ Failed to send digest to ${user.email}:`, error)
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`Daily digest complete: ${successCount} sent, ${errorCount} failed`)

    return {
      total: users.length,
      success: successCount,
      errors: errorCount
    }

  } catch (error) {
    console.error('Error in sendDigestToAllUsers:', error)
    throw error
  }
}
