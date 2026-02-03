import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// Login
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const userFound = await User.findOne({ email });

        if (!userFound) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await userFound.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check role mismatch (if provided)
        if (role && userFound.role !== 'pending' && userFound.role !== role.toLowerCase()) {
            return res.status(401).json({ message: 'Invalid role for this user' });
        }

        res.json({
            _id: userFound.email,
            name: userFound.name,
            email: userFound.email,
            role: userFound.role,
            department: userFound.department || userFound.branch,
            branch: userFound.branch,
            batch: userFound.batch,
            semester: userFound.semester,
            section: userFound.section,
            specialization: userFound.specialization,
            id: userFound.rollNo || userFound.id || 'N/A',
            rollNo: userFound.rollNo || userFound.id || 'N/A',
            assignedSubjects: userFound.assignedSubjects || [],
            token: generateToken(userFound.email)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Signup (Submit for approval)
router.post('/signup', async (req, res) => {
    const registrationData = req.body;

    try {
        const userExists = await User.findOne({ email: registrationData.email });
        if (userExists) {
            const msg = userExists.status === 'pending' ? 'Registration already pending approval' : 'User already exists in system';
            return res.status(400).json({ message: msg });
        }

        const newUser = new User({
            ...registrationData,
            role: 'pending',
            status: 'pending',
            submittedAt: new Date()
        });

        await newUser.save();
        res.status(201).json({ message: 'Registration submitted successfully. Pending Admin approval.' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
