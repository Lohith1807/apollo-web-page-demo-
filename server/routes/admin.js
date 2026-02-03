import express from 'express';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';

const router = express.Router();

// Get Admin Stats
router.get('/stats', async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student', status: 'approved' });
        const facultyCount = await User.countDocuments({ role: 'teacher' });
        const pendingApplications = await User.countDocuments({ role: 'pending', status: 'pending' });

        res.json({
            totalStudents: studentCount,
            totalFaculty: facultyCount,
            pendingApplications: pendingApplications,
            systemHealth: "Optimal"
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Get Subjects
router.get('/subjects', async (req, res) => {
    try {
        const subjects = await Subject.findOne().sort({ updatedAt: -1 });
        res.json(subjects ? subjects.data : {});
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Update Subjects
router.post('/subjects', async (req, res) => {
    try {
        await Subject.findOneAndUpdate(
            {},
            { data: req.body, updatedAt: new Date() },
            { upsert: true }
        );
        res.json({ message: 'Course catalog updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
});

// Get all pending registrations
router.get('/pending', async (req, res) => {
    try {
        const pending = await User.find({ status: 'pending' });
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Approve a registration
router.post('/approve', async (req, res) => {
    const { email } = req.body;
    try {
        const student = await User.findOne({ email, status: 'pending' });
        if (!student) return res.status(404).json({ message: 'Registration not found' });

        // Logic for generating Roll No (Simplified for DB)
        // In a real system, you'd find the latest roll number for the batch/branch
        const yearPrefix = student.batch?.split('-')[0] || '2024';
        const branchCode = student.branch || 'CSE';
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const rollNo = `${yearPrefix}${branchCode}${randomSuffix}`;

        // Approve
        student.status = 'approved';
        student.role = 'student';
        student.rollNo = rollNo;
        student.section = 'Section A'; // Defaulting for now
        await student.save();

        // Create initial attendance
        const firstAttendance = new Attendance({
            email,
            date: new Date().toISOString().split('T')[0],
            status: "Present",
            subject: "Admission Confirmed"
        });
        await firstAttendance.save();

        res.json({ message: 'Student approved successfully', rollNo });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Reject a registration
router.post('/reject', async (req, res) => {
    const { email } = req.body;
    try {
        const student = await User.findOneAndDelete({ email, status: 'pending' });
        if (!student) return res.status(404).json({ message: 'Registration not found' });
        res.json({ message: 'Registration rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Get All Students Directory
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student', status: 'approved' });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Update Student Details
router.put('/students/:email', async (req, res) => {
    try {
        await User.findOneAndUpdate({ email: req.params.email }, req.body);
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
});

// Get All Faculty Directory
router.get('/faculty', async (req, res) => {
    try {
        const faculty = await User.find({ role: 'teacher' });
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Create New Faculty
router.post('/faculty', async (req, res) => {
    try {
        const { email, password, name, department, id } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const newFaculty = new User({
            email, password, name, department, id, role: 'teacher'
        });
        await newFaculty.save();
        res.status(201).json({ message: 'Faculty created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Creation failed', error: error.message });
    }
});

// Update Faculty Details
router.put('/faculty/:email', async (req, res) => {
    try {
        await User.findOneAndUpdate({ email: req.params.email }, req.body);
        res.json({ message: 'Faculty updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
});

// Attendance Report
router.get('/attendance-report', async (req, res) => {
    const { batch, branch, specialization } = req.query;
    try {
        const students = await User.find({ batch, branch, specialization, role: 'student' });
        const emails = students.map(s => s.email);
        const attendance = await Attendance.find({ email: { $in: emails } });

        const report = students.map(s => ({
            ...s.toObject(),
            attendance: attendance.filter(a => a.email === s.email)
        }));

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Exam Management
router.get('/exams', async (req, res) => {
    try {
        const exams = await Exam.find().sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.post('/exams', async (req, res) => {
    try {
        const newExam = new Exam({
            id: Date.now().toString(),
            ...req.body
        });
        await newExam.save();
        res.status(201).json(newExam);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create exam', error: error.message });
    }
});

router.delete('/exams/:id', async (req, res) => {
    try {
        await Exam.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Exam deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

export default router;
