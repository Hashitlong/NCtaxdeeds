import { getDb } from '../server/db.ts';
import { properties } from '../drizzle/schema.ts';
import { eq, and, isNotNull, or } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  const results = await db.select({
    county: properties.county,
    address: properties.address,
    openingBid: properties.openingBid,
    currentBid: properties.currentBid
  }).from(properties)
    .where(and(
      eq(properties.sourceType, 'hutchens'),
      or(isNotNull(properties.openingBid), isNotNull(properties.currentBid))
    ))
    .limit(10);

  console.log('Hutchens properties with bid amounts:\n');
  results.forEach(r => {
    console.log(`${r.county} - ${r.address}`);
    if (r.openingBid) console.log(`  Opening: ${r.openingBid} cents = $${(Number(r.openingBid)/100).toFixed(2)}`);
    if (r.currentBid) console.log(`  Current: ${r.currentBid} cents = $${(Number(r.currentBid)/100).toFixed(2)}`);
    console.log('');
  });

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
