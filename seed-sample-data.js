const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sample data...');

  // Create sample vendors
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: 'Amazon Web Services',
        description: 'Cloud computing platform providing infrastructure services',
        category: 'Cloud',
        statusPage: 'https://status.aws.amazon.com',
        criticality: 'Critical',
        isActive: true
      }
    }),
    prisma.vendor.create({
      data: {
        name: 'Microsoft Azure',
        description: 'Microsoft cloud computing platform',
        category: 'Cloud',
        statusPage: 'https://status.azure.com',
        criticality: 'Critical',
        isActive: true
      }
    }),
    prisma.vendor.create({
      data: {
        name: 'Google Cloud Platform',
        description: 'Google cloud computing services',
        category: 'Cloud',
        statusPage: 'https://status.cloud.google.com',
        criticality: 'High',
        isActive: true
      }
    }),
    prisma.vendor.create({
      data: {
        name: 'Salesforce',
        description: 'Customer relationship management platform',
        category: 'SaaS',
        statusPage: 'https://status.salesforce.com',
        criticality: 'Medium',
        isActive: true
      }
    })
  ]);

  // Create sample compliance alerts
  const alerts = await Promise.all([
    prisma.complianceAlert.create({
      data: {
        title: 'New GDPR Compliance Requirements',
        description: 'Updated data protection regulations require immediate attention for customer data handling procedures.',
        source: 'EU Regulatory Body',
        category: 'Regulatory',
        subcategory: 'Data Protection',
        riskLevel: 'High',
        severity: 'Warning',
        status: 'Active',
        priority: 1,
        publishedAt: new Date(),
        tags: ['GDPR', 'data protection', 'EU regulation']
      }
    }),
    prisma.complianceAlert.create({
      data: {
        title: 'AWS Service Disruption Alert',
        description: 'Critical AWS services experiencing intermittent outages affecting compliance monitoring systems.',
        source: 'AWS Status Page',
        category: 'Vendor',
        subcategory: 'Service Outage',
        riskLevel: 'Critical',
        severity: 'Critical',
        status: 'Active',
        priority: 1,
        publishedAt: new Date(),
        tags: ['AWS', 'outage', 'critical infrastructure']
      }
    }),
    prisma.complianceAlert.create({
      data: {
        title: 'SOX Compliance Audit Preparation',
        description: 'Quarterly SOX compliance audit scheduled for next month. Ensure all documentation is current.',
        source: 'Internal Compliance Team',
        category: 'Policy',
        subcategory: 'Financial Compliance',
        riskLevel: 'Medium',
        severity: 'Warning',
        status: 'Active',
        priority: 2,
        publishedAt: new Date(),
        tags: ['SOX', 'audit', 'financial compliance']
      }
    }),
    prisma.complianceAlert.create({
      data: {
        title: 'Cybersecurity Framework Update',
        description: 'NIST Cybersecurity Framework 2.0 released with new requirements for risk assessment procedures.',
        source: 'NIST',
        category: 'Regulatory',
        subcategory: 'Cybersecurity',
        riskLevel: 'Medium',
        severity: 'Info',
        status: 'Active',
        priority: 2,
        publishedAt: new Date(),
        tags: ['NIST', 'cybersecurity', 'framework']
      }
    })
  ]);

  // Create sample regulatory bodies
  const regulatoryBodies = await Promise.all([
    prisma.regulatoryBody.create({
      data: {
        name: 'Securities and Exchange Commission (SEC)',
        type: 'SEC',
        jurisdiction: 'US',
        industry: 'Financial',
        website: 'https://www.sec.gov',
        isActive: true
      }
    }),
    prisma.regulatoryBody.create({
      data: {
        name: 'Financial Conduct Authority (FCA)',
        type: 'FINRA',
        jurisdiction: 'UK',
        industry: 'Financial',
        website: 'https://www.fca.org.uk',
        isActive: true
      }
    }),
    prisma.regulatoryBody.create({
      data: {
        name: 'European Data Protection Board (EDPB)',
        type: 'GDPR',
        jurisdiction: 'EU',
        industry: 'General',
        website: 'https://edpb.europa.eu',
        isActive: true
      }
    })
  ]);

  // Create sample monitoring logs
  for (const vendor of vendors) {
    await prisma.monitoringLog.create({
      data: {
        source: 'vendor_status',
        sourceId: vendor.id,
        status: 'success',
        message: 'All systems operational',
        responseTime: Math.floor(Math.random() * 500) + 100,
        metadata: {
          vendorName: vendor.name,
          performance: 'good',
          reliability: 'high',
          availability: '99.9%'
        }
      }
    });
  }

  console.log('✅ Sample data seeded successfully!');
  console.log(`Created ${vendors.length} vendors`);
  console.log(`Created ${alerts.length} compliance alerts`);
  console.log(`Created ${regulatoryBodies.length} regulatory bodies`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
