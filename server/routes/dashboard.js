import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// Admin Only
router.get('/admin', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ status: 'approved' });
        res.json({ message: 'Welcome Admin', data: { totalUsers, systemHealth: 'Optimal' } });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

// Teacher and up
router.get('/teacher', protect, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const teacher = await User.findOne({ email: req.user.email });
        res.json({
            message: `Welcome ${teacher.name}`,
            data: {
                assignedCourses: teacher.assignedSubjects?.length || 0,
                activeAssignments: 12 // Placholder for now
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

// Student and up (Everyone)
router.get('/student', protect, authorize('admin', 'teacher', 'student'), async (req, res) => {
    try {
        const email = req.user.email;
        const student = await User.findOne({ email });

        // Find using multikey index
        const allSpecs = await Attendance.find({ "batches.subjects.students.email": email });
        let totalLogs = 0;
        let presentLogs = 0;

        allSpecs.forEach(spec => {
            spec.batches.forEach(batch => {
                batch.subjects.forEach(subject => {
                    const st = subject.students.find(s => s.email === email);
                    if (st) {
                        st.logs.forEach(log => {
                            if (log.status !== 'Not Marked') {
                                totalLogs++;
                                if (log.status === 'Present') presentLogs++;
                            }
                        });
                    }
                });
            });
        });

        const percentage = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 0;

        res.json({
            message: `Welcome ${student.name}`,
            data: {
                attendance: `${percentage || 0}%`, // Default to 0 if no records
                currentGpa: 8.85
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

export default router;
