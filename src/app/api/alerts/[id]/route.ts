import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // Fetch the specific alert
    const alert = await db.complianceAlert.findUnique({
      where: {
        id: alertId
      },
      include: {
        analysis: true,
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Format the response
    const formattedAlert = {
      ...alert,
      tags: alert.tags ? (typeof alert.tags === 'string' ? JSON.parse(alert.tags) : alert.tags) : [],
      metadata: alert.metadata ? (typeof alert.metadata === 'string' ? JSON.parse(alert.metadata) : alert.metadata) : null,
      keyRequirements: alert.analysis?.keyRequirements ? (typeof alert.analysis.keyRequirements === 'string' ? JSON.parse(alert.analysis.keyRequirements) : alert.analysis.keyRequirements) : [],
      deadlines: alert.analysis?.deadlines ? (typeof alert.analysis.deadlines === 'string' ? JSON.parse(alert.analysis.deadlines) : alert.analysis.deadlines) : [],
      recommendations: alert.analysis?.recommendations ? (typeof alert.analysis.recommendations === 'string' ? JSON.parse(alert.analysis.recommendations) : alert.analysis.recommendations) : []
    }

    return NextResponse.json(formattedAlert)

  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id
    const body = await request.json()

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // Update the alert
    const updatedAlert = await db.complianceAlert.update({
      where: {
        id: alertId
      },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedAlert)

  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // Delete the alert
    await db.complianceAlert.delete({
      where: {
        id: alertId
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
