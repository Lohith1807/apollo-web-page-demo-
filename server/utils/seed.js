import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import AttendanceSession from '../models/AttendanceSession.js';
import ExamResult from '../models/ExamResult.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanAndSeed = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        console.log('Wiping old logins and details...');
        await User.deleteMany({});
        await AttendanceSession.deleteMany({});
        await ExamResult.deleteMany({});
        console.log('Database wiped clean.');

        console.log('Creating clean restructured users...');
        const users = [
            {
                name: 'Robert Brown',
                email: 'admin@apollo.edu',
                password: 'Test@123',
                role: 'admin',
                id: 'ADM001',
                status: 'approved'
            },
            {
                name: 'Michael Miller',
                email: 'coe@apollo.edu',
                password: 'Test@123',
                role: 'coe',
                id: 'COE001',
                status: 'approved'
            },
            {
                name: 'Dr. Sarah Wilson',
                email: 'teacher@apollo.edu',
                password: 'Test@123',
                role: 'teacher',
                id: 'FAC001',
                department: 'CSE',
                assignedSubjects: [
                    { subject: 'Data Structures', batch: '2024-2028', branch: 'CSE', specialization: 'Core', semester: '1' }
                ],
                status: 'approved'
            },
            {
                name: 'K Lohith',
                email: 'student@apollo.edu',
                password: 'Test@123',
                role: 'student',
                rollNo: '122411510210',
                batch: '2024-2028',
                branch: 'CSE',
                specialization: 'Core',
                semester: '1',
                section: 'A',
                status: 'approved'
            }
        ];

        for (let i = 2; i <= 10; i++) {
            const rollNo = `1224115102${i.toString().padStart(2, '0')}`;
            users.push({
                name: `Student ${rollNo.slice(-3)}`,
                email: `${rollNo}@apollo.edu`,
                password: 'Test@123',
                role: 'student',
                rollNo: rollNo,
                batch: '2024-2028',
                branch: 'CSE',
                specialization: 'Core',
                semester: '1',
                section: 'A',
                status: 'approved'
            });
        }

        await User.create(users);
        console.log('Successfully inserted structured records!');

        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup and seeding:', error);
        process.exit(1);
    }
};

cleanAndSeed();
