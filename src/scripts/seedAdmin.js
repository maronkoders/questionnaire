import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

async function seedAdmin() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questionnaire';
        await mongoose.connect(uri);
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@genosei.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            email: 'admin@genosei.com',
            password: 'genosei', // This will be hashed automatically
            isAdmin: true
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

seedAdmin(); 