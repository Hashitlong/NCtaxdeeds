import { drizzle } from 'drizzle-orm/mysql2';
import { properties } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

// Check if these specific properties exist with these IDs
const prop1 = await db.select().from(properties).where(eq(properties.id, 390706)).limit(1);
const prop2 = await db.select().from(properties).where(eq(properties.id, 390719)).limit(1);
const prop3 = await db.select().from(properties).where(eq(properties.id, 390988)).limit(1);

console.log('Property ID 390706 (237 Ervin Ln):');
console.log(prop1[0] ? `Found! Address: ${prop1[0].address}, Parcel: ${prop1[0].parcelId}` : 'NOT FOUND');

console.log('\nProperty ID 390719 (Flem Osborne):');
console.log(prop2[0] ? `Found! Address: ${prop2[0].address}, Parcel: ${prop2[0].parcelId}` : 'NOT FOUND');

console.log('\nProperty ID 390988 (546 Woodlawn):');
console.log(prop3[0] ? `Found! Address: ${prop3[0].address}, Parcel: ${prop3[0].parcelId}` : 'NOT FOUND');

// Now check what the properties.list query returns (first 20)
const allProps = await db.select().from(properties).limit(20);
console.log('\n\nFirst 20 properties from properties table:');
allProps.forEach((p, idx) => {
  console.log(`${idx + 1}. ID: ${p.id}, Address: ${p.address}, Parcel: ${p.parcelId}`);
});

process.exit(0);
