import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with sample compliance alerts...')

  // Clear existing compliance alerts
  await prisma.complianceAlert.deleteMany()
  console.log('Cleared existing compliance alerts')

  // Sample compliance alerts data
  const alerts = [
    {
      title: 'SEC Proposes New Cybersecurity Disclosure Requirements',
      description: 'The Securities and Exchange Commission has proposed new rules requiring public companies to disclose material cybersecurity incidents within 4 business days, including details about the incident\'s nature and impact.',
      source: 'SEC',
      category: 'Regulatory',
      subcategory: 'Rulemaking',
      riskLevel: 'High',
      severity: 'Warning',
      status: 'Active',
      priority: 2,
      publishedAt: new Date('2025-06-20T10:00:00Z'),
      expiresAt: new Date('2025-09-20T10:00:00Z'),
      metadata: {
        reference: 'SEC Release No. 34-99245',
        effectiveDate: '2025-12-01',
        affectedEntities: ['Public Companies', 'Investment Advisers'],
        complianceRequirements: [
          'Incident reporting within 4 business days',
          'Annual cybersecurity risk assessments',
          'Board oversight disclosures'
        ]
      },
      tags: ['cybersecurity', 'disclosure', 'public-companies', 'sec']
    },
    {
      title: 'AWS Service Outage Affects Multiple US-East Regions',
      description: 'Amazon Web Services experienced a multi-hour outage affecting EC2, S3, and Lambda services across multiple US-East regions, impacting thousands of enterprise customers.',
      source: 'AWS Status',
      category: 'Vendor',
      subcategory: 'Service Disruption',
      riskLevel: 'Medium',
      severity: 'Warning',
      status: 'Active',
      priority: 3,
      publishedAt: new Date('2025-06-19T14:30:00Z'),
      expiresAt: new Date('2025-06-20T14:30:00Z'),
      metadata: {
        vendorId: 'aws',
        affectedServices: ['EC2', 'S3', 'Lambda'],
        regions: ['us-east-1', 'us-east-2'],
        duration: '3 hours 45 minutes',
        impact: 'High availability and data processing'
      },
      tags: ['aws', 'outage', 'cloud', 'infrastructure']
    },
    {
      title: 'GDPR Enforcement Actions Increase by 45% in 2025',
      description: 'European data protection authorities have significantly increased enforcement actions under GDPR, with fines totaling €1.2 billion in the first half of 2025, focusing on data breaches and consent violations.',
      source: 'European Data Protection Board',
      category: 'Regulatory',
      subcategory: 'Enforcement',
      riskLevel: 'High',
      severity: 'Critical',
      status: 'Active',
      priority: 2,
      publishedAt: new Date('2025-06-18T09:00:00Z'),
      expiresAt: new Date('2025-09-18T09:00:00Z'),
      metadata: {
        reportPeriod: 'H1 2025',
        totalFines: '€1.2 billion',
        topViolations: ['data breaches', 'consent violations', 'data retention'],
        jurisdiction: 'EU',
        trendingUp: true
      },
      tags: ['gdpr', 'enforcement', 'privacy', 'eu', 'fines']
    },
    {
      title: 'Stripe Payment Processing Delays in European Region',
      description: 'Stripe reported payment processing delays affecting European customers, with some transactions experiencing up to 2-hour delays in settlement and processing times.',
      source: 'Stripe Status',
      category: 'Vendor',
      subcategory: 'Performance Degradation',
      riskLevel: 'Low',
      severity: 'Info',
      status: 'Resolved',
      priority: 4,
      publishedAt: new Date('2025-06-17T16:00:00Z'),
      expiresAt: new Date('2025-06-18T16:00:00Z'),
      metadata: {
        vendorId: 'stripe',
        affectedRegion: 'Europe',
        delayDuration: 'up to 2 hours',
        servicesAffected: ['payments', 'settlements'],
        resolutionTime: '4 hours'
      },
      tags: ['stripe', 'payments', 'delays', 'europe']
    },
    {
      title: 'FINRA Issues New Guidance on Crypto Asset Compliance',
      description: 'The Financial Industry Regulatory Authority released comprehensive new guidance for member firms dealing with crypto assets, covering custody, trading, and customer protection requirements.',
      source: 'FINRA',
      category: 'Regulatory',
      subcategory: 'Guidance',
      riskLevel: 'High',
      severity: 'Warning',
      status: 'Active',
      priority: 2,
      publishedAt: new Date('2025-06-16T11:00:00Z'),
      expiresAt: new Date('2025-09-16T11:00:00Z'),
      metadata: {
        guidanceType: 'Regulatory Notice',
        reference: 'Regulatory Notice 25-15',
        focusAreas: ['custody', 'trading', 'customer protection', 'anti-money laundering'],
        effectiveDate: 'Immediate',
        affectedFirms: ['Broker-Dealers', 'Crypto Asset Firms']
      },
      tags: ['finra', 'crypto', 'compliance', 'guidance', 'broker-dealers']
    },
    {
      title: 'Microsoft Azure Active Directory Authentication Issues',
      description: 'Microsoft Azure Active Directory experienced authentication delays affecting enterprise customers worldwide, causing login failures and application access issues.',
      source: 'Microsoft Azure',
      category: 'Vendor',
      subcategory: 'Service Disruption',
      riskLevel: 'High',
      severity: 'Critical',
      status: 'Resolved',
      priority: 1,
      publishedAt: new Date('2025-06-15T08:00:00Z'),
      expiresAt: new Date('2025-06-15T12:00:00Z'),
      metadata: {
        vendorId: 'microsoft',
        service: 'Azure Active Directory',
        impact: 'Authentication failures',
        affectedRegions: ['Global'],
        duration: '2 hours',
        resolution: 'Infrastructure fix completed'
      },
      tags: ['microsoft', 'azure', 'authentication', 'outage', 'global']
    },
    {
      title: 'CCPA Enforcement Actions Reach Record High in California',
      description: 'California privacy regulators have taken enforcement actions against 15 companies in Q2 2025, resulting in $50 million in fines for violations of consumer data rights.',
      source: 'California Privacy Protection Agency',
      category: 'Regulatory',
      subcategory: 'Enforcement',
      riskLevel: 'Medium',
      severity: 'Warning',
      status: 'Active',
      priority: 3,
      publishedAt: new Date('2025-06-14T13:00:00Z'),
      expiresAt: new Date('2025-09-14T13:00:00Z'),
      metadata: {
        period: 'Q2 2025',
        totalFines: '$50 million',
        companiesEnforced: 15,
        commonViolations: ['data access requests', 'data deletion', 'opt-out rights'],
        trend: 'Increasing enforcement'
      },
      tags: ['ccpa', 'enforcement', 'california', 'privacy', 'fines']
    },
    {
      title: 'GitHub Actions Service Disruption',
      description: 'GitHub Actions experienced service degradation affecting CI/CD pipelines worldwide, causing build failures and deployment delays.',
      source: 'GitHub Status',
      category: 'Vendor',
      subcategory: 'Service Disruption',
      riskLevel: 'Medium',
      severity: 'Warning',
      status: 'Resolved',
      priority: 3,
      publishedAt: new Date('2025-06-13T15:30:00Z'),
      expiresAt: new Date('2025-06-13T18:00:00Z'),
      metadata: {
        vendorId: 'github',
        service: 'GitHub Actions',
        impact: 'CI/CD pipeline failures',
        affectedRegions: ['Global'],
        duration: '2.5 hours',
        resolution: 'Infrastructure scaling completed'
      },
      tags: ['github', 'actions', 'ci-cd', 'outage', 'devops']
    }
  ]

  // Insert alerts
  for (const alert of alerts) {
    const createdAlert = await prisma.complianceAlert.create({
      data: {
        title: alert.title,
        description: alert.description,
        source: alert.source,
        category: alert.category,
        subcategory: alert.subcategory,
        riskLevel: alert.riskLevel,
        severity: alert.severity,
        status: alert.status,
        priority: alert.priority,
        publishedAt: alert.publishedAt,
        expiresAt: alert.expiresAt,
        metadata: alert.metadata ? JSON.stringify(alert.metadata) : null,
        tags: alert.tags ? JSON.stringify(alert.tags) : null
      }
    })

    // Add sample analysis for some alerts
    if (alert.category === 'Regulatory') {
      await prisma.alertAnalysis.create({
        data: {
          alertId: createdAlert.id,
          summary: `This ${alert.subcategory?.toLowerCase() || 'regulatory update'} requires immediate attention from compliance teams. Key requirements include compliance with new disclosure and reporting standards.`,
          keyRequirements: JSON.stringify([
            'Review current compliance framework',
            'Update internal policies and procedures',
            'Train relevant staff on new requirements',
            'Implement necessary system changes',
            'Establish monitoring and reporting processes'
          ]),
          riskFactors: JSON.stringify([
            { factor: 'Regulatory Complexity', level: 'High', description: 'Multiple new requirements to implement' },
            { factor: 'Implementation Timeline', level: 'Medium', description: 'Limited time to comply' },
            { factor: 'Resource Requirements', level: 'Medium', description: 'Staff training and system updates needed' }
          ]),
          deadlines: JSON.stringify([
            { deadline: alert.metadata?.effectiveDate || '2025-12-01', action: 'Initial compliance assessment' },
            { deadline: '2025-11-01', action: 'Policy updates completed' },
            { deadline: '2025-11-15', action: 'Staff training completed' }
          ]),
          recommendations: JSON.stringify([
            'Conduct immediate gap analysis',
            'Establish cross-functional compliance team',
            'Develop implementation timeline',
            'Coordinate with legal and IT departments',
            'Prepare documentation for auditors'
          ]),
          impactAnalysis: 'Failure to comply may result in regulatory penalties, reputational damage, and operational disruptions. Estimated compliance costs: $50,000-200,000 depending on organization size.',
          confidence: 0.85,
          analysisType: 'Regulatory'
        }
      })
    }
  }

  console.log(`Successfully seeded ${alerts.length} compliance alerts`)

  // Add some sample monitoring logs for alerts
  const sampleAlerts = await prisma.complianceAlert.findMany({ take: 5 })
  
  for (const alert of sampleAlerts) {
    await prisma.monitoringLog.create({
      data: {
        source: 'compliance_alert',
        sourceId: alert.id,
        status: 'success',
        responseTime: Math.floor(Math.random() * 500) + 50,
        metadata: JSON.stringify({
          alertTitle: alert.title,
          checkType: 'alert_processing',
          result: 'processed_successfully'
        })
      }
    })
  }

  console.log('Added sample alert monitoring logs')
  console.log('Compliance alerts seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding compliance alerts:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })