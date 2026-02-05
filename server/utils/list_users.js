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

import User from '../models/User.js';

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("\n✅ Connected to Database.");
        console.log("Fetching ALL users from 'users' collection...\n");

        const users = await User.find({}, 'name email role status password'); // Fetch specific fields

        if (users.length === 0) {
            console.log("❌ No users found in the database. The collection is empty.");
        } else {
            console.log(`Found ${users.length} users:\n`);
            console.table(users.map(u => ({
                Name: u.name,
                Email: u.email,
                Role: u.role,
                Status: u.status,
                HasPassword: u.password ? "YES (Hashed)" : "NO (Missing)"
            })));

            console.log("\nℹ️ NOTE: Passwords are encrypted (hashed). You cannot see the actual password.");
            console.log("   If you cannot login, it means the password you are typing does not match the hash.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

listUsers();
