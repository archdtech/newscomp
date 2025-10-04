interface ComplianceAlert {
  id: string
  title: string
  description: string
  source: string
  category: string
  riskLevel: string
  severity: string
  publishedAt: string
  tags: string[]
}

interface DigestData {
  user: {
    name: string
    email: string
  }
  alerts: {
    critical: ComplianceAlert[]
    high: ComplianceAlert[]
    medium: ComplianceAlert[]
  }
  stats: {
    total: number
    critical: number
    high: number
    sources: number
  }
  date: string
}

export function generateDailyDigestHTML(data: DigestData): string {
  const { user, alerts, stats, date } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beacon Daily Compliance Digest</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .subtitle {
            color: #64748b;
            font-size: 14px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 20px 0;
            padding: 20px;
            background: #f1f5f9;
            border-radius: 6px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
        }
        .stat-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
        }
        .section {
            margin: 30px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e2e8f0;
        }
        .alert-item {
            border-left: 4px solid #e2e8f0;
            padding: 15px;
            margin: 10px 0;
            background: #fafafa;
            border-radius: 0 6px 6px 0;
        }
        .alert-critical {
            border-left-color: #dc2626;
            background: #fef2f2;
        }
        .alert-high {
            border-left-color: #ea580c;
            background: #fff7ed;
        }
        .alert-medium {
            border-left-color: #d97706;
            background: #fffbeb;
        }
        .alert-title {
            font-weight: 600;
            margin-bottom: 5px;
            color: #1f2937;
        }
        .alert-description {
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 10px;
        }
        .alert-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #6b7280;
        }
        .risk-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 500;
            text-transform: uppercase;
            font-size: 10px;
        }
        .risk-critical {
            background: #fecaca;
            color: #991b1b;
        }
        .risk-high {
            background: #fed7aa;
            color: #9a3412;
        }
        .risk-medium {
            background: #fde68a;
            color: #92400e;
        }
        .cta-button {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            margin-top: 30px;
            font-size: 12px;
            color: #6b7280;
        }
        @media (max-width: 480px) {
            body { padding: 10px; }
            .container { padding: 20px; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚨 Beacon</div>
            <div class="subtitle">Daily Compliance Intelligence Digest</div>
            <div style="margin-top: 10px; color: #64748b;">${date}</div>
        </div>

        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total Alerts</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" style="color: #dc2626;">${stats.critical}</div>
                <div class="stat-label">Critical</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" style="color: #ea580c;">${stats.high}</div>
                <div class="stat-label">High Risk</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" style="color: #059669;">${stats.sources}</div>
                <div class="stat-label">Sources</div>
            </div>
        </div>

        ${alerts.critical.length > 0 ? `
        <div class="section">
            <div class="section-title" style="color: #dc2626;">🚨 Critical Alerts</div>
            ${alerts.critical.map(alert => `
                <div class="alert-item alert-critical">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-meta">
                        <span>${alert.source} • ${alert.category}</span>
                        <span class="risk-badge risk-critical">${alert.riskLevel}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${alerts.high.length > 0 ? `
        <div class="section">
            <div class="section-title" style="color: #ea580c;">⚠️ High Priority Alerts</div>
            ${alerts.high.map(alert => `
                <div class="alert-item alert-high">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-meta">
                        <span>${alert.source} • ${alert.category}</span>
                        <span class="risk-badge risk-high">${alert.riskLevel}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${alerts.medium.length > 0 ? `
        <div class="section">
            <div class="section-title" style="color: #d97706;">📋 Medium Priority Updates</div>
            ${alerts.medium.slice(0, 5).map(alert => `
                <div class="alert-item alert-medium">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description.substring(0, 150)}...</div>
                    <div class="alert-meta">
                        <span>${alert.source} • ${alert.category}</span>
                        <span class="risk-badge risk-medium">${alert.riskLevel}</span>
                    </div>
                </div>
            `).join('')}
            ${alerts.medium.length > 5 ? `<p style="text-align: center; color: #6b7280;">+ ${alerts.medium.length - 5} more alerts</p>` : ''}
        </div>
        ` : ''}

        <div style="text-align: center;">
            <a href="http://localhost:3000" class="cta-button">View Full Dashboard</a>
        </div>

        <div class="footer">
            <p>This digest was generated for ${user.name} (${user.email})</p>
            <p>Beacon Compliance Intelligence Platform</p>
            <p><a href="#" style="color: #6b7280;">Unsubscribe</a> | <a href="#" style="color: #6b7280;">Manage Preferences</a></p>
        </div>
    </div>
</body>
</html>
  `
}

export function generateWelcomeEmailHTML(userName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Beacon</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 40px 20px;">
        <h1 style="color: #1e40af; font-size: 32px; margin-bottom: 10px;">🚨 Welcome to Beacon</h1>
        <p style="color: #64748b; font-size: 18px;">Your daily compliance intelligence starts now</p>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin: 30px 0;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">What to Expect</h2>
            <ul style="text-align: left; color: #4b5563; line-height: 1.8;">
                <li><strong>Daily 7:00 AM Digest:</strong> Critical compliance alerts delivered to your inbox</li>
                <li><strong>Real-time Monitoring:</strong> SEC, CISA, FTC, and vendor status updates</li>
                <li><strong>Smart Prioritization:</strong> AI-powered risk assessment and categorization</li>
                <li><strong>Action-Ready Intelligence:</strong> Clear summaries with next steps</li>
            </ul>
        </div>
        
        <a href="http://localhost:3000" style="display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0;">
            Access Your Dashboard
        </a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Hello ${userName}, you'll receive your first digest tomorrow morning at 7:00 AM local time.
        </p>
    </div>
</body>
</html>
  `
}
