import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import dns from 'dns';
import Subject from '../models/Subject.js';

// Fix for Atlas SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrateSubjects() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in .env file');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected successfully!');

        const subjectsPath = path.join(__dirname, '../data/subjects.json');
        console.log(`Reading subjects from ${subjectsPath}...`);
        const subjectsData = JSON.parse(await fs.readFile(subjectsPath, 'utf8'));

        console.log('Clearing existing subjects in DB...');
        await Subject.deleteMany({});

        const operations = [];

        for (const branch in subjectsData) {
            for (const specialization in subjectsData[branch]) {
                for (const semester in subjectsData[branch][specialization]) {
                    const data = subjectsData[branch][specialization][semester];
                    operations.push({
                        branch,
                        specialization,
                        semester,
                        theory: data.theory || [],
                        labs: data.labs || [],
                        updatedAt: new Date()
                    });
                }
            }
        }

        console.log(`Inserting ${operations.length} subject documents...`);
        if (operations.length > 0) {
            await Subject.insertMany(operations);
        }

        console.log('✅ Subjects migrated successfully to granular documents!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}

migrateSubjects();
