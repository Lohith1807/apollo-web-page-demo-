import express from 'express';
import dns from 'dns';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import attendanceRoutes from './routes/attendance.js';
import adminRoutes from './routes/admin.js';
import resultRoutes from './routes/results.js';

import mongoose from 'mongoose';

dotenv.config();

// Fix for Atlas SRV resolution - Only needed for certain environments, but safe to keep if wrapped or specific
if (process.env.NODE_ENV !== 'production') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const app = express();

// Database Connection
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apollo_db');
            console.log('Connected to MongoDB Atlas');
        }
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
};
// Connect immediately for long-running server, or inside handlers for strict serverless
connectDB();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for now to prevent CORS issues on Vercel
    credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Apollo University Portal API is running with MongoDB...');
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/results', resultRoutes);

const PORT = process.env.PORT || 5000;

// Export for Vercel
export default app;

// Start server only if not importing (i.e. running via node index.js)
if (process.env.VITE_RUN_LOCAL === 'true' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

