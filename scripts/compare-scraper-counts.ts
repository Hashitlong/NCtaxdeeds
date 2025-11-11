import { getDb } from "../server/db";
import { properties } from "../drizzle/schema";
import { sql, count } from "drizzle-orm";

async function compareScraperCounts() {
  console.log("============================================================");
  console.log("Comparing Scraper Counts: Current vs Manus.ai");
  console.log("============================================================\n");

  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  // Get counts by county
  const countsByCounty = await db
    .select({
      county: properties.county,
      count: count(),
    })
    .from(properties)
    .groupBy(properties.county)
    .orderBy(properties.county);

  console.log("Current Property Counts by County:");
  console.log("-----------------------------------");
  
  let total = 0;
  for (const row of countsByCounty) {
    console.log(`${row.county}: ${row.count}`);
    total += row.count;
  }
  
  console.log("-----------------------------------");
  console.log(`TOTAL: ${total}`);
  console.log("\n");

  // Get counts by scraper (using county as proxy since source doesn't exist)
  console.log("Current Property Counts by County (Scraper):");
  console.log("-----------------------------------");
  
  for (const row of countsByCounty) {
    console.log(`${row.county}: ${row.count}`);
  }
  
  console.log("\n");

  // Manus.ai reference counts (from previous successful scrape)
  const manusReference = {
    "Alamance": 8,
    "Anson": 9,
    "Bladen": 8,
    "Cabarrus": 8,
    "Catawba": 8,
    "Cumberland": 2,
    "Edgecombe": 21,
    "Forsyth": 8,
    "Gaston": 8,
    "Hoke": 13,
    "Hutchens (Multi-county)": 196,
    "Kania (Multi-county)": 408,
    "McDowell": 3,
    "RBCWB (Multi-county)": 8,
    "Rutherford": 8,
    "Wake": 8,
    "Wayne": 3,
    "Yadkin": 3,
    "ZLS (Multi-county)": 33,
  };

  console.log("Comparison with Manus.ai Reference:");
  console.log("-----------------------------------");
  
  const currentByCounty = Object.fromEntries(
    countsByCounty.map((row: any) => [row.county, row.count])
  );

  let totalDiff = 0;
  for (const [county, manusCount] of Object.entries(manusReference)) {
    const currentCount = currentByCounty[county] || 0;
    const diff = currentCount - manusCount;
    const status = diff === 0 ? "✓" : diff > 0 ? "+" : "-";
    
    console.log(`${county}:`);
    console.log(`  Manus: ${manusCount}, Current: ${currentCount}, Diff: ${diff} ${status}`);
    
    totalDiff += Math.abs(diff);
  }

  console.log("\n");
  console.log("Summary:");
  console.log("-----------------------------------");
  console.log(`Manus.ai Total: 763`);
  console.log(`Current Total: ${total}`);
  console.log(`Difference: ${total - 763} (${total > 763 ? '+' : ''}${((total - 763) / 763 * 100).toFixed(1)}%)`);
  console.log(`Total Absolute Differences: ${totalDiff}`);
  
  process.exit(0);
}

compareScraperCounts().catch(console.error);