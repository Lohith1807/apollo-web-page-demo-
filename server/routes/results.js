import express from 'express';
import ExamResult from '../models/ExamResult.js';
import ExamConfig from '../models/ExamConfig.js';

const router = express.Router();

// Get results for a student
router.get('/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { role, batch } = req.query;

        let studentResults = await ExamResult.find({ email });

        if (role === 'student') {
            const batchConfig = await ExamConfig.find({ batch: batch || '2024-2028' });

            studentResults = studentResults.map(r => {
                const config = batchConfig.find(c => c.semester === r.semester);
                const isPub = config ? config.published : false;

                if (!isPub) {
                    return {
                        course: r.course,
                        code: r.code,
                        internal: r.internal,
                        external: 'N/A',
                        total: 'N/A',
                        grade: 'Pending',
                        semester: r.semester,
                        credits: r.credits,
                        status: 'Unpublished'
                    };
                }
                return r;
            });
        }

        res.json(studentResults);
    } catch (err) {
        console.error('Error fetching exam results:', err);
        res.status(500).json({ message: 'Error fetching exam results' });
    }
});

// Update Marks (Teacher/COE)
router.post('/update', async (req, res) => {
    try {
        const { email, results: newResults } = req.body;

        const ops = newResults.map(res => ({
            updateOne: {
                filter: { email, course: res.course },
                update: { $set: { ...res, email, updatedAt: new Date() } },
                upsert: true
            }
        }));

        await ExamResult.bulkWrite(ops);
        res.json({ message: 'Marks updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update marks' });
    }
});

// Publish Results (COE Only)
router.post('/publish', async (req, res) => {
    try {
        const { batch, semester, status } = req.body;
        await ExamConfig.findOneAndUpdate(
            { batch, semester },
            { published: status },
            { upsert: true }
        );
        res.json({ message: `Results for ${batch} ${semester} ${status ? 'Published' : 'Hidden'}` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update publish status' });
    }
});

// Get Publish Config
router.get('/config/status', async (req, res) => {
    try {
        const configs = await ExamConfig.find({});
        // Reformat for frontend if needed: { batch: { semester: { published: true } } }
        const result = {};
        configs.forEach(c => {
            if (!result[c.batch]) result[c.batch] = {};
            result[c.batch][c.semester] = { published: c.published };
        });
        res.json(result);
    } catch (err) {
        res.json({});
    }
});

// Batch View Marks
router.post('/batch-view', async (req, res) => {
    try {
        const { students, subject } = req.body;
        const results = await ExamResult.find({
            course: subject,
            email: { $in: students }
        });

        const batchData = {};
        students.forEach(email => {
            const rec = results.find(r => r.email === email);
            if (rec) batchData[email] = rec;
        });

        res.json(batchData);
    } catch (err) {
        res.status(500).json({ message: 'Fetch failed', error: err.message });
    }
});

// Batch Update Marks
router.post('/batch-update', async (req, res) => {
    try {
        const { records, subject } = req.body;
        const ops = records.map(rec => ({
            updateOne: {
                filter: { email: rec.email, course: subject },
                update: { $set: { ...rec, updatedAt: new Date() } },
                upsert: true
            }
        }));

        await ExamResult.bulkWrite(ops);
        res.json({ message: 'Marks updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Update failed', error: err.message });
    }
});

export default router;
