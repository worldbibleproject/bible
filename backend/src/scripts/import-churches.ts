import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ChurchData {
  name: string;
  denomination: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

async function importChurches() {
  try {
    console.log('🏛️ Starting church import...');

    // Sample church data - replace with actual CSV import if needed
    const churches: ChurchData[] = [
      {
        name: 'First Baptist Church',
        denomination: 'Baptist',
        address: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        phone: '(555) 123-4567',
        email: 'info@firstbaptist.org',
        website: 'https://firstbaptist.org',
        description: 'A welcoming Baptist community focused on faith and fellowship.',
        latitude: 37.7749,
        longitude: -122.4194
      },
      {
        name: 'Grace Community Church',
        denomination: 'Non-Denominational',
        address: '456 Oak Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        phone: '(555) 987-6543',
        email: 'hello@gracecommunity.org',
        website: 'https://gracecommunity.org',
        description: 'Contemporary worship and community outreach.',
        latitude: 39.7817,
        longitude: -89.6501
      },
      {
        name: 'St. Mary\'s Catholic Church',
        denomination: 'Catholic',
        address: '789 Pine Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        phone: '(555) 456-7890',
        email: 'office@stmarys.org',
        website: 'https://stmarys.org',
        description: 'Traditional Catholic worship and community service.',
        latitude: 42.3601,
        longitude: -71.0589
      },
      {
        name: 'New Life Assembly',
        denomination: 'Assemblies of God',
        address: '321 Elm Street',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        phone: '(555) 321-9876',
        email: 'info@newlifeassembly.org',
        website: 'https://newlifeassembly.org',
        description: 'Pentecostal worship and spiritual growth.',
        latitude: 32.7767,
        longitude: -96.7970
      },
      {
        name: 'Community Presbyterian Church',
        denomination: 'Presbyterian',
        address: '654 Maple Drive',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        phone: '(555) 654-3210',
        email: 'office@communitypres.org',
        website: 'https://communitypres.org',
        description: 'Reformed theology and community engagement.',
        latitude: 47.6062,
        longitude: -122.3321
      }
    ];

    // Clear existing churches
    await prisma.church.deleteMany();
    console.log('🗑️ Cleared existing churches');

    // Import churches
    for (const churchData of churches) {
      await prisma.church.create({
        data: churchData
      });
      console.log(`✅ Imported: ${churchData.name}`);
    }

    console.log(`🎉 Successfully imported ${churches.length} churches!`);

  } catch (error) {
    console.error('❌ Error importing churches:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  importChurches()
    .then(() => {
      console.log('✅ Church import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Church import failed:', error);
      process.exit(1);
    });
}

export default importChurches;
