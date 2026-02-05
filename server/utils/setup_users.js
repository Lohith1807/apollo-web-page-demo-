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

async function setup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to Database.");

        const users = [
            {
                name: "Lohith Admin",
                email: "lohith@apollo.edu",
                role: "admin",
                status: "approved"
            },
            {
                name: "Lohith Student",
                email: "lohith.student@apollo.edu",
                role: "student",
                status: "approved",
                batch: "2024-2028",
                branch: "CSE",
                specialization: "AI&DS"
            }
        ];

        console.log("\nCreating Personal Accounts in Database...");

        for (const u of users) {
            // Delete existing to start fresh
            await User.deleteOne({ email: u.email });

            const newUser = new User({
                ...u,
                password: "Apollo123", // Will be hashed by pre-save hook
            });

            await newUser.save();
            console.log(`✅ Created ${u.role.toUpperCase()}: ${u.email} (Pass: Apollo123)`);
        }

        console.log("\nDone! You can now login with these credentials.");
        process.exit(0);
    } catch (e) {
        console.error("Error creating users:", e);
        process.exit(1);
    }
}

setup();
