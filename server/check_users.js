
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const checkUsers = async () => {
  await connectDB();

  try {
    const users = await User.find({}, 'name email role guideRequestStatus');
    console.log('--- ALL USERS ---');
    console.table(users.map(u => ({
        id: u._id.toString(),
        name: u.name, 
        email: u.email, 
        role: u.role, 
        status: u.guideRequestStatus
    })));

    const pending = await User.find({ guideRequestStatus: 'pending' });
    console.log(`\nFound ${pending.length} pending requests via query.`);
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

checkUsers();
