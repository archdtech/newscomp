import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface EmailRequest {
  to: string | string[]
  subject: string
  content: string
  htmlContent?: string
  type: 'critical_alert' | 'daily_digest' | 'weekly_summary' | 'custom'
  alertId?: string
  userId?: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
  details?: any
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { to, subject, content, htmlContent, type, alertId, userId } = body;

    // Validate required fields
    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, content' },
        { status: 400 }
      );
    }

    // Normalize recipients to array
    const recipients = Array.isArray(to) ? to : [to];

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email addresses: ${invalidEmails.join(', ')}` },
        { status: 400 }
      );
    }

    // Create email delivery record in database
    const emailDelivery = await db.emailDelivery.create({
      data: {
        alertId,
        userId,
        type,
        recipient: recipients.join(','),
        subject,
        content,
        htmlContent: htmlContent || null,
        status: 'pending'
      }
    });

    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Resend
    // - Nodemailer with SMTP

    // For now, we'll simulate the email delivery
    const emailResponse = await simulateEmailDelivery({
      to: recipients,
      subject,
      content,
      htmlContent,
      type
    });

    // Update email delivery status in database
    const updateData: any = {
      status: emailResponse.success ? 'sent' : 'failed',
      sentAt: emailResponse.success ? new Date() : null
    };

    if (emailResponse.error) {
      updateData.errorMessage = emailResponse.error;
    }

    await db.emailDelivery.update({
      where: { id: emailDelivery.id },
      data: updateData
    });

    return NextResponse.json({
      success: emailResponse.success,
      messageId: emailResponse.messageId,
      details: {
        recipients: recipients.length,
        type,
        deliveredAt: emailResponse.success ? new Date().toISOString() : null,
        simulation: true // Indicates this is a simulation
      }
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Simulated email delivery function
async function simulateEmailDelivery(params: {
  to: string[];
  subject: string;
  content: string;
  htmlContent?: string;
  type: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  // Simulate occasional failures for testing
  if (Math.random() < 0.05) { // 5% failure rate
    return {
      success: false,
      error: 'Simulated email delivery failure'
    };
  }

  // Generate a mock message ID
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`📧 Email sent successfully:`, {
    to: params.to,
    subject: params.subject,
    type: params.type,
    messageId
  });

  return {
    success: true,
    messageId
  };
}

// Email template functions
export function createCriticalAlertEmail(alert: any): {
  subject: string;
  content: string;
  htmlContent: string;
} {
  const subject = `🚨 CRITICAL: ${alert.title} - Beacon Compliance Alert`;
  
  const content = `
CRITICAL COMPLIANCE ALERT - IMMEDIATE ATTENTION REQUIRED

Alert Details:
- Title: ${alert.title}
- Risk Level: ${alert.riskLevel}
- Category: ${alert.category}
- Source: ${alert.source}
- Published: ${new Date(alert.publishedAt).toLocaleDateString()}

Description:
${alert.description}

Recommended Actions:
${alert.analysis?.recommendations?.join('\n') || 'Please review this alert immediately and take appropriate action.'}

This is a critical compliance alert requiring immediate attention. Please log in to the Beacon dashboard for more details and to assign this alert.

---
Beacon Compliance Intelligence Platform
Real-time compliance monitoring and risk assessment
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
        .alert-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 CRITICAL COMPLIANCE ALERT</h1>
            <p>Immediate Attention Required</p>
        </div>
        <div class="content">
            <div class="alert-details">
                <h2>${alert.title}</h2>
                <p><strong>Risk Level:</strong> <span style="color: #dc2626; font-weight: bold;">${alert.riskLevel}</span></p>
                <p><strong>Category:</strong> ${alert.category}</p>
                <p><strong>Source:</strong> ${alert.source}</p>
                <p><strong>Published:</strong> ${new Date(alert.publishedAt).toLocaleDateString()}</p>
                <hr style="margin: 20px 0;">
                <h3>Description</h3>
                <p>${alert.description}</p>
                ${alert.analysis?.recommendations ? `
                <hr style="margin: 20px 0;">
                <h3>Recommended Actions</h3>
                <ul>
                    ${alert.analysis.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
                </ul>
                ` : ''}
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://localhost:3000/dashboard" class="btn">View in Dashboard</a>
            </div>
            <div class="footer">
                <p>Beacon Compliance Intelligence Platform</p>
                <p>Real-time compliance monitoring and risk assessment</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

  return { subject, content, htmlContent };
}

export function createDailyDigestEmail(stats: any, alerts: any[]): {
  subject: string;
  content: string;
  htmlContent: string;
} {
  const subject = `📊 Daily Compliance Digest - ${new Date().toLocaleDateString()}`;
  
  const content = `
DAILY COMPLIANCE DIGEST
Beacon Compliance Intelligence Platform
${new Date().toLocaleDateString()}

Summary:
- Total Alerts: ${stats.summary.totalAlerts}
- Active Alerts: ${stats.summary.activeAlerts}
- Critical Alerts: ${stats.summary.criticalAlerts}
- High Risk Alerts: ${stats.summary.highRiskAlerts}
- Resolution Rate: ${stats.summary.resolutionRate}%

Alerts Requiring Attention:
${alerts.filter((a: any) => a.riskLevel === 'Critical' || a.riskLevel === 'High').map((alert: any) => `
- ${alert.title} (${alert.riskLevel}, ${alert.category})
  Source: ${alert.source}
  Status: ${alert.status}
`).join('\n')}

Top Categories:
${stats.breakdown.byCategory.slice(0, 5).map((cat: any) => 
  `- ${cat.category}: ${cat.count} alerts`
).join('\n')}

Log in to the Beacon dashboard for detailed analysis and action items.
---
Beacon Compliance Intelligence Platform
Transforming compliance monitoring into intelligent action
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
        .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .stat { background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #1f2937; }
        .stat-label { font-size: 12px; color: #6b7280; }
        .alert-item { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #e5e7eb; }
        .alert-item.critical { border-left-color: #dc2626; }
        .alert-item.high { border-left-color: #f59e0b; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .btn { display: inline-block; background: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Daily Compliance Digest</h1>
            <p>${new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">
            <div class="summary">
                <h2>Today's Compliance Overview</h2>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-number">${stats.summary.totalAlerts}</div>
                        <div class="stat-label">Total Alerts</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${stats.summary.activeAlerts}</div>
                        <div class="stat-label">Active</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${stats.summary.criticalAlerts}</div>
                        <div class="stat-label">Critical</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${stats.summary.resolutionRate}%</div>
                        <div class="stat-label">Resolution Rate</div>
                    </div>
                </div>
            </div>

            <h3>Alerts Requiring Attention</h3>
            ${alerts.filter((a: any) => a.riskLevel === 'Critical' || a.riskLevel === 'High').slice(0, 5).map((alert: any) => `
                <div class="alert-item ${alert.riskLevel.toLowerCase()}">
                    <h4>${alert.title}</h4>
                    <p><strong>${alert.riskLevel}</strong> • ${alert.category} • ${alert.source}</p>
                    <p>${alert.description.substring(0, 100)}...</p>
                </div>
            `).join('')}

            <h3>Top Categories</h3>
            <div class="summary">
                ${stats.breakdown.byCategory.slice(0, 5).map((cat: any) => `
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                        <span>${cat.category}</span>
                        <strong>${cat.count}</strong>
                    </div>
                `).join('')}
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://localhost:3000/dashboard" class="btn">View Full Dashboard</a>
            </div>

            <div class="footer">
                <p>Beacon Compliance Intelligence Platform</p>
                <p>Transforming compliance monitoring into intelligent action</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

  return { subject, content, htmlContent };
}