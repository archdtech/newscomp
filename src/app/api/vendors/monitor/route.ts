import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // Get vendor details
    const vendor = await db.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Simulate vendor status monitoring
    // In a real implementation, this would check the vendor's status page
    const monitoringResult = {
      vendorId: vendor.id,
      vendorName: vendor.name,
      status: 'operational', // operational, degraded, outage
      responseTime: Math.floor(Math.random() * 1000) + 100, // Simulated response time
      lastChecked: new Date().toISOString(),
      uptime: 99.9, // Simulated uptime percentage
      incidents: [
        {
          id: '1',
          title: 'Minor performance degradation',
          severity: 'minor',
          startTime: '2025-06-20T10:00:00Z',
          endTime: '2025-06-20T11:30:00Z',
          description: 'Brief period of elevated response times'
        }
      ]
    };

    // Create monitoring log entry
    await db.monitoringLog.create({
      data: {
        vendorId: vendor.id,
        status: monitoringResult.status,
        responseTime: monitoringResult.responseTime,
        details: JSON.stringify(monitoringResult)
      }
    });

    // Check if there's an outage that needs an alert
    if (monitoringResult.status === 'outage') {
      await db.complianceAlert.create({
        data: {
          title: `Vendor Outage: ${vendor.name}`,
          description: `${vendor.name} is currently experiencing an outage. This may impact your operations.`,
          source: 'Vendor Monitoring',
          category: 'Vendor Risk',
          riskLevel: 'High',
          severity: 'Critical',
          priority: 1,
          publishedAt: new Date(),
          metadata: JSON.stringify({
            vendorId: vendor.id,
            vendorName: vendor.name,
            monitoringResult
          })
        }
      });
    }

    return NextResponse.json(monitoringResult);

  } catch (error) {
    console.error('Error monitoring vendor:', error);
    return NextResponse.json(
      { error: 'Failed to monitor vendor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorIds } = body;

    if (!vendorIds || !Array.isArray(vendorIds)) {
      return NextResponse.json(
        { error: 'vendorIds array is required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const vendorId of vendorIds) {
      try {
        // Get vendor details
        const vendor = await db.vendor.findUnique({
          where: { id: vendorId }
        });

        if (!vendor) {
          results.push({
            vendorId,
            error: 'Vendor not found'
          });
          continue;
        }

        // Simulate monitoring for each vendor
        const monitoringResult = {
          vendorId: vendor.id,
          vendorName: vendor.name,
          status: Math.random() > 0.8 ? 'outage' : Math.random() > 0.5 ? 'degraded' : 'operational',
          responseTime: Math.floor(Math.random() * 2000) + 50,
          lastChecked: new Date().toISOString(),
          uptime: 95 + Math.random() * 4.9,
          incidents: []
        };

        // Create monitoring log entry
        await db.monitoringLog.create({
          data: {
            vendorId: vendor.id,
            status: monitoringResult.status,
            responseTime: monitoringResult.responseTime,
            details: JSON.stringify(monitoringResult)
          }
        });

        // Create alert if there's an outage
        if (monitoringResult.status === 'outage') {
          await db.complianceAlert.create({
            data: {
              title: `Vendor Outage: ${vendor.name}`,
              description: `${vendor.name} is currently experiencing an outage. This may impact your operations.`,
              source: 'Vendor Monitoring',
              category: 'Vendor Risk',
              riskLevel: 'High',
              severity: 'Critical',
              priority: 1,
              publishedAt: new Date(),
              metadata: JSON.stringify({
                vendorId: vendor.id,
                vendorName: vendor.name,
                monitoringResult
              })
            }
          });
        }

        results.push(monitoringResult);
      } catch (error) {
        console.error(`Error monitoring vendor ${vendorId}:`, error);
        results.push({
          vendorId,
          error: 'Failed to monitor vendor'
        });
      }
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error in bulk vendor monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to monitor vendors' },
      { status: 500 }
    );
  }
}