import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jurisdiction = searchParams.get('jurisdiction');
    const industry = searchParams.get('industry');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (jurisdiction) {
      where.jurisdiction = jurisdiction;
    }
    
    if (industry) {
      where.industry = industry;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const regulatoryBodies = await db.regulatoryBody.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(regulatoryBodies);

  } catch (error) {
    console.error('Error fetching regulatory bodies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regulatory bodies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      jurisdiction,
      industry,
      website,
      rssFeed,
      apiEndpoint,
      isActive = true,
      monitoring
    } = body;

    // Validate required fields
    if (!name || !type || !jurisdiction) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, jurisdiction' },
        { status: 400 }
      );
    }

    // Check if regulatory body already exists
    const existing = await db.regulatoryBody.findUnique({
      where: { name }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Regulatory body with this name already exists' },
        { status: 400 }
      );
    }

    const regulatoryBody = await db.regulatoryBody.create({
      data: {
        name,
        type,
        jurisdiction,
        industry,
        website,
        rssFeed,
        apiEndpoint,
        isActive,
        monitoring: monitoring ? JSON.stringify(monitoring) : null
      }
    });

    return NextResponse.json(regulatoryBody, { status: 201 });

  } catch (error) {
    console.error('Error creating regulatory body:', error);
    return NextResponse.json(
      { error: 'Failed to create regulatory body' },
      { status: 500 }
    );
  }
}