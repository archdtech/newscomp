import { NextRequest, NextResponse } from 'next/server';
import { createDailyDigestEmail } from '../send/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipients, includeHighRiskOnly = false } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Valid recipients array is required' },
        { status: 400 }
      );
    }

    // Fetch alert statistics
    const statsResponse = await fetch('/api/alerts/stats?days=1');
    const statsData = await statsResponse.json();

    // Fetch alerts for the digest
    const alertsResponse = await fetch('/api/alerts?limit=50');
    const alertsData = await alertsResponse.json();

    let filteredAlerts = alertsData.alerts;
    
    // Filter alerts based on risk level if requested
    if (includeHighRiskOnly) {
      filteredAlerts = alertsData.alerts.filter((alert: any) => 
        alert.riskLevel === 'Critical' || alert.riskLevel === 'High'
      );
    }

    // Create email content
    const { subject, content, htmlContent } = createDailyDigestEmail(statsData, filteredAlerts);

    // Send email to all recipients
    const emailResponse = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipients,
        subject,
        content,
        htmlContent,
        type: 'daily_digest'
      }),
    });

    const emailResult = await emailResponse.json();

    // Log the daily digest
    console.log(`📊 Daily digest sent:`, {
      recipients: recipients.length,
      totalAlerts: statsData.summary.totalAlerts,
      criticalAlerts: statsData.summary.criticalAlerts,
      highRiskAlerts: statsData.summary.highRiskAlerts,
      includeHighRiskOnly,
      messageId: emailResult.messageId,
      success: emailResult.success
    });

    return NextResponse.json({
      success: emailResult.success,
      messageId: emailResult.messageId,
      digest: {
        totalAlerts: statsData.summary.totalAlerts,
        activeAlerts: statsData.summary.activeAlerts,
        criticalAlerts: statsData.summary.criticalAlerts,
        highRiskAlerts: statsData.summary.highRiskAlerts,
        resolutionRate: statsData.summary.resolutionRate,
        includeHighRiskOnly
      },
      recipients: recipients.length,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Daily digest email error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send daily digest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}