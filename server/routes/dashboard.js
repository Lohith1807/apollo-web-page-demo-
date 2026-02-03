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
        const student = await User.findOne({ email: req.user.email });
        const attendance = await Attendance.find({ email: req.user.email });

        let percentage = 0;
        if (attendance.length > 0) {
            const present = attendance.filter(a => a.status === 'Present').length;
            percentage = Math.round((present / attendance.length) * 100);
        }

        res.json({
            message: `Welcome ${student.name}`,
            data: {
                attendance: `${percentage || 94}%`,
                currentGpa: 8.85
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

export default router;
