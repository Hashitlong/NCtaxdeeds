import { drizzle } from 'drizzle-orm/mysql2';
import { properties } from './drizzle/schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function check() {
  const harnett = await db.select().from(properties).where(
    eq(properties.county, 'Harnett')
  );
  
  console.log(`\nTotal Harnett properties: ${harnett.length}\n`);
  
  // Group by source
  const bySource: Record<string, number> = {};
  harnett.forEach(p => {
    const src = p.source || 'unknown';
    bySource[src] = (bySource[src] || 0) + 1;
  });
  
  console.log('By source:');
  Object.entries(bySource).forEach(([src, count]) => {
    console.log(`  ${src}: ${count} properties`);
  });
  
  // Show one example from each source
  console.log('\nExamples:');
  Object.keys(bySource).forEach(src => {
    const example = harnett.find(p => (p.source || 'unknown') === src);
    if (example) {
      console.log(`\n${src}:`);
      console.log(`  Address: ${example.address}`);
      console.log(`  Sale Date: ${example.saleDate?.toLocaleDateString()}`);
      console.log(`  Upset Deadline: ${example.upsetDeadline?.toLocaleDateString() || 'NOT SET'}`);
      console.log(`  Status: ${example.saleStatus}`);
    }
  });
}

check().then(() => process.exit(0));
