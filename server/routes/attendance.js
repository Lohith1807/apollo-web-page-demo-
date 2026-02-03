import express from 'express';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// Get personal attendance
router.get('/:email', async (req, res) => {
    try {
        const records = await Attendance.find({ email: req.params.email }).sort({ date: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Add single attendance record
router.post('/', async (req, res) => {
    try {
        const newRecord = new Attendance(req.body);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add attendance', error: error.message });
    }
});

// Get Attendance for a specific Batch/Subject/Date
router.post('/batch-view', async (req, res) => {
    const { date, subject, students } = req.body;
    try {
        const records = await Attendance.find({
            subject,
            email: { $in: students },
            // Date matching using regex to handle potential time suffixes in existing data
            date: { $regex: date }
        });

        const statusMap = {};
        students.forEach(email => {
            const rec = records.find(r => r.email === email);
            statusMap[email] = rec ? rec.status : 'Not Marked';
        });

        res.json(statusMap);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed', error: error.message });
    }
});

// Update single attendance record
router.put('/', async (req, res) => {
    const { email, originalRecord, updatedRecord } = req.body;
    try {
        const result = await Attendance.findOneAndUpdate(
            { email, date: originalRecord.date, subject: originalRecord.subject },
            { ...updatedRecord, markedAt: new Date() },
            { new: true, upsert: true }
        );
        res.json({ message: 'Attendance updated', record: result });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Bulk initialize attendance (Mock/Demo feature)
router.post('/bulk', async (req, res) => {
    const { email, months, subjects } = req.body;
    try {
        const year = new Date().getFullYear();
        const newRecords = [];

        months.forEach(monthIndex => {
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, monthIndex, day);
                if (date.getDay() !== 0 && date.getDay() !== 6) {
                    const dateStr = date.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    });
                    subjects.forEach(sub => {
                        newRecords.push({
                            email,
                            date: `${dateStr} 09:00 AM`,
                            status: 'Not Marked',
                            subject: sub
                        });
                    });
                }
            }
        });

        // Use bulkWrite with upsert to avoid duplicates
        const ops = newRecords.map(rec => ({
            updateOne: {
                filter: { email: rec.email, date: rec.date, subject: rec.subject },
                update: { $setOnInsert: rec },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(ops);
        const finalRecords = await Attendance.find({ email }).sort({ date: -1 });
        res.json({ message: 'Bulk generation completed', records: finalRecords });
    } catch (error) {
        res.status(500).json({ message: 'Bulk generation failed', error: error.message });
    }
});

// Batch Update for Class Attendance
router.post('/batch-update', async (req, res) => {
    const { date, subject, students } = req.body;
    try {
        const ops = students.map(({ email, status }) => ({
            updateOne: {
                filter: { email, subject, date: { $regex: date } },
                update: {
                    $set: { status, markedAt: new Date() },
                    $setOnInsert: { date: `${date} 09:00 AM` } // Only used if creating new
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(ops);
        res.json({ message: 'Class attendance updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Batch update failed', error: error.message });
    }
});

export default router;
