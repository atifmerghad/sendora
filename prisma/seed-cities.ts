import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CityData {
  id: number;
  zone_id?: number;
  ville: string;
  name?: string;
  arabic_name?: string;
  price: string; // "45 DH"
  delais?: string;
  region?: string;
  refused_cost?: string; // "0 DH"
  canceled_cost?: string; // "0 DH"
  price_driver?: number;
  refused_cost_driver?: string; // "0.00"
  active?: string; // "Oui" or "Non"
  driver_id?: string;
  picker_id?: string;
  note?: string;
  comment?: string;
  pickup_district?: string; // "Oui" or "Non"
  min_pickup?: number;
  fee_pickup?: string; // "10.00"
  fee_pickup_driver?: string; // "0.00"
  min_pickup_required?: number;
  pickup_end_time?: string;
  allow_new_destination?: string; // "Oui" or "Non"
  delivery_days?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Helper function to extract numeric value from price strings like "45 DH" or "0 DH"
function extractPrice(priceString: string | undefined): number {
  if (!priceString) return 0;
  const match = priceString.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper function to parse date string to DateTime
function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString || dateString === 'null') return null;
  try {
    // Handle formats like "05/11/2025" or ISO strings
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(dateString);
  } catch {
    return null;
  }
}

async function main() {
  console.log('Starting city data import...');

  // Read the cities JSON file
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '../data/cities_api.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  
  // Handle the JSON structure - array of objects, each with a "data" array
  let allCities: CityData[] = [];
  if (Array.isArray(jsonData)) {
    // If it's an array, check if items are cities directly or wrapper objects
    for (const item of jsonData) {
      if (item.data && Array.isArray(item.data)) {
        // Item is a wrapper object with a data array
        allCities = allCities.concat(item.data);
      } else if (item.id && item.ville) {
        // Item is a city directly
        allCities.push(item);
      }
    }
  } else if (jsonData.data && Array.isArray(jsonData.data)) {
    // If it's a single object with a data array
    allCities = jsonData.data;
  }

  console.log(`Found ${allCities.length} cities to import`);

  // Clear existing cities
  await prisma.city.deleteMany({});
  console.log('Cleared existing cities');

  // Process and insert cities
  let imported = 0;
  let skipped = 0;
  const seenIds = new Set<number>();

  for (const city of allCities) {
    // Skip duplicates based on id
    if (seenIds.has(city.id)) {
      skipped++;
      continue;
    }
    seenIds.add(city.id);
    try {
      // Skip if deleted
      if (city.deleted_at) {
        skipped++;
        continue;
      }

      await prisma.city.create({
        data: {
          id: city.id,
          zoneId: city.zone_id || null,
          ville: city.ville,
          name: city.name || null,
          arabicName: city.arabic_name || null,
          price: extractPrice(city.price),
          delais: city.delais || null,
          region: city.region || null,
          refusedCost: extractPrice(city.refused_cost),
          canceledCost: extractPrice(city.canceled_cost),
          priceDriver: city.price_driver || null,
          refusedCostDriver: parseFloat(city.refused_cost_driver || '0'),
          active: city.active || null,
          driverId: city.driver_id || null,
          pickerId: city.picker_id || null,
          note: city.note || null,
          comment: city.comment || null,
          pickupDistrict: city.pickup_district || null,
          minPickup: city.min_pickup || 0,
          feePickup: parseFloat(city.fee_pickup || '0'),
          feePickupDriver: parseFloat(city.fee_pickup_driver || '0'),
          minPickupRequired: city.min_pickup_required || 0,
          pickupEndTime: city.pickup_end_time || null,
          allowNewDestination: city.allow_new_destination || null,
          deliveryDays: city.delivery_days || null,
          createdAt: city.created_at || null,
          updatedAt: parseDate(city.updated_at),
          deletedAt: parseDate(city.deleted_at),
        },
      });

      imported++;
      if (imported % 100 === 0) {
        console.log(`Imported ${imported} cities...`);
      }
    } catch (error) {
      console.error(`Error importing city ${city.id} (${city.ville}):`, error);
      skipped++;
    }
  }

  console.log(`\nImport completed!`);
  console.log(`✅ Imported: ${imported} cities`);
  console.log(`⏭️  Skipped: ${skipped} cities`);
}

main()
  .catch((e) => {
    console.error('Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

