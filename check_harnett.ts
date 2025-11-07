import { drizzle } from 'drizzle-orm/mysql2';
import { properties } from './drizzle/schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function checkHarnett() {
  const harnettProps = await db.select().from(properties).where(
    eq(properties.county, 'Harnett')
  ).limit(10);
  
  console.log(`Found ${harnettProps.length} Harnett County properties\n`);
  
  harnettProps.forEach(prop => {
    console.log(`Address: ${prop.address}`);
    console.log(`Sale Date: ${prop.saleDate?.toLocaleDateString()}`);
    console.log(`Upset Deadline: ${prop.upsetDeadline?.toLocaleDateString() || 'NOT SET'}`);
    console.log(`Status: ${prop.saleStatus}`);
    console.log(`Source: ${prop.source}`);
    console.log(`---`);
  });
}

checkHarnett().then(() => process.exit(0));
