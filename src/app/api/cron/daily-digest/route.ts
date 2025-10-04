import { NextRequest, NextResponse } from 'next/server'
import { sendDigestToAllUsers } from '@/lib/email/digest'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🚀 Starting scheduled daily digest job...')
    
    const result = await sendDigestToAllUsers()
    
    console.log('✅ Daily digest job completed:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Daily digest job completed successfully',
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in daily digest cron job:', error)
    
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'daily-digest-cron',
    timestamp: new Date().toISOString()
  })
}
