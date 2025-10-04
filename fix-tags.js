const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTags() {
  try {
    console.log('🔧 Fixing tags format in database...');
    
    // Get all alerts with tags
    const alerts = await prisma.complianceAlert.findMany({
      where: {
        tags: {
          not: null
        }
      }
    });
    
    console.log(`Found ${alerts.length} alerts with tags`);
    
    for (const alert of alerts) {
      try {
        let tags = alert.tags;
        
        // If tags is already a string, try to parse it
        if (typeof tags === 'string') {
          try {
            JSON.parse(tags);
            console.log(`Alert "${alert.title}" already has properly formatted tags`);
            continue;
          } catch (e) {
            // If it's not valid JSON, wrap it in an array
            tags = JSON.stringify([tags]);
          }
        } else if (Array.isArray(tags)) {
          // If it's an array, stringify it
          tags = JSON.stringify(tags);
        } else {
          // If it's something else, make it an empty array
          tags = JSON.stringify([]);
        }
        
        // Update the alert
        await prisma.complianceAlert.update({
          where: { id: alert.id },
          data: { tags }
        });
        
        console.log(`Fixed tags for: "${alert.title}"`);
        
      } catch (error) {
        console.error(`Error fixing tags for alert ${alert.id}:`, error);
      }
    }
    
    console.log('✅ Finished fixing tags');
    
  } catch (error) {
    console.error('❌ Error fixing tags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTags();
