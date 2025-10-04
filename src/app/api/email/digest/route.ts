import { NextRequest, NextResponse } from 'next/server'
import { generateDailyDigest, sendDigestToAllUsers } from '@/lib/email/digest'
import { auth } from '@clerk/nextjs'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, targetUserId } = body

    if (action === 'send-to-user') {
      const userIdToSend = targetUserId || userId
      const result = await generateDailyDigest(userIdToSend)
      
      return NextResponse.json({
        success: true,
        message: 'Daily digest sent successfully',
        data: result
      })
    }

    if (action === 'send-to-all') {
      // This should be protected - only admin users
      const result = await sendDigestToAllUsers()
      
      return NextResponse.json({
        success: true,
        message: 'Daily digests sent to all users',
        data: result
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error in digest API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to test digest generation
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate a preview of the digest without sending
    const result = await generateDailyDigest(userId)
    
    return NextResponse.json({
      success: true,
      message: 'Digest preview generated',
      data: result
    })

  } catch (error) {
    console.error('Error generating digest preview:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
