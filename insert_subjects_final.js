import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Define the schema inline to avoid import issues if paths are tricky
const subjectSchema = new mongoose.Schema({
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
});

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server/.env') });

async function insertSubjects() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in .env file');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected successfully!');

        const subjectsPath = path.join(__dirname, 'server/data/subjects.json');
        console.log(`Reading subjects from ${subjectsPath}...`);
        const subjectsData = JSON.parse(await fs.readFile(subjectsPath, 'utf8'));

        console.log('Updating subjects in database...');
        // We use findOneAndUpdate with upsert to replace the single catalog document
        await Subject.findOneAndUpdate(
            {},
            { data: subjectsData, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        console.log('✅ Subjects inserted/updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

insertSubjects();
