import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the same directory as this script
dotenv.config({ path: path.join(__dirname, '.env') });

const checkConnection = async () => {
  console.log('🔄 Attempting to connect to MongoDB...');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is missing in .env file');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connection Successful!');
    
    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    const buildInfo = await admin.buildInfo();
    console.log(`ℹ️  MongoDB Version: ${buildInfo.version}`);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Collections found:');
    if (collections.length === 0) {
      console.log('   (No collections found yet - this is normal for a new DB)');
    } else {
      collections.forEach(col => console.log(`   - ${col.name}`));
    }

    console.log('✨ Database verification complete.');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkConnection();
