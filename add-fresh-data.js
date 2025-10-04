const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addFreshData() {
  try {
    console.log('🚀 Adding fresh compliance news data...');

    // Add some fresh compliance alerts that would typically come from news scraping
    const freshAlerts = [
      {
        title: 'SEC Announces New Cybersecurity Disclosure Requirements',
        description: 'The Securities and Exchange Commission today announced new rules requiring public companies to disclose material cybersecurity incidents within four business days.',
        source: 'SEC Press Release',
        category: 'Regulatory',
        subcategory: 'Cybersecurity',
        riskLevel: 'High',
        severity: 'Warning',
        status: 'Active',
        priority: 1,
        publishedAt: new Date(),
        tags: JSON.stringify(['SEC', 'cybersecurity', 'disclosure', 'public companies'])
      },
      {
        title: 'CISA Issues Critical Infrastructure Security Alert',
        description: 'The Cybersecurity and Infrastructure Security Agency has issued an urgent alert regarding vulnerabilities in critical infrastructure systems affecting financial services.',
        source: 'CISA Alert',
        category: 'Vendor',
        subcategory: 'Security Alert',
        riskLevel: 'Critical',
        severity: 'Critical',
        status: 'Active',
        priority: 1,
        publishedAt: new Date(),
        tags: JSON.stringify(['CISA', 'critical infrastructure', 'financial services', 'vulnerability'])
      },
      {
        title: 'FTC Settles Data Privacy Case for $50 Million',
        description: 'The Federal Trade Commission reached a settlement with a major technology company over allegations of mishandling consumer data and inadequate privacy protections.',
        source: 'FTC News',
        category: 'Enforcement',
        subcategory: 'Data Privacy',
        riskLevel: 'High',
        severity: 'Warning',
        status: 'Active',
        priority: 2,
        publishedAt: new Date(),
        tags: JSON.stringify(['FTC', 'data privacy', 'settlement', 'consumer protection'])
      },
      {
        title: 'New GDPR Guidance on AI Systems Released',
        description: 'The European Data Protection Board has published new guidance on the application of GDPR to artificial intelligence systems and automated decision-making.',
        source: 'EDPB Guidance',
        category: 'Regulatory',
        subcategory: 'Data Protection',
        riskLevel: 'Medium',
        severity: 'Info',
        status: 'Active',
        priority: 2,
        publishedAt: new Date(),
        tags: JSON.stringify(['GDPR', 'AI', 'automated decision-making', 'EDPB'])
      },
      {
        title: 'Cloud Provider Service Outage Affects Multiple Clients',
        description: 'A major cloud service provider experienced a significant outage affecting authentication services, impacting compliance monitoring systems across multiple organizations.',
        source: 'Cloud Status Page',
        category: 'Vendor',
        subcategory: 'Service Outage',
        riskLevel: 'High',
        severity: 'Critical',
        status: 'Active',
        priority: 1,
        publishedAt: new Date(),
        tags: JSON.stringify(['cloud services', 'outage', 'authentication', 'compliance monitoring'])
      }
    ];

    // Create the alerts
    for (const alertData of freshAlerts) {
      await prisma.complianceAlert.create({
        data: alertData
      });
      console.log(`✅ Added: ${alertData.title}`);
    }

    // Add some monitoring logs to show system activity
    await prisma.monitoringLog.create({
      data: {
        source: 'news_scraper',
        sourceId: 'fresh-data-script',
        status: 'success',
        message: `Added ${freshAlerts.length} fresh compliance alerts`,
        responseTime: 150,
        metadata: {
          alerts_added: freshAlerts.length,
          timestamp: new Date().toISOString()
        }
      }
    });

    console.log(`🎉 Successfully added ${freshAlerts.length} fresh compliance alerts!`);
    
    // Show current total
    const totalAlerts = await prisma.complianceAlert.count();
    console.log(`📊 Total compliance alerts in database: ${totalAlerts}`);

  } catch (error) {
    console.error('❌ Error adding fresh data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFreshData();
