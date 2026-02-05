import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import bcrypt from 'bcryptjs';

// Fix DNS for Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/User.js';

async function diagnose() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI.split('@')[1]); // Hide creds
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        const email = 'student@apollo.edu';
        console.log(`Searching for user: ${email} in 'users' collection...`);

        // Check if collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        const userColl = collections.find(c => c.name === 'users');
        if (!userColl) {
            console.error("❌ 'users' collection does not exist in 'apollo_db'!");
            process.exit(1);
        }
        console.log("✅ 'users' collection exists.");

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            console.error("❌ User NOT FOUND.");
            console.log("Listing first 5 users found in DB to check structure:");
            const allUsers = await User.find().limit(5);
            console.log(allUsers.map(u => ({ email: u.email, role: u.role })));
        } else {
            console.log("✅ User FOUND:");
            console.log(`   ID: ${user._id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password Hash (First 10 chars): ${user.password.substring(0, 10)}...`);

            // Test Password
            const testPass = 'Test@123';
            const isMatch = await bcrypt.compare(testPass, user.password);
            console.log(`\nTesting password '${testPass}':`);
            if (isMatch) {
                console.log("✅ bcrypt.compare returned TRUE. Login SHOULD work.");
            } else {
                console.error("❌ bcrypt.compare returned FALSE.");
                console.log("Possible causes:");
                console.log("1. Password in DB is plain text (not hashed).");
                console.log("2. Password in DB is hashed with different secret/salt.");
                console.log("3. Input password is wrong.");

                // Check if it's plain text
                if (user.password === testPass) {
                    console.error("⚠️ CRITICAL: Password is stored as PLAIN TEXT. Please run fix_login.js again.");
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Diagnosis failed:", error);
        process.exit(1);
    }
}

diagnose();
