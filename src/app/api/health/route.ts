import { NextResponse } from "next/server";
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check database connectivity
    const alertCount = await db.complianceAlert.count();
    const userCount = await db.user.count();
    
    // Check recent activity
    const recentAlerts = await db.complianceAlert.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    const recentEmails = await db.emailDelivery.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: "connected",
        api: "operational",
        email: "configured"
      },
      metrics: {
        totalAlerts: alertCount,
        totalUsers: userCount,
        recentAlerts: recentAlerts,
        recentEmails: recentEmails
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      services: {
        database: "error",
        api: "degraded"
      }
    }, { status: 503 });
  }
}