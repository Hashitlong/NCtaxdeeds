import { drizzle } from 'drizzle-orm/mysql2';
import { properties } from './drizzle/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function check() {
  const harnett = await db.select().from(properties).where(
    and(
      eq(properties.county, 'Harnett'),
      isNotNull(properties.saleDate)
    )
  ).limit(3);
  
  harnett.forEach(p => {
    console.log(`\nAddress: ${p.address}`);
    console.log(`Sale Date: ${p.saleDate?.toLocaleDateString()}`);
    console.log(`Upset Deadline field: ${p.upsetDeadline?.toLocaleDateString() || 'NOT SET'}`);
    console.log(`Status: ${p.saleStatus}`);
    console.log(`Raw Data: ${p.rawData?.substring(0, 500)}`);
    console.log(`---`);
  });
}

check().then(() => process.exit(0));
