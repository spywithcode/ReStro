import { connectDB } from './src/lib/db';
import { Table } from './src/lib/models/Table';

async function migrateTables() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Finding tables without qrCodeUrl...');
    const tablesWithoutQR = await Table.find({
      $or: [
        { qrCodeUrl: { $exists: false } },
        { qrCodeUrl: '' },
        { qrCodeUrl: null }
      ]
    });

    console.log(`Found ${tablesWithoutQR.length} tables to update.`);

    if (tablesWithoutQR.length === 0) {
      console.log('No tables need migration.');
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

    for (const table of tablesWithoutQR) {
      const qrCodeUrl = `${baseUrl}/menu/${table.restaurantId}/${table.id}`;
      table.qrCodeUrl = qrCodeUrl;
      await table.save();
      console.log(`Updated table ${table.id} for restaurant ${table.restaurantId} with QR URL: ${qrCodeUrl}`);
    }

    console.log('Migration completed successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrateTables();
