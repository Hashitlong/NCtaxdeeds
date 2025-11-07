import { drizzle } from 'drizzle-orm/mysql2';
import { properties } from './drizzle/schema';
import { eq, and, or, gt, isNull } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function checkUpsetStatus() {
  const now = new Date();
  
  // Find properties with upset period status
  const upsetProperties = await db.select().from(properties).where(
    eq(properties.saleStatus, 'in_upset_period')
  );
  
  console.log(`\nTotal properties with 'in_upset_period' status: ${upsetProperties.length}\n`);
  
  // Check for issues
  let noSaleDate = 0;
  let futureSaleDate = 0;
  let noUpsetDeadline = 0;
  let expiredUpsetDeadline = 0;
  let valid = 0;
  
  upsetProperties.forEach(prop => {
    if (!prop.saleDate) {
      noSaleDate++;
      console.log(`❌ No sale date: ${prop.county} - ${prop.address}`);
    } else if (prop.saleDate > now) {
      futureSaleDate++;
      console.log(`❌ Future sale (${prop.saleDate.toLocaleDateString()}): ${prop.county} - ${prop.address}`);
    } else if (!prop.upsetDeadline) {
      noUpsetDeadline++;
      console.log(`⚠️  No upset deadline: ${prop.county} - ${prop.address}`);
    } else if (prop.upsetDeadline < now) {
      expiredUpsetDeadline++;
      console.log(`❌ Expired deadline (${prop.upsetDeadline.toLocaleDateString()}): ${prop.county} - ${prop.address}`);
    } else {
      valid++;
      console.log(`✅ Valid (deadline ${prop.upsetDeadline.toLocaleDateString()}): ${prop.county} - ${prop.address}`);
    }
  });
  
  console.log(`\n=== Summary ===`);
  console.log(`No sale date: ${noSaleDate}`);
  console.log(`Future sale date: ${futureSaleDate}`);
  console.log(`No upset deadline: ${noUpsetDeadline}`);
  console.log(`Expired upset deadline: ${expiredUpsetDeadline}`);
  console.log(`Valid upset period: ${valid}`);
}

checkUpsetStatus().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
