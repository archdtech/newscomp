import { NextRequest, NextResponse } from 'next/server'
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

    // Get user preferences
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        preferences: true,
        timezone: true,
        industry: true,
        jurisdictions: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse preferences if they exist
    let preferences = {}
    if (user.preferences) {
      try {
        preferences = typeof user.preferences === 'string' 
          ? JSON.parse(user.preferences) 
          : user.preferences
      } catch (error) {
        console.error('Error parsing user preferences:', error)
      }
    }

    return NextResponse.json({
      preferences: {
        ...preferences,
        timezone: user.timezone || 'America/New_York',
        industry: user.industry || '',
        jurisdictions: user.jurisdictions || []
      }
    })

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { preferences } = body

    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences data is required' },
        { status: 400 }
      )
    }

    // Update or create user preferences
    const updatedUser = await db.user.upsert({
      where: { id: userId },
      update: {
        preferences: preferences,
        timezone: preferences.timezone || 'America/New_York',
        industry: preferences.industry || null,
        jurisdictions: preferences.jurisdictions || [],
        updatedAt: new Date()
      },
      create: {
        id: userId,
        preferences: preferences,
        timezone: preferences.timezone || 'America/New_York',
        industry: preferences.industry || null,
        jurisdictions: preferences.jurisdictions || [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Log preference update
    await db.monitoringLog.create({
      data: {
        source: 'user_preferences',
        sourceId: userId,
        status: 'success',
        message: 'User preferences updated',
        metadata: {
          preferencesUpdated: true,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    })

  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
