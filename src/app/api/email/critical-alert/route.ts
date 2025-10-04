import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createCriticalAlertEmail } from '../send/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, recipients } = body;

    if (!alertId || !recipients) {
      return NextResponse.json(
        { error: 'Missing required fields: alertId, recipients' },
        { status: 400 }
      );
    }

    // Fetch the alert details
    const alert = await db.complianceAlert.findUnique({
      where: { id: alertId },
      include: {
        analysis: true
      }
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    // Verify this is actually a critical alert
    if (alert.riskLevel !== 'Critical') {
      return NextResponse.json(
        { error: 'Alert is not marked as Critical' },
        { status: 400 }
      );
    }

    // Create email content
    const { subject, content, htmlContent } = createCriticalAlertEmail(alert);

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
        type: 'critical_alert',
        alertId
      }),
    });

    const emailResult = await emailResponse.json();

    // Log the critical alert notification
    console.log(`🚨 Critical alert notification sent:`, {
      alertId,
      alertTitle: alert.title,
      recipients: recipients.length,
      messageId: emailResult.messageId,
      success: emailResult.success
    });

    return NextResponse.json({
      success: emailResult.success,
      messageId: emailResult.messageId,
      alert: {
        id: alert.id,
        title: alert.title,
        riskLevel: alert.riskLevel,
        category: alert.category
      },
      recipients: recipients.length,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Critical alert email error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send critical alert notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}