import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding complete database with all sample data...')

  try {
    // Run vendor seeding
    console.log('\n📦 Seeding vendors...')
    const { default: seedVendors } = await import('./seed')
    await seedVendors()
    
    // Run regulatory bodies seeding
    console.log('\n🏛️ Seeding regulatory bodies...')
    const { default: seedRegulatory } = await import('./regulatory-seed')
    await seedRegulatory()
    
    // Run compliance alerts seeding
    console.log('\n🚨 Seeding compliance alerts...')
    const { default: seedAlerts } = await import('./alerts-seed')
    await seedAlerts()

    console.log('\n✅ Complete database seeding finished!')
    console.log('\n📊 Database Summary:')
    
    // Count records
    const vendorCount = await prisma.vendor.count()
    const regulatoryCount = await prisma.regulatoryBody.count()
    const alertCount = await prisma.complianceAlert.count()
    const monitoringLogCount = await prisma.monitoringLog.count()
    
    console.log(`   🏢 Vendors: ${vendorCount}`)
    console.log(`   🏛️ Regulatory Bodies: ${regulatoryCount}`)
    console.log(`   🚨 Compliance Alerts: ${alertCount}`)
    console.log(`   📋 Monitoring Logs: ${monitoringLogCount}`)
    
    console.log('\n🎉 Beacon Compliance Intelligence Platform is now ready with sample data!')
    
  } catch (error) {
    console.error('❌ Error during complete seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Fatal error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })