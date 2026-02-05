import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix DNS for Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

import AttendanceSession from '../models/AttendanceSession.js';

async function checkSessions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB.");

        const count = await AttendanceSession.countDocuments();
        console.log(`Total AttendanceSession records: ${count}`);

        if (count === 0) {
            console.log("⚠️ The new scalable 'AttendanceSession' collection is EMPTY.");
            console.log("   - This explains why the dashboard shows no attendance data.");
            console.log("   - The old data is still in 'attendances' collection but is not used by the new scalable system.");
            console.log("   - You need to use 'Initialize Months' in the Dashboard or 'Bulk Generate' to create new session records.");
        } else {
            console.log("✅ Found session records. Fetching sample...");
            const sample = await AttendanceSession.findOne();
            console.log(JSON.stringify(sample, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkSessions();
