import { drizzle } from 'drizzle-orm/mysql2';
import { properties } from './drizzle/schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

async function fixUpsetStatus() {
  const now = new Date();
  
  // Get all properties with upset period status
  const upsetProperties = await db.select().from(properties).where(
    eq(properties.saleStatus, 'in_upset_period')
  );
  
  console.log(`Found ${upsetProperties.length} properties with 'in_upset_period' status\n`);
  
  let fixedFutureSale = 0;
  let fixedNoDeadline = 0;
  let fixedNoSaleDate = 0;
  let keptValid = 0;
  
  for (const prop of upsetProperties) {
    let newStatus: 'scheduled' | 'pending' | 'in_upset_period' | null = null;
    
    if (!prop.saleDate) {
      // No sale date - mark as scheduled
      newStatus = 'scheduled';
      fixedNoSaleDate++;
      console.log(`Fix: No sale date → scheduled: ${prop.county} - ${prop.address || 'N/A'}`);
    } else if (prop.saleDate > now) {
      // Future sale - mark as scheduled
      newStatus = 'scheduled';
      fixedFutureSale++;
      console.log(`Fix: Future sale (${prop.saleDate.toLocaleDateString()}) → scheduled: ${prop.county} - ${prop.address || 'N/A'}`);
    } else if (!prop.upsetDeadline) {
      // No upset deadline - mark as pending
      newStatus = 'pending';
      fixedNoDeadline++;
      console.log(`Fix: No upset deadline → pending: ${prop.county} - ${prop.address || 'N/A'}`);
    } else if (prop.upsetDeadline < now) {
      // Expired deadline - mark as sold
      newStatus = 'sold' as any;
      console.log(`Fix: Expired deadline → sold: ${prop.county} - ${prop.address || 'N/A'}`);
    } else {
      // Valid upset period - keep as is
      keptValid++;
      console.log(`Keep: Valid upset period (deadline ${prop.upsetDeadline.toLocaleDateString()}): ${prop.county} - ${prop.address || 'N/A'}`);
    }
    
    if (newStatus) {
      await db.update(properties)
        .set({ saleStatus: newStatus })
        .where(eq(properties.id, prop.id));
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Fixed - No sale date: ${fixedNoSaleDate}`);
  console.log(`Fixed - Future sale: ${fixedFutureSale}`);
  console.log(`Fixed - No deadline: ${fixedNoDeadline}`);
  console.log(`Kept valid: ${keptValid}`);
  console.log(`Total fixed: ${fixedNoSaleDate + fixedFutureSale + fixedNoDeadline}`);
}

fixUpsetStatus().then(() => {
  console.log('\n✅ Database cleanup complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
