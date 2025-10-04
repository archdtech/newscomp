const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database for compliance alerts...');
    
    // Count all compliance alerts
    const totalAlerts = await prisma.complianceAlert.count();
    console.log(`Total compliance alerts: ${totalAlerts}`);
    
    // Get recent alerts
    const recentAlerts = await prisma.complianceAlert.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        source: true,
        category: true,
        riskLevel: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Recent alerts:');
    recentAlerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.title}`);
      console.log(`   Source: ${alert.source}`);
      console.log(`   Category: ${alert.category}`);
      console.log(`   Risk: ${alert.riskLevel}`);
      console.log(`   Status: ${alert.status}`);
      console.log(`   Created: ${alert.createdAt}`);
      console.log('');
    });
    
    // Check monitoring logs
    const monitoringLogs = await prisma.monitoringLog.findMany({
      where: {
        source: 'news_scraper'
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📊 News scraper logs:');
    monitoringLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.status}: ${log.message}`);
      console.log(`   Created: ${log.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
