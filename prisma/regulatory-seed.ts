import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with sample regulatory bodies...')

  // Clear existing regulatory bodies
  await prisma.regulatoryBody.deleteMany()
  console.log('Cleared existing regulatory bodies')

  // Sample regulatory bodies data
  const regulatoryBodies = [
    {
      name: 'Securities and Exchange Commission',
      type: 'SEC',
      jurisdiction: 'US',
      industry: 'Financial',
      website: 'https://www.sec.gov/',
      rssFeed: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent',
      apiEndpoint: 'https://data.sec.gov/api/xbrl/',
      isActive: true,
      monitoring: {
        checkInterval: 3600000, // 1 hour
        focusAreas: ['enforcement', 'rulemaking', 'examinations'],
        alerts: ['critical', 'high', 'medium']
      }
    },
    {
      name: 'Financial Industry Regulatory Authority',
      type: 'FINRA',
      jurisdiction: 'US',
      industry: 'Financial',
      website: 'https://www.finra.org/',
      rssFeed: 'https://www.finra.org/rules-guidance/notices/rss',
      apiEndpoint: 'https://api.finra.org/',
      isActive: true,
      monitoring: {
        checkInterval: 3600000,
        focusAreas: ['regulatory-notices', 'enforcement', 'rule-changes'],
        alerts: ['critical', 'high', 'medium']
      }
    },
    {
      name: 'European Data Protection Board',
      type: 'GDPR',
      jurisdiction: 'EU',
      industry: 'General',
      website: 'https://edpb.europa.eu/',
      rssFeed: 'https://edpb.europa.eu/news/rss.xml',
      isActive: true,
      monitoring: {
        checkInterval: 7200000, // 2 hours
        focusAreas: ['guidelines', 'decisions', 'opinions'],
        alerts: ['critical', 'high', 'medium']
      }
    },
    {
      name: 'California Consumer Privacy Act',
      type: 'CCPA',
      jurisdiction: 'California',
      industry: 'General',
      website: 'https://oag.ca.gov/privacy/ccpa',
      rssFeed: 'https://oag.ca.gov/privacy/ccpa/news',
      isActive: true,
      monitoring: {
        checkInterval: 7200000,
        focusAreas: ['regulations', 'enforcement', 'guidance'],
        alerts: ['high', 'medium']
      }
    },
    {
      name: 'Consumer Financial Protection Bureau',
      type: 'CFPB',
      jurisdiction: 'US',
      industry: 'Financial',
      website: 'https://www.consumerfinance.gov/',
      rssFeed: 'https://www.consumerfinance.gov/about-us/newsroom/',
      isActive: true,
      monitoring: {
        checkInterval: 3600000,
        focusAreas: ['rulemaking', 'enforcement', 'supervision'],
        alerts: ['critical', 'high', 'medium']
      }
    },
    {
      name: 'Office of the Comptroller of the Currency',
      type: 'OCC',
      jurisdiction: 'US',
      industry: 'Financial',
      website: 'https://www.occ.gov/',
      rssFeed: 'https://www.occ.gov/news-issuances/',
      isActive: true,
      monitoring: {
        checkInterval: 3600000,
        focusAreas: ['bulletins', 'rules', 'enforcement'],
        alerts: ['high', 'medium']
      }
    },
    {
      name: 'Federal Deposit Insurance Corporation',
      type: 'FDIC',
      jurisdiction: 'US',
      industry: 'Financial',
      website: 'https://www.fdic.gov/',
      rssFeed: 'https://www.fdic.gov/news/news/press/',
      isActive: true,
      monitoring: {
        checkInterval: 3600000,
        focusAreas: ['financial-institution-letters', 'rules', 'enforcement'],
        alerts: ['high', 'medium']
      }
    },
    {
      name: 'Financial Conduct Authority',
      type: 'FCA',
      jurisdiction: 'UK',
      industry: 'Financial',
      website: 'https://www.fca.org.uk/',
      rssFeed: 'https://www.fca.org.uk/news/rss',
      isActive: true,
      monitoring: {
        checkInterval: 3600000,
        focusAreas: ['policy', 'supervision', 'enforcement'],
        alerts: ['critical', 'high', 'medium']
      }
    },
    {
      name: 'Monetary Authority of Singapore',
      type: 'MAS',
      jurisdiction: 'Singapore',
      industry: 'Financial',
      website: 'https://www.mas.gov.sg/',
      rssFeed: 'https://www.mas.gov.sg/news',
      isActive: true,
      monitoring: {
        checkInterval: 7200000,
        focusAreas: ['regulations', 'guidelines', 'enforcement'],
        alerts: ['high', 'medium']
      }
    },
    {
      name: 'Australian Securities and Investments Commission',
      type: 'ASIC',
      jurisdiction: 'Australia',
      industry: 'Financial',
      website: 'https://asic.gov.au/',
      rssFeed: 'https://asic.gov.au/about-asic/news-centre/',
      isActive: true,
      monitoring: {
        checkInterval: 7200000,
        focusAreas: ['regulatory-guides', 'enforcement', 'reports'],
        alerts: ['high', 'medium']
      }
    }
  ]

  // Insert regulatory bodies
  for (const body of regulatoryBodies) {
    await prisma.regulatoryBody.create({
      data: {
        name: body.name,
        type: body.type,
        jurisdiction: body.jurisdiction,
        industry: body.industry,
        website: body.website,
        rssFeed: body.rssFeed,
        apiEndpoint: body.apiEndpoint,
        isActive: body.isActive,
        monitoring: body.monitoring ? JSON.stringify(body.monitoring) : null
      }
    })
  }

  console.log(`Successfully seeded ${regulatoryBodies.length} regulatory bodies`)

  // Add some sample monitoring logs for regulatory bodies
  const sampleBodies = await prisma.regulatoryBody.findMany({ take: 5 })
  
  for (const body of sampleBodies) {
    await prisma.monitoringLog.create({
      data: {
        source: 'regulatory_body',
        sourceId: body.id,
        status: 'success',
        responseTime: Math.floor(Math.random() * 2000) + 200,
        metadata: JSON.stringify({
          bodyName: body.name,
          checkType: 'rss_feed',
          result: 'no_changes'
        })
      }
    })
  }

  console.log('Added sample regulatory monitoring logs')
  console.log('Regulatory bodies seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding regulatory bodies:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })