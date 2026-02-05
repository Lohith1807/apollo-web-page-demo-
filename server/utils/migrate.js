import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Models
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import ExamResult from '../models/ExamResult.js';
import ExamConfig from '../models/ExamConfig.js';
import Announcement from '../models/Announcement.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });
console.log('Using MongoDB URI:', process.env.MONGODB_URI ? 'URI found' : 'URI NOT FOUND');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apollo_db');
        console.log('Connected to MongoDB for migration...');

        // 1. Migrate Users
        console.log('Migrating Users...');
        const usersJSON = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'users.json'), 'utf8'));

        // Admins
        for (const email in usersJSON.admins) {
            try {
                let user = await User.findOne({ email });
                if (!user) {
                    user = new User({ ...usersJSON.admins[email], email });
                } else {
                    user.set(usersJSON.admins[email]);
                }
                await user.save();
            } catch (err) {
                console.error(`Failed to migrate admin ${email}:`, err.message);
            }
        }
        // Teachers
        for (const email in usersJSON.teachers) {
            try {
                let user = await User.findOne({ email });
                if (!user) {
                    user = new User({ ...usersJSON.teachers[email], email });
                } else {
                    user.set(usersJSON.teachers[email]);
                }
                await user.save();
            } catch (err) {
                console.error(`Failed to migrate teacher ${email}:`, err.message);
            }
        }
        // COE
        if (usersJSON.coe) {
            for (const email in usersJSON.coe) {
                try {
                    let user = await User.findOne({ email });
                    if (!user) {
                        user = new User({ ...usersJSON.coe[email], email });
                    } else {
                        user.set(usersJSON.coe[email]);
                    }
                    await user.save();
                } catch (err) {
                    console.error(`Failed to migrate coe ${email}:`, err.message);
                }
            }
        }
        // Students
        if (usersJSON.batches) {
            for (const batch in usersJSON.batches) {
                for (const branch in usersJSON.batches[batch]) {
                    for (const specOrSec in usersJSON.batches[batch][branch]) {
                        const content = usersJSON.batches[batch][branch][specOrSec];
                        if (Array.isArray(content)) {
                            for (const s of content) {
                                if (!s.email) continue;
                                try {
                                    let userData = { ...s, batch, specialization: specOrSec, role: 'student' };
                                    if (s.personalInfo) {
                                        userData = { ...userData, ...s.personalInfo };
                                    }
                                    let user = await User.findOne({ email: s.email });
                                    if (!user) {
                                        user = new User(userData);
                                    } else {
                                        user.set(userData);
                                    }
                                    await user.save();
                                } catch (err) {
                                    console.error(`Failed to migrate student ${s.email}:`, err.message);
                                }
                            }
                        } else {
                            for (const sec in content) {
                                if (!Array.isArray(content[sec])) continue;
                                for (const s of content[sec]) {
                                    if (!s.email) continue;
                                    try {
                                        let userData = { ...s, batch, specialization: specOrSec, section: sec, role: 'student' };
                                        if (s.personalInfo) {
                                            userData = { ...userData, ...s.personalInfo };
                                        }
                                        let user = await User.findOne({ email: s.email });
                                        if (!user) {
                                            user = new User(userData);
                                        } else {
                                            user.set(userData);
                                        }
                                        await user.save();
                                    } catch (err) {
                                        console.error(`Failed to migrate student ${s.email} (${sec}):`, err.message);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Migrate Pending Registrations
        console.log('Migrating Pending Registrations...');
        const pendingJSON = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'pending_registrations.json'), 'utf8'));
        for (const s of pendingJSON) {
            await User.findOneAndUpdate({ email: s.email }, { ...s, role: 'pending', status: 'pending' }, { upsert: true });
        }

        // 3. Migrate Attendance (Disabled - new hierarchical structure active)
        /*
        console.log('Migrating Attendance...');
        const attendanceJSON = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'attendance.json'), 'utf8'));
        for (const email in attendanceJSON) {
            for (const record of attendanceJSON[email]) {
                await Attendance.findOneAndUpdate(
                    { email, date: record.date, subject: record.subject },
                    { ...record, email },
                    { upsert: true }
                );
            }
        }
        */


        // 4. Migrate Exam Results
        console.log('Migrating Exam Results...');
        const resultsJSON = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'exam_results.json'), 'utf8'));
        for (const email in resultsJSON) {
            for (const res of resultsJSON[email]) {
                await ExamResult.findOneAndUpdate(
                    { email, course: res.course },
                    { ...res, email },
                    { upsert: true }
                );
            }
        }

        // 5. Migrate Exam Config
        console.log('Migrating Exam Config...');
        const configJSON = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'exam_config.json'), 'utf8'));
        for (const batch in configJSON) {
            for (const sem in configJSON[batch]) {
                await ExamConfig.findOneAndUpdate(
                    { batch, semester: sem },
                    { batch, semester: sem, published: configJSON[batch][sem].published },
                    { upsert: true }
                );
            }
        }

        // 6. Migrate Announcements
        console.log('Migrating Announcements...');
        try {
            const announcementsJSON = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'announcements.json'), 'utf8'));
            for (const ann of announcementsJSON) {
                await Announcement.findOneAndUpdate(
                    { title: ann.title, content: ann.content },
                    { ...ann },
                    { upsert: true }
                );
            }
        } catch (e) {
            console.log('No announcements found to migrate.');
        }

        // 7. Migrate Subjects
        console.log('Migrating Subjects...');
        try {
            const subjectsJSON = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'subjects.json'), 'utf8'));
            const subjectOperations = [];
            for (const branch in subjectsJSON) {
                for (const specialization in subjectsJSON[branch]) {
                    for (const semester in subjectsJSON[branch][specialization]) {
                        const data = subjectsJSON[branch][specialization][semester];
                        subjectOperations.push({
                            updateOne: {
                                filter: { branch, specialization, semester },
                                update: {
                                    $set: {
                                        theory: data.theory || [],
                                        labs: data.labs || [],
                                        updatedAt: new Date()
                                    }
                                },
                                upsert: true
                            }
                        });
                    }
                }
            }
            if (subjectOperations.length > 0) {
                await Subject.bulkWrite(subjectOperations);
            }
        } catch (e) {
            console.log('No subjects found to migrate.');
        }


        // 8. Migrate Exams
        console.log('Migrating Exams...');
        try {
            const examsJSON = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'exams.json'), 'utf8'));
            if (Array.isArray(examsJSON)) {
                for (const exam of examsJSON) {
                    await Exam.findOneAndUpdate(
                        { id: exam.id },
                        { ...exam },
                        { upsert: true }
                    );
                }
            }
        } catch (e) {
            console.log('No exams found to migrate.');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.stack || err);
        process.exit(1);
    }
}

migrate();
