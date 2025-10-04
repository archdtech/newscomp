import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const riskLevel = searchParams.get('riskLevel');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (riskLevel) {
      where.riskLevel = riskLevel;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get alerts with pagination
    const [alerts, total] = await Promise.all([
      db.complianceAlert.findMany({
        where,
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
            take: 1
          },
          _count: {
            select: {
              assignments: true,
              responses: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.complianceAlert.count({ where })
    ]);

    // Format the response
    const formattedAlerts = alerts.map(alert => {
      try {
        return {
          ...alert,
          tags: alert.tags ? (typeof alert.tags === 'string' ? JSON.parse(alert.tags) : alert.tags) : [],
          metadata: alert.metadata ? (typeof alert.metadata === 'string' ? JSON.parse(alert.metadata) : alert.metadata) : null,
          keyRequirements: alert.analysis?.keyRequirements ? (typeof alert.analysis.keyRequirements === 'string' ? JSON.parse(alert.analysis.keyRequirements) : alert.analysis.keyRequirements) : [],
          deadlines: alert.analysis?.deadlines ? (typeof alert.analysis.deadlines === 'string' ? JSON.parse(alert.analysis.deadlines) : alert.analysis.deadlines) : [],
          recommendations: alert.analysis?.recommendations ? (typeof alert.analysis.recommendations === 'string' ? JSON.parse(alert.analysis.recommendations) : alert.analysis.recommendations) : []
        };
      } catch (error) {
        console.error('Error formatting alert:', error);
        return {
          ...alert,
          tags: [],
          metadata: null,
          keyRequirements: [],
          deadlines: [],
          recommendations: []
        };
      }
    });

    return NextResponse.json({
      alerts: formattedAlerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      source,
      category,
      subcategory,
      riskLevel,
      severity,
      publishedAt,
      expiresAt,
      metadata,
      rawContent,
      tags
    } = body;

    // Validate required fields
    if (!title || !description || !source || !category || !riskLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, source, category, riskLevel' },
        { status: 400 }
      );
    }

    // Create the alert
    const alert = await db.complianceAlert.create({
      data: {
        title,
        description,
        source,
        category,
        subcategory,
        riskLevel,
        severity: severity || 'Info',
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        rawContent,
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : undefined,
        priority: getPriorityFromRiskLevel(riskLevel)
      }
    });

    return NextResponse.json(alert, { status: 201 });

  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

function getPriorityFromRiskLevel(riskLevel: string): number {
  switch (riskLevel) {
    case 'Critical': return 1;
    case 'High': return 2;
    case 'Medium': return 3;
    case 'Low': return 4;
    default: return 3;
  }
}