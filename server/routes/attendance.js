import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

const router = express.Router();

// Helper: Format YYYY-MM-DD -> DD MMM YYYY
const formatSearchDate = (dateStr) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

// 1. GET ATTENDANCE (Personal)
// Drills down: Specialization -> Batch -> Subject -> Student -> Logs
router.get('/:email', async (req, res) => {
    try {
        const email = req.params.email;
        // Optimized find using the multikey index
        const allSpecs = await Attendance.find({
            "batches.subjects.students.email": email
        });

        let allLogs = [];
        allSpecs.forEach(spec => {
            spec.batches.forEach(batch => {
                batch.subjects.forEach(subject => {
                    const student = subject.students.find(s => s.email === email);
                    if (student) {
                        student.logs.forEach(log => {
                            allLogs.push({
                                _id: log._id || `${spec.specialization}-${log.date}`,
                                date: log.date, // "05 Oct 2024 09:00 AM"
                                status: log.status,
                                subject: subject.subjectName,
                                specialization: spec.specialization,
                                batch: batch.batchName
                            });
                        });
                    }
                });
            });
        });

        // Sort by date (descending)
        allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(allLogs);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// 2. BATCH VIEW (For Teachers)
router.post('/batch-view', async (req, res) => {
    // Inputs from frontend
    let { date, subject, students, specialization, batch: batchName } = req.body;
    const searchDate = formatSearchDate(date);

    try {
        // Find the specific specialization document
        const specDoc = await Attendance.findOne({ specialization });
        const batchObj = specDoc?.batches.find(b => b.batchName === batchName);
        const subjObj = batchObj?.subjects.find(s => s.subjectName === subject);

        const statusMap = {};
        students.forEach(email => {
            const student = subjObj?.students.find(s => s.email === email);
            const log = student?.logs.find(l => l.date.includes(searchDate));
            statusMap[email] = log ? log.status : 'Not Marked';
        });

        res.json(statusMap);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed', error: error.message });
    }
});

// 3. BULK INITIALIZATION (For generating months of logs)
router.post('/bulk', async (req, res) => {
    const { email, months, subjects, specialization, batch: batchName } = req.body;
    try {
        const year = new Date().getFullYear();
        const user = await User.findOne({ email });

        // Find or Create Specialization Doc
        let specDoc = await Attendance.findOne({ specialization });
        if (!specDoc) specDoc = new Attendance({ specialization, batches: [] });

        // Find or Create Batch
        let batchObj = specDoc.batches.find(b => b.batchName === batchName);
        if (!batchObj) {
            batchObj = { batchName, subjects: [] };
            specDoc.batches.push(batchObj);
            // Re-reference after push
            batchObj = specDoc.batches.find(b => b.batchName === batchName);
        }

        for (const subName of subjects) {
            // Find or Create Subject
            let subjObj = batchObj.subjects.find(s => s.subjectName === subName);
            if (!subjObj) {
                subjObj = { subjectName: subName, students: [] };
                batchObj.subjects.push(subjObj);
                subjObj = batchObj.subjects.find(s => s.subjectName === subName);
            }

            // Find or Create Student
            let student = subjObj.students.find(s => s.email === email);
            if (!student) {
                student = { email, name: user?.name, logs: [] };
                subjObj.students.push(student);
                student = subjObj.students.find(s => s.email === email);
            }

            // Generate Logs
            months.forEach(monthIndex => {
                const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const d = new Date(year, monthIndex, day);
                    if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip weekends
                        const dateStr = d.toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        });

                        if (!student.logs.some(l => l.date.includes(dateStr))) {
                            student.logs.push({
                                date: `${dateStr} 09:00 AM`,
                                status: 'Not Marked'
                            });
                        }
                    }
                }
            });
        }

        await specDoc.save();
        res.json({ message: 'Bulk generation completed' });
    } catch (error) {
        console.error("Bulk Error:", error);
        res.status(500).json({ message: 'Bulk generation failed', error: error.message });
    }
});

// 4. BATCH UPDATE (Marking Attendance)
router.post('/batch-update', async (req, res) => {
    const { date, subject: subjectName, students, specialization, batch: batchName } = req.body;
    const searchDate = formatSearchDate(date);

    try {
        // We use findOneAndUpdate with array filters for atomic updates
        // BUT for dynamic batch/subject creation, standard save is safer/easier to read
        // Given the scale, atomic is better, but let's stick to the robust logic we need:

        let specDoc = await Attendance.findOne({ specialization });
        if (!specDoc) specDoc = new Attendance({ specialization, batches: [] });

        let batchObj = specDoc.batches.find(b => b.batchName === batchName);
        if (!batchObj) {
            batchObj = { batchName, subjects: [] };
            specDoc.batches.push(batchObj);
            batchObj = specDoc.batches.find(b => b.batchName === batchName);
        }

        let subjObj = batchObj.subjects.find(s => s.subjectName === subjectName);
        if (!subjObj) {
            subjObj = { subjectName, students: [] };
            batchObj.subjects.push(subjObj);
            subjObj = batchObj.subjects.find(s => s.subjectName === subjectName);
        }

        for (const { email, status } of students) {
            let student = subjObj.students.find(s => s.email === email);
            if (!student) {
                const u = await User.findOne({ email });
                student = { email, name: u?.name, logs: [] };
                subjObj.students.push(student);
                student = subjObj.students.find(s => s.email === email);
            }

            const logIndex = student.logs.findIndex(l => l.date.includes(searchDate));
            if (logIndex > -1) {
                student.logs[logIndex].status = status;
                student.logs[logIndex].markedAt = new Date();
            } else {
                student.logs.push({
                    date: `${searchDate} 09:00 AM`,
                    status,
                    markedAt: new Date()
                });
            }
        }

        await specDoc.save();
        res.json({ message: 'Class attendance updated successfully' });
    } catch (error) {
        console.error("Batch Update Error:", error);
        res.status(500).json({ message: 'Batch update failed', error: error.message });
    }
});

export default router;
