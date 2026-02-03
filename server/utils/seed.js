import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: './server/.env' });

const seedData = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/apollo-portal';
        console.log('Connecting to:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const demoUsers = [
            { name: 'Admin Account', email: 'admin@apollo.edu', registrationId: 'ADM001', password: 'Test@123', role: 'admin' },
            { name: 'Dean academic', email: 'dean@apollo.edu', registrationId: 'DEA001', password: 'Test@123', role: 'dean' },
            { name: 'Senior Teacher', email: 'teacher@apollo.edu', registrationId: 'TEA001', password: 'Test@123', role: 'teacher' },
            { name: 'Example Student', email: 'student@apollo.edu', registrationId: 'STU001', password: 'Test@123', role: 'student' }
        ];

        // Add 10 specific students with roll numbers 122411510201 - 122411510210
        for (let i = 1; i <= 10; i++) {
            const rollNo = `1224115102${i.toString().padStart(2, '0')}`;
            demoUsers.push({
                name: `Student ${rollNo.slice(-3)}`,
                email: `${rollNo}@apollo.edu`,
                registrationId: rollNo,
                password: 'Test@123',
                role: 'student'
            });
        }

        await User.deleteMany({});
        await User.insertMany(demoUsers);

        console.log('Database Seeded Successfully with 10 random students (Roll Nos: 122411510201 - 122411510210)!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
