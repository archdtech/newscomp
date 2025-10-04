import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with sample vendor data...')

  // Clear existing vendors
  await prisma.vendor.deleteMany()
  console.log('Cleared existing vendors')

  // Sample vendors data
  const vendors = [
    {
      name: 'Amazon Web Services',
      category: 'Cloud Infrastructure',
      statusPage: 'https://status.aws.amazon.com/',
      criticality: 'Critical',
      isActive: true,
      monitoring: {
        checkInterval: 300000, // 5 minutes
        endpoints: ['/api/v2/events.json'],
        regions: ['us-east-1', 'us-west-2', 'eu-west-1']
      },
      contacts: {
        support: 'aws-support@amazon.com',
        emergency: 'aws-emergency@amazon.com',
        accountManager: 'aws-account-manager@amazon.com'
      }
    },
    {
      name: 'Microsoft Azure',
      category: 'Cloud Infrastructure',
      statusPage: 'https://status.azure.com/',
      criticality: 'Critical',
      isActive: true,
      monitoring: {
        checkInterval: 300000,
        endpoints: ['/api/status'],
        regions: ['East US', 'West US', 'North Europe']
      },
      contacts: {
        support: 'azure-support@microsoft.com',
        emergency: 'azure-emergency@microsoft.com'
      }
    },
    {
      name: 'Stripe',
      category: 'Payment Processing',
      statusPage: 'https://status.stripe.com/',
      criticality: 'Critical',
      isActive: true,
      monitoring: {
        checkInterval: 180000, // 3 minutes
        endpoints: ['/api/v1/status'],
        services: ['payments', 'connect', 'radar']
      },
      contacts: {
        support: 'support@stripe.com',
        emergency: 'emergency@stripe.com'
      }
    },
    {
      name: 'Plaid',
      category: 'Financial Services',
      statusPage: 'https://status.plaid.com/',
      criticality: 'High',
      isActive: true,
      monitoring: {
        checkInterval: 300000,
        endpoints: ['/v1/status'],
        services: ['api', 'dashboard', 'webhooks']
      },
      contacts: {
        support: 'support@plaid.com',
        technical: 'technical@plaid.com'
      }
    },
    {
      name: 'Google Cloud Platform',
      category: 'Cloud Infrastructure',
      statusPage: 'https://status.cloud.google.com/',
      criticality: 'Critical',
      isActive: true,
      monitoring: {
        checkInterval: 300000,
        endpoints: ['/api/v2/status'],
        regions: ['us-central1', 'europe-west1', 'asia-east1']
      },
      contacts: {
        support: 'cloud-support@google.com',
        emergency: 'cloud-emergency@google.com'
      }
    },
    {
      name: 'Twilio',
      category: 'Communication',
      statusPage: 'https://status.twilio.com/',
      criticality: 'High',
      isActive: true,
      monitoring: {
        checkInterval: 180000,
        endpoints: ['/api/v1/status'],
        services: ['sms', 'voice', 'email', 'whatsapp']
      },
      contacts: {
        support: 'support@twilio.com',
        emergency: 'emergency@twilio.com'
      }
    },
    {
      name: 'SendGrid',
      category: 'Communication',
      statusPage: 'https://status.sendgrid.com/',
      criticality: 'Medium',
      isActive: true,
      monitoring: {
        checkInterval: 300000,
        endpoints: ['/v3/status'],
        services: ['email', 'api', 'webhooks']
      },
      contacts: {
        support: 'support@sendgrid.com'
      }
    },
    {
      name: 'Datadog',
      category: 'Monitoring & Analytics',
      statusPage: 'https://status.datadoghq.com/',
      criticality: 'High',
      isActive: true,
      monitoring: {
        checkInterval: 180000,
        endpoints: ['/api/v1/status'],
        services: ['api', 'metrics', 'logs', 'traces']
      },
      contacts: {
        support: 'support@datadoghq.com',
        emergency: 'emergency@datadoghq.com'
      }
    },
    {
      name: 'GitHub',
      category: 'Development Tools',
      statusPage: 'https://www.githubstatus.com/',
      criticality: 'High',
      isActive: true,
      monitoring: {
        checkInterval: 300000,
        endpoints: ['/api/v2/status'],
        services: ['git', 'actions', 'packages', 'pages']
      },
      contacts: {
        support: 'support@github.com'
      }
    },
    {
      name: 'Slack',
      category: 'Communication',
      statusPage: 'https://status.slack.com/',
      criticality: 'Medium',
      isActive: true,
      monitoring: {
        checkInterval: 300000,
        endpoints: ['/api/v1/status'],
        services: ['messaging', 'files', 'calls', 'apps']
      },
      contacts: {
        support: 'support@slack.com'
      }
    },
    {
      name: 'Zoom',
      category: 'Communication',
      statusPage: 'https://status.zoom.us/',
      criticality: 'Medium',
      isActive: true,
      monitoring: {
        checkInterval: 300000,
        endpoints: ['/api/v1/status'],
        services: ['meetings', 'webinars', 'phone', 'chat']
      },
      contacts: {
        support: 'support@zoom.us'
      }
    },
    {
      name: 'Shopify',
      category: 'E-commerce',
      statusPage: 'https://status.shopify.com/',
      criticality: 'High',
      isActive: true,
      monitoring: {
        checkInterval: 300000,
        endpoints: ['/api/v1/status'],
        services: ['admin', 'checkout', 'api', 'themes']
      },
      contacts: {
        support: 'support@shopify.com'
      }
    }
  ]

  // Insert vendors
  for (const vendor of vendors) {
    await prisma.vendor.create({
      data: {
        name: vendor.name,
        category: vendor.category,
        statusPage: vendor.statusPage,
        criticality: vendor.criticality,
        isActive: vendor.isActive,
        monitoring: vendor.monitoring ? JSON.stringify(vendor.monitoring) : null,
        contacts: vendor.contacts ? JSON.stringify(vendor.contacts) : null
      }
    })
  }

  console.log(`Successfully seeded ${vendors.length} vendors`)

  // Add some sample monitoring logs
  const sampleVendors = await prisma.vendor.findMany({ take: 5 })
  
  for (const vendor of sampleVendors) {
    await prisma.monitoringLog.create({
      data: {
        source: 'vendor_status',
        sourceId: vendor.id,
        status: 'success',
        responseTime: Math.floor(Math.random() * 1000) + 100,
        metadata: JSON.stringify({
          vendorName: vendor.name,
          checkType: 'status_page',
          result: 'operational'
        })
      }
    })
  }

  console.log('Added sample monitoring logs')
  console.log('Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })