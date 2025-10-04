import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const criticality = searchParams.get('criticality');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (criticality) {
      where.criticality = criticality;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const vendors = await db.vendor.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    // Format monitoring data
    const formattedVendors = vendors.map(vendor => ({
      ...vendor,
      monitoring: vendor.monitoring ? JSON.parse(vendor.monitoring as string) : null,
      contacts: vendor.contacts ? JSON.parse(vendor.contacts as string) : null
    }));

    return NextResponse.json(formattedVendors);

  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      statusPage,
      criticality = 'Medium',
      isActive = true,
      monitoring,
      contacts
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category' },
        { status: 400 }
      );
    }

    const vendor = await db.vendor.create({
      data: {
        name,
        category,
        statusPage,
        criticality,
        isActive,
        monitoring: monitoring ? JSON.stringify(monitoring) : null,
        contacts: contacts ? JSON.stringify(contacts) : null
      }
    });

    return NextResponse.json(vendor, { status: 201 });

  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}