import express from 'express';
import AttendanceSession from '../models/AttendanceSession.js';
import User from '../models/User.js';

const router = express.Router();

// Helper to format YYYY-MM-DD to DD MMM YYYY for display
const formatDateForDisplay = (dateStr) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Get personal attendance: Fetch all sessions where the student is recorded
router.get('/:email', async (req, res) => {
    try {
        const email = req.params.email;
        // Find efficiently using the index on records.email
        const sessions = await AttendanceSession.find({ "records.email": email }).lean();

        const allLogs = sessions.map(session => {
            const studentRecord = session.records.find(r => r.email === email);
            return {
                _id: session._id,
                date: `${formatDateForDisplay(session.date)} ${session.startTime}`, // Match legacy format ex: "05 Oct 2024 09:00 AM"
                fullDate: session.date, // Keep original YYYY-MM-DD for reference
                status: studentRecord ? studentRecord.status : 'Not Marked',
                markedAt: studentRecord ? studentRecord.markedAt : null,
                subject: session.subject,
                specialization: session.specialization,
                batch: session.batch
            };
        });

        res.json(allLogs);
    } catch (error) {
        console.error('Fetch Personal Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Get Attendance for a specific Batch/Subject/Date
// Endpoint: /api/attendance/batch-view
router.post('/batch-view', async (req, res) => {
    let { date, subject, students, specialization, batch: batchName } = req.body;

    // Ensure date matches the "YYYY-MM-DD" format used in DB
    const searchDate = date;

    try {
        const session = await AttendanceSession.findOne({
            specialization,
            batch: batchName,
            subject,
            date: searchDate
        });

        const statusMap = {};

        // Initialize all requested students as "Not Marked"
        students.forEach(email => {
            statusMap[email] = 'Not Marked';
        });

        // Use database values if session exists
        if (session) {
            session.records.forEach(record => {
                statusMap[record.email] = record.status;
            });
        }

        res.json(statusMap);
    } catch (error) {
        console.error('Batch View Error:', error);
        res.status(500).json({ message: 'Fetch failed', error: error.message });
    }
});

// Update single attendance record
router.put('/', async (req, res) => {
    const { email, originalRecord, updatedRecord } = req.body;

    try {
        const filter = {
            specialization: originalRecord.specialization,
            batch: originalRecord.batch,
            subject: originalRecord.subject,
            "records.email": email
        };

        // If we have the exact date key from our previous fetch
        if (originalRecord.fullDate) {
            filter.date = originalRecord.fullDate;
        }

        const updateResult = await AttendanceSession.updateOne(
            filter,
            {
                $set: {
                    "records.$.status": updatedRecord.status,
                    "records.$.markedAt": new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Record not found to update.' });
        }

        res.json({ message: 'Attendance updated', record: updatedRecord });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Batch Update / Create Class Attendance
router.post('/batch-update', async (req, res) => {
    const { date, subject, students, specialization, batch: batchName } = req.body;
    // students: array of { email, status }

    try {
        // Find existing session or create specific headers
        let session = await AttendanceSession.findOne({
            specialization,
            batch: batchName,
            subject,
            date
        });

        if (!session) {
            session = new AttendanceSession({
                specialization,
                batch: batchName,
                subject,
                date,
                records: []
            });
        }

        // Create a map for O(1) updates
        const existingRecords = new Map(session.records.map(r => [r.email, r]));

        for (const { email, status } of students) {
            if (existingRecords.has(email)) {
                const rec = existingRecords.get(email);
                rec.status = status;
                rec.markedAt = new Date();
            } else {
                // Fetch name if possible, else use email
                const user = await User.findOne({ email }).select('name');
                session.records.push({
                    email,
                    name: user ? user.name : email,
                    status,
                    markedAt: new Date()
                });
            }
        }

        await session.save();
        res.json({ message: 'Class attendance updated successfully' });
    } catch (error) {
        console.error("Batch update error:", error);
        res.status(500).json({ message: 'Batch update failed', error: error.message });
    }
});

// Bulk Generation (Optional/Legacy support)
// Creates empty sessions to act as placeholders if needed, though on-demand creation is better.
router.post('/bulk', async (req, res) => {
    const { months, subjects, specialization, batch: batchName } = req.body;

    try {
        const year = new Date().getFullYear();
        let createdCount = 0;

        for (const subName of subjects) {
            for (const monthIndex of months) {
                const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateObj = new Date(year, monthIndex, day);
                    // Skip weekends
                    if (dateObj.getDay() !== 0 && dateObj.getDay() !== 6) {
                        const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

                        const exists = await AttendanceSession.countDocuments({
                            specialization,
                            batch: batchName,
                            subject: subName,
                            date: dateStr
                        });

                        if (!exists) {
                            await AttendanceSession.create({
                                specialization,
                                batch: batchName,
                                subject: subName,
                                date: dateStr,
                                records: []
                            });
                            createdCount++;
                        }
                    }
                }
            }
        }

        res.json({ message: `Bulk generation completed. Created ${createdCount} sessions.` });
    } catch (error) {
        res.status(500).json({ message: 'Bulk generation failed', error: error.message });
    }
});

export default router;
